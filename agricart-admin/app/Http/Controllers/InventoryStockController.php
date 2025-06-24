<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryStockController extends Controller
{
    public function index()
    { 
        $products = Product::active()->get();
        $stocks = Stock::all(); // Eager loads product and member due to $with
        return Inertia::render('Inventory/index', compact('products', 'stocks'));
    }

    public function addStock(Product $product)
    {
        $products = Product::active()->get(['id', 'name']);
        $members = Member::all(['id', 'name']);
        return Inertia::render('Inventory/addStock', compact('product', 'products', 'members'));
    }

    public function storeStock(Request $request, Product $product)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'member_id' => 'required|exists:members,id',
        ]);

        // Create a new stock entry
        $product->stocks()->create([
            'name' => 'required|string|max:255',
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
        ]);

        return redirect()->route('inventory.index')->with('message', 'Stock added successfully');
    }
}
