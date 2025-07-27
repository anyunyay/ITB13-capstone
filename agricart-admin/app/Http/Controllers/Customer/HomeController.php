<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $products = Product::with('stocks')->get();

        $products->each(function ($product) {
            $stockSums = $product->stocks
                ->where('quantity', '>', 0)
                ->groupBy('category')
                ->map(fn($group) => $group->sum('quantity'));

            $product->stock_by_category = $stockSums;
        });

        return Inertia::render('Customer/Home/index', compact('products'));
    }
}
