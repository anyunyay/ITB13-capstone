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
        
        // Get available categories based on product pricing
        $availableCategories = [];
        if ($product->price_kilo) $availableCategories[] = 'Kilo';
        if ($product->price_pc) $availableCategories[] = 'Pc';
        if ($product->price_tali) $availableCategories[] = 'Tali';
        
        return Inertia::render('Inventory/Stock/addStock', compact('product', 'products', 'members', 'availableCategories'));
    }

    public function storeStock(Request $request, Product $product)
    {
        // Get available categories for this product
        $availableCategories = [];
        if ($product->price_kilo) $availableCategories[] = 'Kilo';
        if ($product->price_pc) $availableCategories[] = 'Pc';
        if ($product->price_tali) $availableCategories[] = 'Tali';
        
        // Validate the request data
        $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:users,id',
            'category' => 'required|in:' . implode(',', $availableCategories),
        ]);

        // Create a new stock entry
        $product->stocks()->create([
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'category' => $request->input('category'),
        ]);

        return redirect()->route('inventory.index')->with('message', 'Stock added successfully');
    }

    public function editStock(Product $product, Stock $stock)
    {
        $members = User::where('type', 'member')->get(['id', 'name']);
        
        // Get available categories based on product pricing
        $availableCategories = [];
        if ($product->price_kilo) $availableCategories[] = 'Kilo';
        if ($product->price_pc) $availableCategories[] = 'Pc';
        if ($product->price_tali) $availableCategories[] = 'Tali';
        
        return Inertia::render('Inventory/Stock/editStock', [
            'product' => $product,
            'stock' => $stock,
            'members' => $members,
            'availableCategories' => $availableCategories,
        ]);
    }

    public function updateStock(Request $request, Product $product, Stock $stock)
    {
        // Get available categories for this product
        $availableCategories = [];
        if ($product->price_kilo) $availableCategories[] = 'Kilo';
        if ($product->price_pc) $availableCategories[] = 'Pc';
        if ($product->price_tali) $availableCategories[] = 'Tali';
        
        $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'member_id' => 'required|exists:users,id',
            'category' => 'required|in:' . implode(',', $availableCategories),
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
        $stocks = $product->stocks()->available()->get();
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
        $stocks = Stock::removed()->with(['product', 'member', 'lastCustomer'])
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
