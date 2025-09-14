<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\MemberEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

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
        
        // Get member earnings data
        $memberEarnings = $this->getMemberEarningsData($user->id);

        return Inertia::render('Member/dashboard', [
            'availableStocks' => $availableStocks,
            'partialStocks' => $partialStocks,
            'soldStocks' => $soldStocks,
            'assignedStocks' => $assignedStocks,
            'salesData' => $salesData,
            'memberEarnings' => $memberEarnings,
            'summary' => $summary
        ]);
    }

    public function soldStocks()
    {
        $user = Auth::user();
        
        // Calculate sales data from MemberEarning records
        $salesData = $this->calculateSalesData($user->id);
        
        // Get member earnings data
        $memberEarnings = $this->getMemberEarningsData($user->id);
            
        return Inertia::render('Member/soldStocks', [
            'salesData' => $salesData,
            'memberEarnings' => $memberEarnings
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
        
        // Get member earnings data
        $memberEarnings = $this->getMemberEarningsData($user->id);
            
        return Inertia::render('Member/allStocks', [
            'availableStocks' => $availableStocks,
            'partialStocks' => $partialStocks,
            'salesData' => $salesData,
            'memberEarnings' => $memberEarnings
        ]);
    }

    /**
     * Calculate sales data from MemberEarning records
     */
    private function calculateSalesData($memberId)
    {
        // Get all member earnings for this member
        $memberEarnings = MemberEarning::where('member_id', $memberId)
            ->with(['sale.customer', 'stock.product'])
            ->get();

        $totalSales = 0;
        $totalRevenue = 0;
        $totalQuantitySold = 0;
        $productSales = []; // Group by product_id

        foreach ($memberEarnings as $earning) {
            $totalSales++;
            $totalQuantitySold += $earning->quantity;
            $totalRevenue += $earning->amount;

            // Group by product_id
            $productId = $earning->stock->product_id;
            if (!isset($productSales[$productId])) {
                $productSales[$productId] = [
                    'product_id' => $productId,
                    'product_name' => $earning->stock->product->name,
                    'total_quantity' => 0,
                    'price_per_unit' => $earning->amount / $earning->quantity, // Calculate average price per unit
                    'total_revenue' => 0,
                    'category' => $earning->category,
                    'sales_count' => 0,
                    'customers' => []
                ];
            }

            // Add quantities and revenue
            $productSales[$productId]['total_quantity'] += $earning->quantity;
            $productSales[$productId]['total_revenue'] += $earning->amount;
            $productSales[$productId]['sales_count']++;

            // Add customer if not already in the list
            if (!in_array($earning->sale->customer->name, $productSales[$productId]['customers'])) {
                $productSales[$productId]['customers'][] = $earning->sale->customer->name;
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
     * Get detailed member earnings data
     */
    private function getMemberEarningsData($memberId)
    {
        $memberEarnings = MemberEarning::where('member_id', $memberId)
            ->with(['sale.customer', 'stock.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalEarnings = $memberEarnings->sum('amount');
        $totalOrders = $memberEarnings->unique('sale_id')->count();

        // Group by month for chart data
        $monthlyEarnings = $memberEarnings->groupBy(function($earning) {
            return $earning->created_at->format('Y-m');
        })->map(function($earnings, $month) {
            return [
                'month' => $month,
                'total_earnings' => $earnings->sum('amount'),
                'order_count' => $earnings->unique('sale_id')->count()
            ];
        })->values();

        return [
            'totalEarnings' => $totalEarnings,
            'totalOrders' => $totalOrders,
            'monthlyEarnings' => $monthlyEarnings,
            'recentEarnings' => $memberEarnings->take(10)->map(function($earning) {
                return [
                    'id' => $earning->id,
                    'amount' => $earning->amount,
                    'quantity' => $earning->quantity,
                    'category' => $earning->category,
                    'product_name' => $earning->stock->product->name,
                    'customer_name' => $earning->sale->customer->name,
                    'sale_id' => $earning->sale_id,
                    'created_at' => $earning->created_at->format('M d, Y'),
                ];
            })
        ];
    }

    /**
     * Generate earnings report for the authenticated member
     */
    public function generateEarningsReport(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $category = $request->get('category', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = MemberEarning::where('member_id', $user->id)
            ->with(['sale.customer', 'stock.product']);

        // Filter by date range
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

        $earnings = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_earnings' => $earnings->sum('amount'),
            'total_orders' => $earnings->unique('sale_id')->count(),
            'total_quantity' => $earnings->sum('quantity'),
            'average_earning_per_order' => $earnings->unique('sale_id')->count() > 0 
                ? $earnings->sum('amount') / $earnings->unique('sale_id')->count() 
                : 0,
            'total_products' => $earnings->pluck('stock.product_id')->unique()->count(),
            'total_customers' => $earnings->pluck('sale.customer_id')->unique()->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportEarningsToCsv($earnings, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportEarningsToPdf($earnings, $summary, $user);
        }

        // Return view for display
        return Inertia::render('Member/earningsReport', [
            'earnings' => $earnings,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category' => $category,
            ],
        ]);
    }

    private function exportEarningsToCsv($earnings, $summary)
    {
        $filename = 'member_earnings_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($earnings) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, [
                'Earning ID',
                'Sale ID',
                'Product Name',
                'Category',
                'Quantity',
                'Amount',
                'Customer Name',
                'Customer Email',
                'Date'
            ]);
            
            // Add data rows
            foreach ($earnings as $earning) {
                fputcsv($file, [
                    $earning->id,
                    $earning->sale_id,
                    $earning->stock->product->name,
                    $earning->category,
                    $earning->quantity,
                    $earning->amount,
                    $earning->sale->customer->name ?? 'N/A',
                    $earning->sale->customer->email ?? 'N/A',
                    $earning->created_at->format('Y-m-d H:i:s')
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportEarningsToPdf($earnings, $summary, $user)
    {
        $html = view('reports.member-earnings-pdf', [
            'earnings' => $earnings,
            'summary' => $summary,
            'user' => $user,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'member_earnings_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
} 