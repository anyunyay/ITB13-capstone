<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\RemovedStock;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        
        // Get stocks using the new scopes
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        $partialStocks = Stock::partial()
            ->with(['product', 'customer'])
            ->where('member_id', $user->id)
            ->get();
            
        $soldStocks = Stock::sold()
            ->with(['product', 'customer'])
            ->where('member_id', $user->id)
            ->get();
            
        // Get assigned stocks (both partial and sold - stocks that have been bought)
        $assignedStocks = Stock::where('member_id', $user->id)
            ->whereNotNull('customer_id')
            ->with(['product', 'customer'])
            ->get();
            
        // Get all stocks for debugging
        $allStocks = Stock::where('member_id', $user->id)->get();
            
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
            
        // Calculate summary statistics
        $summary = [
            'availableStocks' => $availableStocks->count(),
            'partialStocks' => $partialStocks->count(),
            'soldStocks' => $soldStocks->count(),
            'assignedStocks' => $assignedStocks->where('quantity', '>', 0)->count(), // Only count partial stocks
            'totalSales' => $salesData['totalSales'],
            'totalRevenue' => $salesData['totalRevenue'],
            'totalQuantitySold' => $salesData['totalQuantitySold'],
            'debug' => [
                'totalStocks' => $allStocks->count(),
                'stocksWithCustomer' => $allStocks->whereNotNull('customer_id')->count(),
                'stocksWithoutCustomer' => $allStocks->whereNull('customer_id')->count(),
                'stocksWithQuantity' => $allStocks->where('quantity', '>', 0)->count(),
                'stocksWithZeroQuantity' => $allStocks->where('quantity', 0)->count(),
            ]
        ];
        
        return Inertia::render('Member/dashboard', [
            'availableStocks' => $availableStocks,
            'partialStocks' => $partialStocks,
            'soldStocks' => $soldStocks,
            'assignedStocks' => $assignedStocks,
            'salesData' => $salesData,
            'summary' => $summary,
            'debug' => $summary['debug']
        ]);
    }

    public function soldStocks()
    {
        $user = auth()->user();
        
        // Calculate sales data from Sales and AuditTrail tables
        $salesData = $this->calculateSalesData($user->id);
            
        return Inertia::render('Member/soldStocks', [
            'salesData' => $salesData
        ]);
    }

    public function partialStocks()
    {
        $user = auth()->user();
        
        // Get partially fulfilled stocks
        $partialStocks = Stock::partial()
            ->with(['product', 'customer'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Member/partialStocks', [
            'partialStocks' => $partialStocks
        ]);
    }

    public function assignedStocks()
    {
        $user = auth()->user();
        
        // Get only partial stocks (quantity > 0, has customer)
        $assignedStocks = Stock::where('member_id', $user->id)
            ->whereNotNull('customer_id')
            ->where('quantity', '>', 0)
            ->with(['product', 'customer'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Member/assignedStocks', [
            'assignedStocks' => $assignedStocks
        ]);
    }

    public function availableStocks()
    {
        $user = auth()->user();
        
        // Get available stocks (ready for sale)
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
        $user = auth()->user();
        
        // Get all stocks for the member with different statuses
        $availableStocks = Stock::available()
            ->with(['product'])
            ->where('member_id', $user->id)
            ->get();
            
        $partialStocks = Stock::partial()
            ->with(['product', 'customer'])
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
} 