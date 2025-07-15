<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    { 
        $products = Product::active()->get();
        $stocks = Stock::all(); // Eager loads product and member due to $with
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
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->file('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/products/'), $imageName);
            
            Product::create([
                'name' => $request->input('name'),
                'price' => $request->input('price'),
                'description' => $request->input('description'),
                'image' => 'images/products/' . $imageName,
            ]);
        }

        return redirect()->route('inventory.index')->with('message', 'Inventory item created successfully');
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
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($product) {
            $product->update([
                'name' => $request->input('name'),
                'price' => $request->input('price'),
                'description' => $request->input('description'),
            ]);
        }
        
        if ($request->file('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images'), $imageName);
            
            $product->image = 'images/' . $imageName;
        }

        $product->save();
        return redirect()->route('inventory.index')->with('message', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        // Delete the image file if it exists
        if ($product->image && file_exists(public_path($product->image))) {
            unlink(public_path($product->image));
        }
        
        $product->delete();
        return redirect()->route('inventory.index')->with('message', 'Inventory item deleted successfully');
    }
}
