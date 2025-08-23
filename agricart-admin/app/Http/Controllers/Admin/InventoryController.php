<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    { 
        $products = Product::active()->get();
        $stocks = Stock::active()->get();
        return Inertia::render('Inventory/index', compact('products', 'stocks'));
    }

    public function create()
    {
        return Inertia::render('Inventory/Product/create', []);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'price_kilo' => 'nullable|numeric|min:0',
            'price_pc' => 'nullable|numeric|min:0',
            'price_tali' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->file('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/products/'), $imageName);
            
            Product::create([
                'name' => $request->input('name'),
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
                'description' => $request->input('description'),
                'image' => 'images/products/' . $imageName,
                'produce_type' => $request->input('produce_type'),
            ]);
        }

        return redirect()->route('inventory.index')->with('flash', [
            'type' => 'success',
            'message' => 'Inventory item created successfully'
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Inventory/Product/edit', compact('product'));
    }

    public function update(Request $request, Product $product)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'price_kilo' => 'nullable|numeric|min:0',
            'price_pc' => 'nullable|numeric|min:0',
            'price_tali' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($product) {
            $product->update([
                'name' => $request->input('name'),
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
                'description' => $request->input('description'),
                'produce_type' => $request->input('produce_type'),
            ]);
        }
        
        if ($request->file('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images'), $imageName);
            
            $product->image = 'images/' . $imageName;
        }

        $product->save();
        return redirect()->route('inventory.index')->with('flash', [
            'type' => 'success',
            'message' => 'Product updated successfully'
        ]);
    }

    public function destroy(Product $product)
    {
        // Check if the product can be deleted
        if (!$product->canBeDeleted()) {
            $reason = $product->getDeletionRestrictionReason();
            return redirect()->route('inventory.index')
                ->with('flash', [
                    'type' => 'error',
                    'message' => "Cannot delete product '{$product->name}'. {$reason}"
                ]);
        }

        // Delete the image file if it exists
        if ($product->image && file_exists(public_path($product->image))) {
            unlink(public_path($product->image));
        }
        
        $product->delete();
        return redirect()->route('inventory.index')->with('flash', [
            'type' => 'success',
            'message' => 'Inventory item deleted successfully'
        ]);
    }
}
