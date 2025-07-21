<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Stock;
use App\Models\InventoryStockTrail;
use App\Models\SellCategory;
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
        $members = User::where('type', 'member')->get(['id', 'name']);
        $categories = SellCategory::all(['id', 'sell_category']);
        return Inertia::render('Inventory/Stock/addStock', compact('product', 'products', 'members', 'categories'));
    }

    public function storeStock(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:users,id',
            'sell_category_id' => 'required|exists:sell_categories,id',
        ]);
        $product->stocks()->create([
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'sell_category_id' => $request->input('sell_category_id'),
        ]);
        return redirect()->route('inventory.index')->with('message', 'Stock added successfully');
    }

    public function editStock(Product $product, Stock $stock)
    {
        $members = User::where('type', 'member')->get(['id', 'name']);
        $categories = SellCategory::all(['id', 'sell_category']);
        return Inertia::render('Inventory/Stock/editStock', [
            'product' => $product,
            'stock' => $stock,
            'members' => $members,
            'categories' => $categories,
        ]);
    }

    public function updateStock(Request $request, Product $product, Stock $stock)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:users,id',
            'sell_category_id' => 'required|exists:sell_categories,id',
        ]);
        $stock->update([
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'sell_category_id' => $request->input('sell_category_id'),
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
            'sell_category_id' => $stock->sell_category_id,
        ]);
        $stock->delete();
        return redirect()->route('inventory.index')->with('message', 'Stock deleted and saved to trail successfully');
    }
}
