<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use App\Models\ProductPriceHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

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

        // Custom validation to ensure at least one price is provided
        if (empty($request->input('price_kilo')) && empty($request->input('price_pc')) && empty($request->input('price_tali'))) {
            return redirect()->back()->withErrors([
                'prices' => 'At least one price (per kilo, per piece, or per tali) must be provided.',
            ])->withInput();
        }

        if ($request->file('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/products/'), $imageName);
            
            $product = Product::create([
                'name' => $request->input('name'),
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
                'description' => $request->input('description'),
                'image' => 'images/products/' . $imageName,
                'produce_type' => $request->input('produce_type'),
            ]);

            // Record initial price snapshot
            ProductPriceHistory::create([
                'product_id' => $product->id,
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
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

        // Custom validation to ensure at least one price is provided
        if (empty($request->input('price_kilo')) && empty($request->input('price_pc')) && empty($request->input('price_tali'))) {
            return redirect()->back()->withErrors([
                'prices' => 'At least one price (per kilo, per piece, or per tali) must be provided.',
            ])->withInput();
        }

        if ($product) {
            $original = $product->only(['price_kilo', 'price_pc', 'price_tali']);

            $product->update([
                'name' => $request->input('name'),
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
                'description' => $request->input('description'),
                'produce_type' => $request->input('produce_type'),
            ]);

            // If any price changed, record snapshot
            $changed = (
                $original['price_kilo'] != $product->price_kilo ||
                $original['price_pc'] != $product->price_pc ||
                $original['price_tali'] != $product->price_tali
            );

            if ($changed) {
                ProductPriceHistory::create([
                    'product_id' => $product->id,
                    'price_kilo' => $product->price_kilo,
                    'price_pc' => $product->price_pc,
                    'price_tali' => $product->price_tali,
                ]);
            }
        }
        
        if ($request->file('image')) {
            // Delete the old image file if it exists
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }
            
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/products/'), $imageName);
            
            $product->image = 'images/products/' . $imageName;
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

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $category = $request->get('category', 'all');
        $status = $request->get('status', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = Stock::with(['product', 'member', 'lastCustomer']);

        // Filter by date range (based on stock creation date)
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Filter by category
        if ($category !== 'all') {
            $query->where('category', $category);
        }

        // Filter by status
        if ($status !== 'all') {
            switch ($status) {
                case 'available':
                    $query->available();
                    break;
                case 'sold':
                    $query->sold();
                    break;
                case 'partial':
                    $query->partial();
                    break;
                case 'removed':
                    $query->removed();
                    break;
            }
        }

        $stocks = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_stocks' => $stocks->count(),
            'total_quantity' => $stocks->sum('quantity'),
            'available_stocks' => $stocks->where('quantity', '>', 0)->whereNull('last_customer_id')->whereNull('removed_at')->count(),
            'sold_stocks' => $stocks->where('quantity', 0)->whereNotNull('last_customer_id')->whereNull('removed_at')->count(),
            'partial_stocks' => $stocks->where('quantity', '>', 0)->whereNotNull('last_customer_id')->whereNull('removed_at')->count(),
            'removed_stocks' => $stocks->whereNotNull('removed_at')->count(),
            'total_products' => $stocks->pluck('product_id')->unique()->count(),
            'total_members' => $stocks->pluck('member_id')->unique()->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($stocks, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($stocks, $summary);
        }

        // Return view for display
        return Inertia::render('Admin/Inventory/report', [
            'stocks' => $stocks,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category' => $category,
                'status' => $status,
            ],
        ]);
    }

    private function exportToCsv($stocks, $summary)
    {
        $filename = 'inventory_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($stocks, $summary) {
            $file = fopen('php://output', 'w');

            // Write stock data headers
            fputcsv($file, [
                'Stock ID',
                'Product Name',
                'Quantity',
                'Category',
                'Member',
                'Status',
                'Created At',
                'Removed At',
                'Notes'
            ]);

            // Write stock data
            foreach ($stocks as $stock) {
                $status = 'Available';
                if ($stock->removed_at) {
                    $status = 'Removed';
                } elseif ($stock->quantity == 0 && $stock->last_customer_id) {
                    $status = 'Sold';
                } elseif ($stock->quantity > 0 && $stock->last_customer_id) {
                    $status = 'Partial';
                }

                fputcsv($file, [
                    $stock->id,
                    $stock->product->name ?? 'N/A',
                    $stock->quantity,
                    $stock->category,
                    $stock->member->name ?? 'N/A',
                    $status,
                    $stock->created_at->format('Y-m-d H:i:s'),
                    $stock->removed_at ? $stock->removed_at->format('Y-m-d H:i:s') : 'N/A',
                    $stock->notes ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function exportToPdf($stocks, $summary)
    {
        $html = view('reports.inventory-pdf', [
            'stocks' => $stocks,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'inventory_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
