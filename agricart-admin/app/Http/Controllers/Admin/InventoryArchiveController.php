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
        return Inertia::render('Inventory/Product/archive', compact('archivedProducts'));
    }

    public function archive(Product $product)
    {
        // Check if there are any available stocks for this product
        $availableStocks = $product->stocks()->available()->count();
        
        if ($availableStocks > 0) {
            return redirect()->route('inventory.index')
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'Cannot archive product. There are still available stocks. Please remove perished stock first.'
                ]);
        }

        $product->archived_at = now();
        $product->save();

        return redirect()->route('inventory.index')->with('flash', [
            'type' => 'success',
            'message' => 'Product archived successfully'
        ]);
    }

    public function restore($productId)
    {
        $product = Product::archived()->findOrFail($productId);
        $product->archived_at = null;
        $product->save();

        return redirect()->route('inventory.archived.index')->with('flash', [
            'type' => 'success',
            'message' => 'Product restored successfully'
        ]);
    }

    public function forceDelete($productId)
    {
        $product = Product::archived()->findOrFail($productId);
        
        // Check if the product can be deleted (even if archived)
        if (!$product->canBeDeleted()) {
            $reason = $product->getDeletionRestrictionReason();
            return redirect()->route('inventory.archived.index')
                ->with('flash', [
                    'type' => 'error',
                    'message' => "Cannot permanently delete product '{$product->name}'. {$reason}"
                ]);
        }
        
        // Delete the image file if it exists
        if ($product->image && file_exists(public_path($product->image))) {
            unlink(public_path($product->image));
        }
        $product->delete();
        return redirect()->route('inventory.archived.index')->with('flash', [
            'type' => 'success',
            'message' => 'Product permanently deleted'
        ]);
    }
}
