<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryStockController extends Controller
{
    public function index()
    { 
        $products = Product::active()->get();
        $stocks = Stock::active()->get(); // Only active (non-removed) stocks
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

    public function removeStock(Product $product)
    {
        $stocks = $product->stocks()->where('quantity', '>', 0)->active()->get();
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

        // Mark stock as removed using the new method
        $stock->remove($request->reason);

        return redirect()->route('inventory.index')->with('message', 'Perished stock removed successfully');
    }

    public function removedStocks()
    {
        $stocks = Stock::removed()->with(['product', 'member', 'customer'])
            ->orderBy('removed_at', 'asc')
            ->get();
        return Inertia::render('Inventory/Stock/removedStock', compact('stocks'));
    }

    public function restoreStock(Stock $stock)
    {
        $stock->restore();
        return redirect()->back()->with('message', 'Stock restored successfully');
    }
}
