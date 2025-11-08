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
    /**
     * Check if the authenticated customer has verified their email
     * Redirects to verification notice if not verified
     */
    private function ensureCustomerEmailVerified()
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            if ($user->type === 'customer' && !$user->email_verified_at) {
                return redirect()->route('verification.notice');
            }
        }
        
        return null; // Continue with the request
    }

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
        }

        // Check customer email verification
        $verificationRedirect = $this->ensureCustomerEmailVerified();
        if ($verificationRedirect) {
            return $verificationRedirect;
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
        // Check customer email verification
        $verificationRedirect = $this->ensureCustomerEmailVerified();
        if ($verificationRedirect) {
            return response()->json(['error' => 'Email verification required'], 403);
        }

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

    public function produce()
    {
        // Check customer email verification
        $verificationRedirect = $this->ensureCustomerEmailVerified();
        if ($verificationRedirect) {
            return $verificationRedirect;
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

        return Inertia::render('Customer/Home/produce', compact('products'));
    }

    public function about()
    {
        // Check customer email verification
        $verificationRedirect = $this->ensureCustomerEmailVerified();
        if ($verificationRedirect) {
            return $verificationRedirect;
        }

        return Inertia::render('Customer/Home/aboutUs');
    }
}
