<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('cart', function () {
            $user = Auth::user();
            if (!$user) return [];
            $cart = Cart::where('user_id', $user->id)->first();
            if (!$cart) return [];
            return $cart->items()->with('product')->get()->mapWithKeys(function ($item) {
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
        });
    }
}
