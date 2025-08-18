<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Inertia\Inertia;

class SoldStockController extends Controller
{
    public function index()
    {
        $stocks = Stock::with(['product', 'customer'])
            ->where('status', 'sold')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Inventory/Stock/soldStock', compact('stocks'));
    }
}


