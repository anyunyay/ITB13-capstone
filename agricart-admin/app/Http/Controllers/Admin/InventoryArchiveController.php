<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryArchiveController extends Controller
{
    public function index()
    {
        $archivedProducts = Product::archived()->get();
        return inertia('Inventory/Product/archive', compact('archivedProducts'));
    }

    public function archive(Product $product)
    {
        $product->archived_at = now();
        $product->save();

        return redirect()->route('inventory.index')->with('message', 'Product archived successfully');
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
