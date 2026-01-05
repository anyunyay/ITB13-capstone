<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class MemberController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = Auth::user();

        // Pagination parameters
        $availablePage = $request->get('available_page', 1);
        $soldPage = $request->get('sold_page', 1);

        // Detect mobile device based on user agent
        $userAgent = $request->header('User-Agent');
        $isMobile = preg_match('/(android|iphone|ipad|mobile)/i', $userAgent);

        // Set per page limits based on device
        $perPage = $isMobile ? 5 : 10;

        // Get all stocks for statistics (before pagination)
        // Sort by created_at descending to show most recent first  
        $allAvailableStocks = Stock::hasAvailableQuantity()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $allSoldStocks = Stock::sold()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->orderBy('updated_at', 'desc') // Use updated_at for sold stocks as they're updated when sold
            ->get();

        // Get all stocks for debugging
        $allStocks = Stock::where('member_id', $user->id)->get();

        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);

        // Calculate category-specific totals
        $totalKilo = $allStocks->where('category', 'Kilo')
            ->sum(function ($stock) {
                return $stock->quantity + $stock->sold_quantity;
            });
        $totalPiece = $allStocks->where('category', 'Pc')
            ->sum(function ($stock) {
                return $stock->quantity + $stock->sold_quantity;
            });
        $totalTali = $allStocks->where('category', 'Tali')
            ->sum(function ($stock) {
                return $stock->quantity + $stock->sold_quantity;
            });

        // Calculate summary statistics using already fetched data with clear separation
        $summary = [
            'totalStocks' => $allStocks->count(),
            'availableStocks' => $allAvailableStocks->count(),
            'soldStocks' => $allSoldStocks->count(),
            'removedStocks' => Stock::removed()->where('member_id', $user->id)->count(),
            'totalQuantity' => $allStocks->sum('quantity') + $allStocks->sum('sold_quantity'),
            'availableQuantity' => $allAvailableStocks->sum('quantity'),
            'soldQuantity' => $allStocks->sum('sold_quantity'),
            'completelySoldStocks' => $allStocks->where('quantity', 0)->where('sold_quantity', '>', 0)->count(),
            'totalRevenue' => $salesData['totalRevenue'],
            'totalCogs' => $salesData['totalCogs'],
            'totalGrossProfit' => $salesData['totalGrossProfit'],
            'totalSales' => $salesData['totalSales'],
            'totalKilo' => $totalKilo,
            'totalPiece' => $totalPiece,
            'totalTali' => $totalTali,
        ];

        // Paginate available stocks
        $availableTotal = $allAvailableStocks->count();
        $paginatedAvailableStocks = $allAvailableStocks->forPage($availablePage, $perPage)->values();

        // Paginate sold stocks
        $soldTotal = $allSoldStocks->count();
        $paginatedSoldStocks = $allSoldStocks->forPage($soldPage, $perPage)->values();

        return Inertia::render('Member/dashboard', [
            'availableStocks' => $paginatedAvailableStocks,
            'soldStocks' => $paginatedSoldStocks,
            'salesData' => $salesData,
            'summary' => $summary,
            'availablePagination' => [
                'current_page' => (int) $availablePage,
                'per_page' => $perPage,
                'total' => $availableTotal,
                'last_page' => (int) ceil($availableTotal / $perPage),
            ],
            'soldPagination' => [
                'current_page' => (int) $soldPage,
                'per_page' => $perPage,
                'total' => $soldTotal,
                'last_page' => (int) ceil($soldTotal / $perPage),
            ],
        ]);
    }

    public function allStocks(Request $request)
    {
        $user = Auth::user();

        // Check if export is requested
        $format = $request->get('format');
        $view = $request->get('view', 'stocks');

        // Get pagination parameters
        $stockPage = $request->get('stock_page', 1);
        $transactionPage = $request->get('transaction_page', 1);
        $trailPage = $request->get('trail_page', 1);

        // Get sorting parameters
        $stockSortBy = $request->get('stock_sort_by', 'product_name');
        $stockSortDir = $request->get('stock_sort_dir', 'asc');
        $transactionSortBy = $request->get('transaction_sort_by', 'created_at');
        $transactionSortDir = $request->get('transaction_sort_dir', 'desc');
        $trailSortBy = $request->get('trail_sort_by', 'created_at');
        $trailSortDir = $request->get('trail_sort_dir', 'desc');

        // Get filter parameters
        $stockCategoryFilter = $request->get('stock_category', 'all');
        $stockStatusFilter = $request->get('stock_status', 'all');
        $transactionCategoryFilter = $request->get('transaction_category', 'all');
        $trailCategoryFilter = $request->get('trail_category', 'all');
        $trailActionFilter = $request->get('trail_action', 'all');

        // Get date range parameters for transaction exports
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Detect mobile device based on user agent
        $userAgent = $request->header('User-Agent');
        $isMobile = preg_match('/(android|iphone|ipad|mobile)/i', $userAgent);

        // Set per page limits based on device
        $stockPerPage = $isMobile ? 5 : 10;
        $transactionPerPage = $isMobile ? 5 : 10;
        $trailPerPage = $isMobile ? 5 : 10;

        // Get all stocks for the member using scopes
        $availableStocks = Stock::hasAvailableQuantity()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();

        // Calculate sales data for sold stocks (with date filtering)
        $salesData = $this->calculateSalesData($user->id, $startDate, $endDate);

        // Calculate comprehensive stock data with total, sold, and available quantities (with date filtering)
        $allComprehensiveStockData = $this->calculateComprehensiveStockData($user->id, $startDate, $endDate);

        // Apply filters to comprehensive stock data
        $comprehensiveStockDataCollection = collect($allComprehensiveStockData);
        $comprehensiveStockDataCollection = $this->applyStockFilters($comprehensiveStockDataCollection, $stockCategoryFilter, $stockStatusFilter);

        // Apply sorting to comprehensive stock data
        $comprehensiveStockDataCollection = $this->applySorting($comprehensiveStockDataCollection, $stockSortBy, $stockSortDir);

        // Paginate comprehensive stock data
        $totalStocks = $comprehensiveStockDataCollection->count();
        $paginatedComprehensiveStockData = $comprehensiveStockDataCollection
            ->forPage($stockPage, $stockPerPage)
            ->values()
            ->toArray();

        // Get transaction data for the toggle view with pagination and sorting
        $transactionsQuery = AuditTrail::with(['product', 'sale.customer'])
            ->whereHas('stock', function ($q) use ($user) {
                $q->where('member_id', $user->id);
            })
            ->whereHas('sale', function ($q) use ($startDate, $endDate) {
                $q->whereNotNull('delivered_time'); // Only show delivered transactions

                // Apply date range filter if provided (for exports)
                if ($startDate) {
                    $q->whereDate('delivered_time', '>=', $startDate);
                }
                if ($endDate) {
                    $q->whereDate('delivered_time', '<=', $endDate);
                }
            });

        // Apply category filter to transactions
        if ($transactionCategoryFilter !== 'all') {
            $transactionsQuery->where('category', $transactionCategoryFilter);
        }

        // Apply sorting to transactions
        $transactionsQuery = $this->applyTransactionSorting($transactionsQuery, $transactionSortBy, $transactionSortDir);

        // Manual pagination for transactions
        $totalTransactions = $transactionsQuery->count();
        $transactions = $transactionsQuery
            ->skip(($transactionPage - 1) * $transactionPerPage)
            ->take($transactionPerPage)
            ->get();

        // Build transaction pagination data
        $transactionPagination = [
            'current_page' => (int) $transactionPage,
            'per_page' => $transactionPerPage,
            'total' => $totalTransactions,
            'last_page' => (int) ceil($totalTransactions / $transactionPerPage),
            'from' => (($transactionPage - 1) * $transactionPerPage) + 1,
            'to' => min($transactionPage * $transactionPerPage, $totalTransactions),
            'data' => $transactions,
        ];

        // Calculate transaction summary (with date filtering)
        $summary = $this->calculateTransactionSummary($user->id, $startDate, $endDate);

        // Get stock trail data for the member with optimized eager loading
        $stockTrailQuery = \App\Models\StockTrail::with([
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
            ->where('member_id', $user->id)
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            });

        // Apply category filter to stock trail
        if ($trailCategoryFilter !== 'all') {
            $stockTrailQuery->where('category', $trailCategoryFilter);
        }

        // Apply action filter to stock trail
        if ($trailActionFilter !== 'all') {
            $stockTrailQuery->where('action_type', $trailActionFilter);
        }

        // Apply sorting to stock trail
        $stockTrailQuery = $this->applyStockTrailSorting($stockTrailQuery, $trailSortBy, $trailSortDir);

        // Manual pagination for stock trail
        $totalTrails = $stockTrailQuery->count();
        $stockTrails = $stockTrailQuery
            ->skip(($trailPage - 1) * $trailPerPage)
            ->take($trailPerPage)
            ->get();

        // Build stock trail pagination data
        $trailPagination = [
            'current_page' => (int) $trailPage,
            'per_page' => $trailPerPage,
            'total' => $totalTrails,
            'last_page' => (int) ceil($totalTrails / $trailPerPage),
            'from' => (($trailPage - 1) * $trailPerPage) + 1,
            'to' => min($trailPage * $trailPerPage, $totalTrails),
        ];

        // Calculate stock trail summary (for all trails, not just paginated)
        $trailSummary = $this->calculateStockTrailSummary($user->id, $startDate, $endDate);

        // Get display parameter for PDF viewing
        $display = $request->get('display', false);

        // Handle export requests - Stock overview only
        if ($format === 'csv') {
            // Use all filtered stock data (not paginated)
            $allFilteredStockData = $comprehensiveStockDataCollection->toArray();
            return $this->exportStocksToCsv($allFilteredStockData, $allComprehensiveStockData);
        } elseif ($format === 'pdf') {
            // Use all filtered stock data (not paginated)
            $allFilteredStockData = $comprehensiveStockDataCollection->toArray();
            return $this->exportStocksToPdf($allFilteredStockData, $allComprehensiveStockData, $display);
        }

        return Inertia::render('Member/allStocks', [
            'availableStocks' => $availableStocks,
            'salesData' => $salesData,
            'comprehensiveStockData' => $paginatedComprehensiveStockData,
            'allComprehensiveStockData' => $allComprehensiveStockData, // For totals calculation
            'transactions' => [
                'data' => $transactions,
                'meta' => [
                    'current_page' => $transactionPagination['current_page'],
                    'per_page' => $transactionPagination['per_page'],
                    'total' => $transactionPagination['total'],
                    'last_page' => $transactionPagination['last_page'],
                    'from' => $transactionPagination['from'],
                    'to' => $transactionPagination['to'],
                ],
            ],
            'stockTrails' => [
                'data' => $stockTrails,
                'meta' => [
                    'current_page' => $trailPagination['current_page'],
                    'per_page' => $trailPagination['per_page'],
                    'total' => $trailPagination['total'],
                    'last_page' => $trailPagination['last_page'],
                    'from' => $trailPagination['from'],
                    'to' => $trailPagination['to'],
                ],
            ],
            'summary' => $summary,
            'trailSummary' => $trailSummary,
            'stockPagination' => [
                'current_page' => (int) $stockPage,
                'per_page' => $stockPerPage,
                'total' => $totalStocks,
                'last_page' => (int) ceil($totalStocks / $stockPerPage),
                'from' => (($stockPage - 1) * $stockPerPage) + 1,
                'to' => min($stockPage * $stockPerPage, $totalStocks),
            ],
            'sorting' => [
                'stock_sort_by' => $stockSortBy,
                'stock_sort_dir' => $stockSortDir,
                'transaction_sort_by' => $transactionSortBy,
                'transaction_sort_dir' => $transactionSortDir,
                'trail_sort_by' => $trailSortBy,
                'trail_sort_dir' => $trailSortDir,
            ],
            'filters' => [
                'stock_category' => $stockCategoryFilter,
                'stock_status' => $stockStatusFilter,
                'transaction_category' => $transactionCategoryFilter,
                'trail_category' => $trailCategoryFilter,
                'trail_action' => $trailActionFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Apply filters to stock data collection
     */
    private function applyStockFilters($collection, $categoryFilter, $statusFilter)
    {
        // Apply category filter
        if ($categoryFilter !== 'all') {
            $collection = $collection->filter(function ($item) use ($categoryFilter) {
                return $item['category'] === $categoryFilter;
            });
        }

        // Apply status filter
        // IMPORTANT: Never filter out items with sold_quantity > 0 or damaged_defective_count > 0
        // These must always remain visible for accurate member tracking
        if ($statusFilter !== 'all') {
            $collection = $collection->filter(function ($item) use ($statusFilter) {
                if ($statusFilter === 'available') {
                    // Has available balance
                    return $item['balance_quantity'] > 0;
                } elseif ($statusFilter === 'sold_out') {
                    // No balance remaining AND has sold some quantity
                    // Include items with sold stock OR damaged/defective stock
                    return $item['balance_quantity'] <= 0 && 
                           ($item['sold_quantity'] > 0 || $item['damaged_defective_count'] > 0);
                }
                return true;
            });
        }

        // Re-index the collection after filtering
        return $collection->values();
    }

    /**
     * Apply sorting to comprehensive stock data collection
     */
    private function applySorting($collection, $sortBy, $sortDir)
    {
        $ascending = $sortDir === 'asc';

        switch ($sortBy) {
            case 'product_name':
                return $ascending
                    ? $collection->sortBy('product_name', SORT_NATURAL | SORT_FLAG_CASE)
                    : $collection->sortByDesc('product_name', SORT_NATURAL | SORT_FLAG_CASE);

            case 'category':
                return $ascending
                    ? $collection->sortBy('category')
                    : $collection->sortByDesc('category');

            case 'total_quantity':
                return $ascending
                    ? $collection->sortBy('total_quantity')
                    : $collection->sortByDesc('total_quantity');

            case 'sold_quantity':
                return $ascending
                    ? $collection->sortBy('sold_quantity')
                    : $collection->sortByDesc('sold_quantity');

            case 'balance_quantity':
                return $ascending
                    ? $collection->sortBy('balance_quantity')
                    : $collection->sortByDesc('balance_quantity');

            case 'total_revenue':
                return $ascending
                    ? $collection->sortBy('total_revenue')
                    : $collection->sortByDesc('total_revenue');

            case 'total_cogs':
                return $ascending
                    ? $collection->sortBy('total_cogs')
                    : $collection->sortByDesc('total_cogs');

            case 'total_gross_profit':
                return $ascending
                    ? $collection->sortBy('total_gross_profit')
                    : $collection->sortByDesc('total_gross_profit');

            case 'damaged_defective_count':
                return $ascending
                    ? $collection->sortBy('damaged_defective_count')
                    : $collection->sortByDesc('damaged_defective_count');

            case 'damaged_defective_loss':
                return $ascending
                    ? $collection->sortBy('damaged_defective_loss')
                    : $collection->sortByDesc('damaged_defective_loss');

            default:
                return $collection;
        }
    }

    /**
     * Apply sorting to transaction query
     */
    private function applyTransactionSorting($query, $sortBy, $sortDir)
    {
        switch ($sortBy) {
            case 'product_name':
                return $query->join('products', 'audit_trails.product_id', '=', 'products.id')
                    ->orderBy('products.name', $sortDir)
                    ->select('audit_trails.*');

            case 'category':
                return $query->orderBy('category', $sortDir);

            case 'quantity':
                return $query->orderBy('quantity', $sortDir);

            case 'created_at':
                return $query->orderBy('created_at', $sortDir);

            case 'customer_name':
                return $query->join('sales', 'audit_trails.sale_id', '=', 'sales.id')
                    ->join('users', 'sales.customer_id', '=', 'users.id')
                    ->orderBy('users.name', $sortDir)
                    ->select('audit_trails.*');

            default:
                return $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Apply sorting to stock trail query
     */
    private function applyStockTrailSorting($query, $sortBy, $sortDir)
    {
        switch ($sortBy) {
            case 'product_name':
                return $query->join('products', 'stock_trails.product_id', '=', 'products.id')
                    ->orderBy('products.name', $sortDir)
                    ->orderBy('stock_trails.stock_id', 'desc') // Secondary sort by Stock ID descending
                    ->select('stock_trails.*');

            case 'category':
                return $query->orderBy('category', $sortDir)
                    ->orderBy('stock_id', 'desc'); // Secondary sort by Stock ID descending

            case 'action_type':
                return $query->orderBy('action_type', $sortDir)
                    ->orderBy('stock_id', 'desc'); // Secondary sort by Stock ID descending

            case 'quantity':
                return $query->orderBy('new_quantity', $sortDir)
                    ->orderBy('stock_id', 'desc'); // Secondary sort by Stock ID descending

            case 'created_at':
                return $query->orderBy('created_at', $sortDir)
                    ->orderBy('stock_id', 'desc'); // Secondary sort by Stock ID descending

            default:
                return $query->orderBy('created_at', 'desc')
                    ->orderBy('stock_id', 'desc'); // Secondary sort by Stock ID descending
        }
    }

    /**
     * Calculate sales data from Sales and AuditTrail tables
     */
    private function calculateSalesData($memberId, $startDate = null, $endDate = null)
    {
        // Get only delivered sales that involve stocks from this member
        $deliveredSales = Sales::with(['salesAudit.auditTrail.product', 'customer'])
            ->whereNotNull('delivered_at')
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('delivered_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('delivered_at', '<=', $endDate);
            })
            ->whereHas('salesAudit.auditTrail', function ($query) use ($memberId) {
                $query->whereHas('stock', function ($stockQuery) use ($memberId) {
                    $stockQuery->where('member_id', $memberId);
                });
            })
            ->get();

        $totalSales = 0;
        $totalRevenue = 0;
        $totalCogs = 0;
        $totalGrossProfit = 0;
        $totalQuantitySold = 0;
        $productSales = []; // Group by product_id

        foreach ($deliveredSales as $sale) {
            $orderRevenue = 0;
            $orderCogs = 0;
            $orderGrossProfit = 0;
            $orderQuantity = 0;
            $hasMemberItems = false;

            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $hasMemberItems = true;
                    $orderQuantity += $audit->quantity;

                    // Calculate member's revenue share for this item
                    // Use the audit trail's stored sale price (member gets 100% of product price)
                    $price = $audit->getSalePrice();
                    $itemRevenue = $audit->getTotalAmount(); // quantity * price (member's share)
                    $orderRevenue += $itemRevenue;

                    // Calculate COGS and Gross Profit for this item
                    $itemCogs = ($itemRevenue / 1.3) * 0.7;
                    $itemGrossProfit = $itemRevenue - $itemCogs;
                    $orderCogs += $itemCogs;
                    $orderGrossProfit += $itemGrossProfit;

                    // Group by product_id for breakdown
                    $productId = $audit->product_id;
                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'product_id' => $productId,
                            'product_name' => $audit->product->name,
                            'total_quantity' => 0,
                            'price_per_unit' => $price,
                            'total_revenue' => 0,
                            'total_cogs' => 0,
                            'total_gross_profit' => 0,
                            'category' => $audit->category,
                            'sales_count' => 0,
                            'customers' => [],
                            'latest_sale_date' => $sale->delivered_at
                        ];
                    }

                    // Add quantities and revenue
                    $productSales[$productId]['total_quantity'] += $audit->quantity;
                    $productSales[$productId]['total_revenue'] += $itemRevenue;
                    $productSales[$productId]['total_cogs'] += $itemCogs;
                    $productSales[$productId]['total_gross_profit'] += $itemGrossProfit;
                    $productSales[$productId]['sales_count']++;

                    // Update latest sale date if this sale is more recent
                    if ($sale->delivered_at > $productSales[$productId]['latest_sale_date']) {
                        $productSales[$productId]['latest_sale_date'] = $sale->delivered_at;
                    }

                    // Add customer if not already in the list
                    if (!in_array($sale->customer->name, $productSales[$productId]['customers'])) {
                        $productSales[$productId]['customers'][] = $sale->customer->name;
                    }
                }
            }

            // Only count sales and revenue if this order had items from this member
            if ($hasMemberItems) {
                $totalSales++;
                $totalRevenue += $orderRevenue;
                $totalCogs += $orderCogs;
                $totalGrossProfit += $orderGrossProfit;
                $totalQuantitySold += $orderQuantity;
            }
        }

        // Convert to array and sort by latest sale date (most recent first)
        $salesBreakdown = array_values($productSales);
        usort($salesBreakdown, function ($a, $b) {
            return strtotime($b['latest_sale_date']) <=> strtotime($a['latest_sale_date']);
        });

        return [
            'totalSales' => $totalSales,
            'totalRevenue' => $totalRevenue,
            'totalCogs' => $totalCogs,
            'totalGrossProfit' => $totalGrossProfit,
            'totalQuantitySold' => $totalQuantitySold,
            'salesBreakdown' => $salesBreakdown
        ];
    }

    /**
     * Calculate comprehensive stock data with total, sold, and available quantities
     */
    private function calculateComprehensiveStockData($memberId, $startDate = null, $endDate = null)
    {
        // Get all stocks for this member (including sold ones and removed ones)
        // We include removed stocks to show complete history
        $allStocks = Stock::where('member_id', $memberId)
            ->with(['product'])
            ->get();

        // Calculate revenue from delivered sales for this member
        $deliveredSales = Sales::with(['salesAudit.auditTrail'])
            ->whereNotNull('delivered_at')
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('delivered_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('delivered_at', '<=', $endDate);
            })
            ->whereHas('salesAudit.auditTrail', function ($query) use ($memberId) {
                $query->whereHas('stock', function ($stockQuery) use ($memberId) {
                    $stockQuery->where('member_id', $memberId);
                });
            })
            ->get();

        // Get damaged/defective stock data from stock trails
        // Use LIKE to match notes that contain "Damaged" or "Defective"
        $damagedDefectiveData = \App\Models\StockTrail::where('member_id', $memberId)
            ->where('action_type', 'removed')
            ->where(function ($query) {
                $query->where('notes', 'LIKE', '%Damaged%')
                      ->orWhere('notes', 'LIKE', '%Defective%');
            })
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->with(['product'])
            ->get();

        // Group stocks by product and category
        $stockGroups = [];
        foreach ($allStocks as $stock) {
            $key = $stock->product_id . '-' . $stock->category;
            if (!isset($stockGroups[$key])) {
                $stockGroups[$key] = [
                    'product_id' => $stock->product_id,
                    'product_name' => $stock->product->name,
                    'category' => $stock->category,
                    'total_quantity' => 0,
                    'available_quantity' => 0,
                    'sold_quantity' => 0,
                    'removed_quantity' => 0,
                    'balance_quantity' => 0,
                    'damaged_defective_count' => 0,
                    'damaged_defective_loss' => 0,
                    'unit_price' => $this->getProductPrice($stock->product, $stock->category),
                    'total_revenue' => 0,
                    'total_cogs' => 0,
                    'total_gross_profit' => 0,
                    'product' => $stock->product
                ];
            }

            // Add to total quantity - this represents CURRENT total (available + sold)
            // Removed stock is NOT included in total as it's no longer part of the inventory
            $stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity;

            // Add available quantity (current quantity that can be sold)
            $stockGroups[$key]['available_quantity'] += $stock->quantity;

            // Add sold quantity (total sold from this stock)
            $stockGroups[$key]['sold_quantity'] += $stock->sold_quantity;
            
            // Add removed quantity (total removed from this stock - tracked separately)
            $stockGroups[$key]['removed_quantity'] += $stock->removed_quantity ?? 0;
        }

        // Add damaged/defective data to stock groups
        foreach ($damagedDefectiveData as $trail) {
            $key = $trail->product_id . '-' . $trail->category;
            if (isset($stockGroups[$key])) {
                // Calculate the quantity that was removed (old_quantity - new_quantity)
                $removedQuantity = ($trail->old_quantity ?? 0) - ($trail->new_quantity ?? 0);
                $stockGroups[$key]['damaged_defective_count'] += $removedQuantity;
                
                // Calculate loss value
                $price = $stockGroups[$key]['unit_price'];
                $stockGroups[$key]['damaged_defective_loss'] += $removedQuantity * $price;
            }
        }

        // Calculate revenue from delivered sales
        foreach ($deliveredSales as $sale) {
            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $key = $audit->product_id . '-' . $audit->category;
                    if (isset($stockGroups[$key])) {
                        $itemRevenue = $audit->getTotalAmount();
                        $itemCogs = ($itemRevenue / 1.3) * 0.7;
                        $itemGrossProfit = $itemRevenue - $itemCogs;

                        $stockGroups[$key]['total_revenue'] += $itemRevenue;
                        $stockGroups[$key]['total_cogs'] += $itemCogs;
                        $stockGroups[$key]['total_gross_profit'] += $itemGrossProfit;
                    }
                }
            }
        }

        // Calculate balance quantity and potential revenue for all stock groups
        foreach ($stockGroups as $key => &$group) {
            $group['balance_quantity'] = $group['available_quantity'];
            
            // If no sales yet, calculate potential revenue based on total quantity and unit price
            if ($group['total_revenue'] == 0 && $group['total_quantity'] > 0) {
                $potentialRevenue = $group['total_quantity'] * $group['unit_price'];
                $potentialCogs = ($potentialRevenue / 1.3) * 0.7;
                $potentialGrossProfit = $potentialRevenue - $potentialCogs;
                
                $group['total_revenue'] = $potentialRevenue;
                $group['total_cogs'] = $potentialCogs;
                $group['total_gross_profit'] = $potentialGrossProfit;
            }
        }

        // Convert to array and sort by product name
        $result = array_values($stockGroups);
        usort($result, function ($a, $b) {
            return strcmp($a['product_name'], $b['product_name']);
        });

        return $result;
    }

    /**
     * Get product price based on category
     */
    private function getProductPrice($product, $category)
    {
        switch ($category) {
            case 'Kilo':
                return $product->price_kilo ?? 0;
            case 'Pc':
                return $product->price_pc ?? 0;
            case 'Tali':
                return $product->price_tali ?? 0;
            default:
                return $product->price_kilo ?? $product->price_pc ?? $product->price_tali ?? 0;
        }
    }

    public function generateRevenueReport(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        // Get only delivered sales that involve stocks from this member
        $query = Sales::with(['salesAudit.auditTrail.product', 'customer'])
            ->whereNotNull('delivered_at')
            ->whereHas('salesAudit.auditTrail', function ($q) use ($user) {
                $q->whereHas('stock', function ($stockQuery) use ($user) {
                    $stockQuery->where('member_id', $user->id);
                });
            });

        // Filter by date range
        if ($startDate) {
            $query->whereDate('delivered_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('delivered_at', '<=', $endDate);
        }

        $sales = $query->orderBy('delivered_at', 'desc')->get();

        // Calculate detailed sales data
        $salesData = $this->calculateDetailedSalesData($user->id, $sales);

        // Calculate summary statistics
        $summary = [
            'total_revenue' => $salesData['totalRevenue'],
            'total_orders' => $salesData['totalOrders'],
            'total_quantity_sold' => $salesData['totalQuantitySold'],
            'total_cogs' => $salesData['totalCogs'],
            'total_gross_profit' => $salesData['totalGrossProfit'],
            'average_order_value' => $salesData['totalOrders'] > 0 ? $salesData['totalRevenue'] / $salesData['totalOrders'] : 0,
            'total_products' => count($salesData['productSales']),
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportRevenueToCsv($salesData, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportRevenueToPdf($salesData, $summary, $display);
        }

        // Return view for display
        return Inertia::render('Member/revenueReport', [
            'salesData' => $salesData,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function calculateDetailedSalesData($memberId, $sales)
    {
        $totalRevenue = 0;
        $totalOrders = 0;
        $totalQuantitySold = 0;
        $totalCogs = 0;
        $totalGrossProfit = 0;
        $productSales = [];
        $orderDetails = [];

        foreach ($sales as $sale) {
            $orderTotal = 0;
            $orderQuantity = 0;
            $orderCogs = 0;
            $orderGrossProfit = 0;
            $orderProducts = [];
            $hasMemberItems = false;

            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $hasMemberItems = true;
                    $orderQuantity += $audit->quantity;

                    // Calculate member's revenue share for this item
                    // Use the audit trail's stored sale price (member gets 100% of product price)
                    $price = $audit->getSalePrice();
                    $itemRevenue = $audit->getTotalAmount(); // quantity * price (member's share)
                    $orderTotal += $itemRevenue;

                    // Calculate COGS and Gross Profit for this item
                    $itemCogs = ($itemRevenue / 1.3) * 0.7;
                    $itemGrossProfit = $itemRevenue - $itemCogs;
                    $orderCogs += $itemCogs;
                    $orderGrossProfit += $itemGrossProfit;

                    // Group by product_id
                    $productId = $audit->product_id;
                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'product_id' => $productId,
                            'product_name' => $audit->product->name,
                            'total_quantity' => 0,
                            'price_per_unit' => $price,
                            'total_revenue' => 0,
                            'total_cogs' => 0,
                            'total_gross_profit' => 0,
                            'category' => $audit->category,
                            'sales_count' => 0,
                            'customers' => []
                        ];
                    }

                    // Add quantities and revenue
                    $productSales[$productId]['total_quantity'] += $audit->quantity;
                    $productSales[$productId]['total_revenue'] += $itemRevenue;
                    $productSales[$productId]['total_cogs'] += $itemCogs;
                    $productSales[$productId]['total_gross_profit'] += $itemGrossProfit;
                    $productSales[$productId]['sales_count']++;

                    // Add customer if not already in the list
                    if (!in_array($sale->customer->name, $productSales[$productId]['customers'])) {
                        $productSales[$productId]['customers'][] = $sale->customer->name;
                    }

                    // Add to order products
                    $orderProducts[] = [
                        'product_name' => $audit->product->name,
                        'quantity' => $audit->quantity,
                        'category' => $audit->category,
                        'price_per_unit' => $price,
                        'total_price' => $itemRevenue,
                        'cogs' => $itemCogs,
                        'gross_profit' => $itemGrossProfit
                    ];
                }
            }

            // Only count orders with items from this member
            if ($hasMemberItems && $orderTotal > 0) {
                $totalOrders++;
                $totalRevenue += $orderTotal;
                $totalQuantitySold += $orderQuantity;
                $totalCogs += $orderCogs;
                $totalGrossProfit += $orderGrossProfit;

                $orderDetails[] = [
                    'order_id' => $sale->id,
                    'customer_name' => $sale->customer->name,
                    'customer_email' => $sale->customer->email,
                    'total_amount' => $orderTotal,
                    'total_quantity' => $orderQuantity,
                    'total_cogs' => $orderCogs,
                    'total_gross_profit' => $orderGrossProfit,
                    'created_at' => $sale->created_at,
                    'products' => $orderProducts
                ];
            }
        }

        // Convert to array and sort by total revenue (highest first)
        $productSalesArray = array_values($productSales);
        usort($productSalesArray, function ($a, $b) {
            return $b['total_revenue'] <=> $a['total_revenue'];
        });

        return [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalQuantitySold' => $totalQuantitySold,
            'totalCogs' => $totalCogs,
            'totalGrossProfit' => $totalGrossProfit,
            'productSales' => $productSalesArray,
            'orderDetails' => $orderDetails
        ];
    }

    private function exportRevenueToCsv($salesData, $summary, $display = false)
    {
        $filename = 'member_revenue_report_' . date('Y-m-d_H-i-s') . '.csv';

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

        $callback = function () use ($salesData, $summary) {
            $file = fopen('php://output', 'w');

            // Write main table headers
            fputcsv($file, [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Product Name',
                'Category',
                'Quantity',
                'Price Per Unit',
                'Product Total',
                'COGS',
                'Gross Profit',
                'Order Total',
                'Created At'
            ]);

            // Write combined data
            foreach ($salesData['orderDetails'] as $order) {
                foreach ($order['products'] as $product) {
                    fputcsv($file, [
                        $order['order_id'],
                        $order['customer_name'],
                        $order['customer_email'],
                        $product['product_name'],
                        $product['category'],
                        $product['quantity'],
                        'PHP ' . number_format($product['price_per_unit'], 2),
                        'PHP ' . number_format($product['total_price'], 2),
                        'PHP ' . number_format($product['cogs'], 2),
                        'PHP ' . number_format($product['gross_profit'], 2),
                        'PHP ' . number_format($order['total_amount'], 2),
                        $order['created_at']->format('Y-m-d H:i:s')
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportRevenueToPdf($salesData, $summary, $display = false)
    {
        $html = view('reports.member-revenue-pdf', [
            'salesData' => $salesData,
            'summary' => $summary,
            'member' => Auth::user()
        ])->render();

        $pdf = Pdf::loadHTML($html);

        $filename = 'member_revenue_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Calculate transaction summary statistics
     */
    private function calculateTransactionSummary($memberId, $dateFrom = null, $dateTo = null)
    {
        // Get delivered sales for this member through the proper relationship
        $query = Sales::with(['salesAudit.auditTrail'])
            ->whereNotNull('delivered_at')
            ->whereHas('salesAudit.auditTrail', function ($q) use ($memberId) {
                $q->whereHas('stock', function ($stockQuery) use ($memberId) {
                    $stockQuery->where('member_id', $memberId);
                });
            });

        // Apply date filters if provided
        if ($dateFrom) {
            $query->whereDate('delivered_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('delivered_at', '<=', $dateTo);
        }

        $sales = $query->get();

        $totalTransactions = 0;
        $totalQuantity = 0;
        $totalRevenue = 0.0;
        $totalMemberShare = 0.0;
        $totalCogs = 0.0;
        $totalGrossProfit = 0.0;

        foreach ($sales as $sale) {
            $orderQuantity = 0;
            $orderMemberRevenue = 0.0;
            $orderCogs = 0.0;
            $orderGrossProfit = 0.0;
            $hasMemberItems = false;

            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $hasMemberItems = true;
                    $orderQuantity += $audit->quantity;

                    // Calculate member's revenue share (100% of product price)
                    $itemRevenue = $audit->getTotalAmount(); // quantity * price
                    $orderMemberRevenue += $itemRevenue;

                    // Calculate COGS and Gross Profit for this item
                    $itemCogs = ($itemRevenue / 1.3) * 0.7;
                    $itemGrossProfit = $itemRevenue - $itemCogs;
                    $orderCogs += $itemCogs;
                    $orderGrossProfit += $itemGrossProfit;
                }
            }

            // Only count orders with items from this member
            if ($hasMemberItems) {
                $totalTransactions++;
                $totalQuantity += $orderQuantity;
                $totalRevenue += $orderMemberRevenue;
                $totalMemberShare += $orderMemberRevenue; // Member gets 100% of product revenue
                $totalCogs += $orderCogs;
                $totalGrossProfit += $orderGrossProfit;
            }
        }

        return [
            'total_transactions' => $totalTransactions,
            'total_quantity' => $totalQuantity,
            'total_revenue' => $totalRevenue,
            'total_member_share' => $totalMemberShare,
            'total_cogs' => $totalCogs,
            'total_gross_profit' => $totalGrossProfit,
        ];
    }

    /**
     * Export stocks to CSV
     */
    private function exportStocksToCsv($paginatedData, $allData)
    {
        $filename = 'member_stock_overview_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($paginatedData, $allData) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Add summary header
            fputcsv($file, ['Stock Overview Report']);
            fputcsv($file, ['Generated:', date('F d, Y H:i:s')]);
            fputcsv($file, ['']);

            // Add summary statistics
            $totalStock = array_sum(array_column($allData, 'total_quantity'));
            $totalSold = array_sum(array_column($allData, 'sold_quantity'));
            $totalAvailable = array_sum(array_column($allData, 'balance_quantity'));
            $totalDamagedDefective = array_sum(array_column($allData, 'damaged_defective_count'));
            $totalRevenue = array_sum(array_column($allData, 'total_revenue'));
            $totalCogs = array_sum(array_column($allData, 'total_cogs'));
            $totalGrossProfit = array_sum(array_column($allData, 'total_gross_profit'));
            $totalLoss = array_sum(array_column($allData, 'damaged_defective_loss'));

            fputcsv($file, ['Summary Statistics']);
            fputcsv($file, ['Total Stock:', $totalStock]);
            fputcsv($file, ['Total Sold:', $totalSold]);
            fputcsv($file, ['Total Available:', $totalAvailable]);
            fputcsv($file, ['Total Damaged/Defective:', $totalDamagedDefective]);
            fputcsv($file, ['Total Revenue:', '₱' . number_format($totalRevenue, 2)]);
            fputcsv($file, ['Total COGS:', '₱' . number_format($totalCogs, 2)]);
            fputcsv($file, ['Total Gross Profit:', '₱' . number_format($totalGrossProfit, 2)]);
            fputcsv($file, ['Total Loss:', '₱' . number_format($totalLoss, 2)]);
            fputcsv($file, ['']);

            // Add column headers
            fputcsv($file, [
                'Product Name',
                'Category',
                'Total Quantity',
                'Sold Quantity',
                'Available Quantity',
                'Damaged/Defective Count',
                'Unit Price',
                'Total Revenue',
                'Total COGS',
                'Gross Profit',
                'Loss'
            ]);

            // Add data rows (only paginated data)
            foreach ($paginatedData as $item) {
                fputcsv($file, [
                    $item['product_name'],
                    $item['category'],
                    $item['total_quantity'],
                    $item['sold_quantity'],
                    $item['balance_quantity'],
                    $item['damaged_defective_count'] ?? 0,
                    '₱' . number_format($item['unit_price'], 2),
                    '₱' . number_format($item['total_revenue'], 2),
                    '₱' . number_format($item['total_cogs'], 2),
                    '₱' . number_format($item['total_gross_profit'], 2),
                    '₱' . number_format($item['damaged_defective_loss'] ?? 0, 2)
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export stocks to PDF
     */
    private function exportStocksToPdf($paginatedData, $allData, $display = false)
    {
        $filename = 'member_stock_overview_' . date('Y-m-d_His') . '.pdf';

        // Calculate summary statistics
        $totalStock = array_sum(array_column($allData, 'total_quantity'));
        $totalSold = array_sum(array_column($allData, 'sold_quantity'));
        $totalAvailable = array_sum(array_column($allData, 'balance_quantity'));
        $totalDamagedDefective = array_sum(array_column($allData, 'damaged_defective_count'));
        $totalRevenue = array_sum(array_column($allData, 'total_revenue'));
        $totalCogs = array_sum(array_column($allData, 'total_cogs'));
        $totalGrossProfit = array_sum(array_column($allData, 'total_gross_profit'));
        $totalLoss = array_sum(array_column($allData, 'damaged_defective_loss'));

        // Encode logo as base64 for PDF embedding
        $logoPath = storage_path('app/public/logo/SMMC Logo-1.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }

        $data = [
            'title' => 'Stock Overview Report',
            'date' => date('F d, Y H:i:s'),
            'summary' => [
                'total_stock' => $totalStock,
                'total_sold' => $totalSold,
                'total_available' => $totalAvailable,
                'total_damaged_defective' => $totalDamagedDefective,
                'total_revenue' => $totalRevenue,
                'total_cogs' => $totalCogs,
                'total_gross_profit' => $totalGrossProfit,
                'total_loss' => $totalLoss,
            ],
            'stocks' => $paginatedData,
            'logo_base64' => $logoBase64
        ];

        $pdf = Pdf::loadView('exports.member-stocks-pdf', $data);
        $pdf->setPaper('A4', 'landscape');

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Export transactions to CSV - exports all filtered data with date range
     */
    private function exportTransactionsToCsv($transactions, $summary, $startDate, $endDate)
    {
        $filename = 'member_transactions_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($transactions, $summary, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Add summary header
            fputcsv($file, ['Transaction History Report']);
            fputcsv($file, ['Generated:', date('F d, Y H:i:s')]);

            // Add date range if provided
            if ($startDate && $endDate) {
                fputcsv($file, ['Date Range:', date('M d, Y', strtotime($startDate)) . ' - ' . date('M d, Y', strtotime($endDate))]);
            } else {
                fputcsv($file, ['Date Range:', 'All Transactions']);
            }

            fputcsv($file, ['Total Records:', count($transactions)]);
            fputcsv($file, ['']);

            // Add summary statistics
            fputcsv($file, ['Summary Statistics']);
            fputcsv($file, ['Total Transactions:', $summary['total_transactions']]);
            fputcsv($file, ['Total Quantity:', $summary['total_quantity']]);
            fputcsv($file, ['Total Revenue:', '₱' . number_format($summary['total_revenue'], 2)]);
            fputcsv($file, ['Total COGS:', '₱' . number_format($summary['total_cogs'], 2)]);
            fputcsv($file, ['Total Gross Profit:', '₱' . number_format($summary['total_gross_profit'], 2)]);
            fputcsv($file, ['']);

            // Add column headers
            fputcsv($file, [
                'Date',
                'Product Name',
                'Category',
                'Quantity',
                'Unit Price',
                'Revenue',
                'Customer',
                'Status'
            ]);

            // Add data rows
            foreach ($transactions as $transaction) {
                $price = 0;
                switch ($transaction->category) {
                    case 'Kilo':
                        $price = $transaction->price_kilo ?? 0;
                        break;
                    case 'Pc':
                        $price = $transaction->price_pc ?? 0;
                        break;
                    case 'Tali':
                        $price = $transaction->price_tali ?? 0;
                        break;
                    default:
                        $price = $transaction->unit_price ?? 0;
                }

                $revenue = $transaction->quantity * $price;

                fputcsv($file, [
                    date('M d, Y H:i', strtotime($transaction->created_at)),
                    $transaction->product->name ?? 'N/A',
                    $transaction->category,
                    $transaction->quantity,
                    '₱' . number_format($price, 2),
                    '₱' . number_format($revenue, 2),
                    $transaction->sale->customer->name ?? 'N/A',
                    $transaction->sale->delivery_status ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export transactions to PDF - exports all filtered data with optional date range
     */
    private function exportTransactionsToPdf($transactions, $summary, $startDate, $endDate, $display = false)
    {
        $filename = 'member_transactions_' . date('Y-m-d_His') . '.pdf';

        $data = [
            'title' => 'Transaction History Report',
            'date' => date('F d, Y H:i:s'),
            'total_records' => count($transactions),
            'summary' => $summary,
            'transactions' => $transactions,
        ];

        // Add date range if provided
        if ($startDate && $endDate) {
            $data['date_range'] = [
                'start' => date('M d, Y', strtotime($startDate)),
                'end' => date('M d, Y', strtotime($endDate)),
            ];
        }

        $pdf = Pdf::loadView('exports.member-transactions-pdf', $data);
        $pdf->setPaper('A4', 'landscape');

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Calculate stock trail summary including losses
     */
    private function calculateStockTrailSummary($memberId, $startDate = null, $endDate = null)
    {
        $query = \App\Models\StockTrail::with([
            'product' => function ($query) {
                $query->select('id', 'price_kilo', 'price_pc', 'price_tali');
            }
        ])
            ->select('id', 'product_id', 'action_type', 'old_quantity', 'new_quantity', 'category', 'notes', 'created_at')
            ->where('member_id', $memberId)
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            });

        $allTrails = $query->get();

        // Count by action type
        $totalChanges = $allTrails->count();
        $totalAdded = $allTrails->where('action_type', 'added')->count();
        $totalSold = $allTrails->where('action_type', 'sold')->count();
        $totalRemoved = $allTrails->where('action_type', 'removed')->count();

        // Calculate losses ONLY for damaged/defective removals
        $totalRemovedValue = 0;
        $removedTrails = $allTrails->where('action_type', 'removed');

        foreach ($removedTrails as $trail) {
            // Only count as loss if the removal was due to Damaged/Defective
            $isDamagedDefective = $trail->notes && (
                stripos($trail->notes, 'Damaged') !== false || 
                stripos($trail->notes, 'Defective') !== false
            );
            
            if ($isDamagedDefective && $trail->product && $trail->new_quantity !== null) {
                // Calculate the quantity that was removed (old_quantity - new_quantity)
                $removedQuantity = ($trail->old_quantity ?? 0) - ($trail->new_quantity ?? 0);

                // Get the price based on category
                $price = 0;
                if ($trail->category === 'Kilo') {
                    $price = $trail->product->price_kilo ?? 0;
                } elseif ($trail->category === 'Pc') {
                    $price = $trail->product->price_pc ?? 0;
                } elseif ($trail->category === 'Tali') {
                    $price = $trail->product->price_tali ?? 0;
                }

                // Calculate loss value (only for damaged/defective)
                $totalRemovedValue += $removedQuantity * $price;
            }
        }

        return [
            'total_changes' => $totalChanges,
            'total_added' => $totalAdded,
            'total_sold' => $totalSold,
            'total_removed' => $totalRemoved,
            'total_removed_value' => $totalRemovedValue,
        ];
    }
}
