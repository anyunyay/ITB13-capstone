<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryStockTrail;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryStockTrailController extends Controller
{
    public function index()
    {
        $stocks = InventoryStockTrail::with(['product', 'member', 'customer'])->get();
        return Inertia::render('Inventory/Stock/stockTrail', ['stocks' => $stocks,]);
    }

    public function soldIndex()
    {
        $stocks = Stock::with(['product', 'customer'])
            ->where('status', 'sold')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Inventory/Stock/soldStock', ['stocks' => $stocks]);
    }
}
