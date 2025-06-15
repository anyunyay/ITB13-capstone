<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $products = Product::all();
        return Inertia::render('Inventory/index', compact('products'));
    }

    public function create()
    {
        return Inertia::render('Inventory/create', []);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        Product::create($request->all());
        // Store the inventory item (logic to save to database would go here)
        // Redirect back to the inventory index with a success message
        return redirect()->route('inventory.index')->with('message', 'Inventory item created successfully');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Inventory/edit', compact('product'));
    }

    public function update(Request $request, Product $product)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $product->update([
            'name' => $request->input('name'),
            'price' => $request->input('price'),
            'description' => $request->input('description'),
        ]);
        return redirect()->route('inventory.index')->with('message', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('inventory.index')->with('message', 'Inventory item deleted successfully');
    }
}
