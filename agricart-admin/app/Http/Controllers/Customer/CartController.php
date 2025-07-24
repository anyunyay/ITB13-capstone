<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\Cart;
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
                return [
                    $item->product_id . '-' . $item->category => [
                        'product_id' => $item->product_id,
                        'name' => $item->product ? $item->product->name : '',
                        'sell_category_id' => $item->id,
                        'sell_category' => $item->category,
                        'quantity' => $item->quantity,
                    ]
                ];
            });
        }
        $checkoutMessage = session('checkoutMessage');
        return Inertia::render('Customer/Cart/index', [
            'cart' => $cartData,
            'checkoutMessage' => $checkoutMessage,
        ]);
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

            // Add or update cart item (no stock deduction here)
            $cartItem = $cart->items()
                ->where('product_id', $productId)
                ->where('category', $category)
                ->first();

            if ($cartItem) {
                $cartItem->quantity += $quantity;
                $cartItem->save();
            } else {
                $cart->items()->create([
                    'product_id' => $productId,
                    'category' => $category,
                    'quantity' => $quantity,
                ]);
            }

            return back()->with('message', 'Added to cart!');
        } catch (\Throwable $e) {
            Log::error('Cart Store Error: ' . $e->getMessage());

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
            foreach ($cart->items as $item) {
                $stocks = Stock::where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->where('quantity', '>', 0)
                    ->orderBy('created_at', 'asc')
                    ->get();

                $totalAvailable = $stocks->sum('quantity');
                if ($totalAvailable < $item->quantity) {
                    $error = 'Not enough stock for ' . $item->product_id . ' (' . $item->category . ')';
                    break;
                }

                $remainingQty = $item->quantity;
                foreach ($stocks as $stock) {
                    if ($remainingQty <= 0) break;
                    $deduct = min($stock->quantity, $remainingQty);
                    $stock->quantity -= $deduct;
                    $stock->save();
                    $remainingQty -= $deduct;
                }
            }

            if ($error) {
                return back()->with('checkoutMessage', $error);
            }

            // Clear the cart
            $cart->items()->delete();
            $message = 'Checkout successful!';
        } catch (\Throwable $e) {
            Log::error('Cart Checkout Error: ' . $e->getMessage());
            $message = 'An unexpected error occurred during checkout.';
        }

        // Return updated cart (empty) and message
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
}
