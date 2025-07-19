<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {

        $products = Product::active()->get();
        return Inertia::render('Customer/Home/index', compact('products'));
    }
} 