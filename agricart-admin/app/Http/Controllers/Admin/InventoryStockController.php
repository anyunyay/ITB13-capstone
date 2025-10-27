<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Product;
use App\Models\User;
use App\Models\Stock;
use App\Models\StockTrail;
use App\Notifications\InventoryUpdateNotification;
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
        
        // Set default category if only one is available
        $defaultCategory = count($availableCategories) === 1 ? $availableCategories[0] : null;
        
        return Inertia::render('Inventory/Stock/addStock', compact('product', 'products', 'members', 'availableCategories', 'defaultCategory'));
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
        $stock = $product->stocks()->create([
            'quantity' => $request->input('quantity'),
            'sold_quantity' => 0, // Initialize sold quantity to 0
            'initial_quantity' => $request->input('quantity'), // Set initial quantity
            'member_id' => $request->input('member_id'),
            'category' => $request->input('category'),
        ]);

        // Record stock trail
        StockTrail::record(
            stockId: $stock->id,
            productId: $product->id,
            actionType: 'created',
            oldQuantity: 0,
            newQuantity: $request->input('quantity'),
            memberId: $request->input('member_id'),
            category: $request->input('category'),
            notes: 'Stock created',
            performedBy: $request->user()->id,
            performedByType: $request->user()->type
        );

        // Log stock creation
        SystemLogger::logStockUpdate(
            $stock->id,
            $product->id,
            0,
            $request->input('quantity'),
            $request->user()->id,
            $request->user()->type,
            'stock_created',
            [
                'member_id' => $request->input('member_id'),
                'category' => $request->input('category'),
                'product_name' => $product->name
            ]
        );

        // Notify admin and staff about inventory update
        $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InventoryUpdateNotification($stock, 'added', $stock->member));
        }

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
        $oldQuantity = $stock->quantity;
        
        $stock->update([
            'quantity' => $request->input('quantity'),
            'member_id' => $request->input('member_id'),
            'category' => $request->input('category'),
        ]);

        // Record stock trail
        StockTrail::record(
            stockId: $stock->id,
            productId: $product->id,
            actionType: 'updated',
            oldQuantity: $oldQuantity,
            newQuantity: $request->input('quantity'),
            memberId: $request->input('member_id'),
            category: $request->input('category'),
            notes: 'Stock updated',
            performedBy: $request->user()->id,
            performedByType: $request->user()->type
        );

        // Log stock update
        SystemLogger::logStockUpdate(
            $stock->id,
            $product->id,
            $oldQuantity,
            $request->input('quantity'),
            $request->user()->id,
            $request->user()->type,
            'stock_updated',
            [
                'member_id' => $request->input('member_id'),
                'category' => $request->input('category'),
                'product_name' => $product->name
            ]
        );

        // Notify admin and staff about inventory update
        $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InventoryUpdateNotification($stock, 'updated', $stock->member));
        }

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

        $oldQuantity = $stock->quantity;
        
        // Mark stock as removed using the new method
        $stock->remove($request->reason);

        // Record stock trail
        StockTrail::record(
            stockId: $stock->id,
            productId: $product->id,
            actionType: 'removed',
            oldQuantity: $oldQuantity,
            newQuantity: 0,
            memberId: $stock->member_id,
            category: $stock->category,
            notes: $request->reason,
            performedBy: $request->user()->id,
            performedByType: $request->user()->type
        );

        // Log stock removal
        SystemLogger::logStockUpdate(
            $stock->id,
            $product->id,
            $oldQuantity,
            0,
            $request->user()->id,
            $request->user()->type,
            'stock_removed',
            [
                'member_id' => $stock->member_id,
                'category' => $stock->category,
                'product_name' => $product->name,
                'reason' => $request->reason
            ]
        );

        // Notify admin and staff about inventory update
        $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InventoryUpdateNotification($stock, 'removed', $stock->member));
        }

        return redirect()->route('inventory.index')->with('message', 'Perished stock removed successfully');
    }

    public function removedStocks()
    {
        $stocks = Stock::removed()->with(['product', 'member'])
            ->orderBy('removed_at', 'asc')
            ->get();
        return Inertia::render('Inventory/Stock/removedStock', compact('stocks'));
    }

    public function restoreStock(Stock $stock)
    {
        $oldQuantity = $stock->quantity;
        
        $stock->restore();
        
        // Record stock trail
        StockTrail::record(
            stockId: $stock->id,
            productId: $stock->product_id,
            actionType: 'restored',
            oldQuantity: $oldQuantity,
            newQuantity: $stock->quantity,
            memberId: $stock->member_id,
            category: $stock->category,
            notes: 'Stock restored',
            performedBy: request()->user()->id,
            performedByType: request()->user()->type
        );
        
        // Log stock restoration
        SystemLogger::logStockUpdate(
            $stock->id,
            $stock->product_id,
            $oldQuantity,
            $stock->quantity,
            request()->user()->id,
            request()->user()->type,
            'stock_restored',
            [
                'member_id' => $stock->member_id,
                'category' => $stock->category,
                'product_name' => $stock->product->name
            ]
        );
        
        return redirect()->back()->with('message', 'Stock restored successfully');
    }
}
