<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use App\Models\UserAddress;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\NewOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $cartData = [];
        $cartTotal = 0;
        
        if ($cart) {
            $cartData = $cart->items()->with('product')->get()->mapWithKeys(function ($item) use (&$cartTotal) {
                // Get customer visible stock for this item using scope
                $stocks = Stock::customerVisible()
                    ->where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->get();
                
                $totalAvailable = $stocks->sum('quantity');
                
                // Calculate item total price
                $itemTotalPrice = 0;
                $remainingQty = $item->quantity;
                
                foreach ($stocks as $stock) {
                    if ($remainingQty <= 0) break;
                    $deduct = min($stock->quantity, $remainingQty);
                    
                    // Calculate price for this portion
                    $price = 0;
                    if ($item->category === 'Kilo' && $stock->product->price_kilo) {
                        $price = $stock->product->price_kilo;
                    } elseif ($item->category === 'Pc' && $stock->product->price_pc) {
                        $price = $stock->product->price_pc;
                    } elseif ($item->category === 'Tali' && $stock->product->price_tali) {
                        $price = $stock->product->price_tali;
                    }
                    
                    $itemTotalPrice += $price * $deduct;
                    $remainingQty -= $deduct;
                }
                
                $cartTotal += $itemTotalPrice;
                
                return [
                    $item->product_id . '-' . $item->category => [
                        'product_id' => $item->product_id,
                        'name' => $item->product ? $item->product->name : '',
                        'item_id' => $item->id,
                        'category' => $item->category,
                        'quantity' => $item->quantity,
                        'available_stock' => $totalAvailable,
                        'total_price' => $itemTotalPrice,
                    ]
                ];
            });
        }
        $checkoutMessage = session('checkoutMessage');
        $cart = $cartData;
        
        // Get user's addresses for delivery selection (all addresses)
        $allAddresses = $user->addresses()->orderBy('created_at', 'desc')->get();
        
        // Get user's active address from user_addresses table
        $activeAddress = $user->defaultAddress;
        
        // Filter out the currently active address from the dropdown
        $addresses = $allAddresses->filter(function ($address) use ($activeAddress) {
            if (!$activeAddress) {
                return true;
            }
            return $address->id !== $activeAddress->id;
        })->values();
        
        // Get flash messages
        $flash = [
            'success' => session('success'),
            'error' => session('error'),
        ];
        
        return Inertia::render('Customer/Cart/index', compact('cart', 'checkoutMessage', 'cartTotal', 'addresses', 'activeAddress', 'flash'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'category' => 'required|string',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        try {
            $user = $request->user();
            $productId = $validated['product_id'];
            $category = $validated['category'];
            $quantity = $validated['quantity'];

            // Use database transaction to prevent race conditions
            return DB::transaction(function () use ($user, $productId, $category, $quantity) {
                // Get or create the user's cart with lock
                $cart = Cart::lockForUpdate()->firstOrCreate(['user_id' => $user->id]);

                // Check if the item already exists in the cart
                $cartItem = $cart->items()
                    ->where('product_id', $productId)
                    ->where('category', $category)
                    ->first();

                if ($cartItem) { // If it exists, update the quantity
                    $oldQuantity = $cartItem->quantity;
                    $cartItem->quantity += $quantity;
                    $cartItem->save();
                    
                    // Log cart item update
                    SystemLogger::logCustomerActivity(
                        'cart_item_updated',
                        $user->id,
                        [
                            'product_id' => $productId,
                            'category' => $category,
                            'old_quantity' => $oldQuantity,
                            'new_quantity' => $cartItem->quantity,
                            'added_quantity' => $quantity
                        ]
                    );
                } else { // If it doesn't exist, create a new cart item
                    $cart->items()->create([
                        'product_id' => $productId,
                        'category' => $category,
                        'quantity' => $quantity,
                    ]);
                    
                    // Log cart item addition
                    SystemLogger::logCustomerActivity(
                        'cart_item_added',
                        $user->id,
                        [
                            'product_id' => $productId,
                            'category' => $category,
                            'quantity' => $quantity
                        ]
                    );
                }

                return back()->with('message', 'Added to cart!');
            });
        } catch (\Throwable $e) {
            Log::error('Cart store error: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'product_id' => $productId ?? null,
                'category' => $category ?? null,
                'quantity' => $quantity ?? null,
            ]);
            
            return back()->withErrors([
                'quantity' => 'An unexpected error occurred. Please try again.',
            ]);
        }
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('checkoutMessage', 'Your cart is empty.');
        }

        // Validate address selection
        $validated = $request->validate([
            'delivery_address_id' => 'nullable|exists:user_addresses,id',
            'use_main_address' => 'boolean',
        ]);

        $deliveryAddress = null;
        
        // If using main address
        if ($validated['use_main_address']) {
            $activeAddress = $user->defaultAddress;
            
            if ($activeAddress) {
                $deliveryAddress = (object) [
                    'street' => $activeAddress->street,
                    'barangay' => $activeAddress->barangay,
                    'city' => $activeAddress->city,
                    'province' => $activeAddress->province,
                ];
            } else {
                return redirect()->route('cart.index')->with('checkoutMessage', 'No default address found. Please set a default address first.');
            }
        } else {
            // Ensure the address belongs to the user
            $deliveryAddress = UserAddress::where('id', $validated['delivery_address_id'])
                ->where('user_id', $user->id)
                ->first();

            if (!$deliveryAddress) {
                return redirect()->route('cart.index')->with('checkoutMessage', 'Invalid delivery address selected.');
            }
        }

        try {
            // Determine the address_id based on the delivery address selection
            $addressId = null;
            if (!$validated['use_main_address'] && $validated['delivery_address_id']) {
                // Using a specific address from user_addresses table
                $addressId = $validated['delivery_address_id'];
            } elseif ($validated['use_main_address']) {
                // Using main address - find the corresponding UserAddress record
                $activeAddress = $user->defaultAddress;
                if ($activeAddress) {
                    $addressId = $activeAddress->id;
                }
            }

            // Create a new sales audit record with address reference
            $sale = SalesAudit::create([
                'customer_id' => $user->id,
                'status' => 'pending',
                'address_id' => $addressId,
                'delivery_address' => $deliveryAddress->street . ', ' . $deliveryAddress->barangay . ', ' . $deliveryAddress->city . ', ' . $deliveryAddress->province,
            ]);

            $totalPrice = 0;
            $orderItems = [];
            $error = null;

            foreach ($cart->items as $item) {
                // Get customer visible stock for this item using scope
                $stocks = Stock::customerVisible()
                    ->where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->with('product')
                    ->orderBy('created_at', 'asc')
                    ->get();

                $totalAvailable = $stocks->sum('quantity');

                if ($totalAvailable < $item->quantity) {
                    $error = 'Not enough stock for ' . ($item->product ? $item->product->name : 'Product') . ' (' . $item->category . ')';
                    break;
                }

                $remainingQty = $item->quantity;
                $itemTotalPrice = 0;

                foreach ($stocks as $stock) {
                    if ($remainingQty <= 0) break;
                    $deduct = min($stock->quantity, $remainingQty);
                    
                    // Calculate price for this portion
                    $price = 0;
                    if ($item->category === 'Kilo' && $stock->product->price_kilo) {
                        $price = $stock->product->price_kilo;
                    } elseif ($item->category === 'Pc' && $stock->product->price_pc) {
                        $price = $stock->product->price_pc;
                    } elseif ($item->category === 'Tali' && $stock->product->price_tali) {
                        $price = $stock->product->price_tali;
                    }
                    
                    $itemTotalPrice += $price * $deduct;
                    $remainingQty -= $deduct;

                    // Create an audit trail record (but don't deduct stock yet)
                    AuditTrail::create([
                        'sale_id' => $sale->id,
                        'stock_id' => $stock->id,
                        'product_id' => $item->product_id,
                        'category' => $item->category,
                        'quantity' => $deduct,
                    ]);
                }

                $totalPrice += $itemTotalPrice;
            }

            if ($error) {
                // Delete the sale and audit trail if there was an error
                $sale->auditTrail()->delete();
                $sale->delete();
                return redirect()->route('cart.index')->with('checkoutMessage', $error);
            }

            // Check minimum order requirement
            if ($totalPrice < 75) {
                // Delete the sale and audit trail if minimum order not met
                $sale->auditTrail()->delete();
                $sale->delete();
                return redirect()->route('cart.index')->with('checkoutMessage', 'Minimum order requirement is Php75. Your current total is Php' . number_format($totalPrice, 2) . '. Please add more items to your cart.');
            }

            // Update the sale with total amount
            $sale->update(['total_amount' => $totalPrice]);

            // Log successful checkout
            SystemLogger::logCheckout(
                $user->id,
                $sale->id,
                $totalPrice,
                'success',
                [
                    'cart_items_count' => $cart->items->count(),
                    'minimum_order_met' => $totalPrice >= 75,
                    'order_status' => 'pending'
                ]
            );

            // Notify customer of order confirmation
            $user->notify(new OrderConfirmationNotification($sale));

            // Notify admin and staff about new order
            $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
            foreach ($adminUsers as $admin) {
                $admin->notify(new NewOrderNotification($sale));
            }

            // Clear the cart
            $cart->items()->delete();
            
            $message = 'Order placed successfully! Your order is pending admin approval.';
        } catch (\Throwable $e) {
            Log::error('Checkout error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getTraceAsString()
            ]);

            // Log checkout failure
            SystemLogger::logCheckout(
                $user->id,
                null,
                0,
                'failed',
                [
                    'error_message' => $e->getMessage(),
                    'error_type' => get_class($e)
                ]
            );

            $message = 'An unexpected error occurred during checkout.';
        }

        return redirect()->route('cart.index')->with('checkoutMessage', $message);
    }

    public function remove(Request $request, $cartItemId)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $message = null;

        if (!$cart) {
            return back()->with('checkoutMessage', 'Cart not found.');
        }

        $item = $cart->items()->where('id', $cartItemId)->first();
        if ($item) {
            // Log cart item removal
            SystemLogger::logCustomerActivity(
                'cart_item_removed',
                $user->id,
                [
                    'product_id' => $item->product_id,
                    'category' => $item->category,
                    'quantity' => $item->quantity
                ]
            );
            
            $item->delete();
            $message = 'Item removed from cart.';
        } else {
            $message = 'Item not found in your cart.';
        }

        // Recalculate cart total after removal
        $cartTotal = $this->calculateCartTotal($user->id);

        return redirect()->route('cart.index')->with('checkoutMessage', $message)->with('cartTotal', $cartTotal);
    }

    public function update(Request $request, $cartItemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $message = null;

        if (!$cart) {
            return back()->with('checkoutMessage', 'Cart not found.');
        }

        $item = $cart->items()->where('id', $cartItemId)->first();
        if ($item) {
            $quantity = $validated['quantity'];
            
            // Validate based on category
            if ($item->category === 'Kilo') {
                // For kilo, allow decimals up to 2 places
                if (round($quantity, 2) != $quantity) {
                    return back()->with('checkoutMessage', 'Kilo quantity must have maximum 2 decimal places.');
                }
            } else {
                // For other categories, only allow integers
                if (!is_int($quantity) && $quantity != intval($quantity)) {
                    return back()->with('checkoutMessage', 'Quantity must be a whole number for this category.');
                }
                $quantity = intval($quantity);
            }

            // Check customer visible stock using scope
            $stocks = Stock::customerVisible()
                ->where('product_id', $item->product_id)
                ->where('category', $item->category)
                ->get();

            $totalAvailable = $stocks->sum('quantity');

            if ($totalAvailable < $quantity) {
                return back()->with('checkoutMessage', 'Not enough stock available. Maximum available: ' . $totalAvailable . ' ' . $item->category);
            }
            
            $item->update(['quantity' => $quantity]);
            $message = 'Cart item updated successfully.';
        } else {
            $message = 'Item not found in your cart.';
        }

        // Recalculate cart total after update
        $cartTotal = $this->calculateCartTotal($user->id);

        return redirect()->route('cart.index')->with('checkoutMessage', $message)->with('cartTotal', $cartTotal);
    }

    /**
     * Calculate the total price of the cart for a given user
     */
    private function calculateCartTotal($userId)
    {
        $cart = Cart::where('user_id', $userId)->first();
        if (!$cart) {
            return 0;
        }

        $totalPrice = 0;

        foreach ($cart->items as $item) {
            // Get customer visible stock using scope
            $stocks = Stock::customerVisible()
                ->where('product_id', $item->product_id)
                ->where('category', $item->category)
                ->with('product')
                ->orderBy('created_at', 'asc')
                ->get();

            $remainingQty = $item->quantity;
            $itemTotalPrice = 0;

            foreach ($stocks as $stock) {
                if ($remainingQty <= 0) break;
                $deduct = min($stock->quantity, $remainingQty);
                
                // Calculate price for this portion
                $price = 0;
                if ($item->category === 'Kilo' && $stock->product->price_kilo) {
                    $price = $stock->product->price_kilo;
                } elseif ($item->category === 'Pc' && $stock->product->price_pc) {
                    $price = $stock->product->price_pc;
                } elseif ($item->category === 'Tali' && $stock->product->price_tali) {
                    $price = $stock->product->price_tali;
                }
                
                $itemTotalPrice += $price * $deduct;
                $remainingQty -= $deduct;
            }

            $totalPrice += $itemTotalPrice;
        }

        return $totalPrice;
    }
}
