<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\NewOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        return Inertia::render('Customer/Cart/index', compact('cart', 'checkoutMessage', 'cartTotal'));
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

            // Get or create the user's cart
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            // Check if the item already exists in the cart
            $cartItem = $cart->items()
                ->where('product_id', $productId)
                ->where('category', $category)
                ->first();

            if ($cartItem) { // If it exists, update the quantity
                $cartItem->quantity += $quantity;
                $cartItem->save();
            } else { // If it doesn't exist, create a new cart item
                $cart->items()->create([
                    'product_id' => $productId,
                    'category' => $category,
                    'quantity' => $quantity,
                ]);
            }

            return back()->with('message', 'Added to cart!');
        } catch (\Throwable $e) {
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

        try {
            // Create a new sale record
            $sale = Sales::create([
                'customer_id' => $user->id,
                'status' => 'pending',
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

            // Calculate operational expense (10%) and member earnings (90%)
            $operationalExpense = $totalPrice * 0.10;
            $memberEarnings = $totalPrice * 0.90;

            // Update the sale with total amount, operational expense, and member earnings
            $sale->update([
                'total_amount' => $totalPrice,
                'operational_expense' => $operationalExpense,
                'member_earnings' => $memberEarnings,
            ]);

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
