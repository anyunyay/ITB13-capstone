<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use App\Models\ProductPriceHistory;
use App\Models\PriceTrend;
use App\Models\StockTrail;
use App\Helpers\SystemLogger;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class InventoryController extends Controller
{
    public function index()
    {
        // Optimize queries with selective loading and limits

        // Load products with only essential fields, defer expensive stock calculations
        $products = Product::active()
            ->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali', 'description', 'image', 'produce_type', 'created_at')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                // Only calculate stock status for products that might have stock
                $product->has_stock = cache()->remember("product_stock_{$product->id}", 300, function () use ($product) {
                    return $product->hasAvailableStock();
                });
                // Check if product can be deleted
                $product->can_be_deleted = cache()->remember("product_can_delete_{$product->id}", 300, function () use ($product) {
                    return $product->canBeDeleted();
                });
                // Get deletion restriction reason
                $product->deletion_reason = cache()->remember("product_deletion_reason_{$product->id}", 300, function () use ($product) {
                    return $product->getDeletionRestrictionReason();
                });
                return $product;
            });

        $archivedProducts = Product::archived()
            ->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali', 'description', 'image', 'produce_type', 'created_at', 'archived_at')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                // Check if product can be deleted
                $product->can_be_deleted = cache()->remember("product_can_delete_{$product->id}", 300, function () use ($product) {
                    return $product->canBeDeleted();
                });
                // Get deletion restriction reason
                $product->deletion_reason = cache()->remember("product_deletion_reason_{$product->id}", 300, function () use ($product) {
                    return $product->getDeletionRestrictionReason();
                });
                return $product;
            });

        // Optimize stock loading with selective fields and efficient relations
        // Exclude zero-quantity stocks as they're now managed in Stock Trail
        $stocks = Stock::active()
            ->where('quantity', '>', 0) // Only show stocks with available quantity
            ->with([
                'product' => function ($query) {
                    $query->select('id', 'name', 'produce_type');
                },
                'member' => function ($query) {
                    $query->select('id', 'name');
                }
            ])
            ->select('id', 'product_id', 'member_id', 'quantity', 'sold_quantity', 'category', 'notes', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Significantly reduce historical data payload
        $removedStocks = Stock::removed()
            ->with([
                'product' => function ($query) {
                    $query->select('id', 'name');
                },
                'member' => function ($query) {
                    $query->select('id', 'name');
                }
            ])
            ->select('id', 'product_id', 'member_id', 'quantity', 'sold_quantity', 'category', 'removed_at', 'notes')
            ->orderBy('removed_at', 'desc')
            ->limit(20) // Reduced from 50
            ->get();

        $soldStocks = Stock::sold()
            ->with([
                'product' => function ($query) {
                    $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
                },
                'member' => function ($query) {
                    $query->select('id', 'name');
                },
                'stockTrails' => function ($query) {
                    // Get the most recent trail entry (likely the 'completed' or final 'sale' action)
                    $query->with(['performedByUser' => function ($q) {
                        $q->select('id', 'name', 'type');
                    }])
                    ->select('id', 'stock_id', 'performed_by', 'performed_by_type', 'action_type', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(1);
                }
            ])
            ->select('id', 'product_id', 'member_id', 'quantity', 'sold_quantity', 'category', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->limit(20) // Reduced from 50
            ->get()
            ->map(function ($stock) {
                // Get the most recent stock trail entry to find who processed the final action
                $latestTrail = $stock->stockTrails->first();
                return [
                    'id' => $stock->id,
                    'product_id' => $stock->product_id,
                    'member_id' => $stock->member_id,
                    'quantity' => $stock->quantity,
                    'sold_quantity' => $stock->sold_quantity,
                    'category' => $stock->category,
                    'updated_at' => $stock->updated_at,
                    'sold_at' => $latestTrail ? $latestTrail->created_at : $stock->updated_at, // Date when fully sold
                    'product' => $stock->product,
                    'member' => $stock->member,
                    'performed_by_user' => $latestTrail && $latestTrail->performedByUser ? [
                        'id' => $latestTrail->performedByUser->id,
                        'name' => $latestTrail->performedByUser->name,
                        'type' => $latestTrail->performedByUser->type,
                    ] : null,
                    'performed_by_type' => $latestTrail ? $latestTrail->performed_by_type : null,
                ];
            });

        // Drastically reduce stock trails for initial load
        $stockTrails = StockTrail::with([
            'product' => function ($query) {
                $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
            },
            'member' => function ($query) {
                $query->select('id', 'name');
            },
            'performedByUser' => function ($query) {
                $query->select('id', 'name', 'type');
            }
        ])
            ->select('id', 'stock_id', 'product_id', 'member_id', 'action_type', 'old_quantity', 'new_quantity', 'category', 'notes', 'performed_by', 'performed_by_type', 'created_at')
            ->orderBy('created_at', 'desc') // IMPORTANT: Primary sort - most recent first
            ->orderBy('stock_id', 'desc') // Secondary sort - within same timestamp, latest stock first
            ->limit(30) // Reduced from 200
            ->get()
            ->map(function ($trail) {
                // Explicitly include performed_by_user data in the response
                return [
                    'id' => $trail->id,
                    'stock_id' => $trail->stock_id,
                    'product_id' => $trail->product_id,
                    'member_id' => $trail->member_id,
                    'action_type' => $trail->action_type,
                    'old_quantity' => $trail->old_quantity,
                    'new_quantity' => $trail->new_quantity,
                    'category' => $trail->category,
                    'notes' => $trail->notes,
                    'performed_by' => $trail->performed_by,
                    'performed_by_type' => $trail->performed_by_type,
                    'created_at' => $trail->created_at,
                    'product' => $trail->product,
                    'member' => $trail->member,
                    'performed_by_user' => $trail->performedByUser ? [
                        'id' => $trail->performedByUser->id,
                        'name' => $trail->performedByUser->name,
                        'type' => $trail->performedByUser->type,
                    ] : null,
                ];
            });

        // Cache categories to avoid repeated queries
        $categories = cache()->remember('product_categories', 3600, function () {
            return Product::active()->distinct()->pluck('produce_type')->filter()->values()->toArray();
        });

        // Get members for stock management (only active members)
        $members = \App\Models\User::where('type', 'member')->where('active', true)->get(['id', 'name']);
        
        // Get all available categories (Kilo, Pc, Tali)
        $availableCategories = ['Kilo', 'Pc', 'Tali'];

        // Pass empty array for auditTrails to maintain compatibility with frontend
        $auditTrails = [];

        return Inertia::render('Inventory/index', compact('products', 'archivedProducts', 'stocks', 'removedStocks', 'soldStocks', 'auditTrails', 'stockTrails', 'categories', 'members', 'availableCategories'));
    }

    public function create()
    {
        return Inertia::render('Inventory/Product/create', []);
    }

    public function store(Request $request, FileUploadService $fileService)
    {
        // Validate the request data
        $validationRules = [
            'name' => 'required|string|max:255',
            'price_kilo' => 'nullable|numeric|min:0',
            'price_pc' => 'nullable|numeric|min:0',
            'price_tali' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'produce_type' => 'required|in:fruit,vegetable',
        ];

        // Add image validation rules
        $validationRules['image'] = FileUploadService::getValidationRules('products', true);

        $request->validate($validationRules);

        // Custom validation to ensure at least one price is provided
        if (empty($request->input('price_kilo')) && empty($request->input('price_pc')) && empty($request->input('price_tali'))) {
            return redirect()->back()->withErrors([
                'prices' => 'At least one price (per kilo, per piece, or per tali) must be provided.',
            ])->withInput();
        }

        try {
            // Upload image using file service
            $imagePath = null;
            if ($request->hasFile('image')) {
                $fullImagePath = $fileService->uploadFile(
                    $request->file('image'),
                    'products',
                    $request->input('name')
                );
                // Store only the filename, not the full path
                $imagePath = basename($fullImagePath);
            }

            $product = Product::create([
                'name' => $request->input('name'),
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
                'description' => $request->input('description'),
                'image' => $imagePath,
                'produce_type' => $request->input('produce_type'),
            ]);

            // Log product creation
            SystemLogger::logProductManagement(
                'create',
                $product->id,
                $request->user()->id,
                $request->user()->type,
                [
                    'product_name' => $product->name,
                    'produce_type' => $product->produce_type,
                    'price_kilo' => $product->price_kilo,
                    'price_pc' => $product->price_pc,
                    'price_tali' => $product->price_tali
                ]
            );

            // Record initial price snapshot
            ProductPriceHistory::create([
                'product_id' => $product->id,
                'price_kilo' => $request->input('price_kilo'),
                'price_pc' => $request->input('price_pc'),
                'price_tali' => $request->input('price_tali'),
            ]);

            return redirect()->route('inventory.index')->with('flash', [
                'type' => 'success',
                'message' => 'Inventory item created successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'image' => 'Failed to upload image: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function edit(Product $product)
    {
        return Inertia::render('Inventory/Product/edit', compact('product'));
    }

    public function update(Request $request, Product $product, FileUploadService $fileService)
    {
        // Validate the request data
        $validationRules = [
            'name' => 'required|string|max:255',
            'price_kilo' => 'nullable|numeric|min:0',
            'price_pc' => 'nullable|numeric|min:0',
            'price_tali' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'produce_type' => 'required|in:fruit,vegetable',
        ];

        // Add image validation rules (optional for updates)
        $validationRules['image'] = FileUploadService::getValidationRules('products', false);

        $request->validate($validationRules);

        // Custom validation to ensure at least one price is provided
        if (empty($request->input('price_kilo')) && empty($request->input('price_pc')) && empty($request->input('price_tali'))) {
            return redirect()->back()->withErrors([
                'prices' => 'At least one price (per kilo, per piece, or per tali) must be provided.',
            ])->withInput();
        }

        try {
            $original = $product->only(['price_kilo', 'price_pc', 'price_tali']);

            // Handle image update if new file is uploaded
            if ($request->hasFile('image')) {
                $newImagePath = $fileService->updateFile(
                    $request->file('image'),
                    'products',
                    $product->image ? 'products/' . $product->image : null,
                    $request->input('name')
                );
                // Store only the filename, not the full path
                $product->image = basename($newImagePath);
            }

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

            // Log product update
            SystemLogger::logProductManagement(
                'update',
                $product->id,
                $request->user()->id,
                $request->user()->type,
                [
                    'product_name' => $product->name,
                    'produce_type' => $product->produce_type,
                    'price_kilo' => $product->price_kilo,
                    'price_pc' => $product->price_pc,
                    'price_tali' => $product->price_tali,
                    'price_changed' => $changed
                ]
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

            $product->save();

            // Redirect back to inventory index with archived view if product is archived
            $redirectUrl = route('inventory.index');
            if ($product->archived_at) {
                $redirectUrl .= '?view=archived';
            }

            return redirect($redirectUrl)->with('flash', [
                'type' => 'success',
                'message' => 'Product updated successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'image' => 'Failed to update image: ' . $e->getMessage()
            ])->withInput();
        }
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

        // Log product deletion
        SystemLogger::logProductManagement(
            'delete',
            $product->id,
            request()->user()->id,
            request()->user()->type,
            [
                'product_name' => $product->name,
                'produce_type' => $product->produce_type
            ]
        );

        // Delete the image file using the file service
        $product->deleteImageFile();

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
        $memberIds = $request->input('member_ids', []);
        // Ensure it's always an array
        if (!is_array($memberIds)) {
            $memberIds = $memberIds ? [$memberIds] : [];
        }
        $productType = $request->get('product_type', 'all');
        $minQuantity = $request->get('min_quantity');
        $maxQuantity = $request->get('max_quantity');
        $search = $request->get('search');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode
        $paperSize = $request->get('paper_size', 'A4'); // A4, Letter, Legal, A3
        $orientation = $request->get('orientation', 'landscape'); // portrait, landscape

        // Optimize: Load only essential fields for reporting
        $query = Stock::with([
            'product' => function ($query) {
                $query->select('id', 'name', 'produce_type');
            },
            'member' => function ($query) {
                $query->select('id', 'name');
            }
        ])->select('id', 'product_id', 'member_id', 'quantity', 'sold_quantity', 'category', 'created_at', 'removed_at', 'notes');

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

        // Filter by members
        if (!empty($memberIds)) {
            $query->whereIn('member_id', $memberIds);
        }

        // Filter by product type
        if ($productType !== 'all') {
            $query->whereHas('product', function ($q) use ($productType) {
                $q->where('produce_type', $productType);
            });
        }

        // Filter by quantity range
        if ($minQuantity !== null && $minQuantity !== '') {
            $query->where('quantity', '>=', $minQuantity);
        }
        if ($maxQuantity !== null && $maxQuantity !== '') {
            $query->where('quantity', '<=', $maxQuantity);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($productQuery) use ($search) {
                    $productQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                })->orWhereHas('member', function ($memberQuery) use ($search) {
                    $memberQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
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
                case 'removed':
                    $query->removed();
                    break;
            }
        }

        $stocks = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics with clear separation
        $summary = [
            'total_stocks' => $stocks->count(),
            'total_quantity' => $stocks->sum('quantity') + $stocks->sum('sold_quantity'),
            'available_stocks' => $stocks->where('quantity', '>', 0)->whereNull('removed_at')->count(),
            'available_quantity' => $stocks->where('quantity', '>', 0)->whereNull('removed_at')->sum('quantity'),
            'sold_stocks' => $stocks->where('sold_quantity', '>', 0)->whereNull('removed_at')->count(),
            'sold_quantity' => $stocks->where('sold_quantity', '>', 0)->whereNull('removed_at')->sum('sold_quantity'),
            'completely_sold_stocks' => $stocks->where('quantity', 0)->where('sold_quantity', '>', 0)->whereNull('removed_at')->count(),
            'removed_stocks' => $stocks->whereNotNull('removed_at')->count(),
            'total_products' => $stocks->pluck('product_id')->unique()->count(),
            'total_members' => $stocks->pluck('member_id')->unique()->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($stocks, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($stocks, $summary, $display, $paperSize, $orientation);
        }

        // Get unique values for filter dropdowns (cached for performance) - only active members
        $members = cache()->remember('active_members_list', 1800, function () {
            return \App\Models\User::where('type', 'member')->where('active', true)->select('id', 'name')->orderBy('name')->get();
        });
        $productTypes = cache()->remember('product_types_list', 3600, function () {
            return \App\Models\Product::select('produce_type')->distinct()->pluck('produce_type')->filter();
        });

        // Return view for display
        return Inertia::render('Admin/Inventory/report', [
            'stocks' => $stocks,
            'summary' => $summary,
            'members' => $members,
            'productTypes' => $productTypes,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category' => $category,
                'status' => $status,
                'member_ids' => $memberIds,
                'product_type' => $productType,
                'min_quantity' => $minQuantity,
                'max_quantity' => $maxQuantity,
                'search' => $search,
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

        $callback = function () use ($stocks, $summary) {
            $file = fopen('php://output', 'w');

            // Write stock data headers
            fputcsv($file, [
                'Stock ID',
                'Product Name',
                'Quantity',
                'Category',
                'Member',
                'Notes'
            ]);

            // Write stock data
            foreach ($stocks as $stock) {
                fputcsv($file, [
                    $stock->id,
                    $stock->product?->name ?? 'N/A',
                    $stock->quantity,
                    $stock->category,
                    $stock->member?->name ?? 'N/A',
                    $stock->notes ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($stocks, $summary, $display = false, $paperSize = 'A4', $orientation = 'landscape')
    {
        // Encode logo as base64 for PDF embedding
        $logoPath = storage_path('app/public/logo/SMMC Logo-1.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }

        $html = view('reports.inventory-pdf', [
            'stocks' => $stocks,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'logo_base64' => $logoBase64
        ])->render();

        $pdf = Pdf::loadHTML($html);

        // Set paper size and orientation (supports: A4, Letter, Legal, A3, etc.)
        $pdf->setPaper($paperSize, $orientation);

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
        if (
            $firstRecord->price_kilo == $immediateOriginal['price_kilo'] &&
            $firstRecord->price_pc == $immediateOriginal['price_pc'] &&
            $firstRecord->price_tali == $immediateOriginal['price_tali']
        ) {
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

    /**
     * Check if a product name already exists
     */
    public function checkDuplicate(Request $request)
    {
        $name = $request->input('name');
        $productId = $request->input('product_id'); // Optional: exclude current product when editing
        
        if (empty($name)) {
            return response()->json(['exists' => false]);
        }

        // Check if product name exists (case-insensitive, active products only)
        $query = Product::active()
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($name))]);

        // Exclude current product if editing
        if ($productId) {
            $query->where('id', '!=', $productId);
        }

        $exists = $query->exists();

        return response()->json(['exists' => $exists]);
    }
}
