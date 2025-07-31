<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $products = Product::active()->with('stocks')->get();

        $products->each(function ($product) {
            $stockSums = $product->stocks
                ->where('quantity', '>', 0)
                ->groupBy('category')
                ->map(fn($group) => $group->sum('quantity'));

            $product->stock_by_category = $stockSums;
        });

        return Inertia::render('Customer/Home/index', compact('products'));
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        $products = Product::active()->with('stocks')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('produce_type', 'like', "%{$query}%")
            ->get();

        $products->each(function ($product) {
            $stockSums = $product->stocks
                ->where('quantity', '>', 0)
                ->groupBy('category')
                ->map(fn($group) => $group->sum('quantity'));

            $product->stock_by_category = $stockSums;
        });

        return response()->json($products);
    }

    public function show(Product $product)
    {
        $product->load('stocks');
        
        $stockSums = $product->stocks
            ->where('quantity', '>', 0)
            ->groupBy('category')
            ->map(fn($group) => $group->sum('quantity'));

        $product->stock_by_category = $stockSums;

        return Inertia::render('Customer/Products/show', [
            'product' => $product,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function product(Product $product)
    {
        $product->load('stocks');
        
        $stockSums = $product->stocks
            ->where('quantity', '>', 0)
            ->groupBy('category')
            ->map(fn($group) => $group->sum('quantity'));

        $product->stock_by_category = $stockSums;

        return Inertia::render('Customer/Products/product', [
            'product' => $product,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }
}
