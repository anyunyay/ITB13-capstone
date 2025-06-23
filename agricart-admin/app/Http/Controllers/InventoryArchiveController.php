<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryArchiveController extends Controller
{
    public function index()
    {
        $archivedProducts = Product::archived()->get();
        return inertia('Inventory/archive', compact('archivedProducts'));
    }

    public function restore($productId)
    {
        $product = Product::archived()->findOrFail($productId);
        $product->archived_at = null;
        $product->save();

        return redirect()->route('inventory.archived.index')->with('message', 'Product restored successfully');
    }

    public function forceDelete($productId)
    {
        $product = Product::archived()->findOrFail($productId);
        // Delete the image file if it exists
        if ($product->image && file_exists(public_path($product->image))) {
            unlink(public_path($product->image));
        }
        $product->delete();
        return redirect()->route('inventory.archived.index')->with('message', 'Product permanently deleted');
    }
}
