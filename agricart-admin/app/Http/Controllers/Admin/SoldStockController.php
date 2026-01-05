<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Inertia\Inertia;

class SoldStockController extends Controller
{
    public function index()
    {
        // Optimize: Load only essential fields and limit results
        $stocks = Stock::with([
                'product' => function($query) {
                    $query->select('id', 'name', 'produce_type', 'price_kilo', 'price_pc', 'price_tali');
                },
                'member' => function($query) {
                    $query->select('id', 'name');
                }
            ])
            ->sold()
            ->select('id', 'product_id', 'member_id', 'quantity', 'sold_quantity', 'category', 'created_at', 'updated_at')
            ->orderBy('updated_at', 'desc') // Show recently sold items first
            ->limit(200) // Limit to recent sold stocks
            ->get();
        
        return Inertia::render('Inventory/Stock/soldStock', compact('stocks'));
    }
}


