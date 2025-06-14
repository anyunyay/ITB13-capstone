<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/index', []);
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
}
