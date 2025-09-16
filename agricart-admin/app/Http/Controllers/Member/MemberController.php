<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\MemberEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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
} 