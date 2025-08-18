<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Stock;
use App\Models\RemovedStock;
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
        return Inertia::render('Inventory/Stock/addStock', compact('product', 'products', 'members'));
    }

    public function storeStock(Request $request, Product $product)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:users,id',
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
        $members = User::where('type', 'member')->get(['id', 'name']);
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
            'member_id' => 'required|exists:users,id',
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
        // Save to RemovedStock before deleting
        RemovedStock::create([
            'stock_id' => $stock->id,
            'product_id' => $stock->product_id,
            'quantity' => $stock->quantity,
            'member_id' => $stock->member_id,
            'customer_id' => $stock->customer_id,
            'category' => $stock->category,
            'status' => 'removed',
        ]);
        $stock->delete();
        return redirect()->route('inventory.index')->with('message', 'Stock deleted and saved to trail successfully');
    }

    public function removeStock(Product $product)
    {
        $stocks = $product->stocks()->where('quantity', '>', 0)->get();
        return Inertia::render('Inventory/Stock/removeStock', [
            'product' => $product,
            'stocks' => $stocks,
        ]);
    }

    public function storeRemoveStock(Request $request, Product $product)
    {
        $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'reason' => 'required|string|max:500',
        ]);

        $stock = Stock::findOrFail($request->stock_id);
        
        // Verify the stock belongs to this product
        if ($stock->product_id !== $product->id) {
            return redirect()->back()->withErrors(['stock_id' => 'Invalid stock selected.']);
        }

        // Save to RemovedStock before removing
        RemovedStock::create([
            'stock_id' => $stock->id,
            'product_id' => $stock->product_id,
            'quantity' => $stock->quantity,
            'member_id' => $stock->member_id,
            'customer_id' => $stock->customer_id,
            'category' => $stock->category,
            'status' => 'removed',
            'notes' => $request->reason,
        ]);

        // Remove the stock
        $stock->delete();

        return redirect()->route('inventory.index')->with('message', 'Perished stock removed successfully');
    }
}
