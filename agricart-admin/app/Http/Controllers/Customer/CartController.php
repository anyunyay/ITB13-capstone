<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\Cart;
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
                return [
                    $item->product_id . '-' . $item->category => [
                        'product_id' => $item->product_id,
                        'name' => $item->product ? $item->product->name : '',
                        'item_id' => $item->id,
                        'category' => $item->category,
                        'quantity' => $item->quantity,
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
            Log::error('Cart Store Error: ' . $e->getMessage());

            return back()->withErrors([
                'quantity' => 'An unexpected error occurred. Please try again.',
            ]);
        }
    }

    public function checkout(Request $request)
    {
        Log::info('Checkout started', ['user_id' => $request->user()->id]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $message = null;
        $error = null;

        if (!$cart || $cart->items->isEmpty()) {
            Log::info('Checkout failed: cart empty or not found', ['user_id' => $request->user()->id]);
            return back()->with('checkoutMessage', 'Your cart is empty.');
        }

        try {
            $user = $request->user();

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

                    // // Check if a SoldStock record for this stock_id already exists for this checkout
                    // NOW ORDER HISTORY
                    // $soldStock = SoldStock::where('stock_id', $stock->id)
                    //     ->where('customer_id', $user->id)
                    //     ->where('product_id', $stock->product_id)
                    //     ->where('member_id', $stock->member_id)
                    //     ->where('category', $stock->category)
                    //     ->first();

                    // if ($soldStock) { // If exists, increment the quantity
                    //     $soldStock->quantity += $deduct;
                    //     $soldStock->save();
                    // } else { // If not, create a new record
                    //     SoldStock::create([
                    //         'customer_id' => $user->id,
                    //         'stock_id' => $stock->id,
                    //         'product_id' => $stock->product_id,
                    //         'quantity' => $deduct, // amount deducted from this stock
                    //         'member_id' => $stock->member_id,
                    //         'category' => $stock->category,
                    //     ]);
                    // }
                }
            }

            if ($error) {
                return back()->with('checkoutMessage', $error);
            } else {
                $sold = false;
            }

            // Clear the cart
            $cart->items()->delete();
            $message = 'Checkout successful!';
        } catch (\Throwable $e) {
            $message = 'An unexpected error occurred during checkout.';
        }

        return redirect()->route('cart.index')->with('checkoutMessage', $message); // Return updated cart (empty) and message
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
