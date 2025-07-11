<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Member;
use App\Models\Stock;
use App\Models\InventoryStockTrail;
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
        return Inertia::render('Inventory/Stock/addStock', compact('product', 'products', 'members'));
    }

    public function storeStock(Request $request, Product $product)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:members,id',
            'category' => 'required|in:Kilo,Pc,Tali',
        ]);

        // Create a new stock entry
        $product->stocks()->create([
            'name' => 'required|string|max:255',
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'category' => $request->input('category'),
        ]);

        return redirect()->route('inventory.index')->with('message', 'Stock added successfully');
    }

    public function editStock(Product $product, Stock $stock)
    {
        $members = Member::all(['id', 'name']);
        return Inertia::render('Inventory/Stock/editStock', [
            'product' => $product,
            'stock' => $stock,
            'members' => $members,
        ]);
    }

    public function updateStock(Request $request, Product $product, Stock $stock)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:members,id',
            'category' => 'required|in:Kilo,Pc,Tali',
        ]);
        $stock->update([
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'category' => $request->input('category'),
        ]);
        return redirect()->route('inventory.index')->with('message', 'Stock updated successfully');
    }

    public function destroy(Product $product, Stock $stock)
    {
        // Save to InventoryStockTrail before deleting
        InventoryStockTrail::create([
            'stock_id' => $stock->id,
            'product_id' => $stock->product_id,
            'quantity' => $stock->quantity,
            'member_id' => $stock->member_id,
            'category' => $stock->category,
        ]);
        $stock->delete();
        return redirect()->route('inventory.index')->with('message', 'Stock deleted and saved to trail successfully');
    }
}
