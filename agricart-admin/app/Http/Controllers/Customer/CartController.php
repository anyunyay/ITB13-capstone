<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Cart;
use App\Models\Sales;
use App\Models\SoldStock;
use App\Models\Stock;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $cartData = [];
        if ($cart) {
            $cartData = $cart->items()->with('product')->get()->mapWithKeys(function ($item) {
                // Get available stock for this item
                $stocks = Stock::where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->where('quantity', '>', 0)
                    ->get();
                
                $totalAvailable = $stocks->sum('quantity');
                
                return [
                    $item->product_id . '-' . $item->category => [
                        'product_id' => $item->product_id,
                        'name' => $item->product ? $item->product->name : '',
                        'item_id' => $item->id,
                        'category' => $item->category,
                        'quantity' => $item->quantity,
                        'available_stock' => $totalAvailable,
                    ]
                ];
            });
        }
        $checkoutMessage = session('checkoutMessage');
        $cart = $cartData;
        return Inertia::render('Customer/Cart/index', compact('cart', 'checkoutMessage'));
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
        $message = null;
        $error = null;

        if (!$cart || $cart->items->isEmpty()) {
            return back()->with('checkoutMessage', 'Your cart is empty.');
        }

        try {
            $user = $request->user();

            // Create a new sale record with pending status
            $sale = Sales::create([
                'customer_id' => $user->id,
                'total_amount' => 0, // This will be calculated but not processed yet
                'status' => 'pending',
            ]);

            $totalPrice = 0;
            $orderItems = [];

            foreach ($cart->items as $item) {
                $stocks = Stock::where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->where('quantity', '>', 0)
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
                return back()->with('checkoutMessage', $error);
            }

            // Update the sale with total amount
            $sale->update(['total_amount' => $totalPrice]);

            // Clear the cart
            $cart->items()->delete();
            
            $message = 'Order placed successfully! Your order is pending admin approval.';
        } catch (\Throwable $e) {
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

        return redirect()->route('cart.index')->with('checkoutMessage', $message);
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

            // Check available stock
            $stocks = Stock::where('product_id', $item->product_id)
                ->where('category', $item->category)
                ->where('quantity', '>', 0)
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

        return redirect()->route('cart.index')->with('checkoutMessage', $message);
    }
}
