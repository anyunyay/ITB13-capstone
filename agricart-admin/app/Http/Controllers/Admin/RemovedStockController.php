<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RemovedStock;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RemovedStockController extends Controller
{
    public function index()
    {
        $stocks = RemovedStock::with(['product', 'member', 'customer'])
            ->where('status', 'removed')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('Inventory/Stock/removedStock', compact('stocks'));
    }
}


