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

            // Create a new sale record
            $sale = Sales::create([
                'customer_id' => $user->id,
                'total_amount' => 0, // This will be updated later
            ]);

            $totalPrice = 0;

            foreach ($cart->items as $item) {
                $stocks = Stock::where('product_id', $item->product_id)
                    ->where('category', $item->category)
                    ->where('quantity', '>', 0)
                    ->with('product')
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

                    $totalPrice += ($stock->product->price ?? 0) * $deduct;
                    $remainingQty -= $deduct;

                    // Create an audit trail record
                    AuditTrail::create([
                        'sale_id' => $sale->id,
                        'stock_id' => $stock->id,
                        'product_id' => $item->product_id,
                        'category' => $item->category,
                        'quantity' => $deduct,  
                    ]);
                }
            }

            if ($error) {
                return back()->with('checkoutMessage', $error);
            }

            $cart->items()->delete(); // Clear the cart
            $sale->update(['total_amount' => $totalPrice]); // Update the sale total amount
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
