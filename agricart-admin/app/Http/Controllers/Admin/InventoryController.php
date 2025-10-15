<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use App\Models\ProductPriceHistory;
use App\Models\PriceTrend;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class InventoryController extends Controller
{
    public function index()
    { 
        $products = Product::active()->get();
        $archivedProducts = Product::archived()->get();
        $stocks = Stock::active()->with(['product', 'member', 'lastCustomer'])->get();
        $removedStocks = Stock::removed()->with(['product', 'member', 'lastCustomer'])->orderBy('removed_at', 'desc')->limit(50)->get();
        $soldStocks = Stock::sold()->with(['product', 'member', 'lastCustomer'])->orderBy('updated_at', 'desc')->limit(50)->get();
        $auditTrails = AuditTrail::with(['product', 'stock', 'sale'])->orderBy('created_at', 'desc')->limit(100)->get();
        $categories = Product::active()->distinct()->pluck('produce_type')->filter()->values()->toArray();
        return Inertia::render('Inventory/index', compact('products', 'archivedProducts', 'stocks', 'removedStocks', 'soldStocks', 'auditTrails', 'categories'));
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

            // If any price changed, record snapshot and handle price trends
            $changed = (
                $original['price_kilo'] != $product->price_kilo ||
                $original['price_pc'] != $product->price_pc ||
                $original['price_tali'] != $product->price_tali
            );

            if ($changed) {
                // Record in ProductPriceHistory
                ProductPriceHistory::create([
                    'product_id' => $product->id,
                    'price_kilo' => $product->price_kilo,
                    'price_pc' => $product->price_pc,
                    'price_tali' => $product->price_tali,
                ]);

                // Get the very original prices for price trend comparison
                $veryOriginalPrices = $this->getVeryOriginalPrices($product, $original);


                // Handle PriceTrend records
                $this->handlePriceTrendUpdate($product, $veryOriginalPrices);
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
        $display = $request->get('display', false); // true for display mode

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
            return $this->exportToCsv($stocks, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($stocks, $summary, $display);
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

    private function exportToCsv($stocks, $summary, $display = false)
    {
        $filename = 'inventory_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        if ($display) {
            // For display mode, return as plain text to show in browser
            $headers = [
                'Content-Type' => 'text/plain',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ];
        } else {
            // For download mode, return as CSV attachment
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];
        }

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

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($stocks, $summary, $display = false)
    {
        $html = view('reports.inventory-pdf', [
            'stocks' => $stocks,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'inventory_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Get the very original prices for price trend comparison
     */
    private function getVeryOriginalPrices(Product $product, array $immediateOriginal)
    {
        // For the first update, use immediate original prices
        // For subsequent updates, we need to find the truly original prices
        // by looking at the first price history record that was created at product creation time
        
        // Get all price history records ordered by creation time
        $allPriceHistories = $product->priceHistories()
            ->orderBy('created_at', 'asc')
            ->get();

        if ($allPriceHistories->count() <= 1) {
            // This is the first update, use immediate original prices
            return $immediateOriginal;
        }

        // For subsequent updates, we need to find the record that represents
        // the original prices before any updates. This should be the first record
        // that was created when the product was first created.
        // We can identify this by checking if it matches the immediate original prices
        // (which represent the prices before the current update)
        
        // If the first record matches the immediate original prices, then the immediate original
        // prices are the truly original prices
        $firstRecord = $allPriceHistories->first();
        if ($firstRecord->price_kilo == $immediateOriginal['price_kilo'] &&
            $firstRecord->price_pc == $immediateOriginal['price_pc'] &&
            $firstRecord->price_tali == $immediateOriginal['price_tali']) {
            return $immediateOriginal;
        }

        // Otherwise, the first record contains the original prices
        return [
            'price_kilo' => $firstRecord->price_kilo,
            'price_pc' => $firstRecord->price_pc,
            'price_tali' => $firstRecord->price_tali,
        ];
    }

    /**
     * Get the previous day's prices for same-day reversion detection
     */
    private function getPreviousDayPrices(Product $product)
    {
        $yesterday = now()->subDay()->toDateString();
        
        // Get the most recent price trend record from yesterday
        $yesterdayPriceTrend = PriceTrend::where('product_name', $product->name)
            ->whereDate('date', $yesterday)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($yesterdayPriceTrend) {
            return [
                'price_kilo' => $yesterdayPriceTrend->price_per_kg,
                'price_pc' => $yesterdayPriceTrend->price_per_pc,
                'price_tali' => $yesterdayPriceTrend->price_per_tali,
            ];
        }

        // If no yesterday's price trend, get from the first price history record
        $firstPriceHistory = $product->priceHistories()
            ->orderBy('created_at', 'asc')
            ->first();

        if ($firstPriceHistory) {
            return [
                'price_kilo' => $firstPriceHistory->price_kilo,
                'price_pc' => $firstPriceHistory->price_pc,
                'price_tali' => $firstPriceHistory->price_tali,
            ];
        }

        return null;
    }

    /**
     * Handle price trend updates when product prices change
     */
    private function handlePriceTrendUpdate(Product $product, array $originalPrices)
    {
        $today = now()->toDateString();
        
        // Check if there are price trend records for today
        $todayPriceTrends = PriceTrend::where('product_name', $product->name)
            ->whereDate('date', $today)
            ->get();

        // Only check for reversion if there are existing price trend records for today
        $shouldCheckReversion = $todayPriceTrends->isNotEmpty();
        
        if ($shouldCheckReversion) {
            // For same-day reversion detection, get the previous day's prices as reference
            $previousDayPrices = $this->getPreviousDayPrices($product);

            // Check if prices reverted to previous day's prices (same-day reversion)
            $pricesRevertedToPrevious = false;
            if ($previousDayPrices) {
                $pricesRevertedToPrevious = (
                    $previousDayPrices['price_kilo'] == $product->price_kilo &&
                    $previousDayPrices['price_pc'] == $product->price_pc &&
                    $previousDayPrices['price_tali'] == $product->price_tali
                );
            }

            // Check if prices reverted to very original prices
            $pricesRevertedToOriginal = (
                $originalPrices['price_kilo'] == $product->price_kilo &&
                $originalPrices['price_pc'] == $product->price_pc &&
                $originalPrices['price_tali'] == $product->price_tali
            );

            if ($pricesRevertedToPrevious || $pricesRevertedToOriginal) {
                // Delete all price trend records for same-day reversion
                $todayPriceTrends->each->delete();
                return; // Exit early if records were deleted
            }
        }

        // Only create/update records if prices actually changed from original
        $hasChanges = (
            $originalPrices['price_kilo'] != $product->price_kilo ||
            $originalPrices['price_pc'] != $product->price_pc ||
            $originalPrices['price_tali'] != $product->price_tali
        );

        if ($hasChanges) {
            if ($todayPriceTrends->isNotEmpty()) {
                // Update existing records
                $this->updatePriceTrendRecords($product, $todayPriceTrends, $originalPrices);
            } else {
                // Create new price trend records for changed prices only
                $this->createPriceTrendRecords($product, $originalPrices);
            }
        }
    }

    /**
     * Update existing price trend records
     */
    private function updatePriceTrendRecords(Product $product, $existingTrends, array $originalPrices)
    {
        $today = now()->toDateString();

        // Update or create records for each price type that has a value and changed
        if ($product->price_kilo && $originalPrices['price_kilo'] != $product->price_kilo) {
            $kiloTrend = $existingTrends->where('unit_type', 'kg')->first();
            if ($kiloTrend) {
                $kiloTrend->update(['price_per_kg' => $product->price_kilo]);
            } else {
                PriceTrend::create([
                    'product_name' => $product->name,
                    'date' => $today,
                    'price_per_kg' => $product->price_kilo,
                    'price_per_tali' => null,
                    'price_per_pc' => null,
                    'unit_type' => 'kg',
                ]);
            }
        }

        if ($product->price_tali && $originalPrices['price_tali'] != $product->price_tali) {
            $taliTrend = $existingTrends->where('unit_type', 'tali')->first();
            if ($taliTrend) {
                $taliTrend->update(['price_per_tali' => $product->price_tali]);
            } else {
                PriceTrend::create([
                    'product_name' => $product->name,
                    'date' => $today,
                    'price_per_kg' => null,
                    'price_per_tali' => $product->price_tali,
                    'price_per_pc' => null,
                    'unit_type' => 'tali',
                ]);
            }
        }

        if ($product->price_pc && $originalPrices['price_pc'] != $product->price_pc) {
            $pcTrend = $existingTrends->where('unit_type', 'pc')->first();
            if ($pcTrend) {
                $pcTrend->update(['price_per_pc' => $product->price_pc]);
            } else {
                PriceTrend::create([
                    'product_name' => $product->name,
                    'date' => $today,
                    'price_per_kg' => null,
                    'price_per_tali' => null,
                    'price_per_pc' => $product->price_pc,
                    'unit_type' => 'pc',
                ]);
            }
        }
    }

    /**
     * Create price trend records for changed price types only
     */
    private function createPriceTrendRecords(Product $product, array $originalPrices)
    {
        $today = now()->toDateString();

        // Create records for each price type that has a value and changed
        if ($product->price_kilo && $originalPrices['price_kilo'] != $product->price_kilo) {
            PriceTrend::create([
                'product_name' => $product->name,
                'date' => $today,
                'price_per_kg' => $product->price_kilo,
                'price_per_tali' => null,
                'price_per_pc' => null,
                'unit_type' => 'kg',
            ]);
        }

        if ($product->price_tali && $originalPrices['price_tali'] != $product->price_tali) {
            PriceTrend::create([
                'product_name' => $product->name,
                'date' => $today,
                'price_per_kg' => null,
                'price_per_tali' => $product->price_tali,
                'price_per_pc' => null,
                'unit_type' => 'tali',
            ]);
        }

        if ($product->price_pc && $originalPrices['price_pc'] != $product->price_pc) {
            PriceTrend::create([
                'product_name' => $product->name,
                'date' => $today,
                'price_per_kg' => null,
                'price_per_tali' => null,
                'price_per_pc' => $product->price_pc,
                'unit_type' => 'pc',
            ]);
        }
    }
}
