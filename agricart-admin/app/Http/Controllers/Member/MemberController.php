<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;

class MemberController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get stocks using scopes
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        $partialStocks = Stock::partial()
            ->with(['product', 'lastCustomer'])
            ->where('member_id', $user->id)
            ->get();
            
        $soldStocks = Stock::sold()
            ->with(['product', 'lastCustomer'])
            ->where('member_id', $user->id)
            ->get();
            
        // Get assigned stocks (both partial and sold - stocks that have been bought)
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
            'partialStocks' => $partialStocks->count(),
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
            'partialStocks' => $partialStocks,
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

    public function partialStocks()
    {
        $user = Auth::user();
        
        // Get partially fulfilled stocks using scope
        $partialStocks = Stock::partial()
            ->with(['product', 'lastCustomer'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Member/partialStocks', [
            'partialStocks' => $partialStocks
        ]);
    }

    public function assignedStocks()
    {
        $user = Auth::user();
        
        // Get only partial stocks using scope instead of manual query
        $assignedStocks = Stock::partial()
            ->where('member_id', $user->id)
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
            
        $partialStocks = Stock::partial()
            ->with(['product', 'lastCustomer'])
            ->where('member_id', $user->id)
            ->get();
            
        // Calculate sales data for sold stocks
        $salesData = $this->calculateSalesData($user->id);
            
        return Inertia::render('Member/allStocks', [
            'availableStocks' => $availableStocks,
            'partialStocks' => $partialStocks,
            'salesData' => $salesData
        ]);
    }

    /**
     * Calculate sales data from Sales and AuditTrail tables
     */
    private function calculateSalesData($memberId)
    {
        // Get all approved sales that involve stocks from this member
        $approvedSales = Sales::approved()
            ->with(['auditTrail.product', 'customer'])
            ->get();

        $totalSales = 0;
        $totalRevenue = 0;
        $totalQuantitySold = 0;
        $productSales = []; // Group by product_id

        foreach ($approvedSales as $sale) {
            foreach ($sale->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $totalSales++;
                    $totalQuantitySold += $audit->quantity;
                    
                    // Calculate revenue for this item
                    $price = 0;
                    if ($audit->category === 'Kilo' && $audit->product->price_kilo) {
                        $price = $audit->product->price_kilo;
                    } elseif ($audit->category === 'Pc' && $audit->product->price_pc) {
                        $price = $audit->product->price_pc;
                    } elseif ($audit->category === 'Tali' && $audit->product->price_tali) {
                        $price = $audit->product->price_tali;
                    }
                    
                    $itemRevenue = $audit->quantity * $price;
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

    public function generateRevenueReport(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        // Get all approved sales that involve stocks from this member
        $query = Sales::approved()
            ->with(['auditTrail.product', 'customer'])
            ->whereHas('auditTrail', function($q) use ($user) {
                $q->whereHas('stock', function($stockQuery) use ($user) {
                    $stockQuery->where('member_id', $user->id);
                });
            });

        // Filter by date range
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $sales = $query->orderBy('created_at', 'desc')->get();

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

            foreach ($sale->auditTrail as $audit) {
                // Check if this audit trail involves a stock from this member
                $stock = Stock::where('id', $audit->stock_id)
                    ->where('member_id', $memberId)
                    ->first();

                if ($stock) {
                    $orderQuantity += $audit->quantity;
                    
                    // Calculate revenue for this item
                    $price = 0;
                    if ($audit->category === 'Kilo' && $audit->product->price_kilo) {
                        $price = $audit->product->price_kilo;
                    } elseif ($audit->category === 'Pc' && $audit->product->price_pc) {
                        $price = $audit->product->price_pc;
                    } elseif ($audit->category === 'Tali' && $audit->product->price_tali) {
                        $price = $audit->product->price_tali;
                    }
                    
                    $itemRevenue = $audit->quantity * $price;
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