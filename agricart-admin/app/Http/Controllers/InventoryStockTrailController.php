<?php

namespace App\Http\Controllers;

use App\Models\InventoryStockTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryStockTrailController extends Controller
{
    public function index()
    {
        $stocks = InventoryStockTrail::with(['product', 'member'])->get();
        return Inertia::render('Inventory/Stock/stockTrail', ['stocks' => $stocks,]);
    }
}
