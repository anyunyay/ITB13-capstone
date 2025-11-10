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
        
        // Log member dashboard access
        SystemLogger::logMemberActivity(
            'dashboard_access',
            $user->id,
            ['ip_address' => request()->ip()]
        );
        
        // Pagination parameters
        $availablePage = $request->get('available_page', 1);
        $soldPage = $request->get('sold_page', 1);
        $perPage = 3;
        
        // Get all stocks for statistics (before pagination)
        $allAvailableStocks = Stock::hasAvailableQuantity()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        $allSoldStocks = Stock::sold()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        // Get all stocks for debugging
        $allStocks = Stock::where('member_id', $user->id)->get();
            
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
            
        // Calculate category-specific totals
        $totalKilo = $allStocks->where('category', 'Kilo')
            ->sum(function($stock) {
                return $stock->quantity + $stock->sold_quantity;
            });
        $totalPiece = $allStocks->where('category', 'Pc')
            ->sum(function($stock) {
                return $stock->quantity + $stock->sold_quantity;
            });
        $totalTali = $allStocks->where('category', 'Tali')
            ->sum(function($stock) {
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

    public function soldStocks(Request $request)
    {
        $user = Auth::user();
        
        // Pagination parameters
        $page = $request->get('page', 1);
        $perPage = 3;
        
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
        
        // Paginate sales breakdown
        $totalSales = count($salesData['salesBreakdown']);
        $paginatedSalesBreakdown = collect($salesData['salesBreakdown'])
            ->forPage($page, $perPage)
            ->values()
            ->toArray();
        
        // Update salesData with paginated breakdown
        $salesData['salesBreakdown'] = $paginatedSalesBreakdown;
            
        return Inertia::render('Member/soldStocks', [
            'salesData' => $salesData,
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => $perPage,
                'total' => $totalSales,
                'last_page' => (int) ceil($totalSales / $perPage),
            ],
        ]);
    }



    public function availableStocks(Request $request)
    {
        $user = Auth::user();
        
        // Pagination parameters
        $page = $request->get('page', 1);
        $perPage = 3;
        
        // Get all available stocks for total count
        $allAvailableStocks = Stock::hasAvailableQuantity()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Paginate available stocks
        $total = $allAvailableStocks->count();
        $paginatedStocks = $allAvailableStocks->forPage($page, $perPage)->values();
            
        return Inertia::render('Member/availableStocks', [
            'availableStocks' => $paginatedStocks,
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function allStocks(Request $request)
    {
        $user = Auth::user();
        
        // Get pagination parameters
        $stockPage = $request->get('stock_page', 1);
        $stockPerPage = 10;
        
        // Get all stocks for the member using scopes
        $availableStocks = Stock::hasAvailableQuantity()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        // Calculate sales data for sold stocks
        $salesData = $this->calculateSalesData($user->id);
        
        // Calculate comprehensive stock data with total, sold, and available quantities
        $allComprehensiveStockData = $this->calculateComprehensiveStockData($user->id);
        
        // Paginate comprehensive stock data
        $comprehensiveStockDataCollection = collect($allComprehensiveStockData);
        $totalStocks = $comprehensiveStockDataCollection->count();
        $paginatedComprehensiveStockData = $comprehensiveStockDataCollection
            ->forPage($stockPage, $stockPerPage)
            ->values()
            ->toArray();
        
        // Get transaction data for the toggle view
        $transactions = AuditTrail::with(['product', 'sale.customer'])
            ->whereHas('stock', function($q) use ($user) {
                $q->where('member_id', $user->id);
            })
            ->whereHas('sale', function($q) {
                $q->whereNotNull('delivered_time'); // Only show delivered transactions
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        // Calculate transaction summary
        $summary = $this->calculateTransactionSummary($user->id);
            
        return Inertia::render('Member/allStocks', [
            'availableStocks' => $availableStocks,
            'salesData' => $salesData,
            'comprehensiveStockData' => $paginatedComprehensiveStockData,
            'allComprehensiveStockData' => $allComprehensiveStockData, // For totals calculation
            'transactions' => $transactions,
            'summary' => $summary,
            'stockPagination' => [
                'current_page' => (int) $stockPage,
                'per_page' => $stockPerPage,
                'total' => $totalStocks,
                'last_page' => (int) ceil($totalStocks / $stockPerPage),
                'from' => (($stockPage - 1) * $stockPerPage) + 1,
                'to' => min($stockPage * $stockPerPage, $totalStocks),
            ],
        ]);
    }

    /**
     * Calculate sales data from Sales and AuditTrail tables
     */
    private function calculateSalesData($memberId)
    {
        // Get only delivered sales that involve stocks from this member
        $deliveredSales = Sales::with(['salesAudit.auditTrail.product', 'customer'])
            ->whereNotNull('delivered_at')
            ->whereHas('salesAudit.auditTrail', function($query) use ($memberId) {
                $query->whereHas('stock', function($stockQuery) use ($memberId) {
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

        // Convert to array and sort by total revenue (highest first)
        $salesBreakdown = array_values($productSales);
        usort($salesBreakdown, function($a, $b) {
            return $b['total_revenue'] <=> $a['total_revenue'];
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
    private function calculateComprehensiveStockData($memberId)
    {
        // Get all stocks for this member (including sold ones)
        $allStocks = Stock::where('member_id', $memberId)
            ->whereNull('removed_at')
            ->with(['product'])
            ->get();

        // Calculate revenue from delivered sales for this member
        $deliveredSales = Sales::with(['salesAudit.auditTrail'])
            ->whereNotNull('delivered_at')
            ->whereHas('salesAudit.auditTrail', function($query) use ($memberId) {
                $query->whereHas('stock', function($stockQuery) use ($memberId) {
                    $stockQuery->where('member_id', $memberId);
                });
            })
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
                    'balance_quantity' => 0,
                    'unit_price' => $this->getProductPrice($stock->product, $stock->category),
                    'total_revenue' => 0,
                    'total_cogs' => 0,
                    'total_gross_profit' => 0,
                    'product' => $stock->product
                ];
            }
            
            // Add to total quantity (available + sold)
            $stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity;
            
            // Add available quantity (current quantity that can be sold)
            $stockGroups[$key]['available_quantity'] += $stock->quantity;
            
            // Add sold quantity (total sold from this stock)
            $stockGroups[$key]['sold_quantity'] += $stock->sold_quantity;
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

        // Calculate balance quantity: Available quantity (current quantity that can be sold)
        foreach ($stockGroups as $key => &$group) {
            $group['balance_quantity'] = $group['available_quantity'];
        }

        // Convert to array and sort by product name
        $result = array_values($stockGroups);
        usort($result, function($a, $b) {
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

    public function transactions(Request $request)
    {
        $user = Auth::user();
        
        // Log member transactions access
        SystemLogger::logMemberActivity(
            'transactions_access',
            $user->id,
            ['ip_address' => request()->ip()]
        );
        
        // Get search and filter parameters
        $search = $request->get('search', '');
        $productFilter = $request->get('product', '');
        $dateFrom = $request->get('date_from', '');
        $dateTo = $request->get('date_to', '');
        $perPage = $request->get('per_page', 15);
        
        // Build query for member's transactions
        $query = AuditTrail::with(['product', 'sale.customer'])
            ->whereHas('stock', function($q) use ($user) {
                $q->where('member_id', $user->id);
            })
            ->whereHas('sale', function($q) {
                $q->whereNotNull('delivered_time'); // Only show delivered transactions
            });
        
        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhereHas('sale.customer', function($customerQuery) use ($search) {
                      $customerQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Apply product filter
        if ($productFilter && $productFilter !== 'all') {
            $query->where('product_id', $productFilter);
        }
        
        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        
        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        // Get available products for filter dropdown
        $availableProducts = AuditTrail::with('product')
            ->whereHas('stock', function($q) use ($user) {
                $q->where('member_id', $user->id);
            })
            ->whereHas('sale', function($q) {
                $q->whereNotNull('delivered_time');
            })
            ->get()
            ->pluck('product')
            ->unique('id')
            ->values();
        
        // Calculate summary statistics
        $summary = $this->calculateTransactionSummary($user->id, $dateFrom, $dateTo);
        
        return Inertia::render('Member/transactions', [
            'transactions' => $transactions,
            'availableProducts' => $availableProducts,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'product' => $productFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function generateRevenueReport(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        // Log report generation
        SystemLogger::logReportGeneration(
            'member_revenue_report',
            $user->id,
            'member',
            [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'format' => $format,
                'display_mode' => $display
            ]
        );

        // Get only delivered sales that involve stocks from this member
        $query = Sales::with(['salesAudit.auditTrail.product', 'customer'])
            ->whereNotNull('delivered_at')
            ->whereHas('salesAudit.auditTrail', function($q) use ($user) {
                $q->whereHas('stock', function($stockQuery) use ($user) {
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
        usort($productSalesArray, function($a, $b) {
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

        $callback = function() use ($salesData, $summary) {
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
            ->whereHas('salesAudit.auditTrail', function($q) use ($memberId) {
                $q->whereHas('stock', function($stockQuery) use ($memberId) {
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
} 