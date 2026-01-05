<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use App\Models\Cart;
use Illuminate\Validation\Rules\Password;

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
        // Force HTTPS in production
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Configure stronger password requirements
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols();
        });

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
