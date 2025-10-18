<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\SalesAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;

class MemberController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Log member dashboard access
        SystemLogger::logMemberActivity(
            'dashboard_access',
            $user->id,
            ['ip_address' => request()->ip()]
        );
        
        // Get stocks using scopes
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        $soldStocks = Stock::sold()
            ->with(['product', 'lastCustomer'])
            ->where('member_id', $user->id)
            ->get();
            
        // Get assigned stocks (stocks that have been bought)
        $assignedStocks = Stock::where('member_id', $user->id)
            ->whereNotNull('last_customer_id')
            ->with(['product', 'lastCustomer'])
            ->get();
            
        // Get all stocks for debugging
        $allStocks = Stock::where('member_id', $user->id)->get();
            
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
            
        // Calculate summary statistics using already fetched data
        $summary = [
            'totalStocks' => $allStocks->count(),
            'availableStocks' => $availableStocks->count(),
            'soldStocks' => $soldStocks->count(),
            'assignedStocks' => $assignedStocks->count(),
            'removedStocks' => Stock::removed()->where('member_id', $user->id)->count(),
            'stocksWithCustomer' => $allStocks->whereNotNull('last_customer_id')->count(),
            'stocksWithoutCustomer' => $allStocks->whereNull('last_customer_id')->count(),
            'totalRevenue' => $salesData['totalRevenue'],
            'totalSales' => $salesData['totalSales'],
        ];
        
        return Inertia::render('Member/dashboard', [
            'availableStocks' => $availableStocks,
            'soldStocks' => $soldStocks,
            'assignedStocks' => $assignedStocks,
            'salesData' => $salesData,
            'summary' => $summary
        ]);
    }

    public function soldStocks()
    {
        $user = Auth::user();
        
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
            
        return Inertia::render('Member/soldStocks', [
            'salesData' => $salesData
        ]);
    }


    public function assignedStocks()
    {
        $user = Auth::user();
        
        // Get assigned stocks (stocks that have been bought)
        $assignedStocks = Stock::where('member_id', $user->id)
            ->whereNotNull('last_customer_id')
            ->with(['product', 'lastCustomer'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Member/assignedStocks', [
            'assignedStocks' => $assignedStocks
        ]);
    }

    public function availableStocks()
    {
        $user = Auth::user();
        
        // Get available stocks (ready for sale) using scope
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Member/availableStocks', [
            'availableStocks' => $availableStocks
        ]);
    }

    public function allStocks()
    {
        $user = Auth::user();
        
        // Get all stocks for the member using scopes
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        // Calculate sales data for sold stocks
        $salesData = $this->calculateSalesData($user->id);
        
        // Calculate comprehensive stock data with total, sold, and available quantities
        $comprehensiveStockData = $this->calculateComprehensiveStockData($user->id);
            
        return Inertia::render('Member/allStocks', [
            'availableStocks' => $availableStocks,
            'salesData' => $salesData,
            'comprehensiveStockData' => $comprehensiveStockData
        ]);
    }

    /**
     * Calculate sales data from Sales and AuditTrail tables
     */
    private function calculateSalesData($memberId)
    {
        // Get all delivered sales that involve stocks from this member
        $deliveredSales = Sales::with(['salesAudit.auditTrail.product', 'customer'])
            ->get();

        $totalSales = 0;
        $totalRevenue = 0;
        $totalQuantitySold = 0;
        $productSales = []; // Group by product_id

        foreach ($deliveredSales as $sale) {
            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $totalSales++;
                    $totalQuantitySold += $audit->quantity;
                    
                    // Calculate revenue for this item using stored prices
                    $price = $audit->getSalePrice();
                    $itemRevenue = $audit->getTotalAmount();
                    $totalRevenue += $itemRevenue;

                    // Group by product_id
                    $productId = $audit->product_id;
                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'product_id' => $productId,
                            'product_name' => $audit->product->name,
                            'total_quantity' => 0,
                            'price_per_unit' => $price,
                            'total_revenue' => 0,
                            'category' => $audit->category,
                            'sales_count' => 0,
                            'customers' => []
                        ];
                    }

                    // Add quantities and revenue
                    $productSales[$productId]['total_quantity'] += $audit->quantity;
                    $productSales[$productId]['total_revenue'] += $itemRevenue;
                    $productSales[$productId]['sales_count']++;

                    // Add customer if not already in the list
                    if (!in_array($sale->customer->name, $productSales[$productId]['customers'])) {
                        $productSales[$productId]['customers'][] = $sale->customer->name;
                    }
                }
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

        // Get sold quantities from sales audit
        $soldQuantities = [];
        $deliveredSales = Sales::with(['salesAudit.auditTrail'])
            ->whereHas('salesAudit', function($query) {
                $query->where('delivery_status', 'delivered');
            })
            ->get();

        foreach ($deliveredSales as $sale) {
            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $key = $audit->product_id . '-' . $audit->category;
                    if (!isset($soldQuantities[$key])) {
                        $soldQuantities[$key] = [
                            'product_id' => $audit->product_id,
                            'product_name' => $audit->product->name,
                            'category' => $audit->category,
                            'sold_quantity' => 0,
                            'total_revenue' => 0,
                            'unit_price' => $audit->getSalePrice()
                        ];
                    }
                    $soldQuantities[$key]['sold_quantity'] += $audit->quantity;
                    $soldQuantities[$key]['total_revenue'] += $audit->getTotalAmount();
                }
            }
        }

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
                    'product' => $stock->product
                ];
            }
            
            // Add to total quantity
            $stockGroups[$key]['total_quantity'] += $stock->quantity;
            
            // If stock is available (quantity > 0 and no customer assigned)
            if ($stock->quantity > 0 && is_null($stock->last_customer_id)) {
                $stockGroups[$key]['available_quantity'] += $stock->quantity;
            }
        }

        // Merge with sold quantities and calculate balance
        foreach ($stockGroups as $key => &$group) {
            if (isset($soldQuantities[$key])) {
                $group['sold_quantity'] = $soldQuantities[$key]['sold_quantity'];
                $group['total_revenue'] = $soldQuantities[$key]['total_revenue'];
                $group['unit_price'] = $soldQuantities[$key]['unit_price'];
            }
            
            // Calculate balance quantity: Total - Sold
            $group['balance_quantity'] = $group['total_quantity'] - $group['sold_quantity'];
            
            // Ensure available quantity doesn't exceed balance
            if ($group['available_quantity'] > $group['balance_quantity']) {
                $group['available_quantity'] = $group['balance_quantity'];
            }
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

        // Get all delivered sales that involve stocks from this member
        $query = Sales::with(['salesAudit.auditTrail.product', 'customer'])
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
        $productSales = [];
        $orderDetails = [];

        foreach ($sales as $sale) {
            $orderTotal = 0;
            $orderQuantity = 0;
            $orderProducts = [];

            foreach ($sale->salesAudit->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $orderQuantity += $audit->quantity;
                    
                    // Calculate revenue for this item using stored prices
                    $price = $audit->getSalePrice();
                    $itemRevenue = $audit->getTotalAmount();
                    $orderTotal += $itemRevenue;

                    // Group by product_id
                    $productId = $audit->product_id;
                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'product_id' => $productId,
                            'product_name' => $audit->product->name,
                            'total_quantity' => 0,
                            'price_per_unit' => $price,
                            'total_revenue' => 0,
                            'category' => $audit->category,
                            'sales_count' => 0,
                            'customers' => []
                        ];
                    }

                    // Add quantities and revenue
                    $productSales[$productId]['total_quantity'] += $audit->quantity;
                    $productSales[$productId]['total_revenue'] += $itemRevenue;
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
                        'total_price' => $itemRevenue
                    ];
                }
            }

            if ($orderTotal > 0) {
                $totalOrders++;
                $totalRevenue += $orderTotal;
                $totalQuantitySold += $orderQuantity;

                $orderDetails[] = [
                    'order_id' => $sale->id,
                    'customer_name' => $sale->customer->name,
                    'customer_email' => $sale->customer->email,
                    'total_amount' => $orderTotal,
                    'total_quantity' => $orderQuantity,
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

        $pdf = app('dompdf.wrapper');
        $pdf->loadHTML($html);
        
        $filename = 'member_revenue_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }
} 