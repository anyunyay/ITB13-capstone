<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            if ($user->type === 'admin' || $user->type === 'staff') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->type === 'member') {
                return redirect()->route('member.dashboard');
            } elseif ($user->type === 'logistic') {
                return redirect()->route('logistic.dashboard');
            }
            // Customer users stay on the home page
        }

        $products = Product::active()->with(['stocks' => function($query) {
            $query->customerVisible();
        }])->get();

        $products->each(function ($product) {
            $stockSums = $product->stocks
                ->groupBy('category')
                ->map(fn($group) => $group->sum('quantity'));

            $product->stock_by_category = $stockSums;
        });

        return Inertia::render('Customer/Home/index', compact('products'));
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        $products = Product::active()->with(['stocks' => function($query) {
            $query->customerVisible();
        }])
            ->where('name', 'like', "%{$query}%")
            ->get();

        $products->each(function ($product) {
            $stockSums = $product->stocks
                ->groupBy('category')
                ->map(fn($group) => $group->sum('quantity'));

            $product->stock_by_category = $stockSums;
        });

        return response()->json($products);
    }

    public function show(Product $product)
    {
        $product->load(['stocks' => function($query) {
            $query->customerVisible();
        }]);
        
        $stockSums = $product->stocks
            ->groupBy('category')
            ->map(fn($group) => $group->sum('quantity'));

        $product->stock_by_category = $stockSums;

        return Inertia::render('Customer/Products/show', [
            'product' => $product,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function product(Product $product)
    {
        $product->load(['stocks' => function($query) {
            $query->customerVisible();
        }]);
        
        $stockSums = $product->stocks
            ->groupBy('category')
            ->map(fn($group) => $group->sum('quantity'));

        $product->stock_by_category = $stockSums;

        return Inertia::render('Customer/Products/product', [
            'product' => $product,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
}
