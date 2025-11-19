<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\MemberEarnings;
use App\Models\Cart;
use App\Models\CartItem;
use App\Helpers\SystemLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Log admin dashboard access
        SystemLogger::logAdminActivity(
            'dashboard_access',
            request()->user()->id,
            ['ip_address' => request()->ip()]
        );

        // Get current date and date ranges
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();
        $thisWeek = $now->copy()->startOfWeek();
        $thisMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Orders Statistics
        $ordersStats = $this->getOrdersStatistics($today, $thisWeek, $thisMonth, $lastMonth, $lastMonthEnd);
        
        // Sales Statistics
        $salesStats = $this->getSalesStatistics($today, $thisWeek, $thisMonth, $lastMonth, $lastMonthEnd);
        
        // Inventory Statistics
        $inventoryStats = $this->getInventoryStatistics();
        
        // User Statistics
        $userStats = $this->getUserStatistics();
        
        // Recent Activity
        $recentActivity = $this->getRecentActivity();
        
        // Low Stock Alerts
        $lowStockAlerts = $this->getLowStockAlerts();
        
        // Pending Orders (for urgent attention)
        $pendingOrders = $this->getPendingOrders();
        
        // Top Selling Products
        $topSellingProducts = $this->getTopSellingProducts();
        
        // Member Performance
        $memberPerformance = $this->getMemberPerformance();
        
        // Logistics Performance
        $logisticsPerformance = $this->getLogisticsPerformance();

        return Inertia::render('Admin/dashboard', [
            'ordersStats' => $ordersStats,
            'salesStats' => $salesStats,
            'inventoryStats' => $inventoryStats,
            'userStats' => $userStats,
            'recentActivity' => $recentActivity,
            'lowStockAlerts' => $lowStockAlerts,
            'pendingOrders' => $pendingOrders,
            'topSellingProducts' => $topSellingProducts,
            'memberPerformance' => $memberPerformance,
            'logisticsPerformance' => $logisticsPerformance,
        ]);
    }

    private function getOrdersStatistics($today, $thisWeek, $thisMonth, $lastMonth, $lastMonthEnd)
    {
        // Today's delivered orders
        $todayOrders = Sales::whereDate('delivered_at', $today)->count();
        $todayRevenue = Sales::whereDate('delivered_at', $today)->sum('total_amount');
        
        // This week's delivered orders
        $weekOrders = Sales::where('delivered_at', '>=', $thisWeek)->count();
        $weekRevenue = Sales::where('delivered_at', '>=', $thisWeek)->sum('total_amount');
        
        // This month's delivered orders
        $monthOrders = Sales::where('delivered_at', '>=', $thisMonth)->count();
        $monthRevenue = Sales::where('delivered_at', '>=', $thisMonth)->sum('total_amount');
        
        // Last month's delivered orders for comparison
        $lastMonthOrders = Sales::whereBetween('delivered_at', [$lastMonth, $lastMonthEnd])->count();
        $lastMonthRevenue = Sales::whereBetween('delivered_at', [$lastMonth, $lastMonthEnd])->sum('total_amount');
        
        // Order status breakdown
        $orderStatusBreakdown = SalesAudit::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // Delivery status breakdown
        $deliveryStatusBreakdown = SalesAudit::select('delivery_status', DB::raw('count(*) as count'))
            ->groupBy('delivery_status')
            ->get()
            ->pluck('count', 'delivery_status');
        
        // Urgent orders
        $urgentOrders = SalesAudit::where('status', 'pending')
            ->where(function($query) {
                $query->where('is_urgent', true)
                      ->orWhere('created_at', '<=', now()->subHours(16));
            })
            ->count();
        
        // Delayed orders
        $delayedOrders = SalesAudit::where('status', 'delayed')->count();

        return [
            'today' => [
                'orders' => $todayOrders,
                'revenue' => $todayRevenue,
            ],
            'week' => [
                'orders' => $weekOrders,
                'revenue' => $weekRevenue,
            ],
            'month' => [
                'orders' => $monthOrders,
                'revenue' => $monthRevenue,
            ],
            'lastMonth' => [
                'orders' => $lastMonthOrders,
                'revenue' => $lastMonthRevenue,
            ],
            'statusBreakdown' => $orderStatusBreakdown,
            'deliveryStatusBreakdown' => $deliveryStatusBreakdown,
            'urgentOrders' => $urgentOrders,
            'delayedOrders' => $delayedOrders,
            'orderGrowth' => $lastMonthOrders > 0 ? round((($monthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 2) : 0,
            'revenueGrowth' => $lastMonthRevenue > 0 ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 2) : 0,
        ];
    }

    private function getSalesStatistics($today, $thisWeek, $thisMonth, $lastMonth, $lastMonthEnd)
    {
        // Total sales (delivered orders only)
        $totalSales = Sales::sum('total_amount');
        $totalOrders = Sales::count();
        
        // Delivered sales (completed orders) - same as total sales now
        $deliveredSales = Sales::sum('total_amount');
        $deliveredOrders = Sales::count();
        
        // Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        // Sales by day (last 30 days) - delivered orders only
        $salesByDay = Sales::select(
                DB::raw('DATE(delivered_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->where('delivered_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Sales by product category - delivered orders only
        $salesByCategory = DB::table('sales')
            ->join('sales_audit', 'sales.sales_audit_id', '=', 'sales_audit.id')
            ->join('audit_trails', 'sales_audit.id', '=', 'audit_trails.sale_id')
            ->select(
                'audit_trails.category',
                DB::raw('COUNT(DISTINCT sales.id) as orders'),
                DB::raw('SUM(audit_trails.quantity) as quantity'),
                DB::raw('SUM(sales.total_amount) as revenue')
            )
            ->where('sales.delivered_at', '>=', $thisMonth)
            ->groupBy('audit_trails.category')
            ->get();

        return [
            'totalSales' => $totalSales,
            'totalOrders' => $totalOrders,
            'avgOrderValue' => $avgOrderValue,
            'salesByDay' => $salesByDay,
            'salesByCategory' => $salesByCategory,
        ];
    }

    private function getInventoryStatistics()
    {
        // Total products
        $totalProducts = Product::count();
        $activeProducts = Product::active()->count();
        $archivedProducts = Product::archived()->count();
        
        // Stock statistics - now clearly separated
        $totalStock = Stock::active()->sum('quantity') + Stock::active()->sum('sold_quantity');
        $availableStock = Stock::available()->sum('quantity');
        $soldStock = Stock::hasSold()->sum('sold_quantity');
        $completelySoldStock = Stock::sold()->count();
        
        // Low stock products (quantity < 10)
        $lowStockProducts = Stock::active()
            ->where('quantity', '<', 10)
            ->where('quantity', '>', 0)
            ->with('product')
            ->get();
        
        // Out of stock products
        $outOfStockProducts = Stock::active()
            ->where('quantity', 0)
            ->with('product')
            ->get();
        
        // Products by category
        $productsByCategory = Stock::active()
            ->select('category', DB::raw('COUNT(*) as count'), DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('category')
            ->get();

        return [
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'archivedProducts' => $archivedProducts,
            'totalStock' => $totalStock,
            'availableStock' => $availableStock,
            'soldStock' => $soldStock,
            'completelySoldStock' => $completelySoldStock,
            'lowStockProducts' => $lowStockProducts,
            'outOfStockProducts' => $outOfStockProducts,
            'productsByCategory' => $productsByCategory,
        ];
    }

    private function getUserStatistics()
    {
        // User counts by type
        $userCounts = User::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type');
        
        // New users this month
        $newUsersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
        
        // Active customers (with orders)
        $activeCustomers = User::where('type', 'customer')
            ->whereHas('sales')
            ->count();
        
        // Active members (with stock and active status)
        $activeMembers = User::where('type', 'member')
            ->where('active', true)
            ->whereHas('stocks')
            ->count();
        
        // Active logistics (with assigned orders and active status)
        $activeLogistics = User::where('type', 'logistic')
            ->where('active', true)
            ->whereHas('assignedOrders')
            ->count();

        return [
            'userCounts' => $userCounts,
            'newUsersThisMonth' => $newUsersThisMonth,
            'activeCustomers' => $activeCustomers,
            'activeMembers' => $activeMembers,
            'activeLogistics' => $activeLogistics,
        ];
    }

    private function getRecentActivity()
    {
        // Recent orders
        $recentOrders = SalesAudit::with(['customer.defaultAddress', 'admin'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'type' => 'order',
                    'description' => "New order from {$order->customer->name}",
                    'amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            });
        
        // Recent stock additions
        $recentStockAdditions = Stock::with(['product', 'member'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'type' => 'stock',
                    'description' => "New stock added for {$stock->product->name} by {$stock->member->name}",
                    'quantity' => $stock->quantity,
                    'category' => $stock->category,
                    'created_at' => $stock->created_at,
                ];
            });
        
        // Recent user registrations
        $recentRegistrations = User::where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'description' => "New {$user->type} registered: {$user->name}",
                    'user_type' => $user->type,
                    'created_at' => $user->created_at,
                ];
            });
        
        // Combine and sort by date
        $allActivities = collect()
            ->merge($recentOrders)
            ->merge($recentStockAdditions)
            ->merge($recentRegistrations)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return $allActivities;
    }

    private function getLowStockAlerts()
    {
        return Stock::active()
            ->where('quantity', '<', 10)
            ->where('quantity', '>', 0)
            ->with(['product', 'member'])
            ->orderBy('quantity', 'asc')
            ->limit(10)
            ->get();
    }

    private function getPendingOrders()
    {
        return SalesAudit::with(['customer.defaultAddress', 'auditTrail.product'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->limit(5)
            ->get();
    }

    private function getTopSellingProducts()
    {
        return DB::table('sales')
            ->join('sales_audit', 'sales.sales_audit_id', '=', 'sales_audit.id')
            ->join('audit_trails', 'sales_audit.id', '=', 'audit_trails.sale_id')
            ->join('products', 'audit_trails.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.produce_type',
                DB::raw('SUM(audit_trails.quantity) as total_quantity'),
                DB::raw('COUNT(DISTINCT sales.id) as order_count')
            )
            ->where('sales.delivered_at', '>=', now()->subMonth())
            ->groupBy('products.id', 'products.name', 'products.produce_type')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();
    }

    private function getMemberPerformance()
    {
        $thisMonth = Carbon::now()->startOfMonth();
        
        // Get all active members with their stock and sales data
        $members = User::where('type', 'member')
            ->where('active', true)
            ->with(['stocks' => function($query) use ($thisMonth) {
                $query->with('product')
                    ->where('updated_at', '>=', $thisMonth);
            }])
            ->get()
            ->map(function ($member) use ($thisMonth) {
                // Count total stocks
                $totalStocks = $member->stocks->count();
                
                // Count stocks that have been sold (sold_quantity > 0)
                $soldStocks = $member->stocks->where('sold_quantity', '>', 0)->count();
                
                // Calculate earnings from sold stocks
                $totalEarnings = 0;
                $commissionRate = 0.10; // 10% commission
                
                foreach ($member->stocks as $stock) {
                    if ($stock->sold_quantity > 0 && $stock->product) {
                        $price = 0;
                        
                        // Get price based on category
                        if ($stock->category === 'Kilo' && $stock->product->price_kilo) {
                            $price = $stock->product->price_kilo;
                        } elseif ($stock->category === 'Pc' && $stock->product->price_pc) {
                            $price = $stock->product->price_pc;
                        } elseif ($stock->category === 'Tali' && $stock->product->price_tali) {
                            $price = $stock->product->price_tali;
                        }
                        
                        // Calculate earnings (commission on sold quantity)
                        $salesAmount = $price * $stock->sold_quantity;
                        $totalEarnings += $salesAmount * $commissionRate;
                    }
                }
                
                // Get available earnings from member_earnings table (latest record)
                $earningsRecord = MemberEarnings::where('member_id', $member->id)
                    ->latest()
                    ->first();
                
                $availableEarnings = $earningsRecord ? (float) $earningsRecord->available_earnings : 0;
                
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'total_stocks' => $totalStocks,
                    'sold_stocks' => $soldStocks,
                    'total_earnings' => round($totalEarnings, 2),
                    'available_earnings' => $availableEarnings,
                ];
            })
            ->sortByDesc('total_earnings')
            ->take(10)
            ->values();
        
        return $members;
    }

    private function getLogisticsPerformance()
    {
        $thisMonth = Carbon::now()->startOfMonth();
        
        return DB::table('users')
            ->leftJoin('sales_audit', function($join) use ($thisMonth) {
                $join->on('users.id', '=', 'sales_audit.logistic_id')
                     ->where('sales_audit.created_at', '>=', $thisMonth);
            })
            ->where('users.type', 'logistic')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(sales_audit.id) as total_orders'),
                DB::raw('SUM(CASE WHEN sales_audit.delivery_status = "delivered" THEN 1 ELSE 0 END) as delivered_orders')
            )
            ->groupBy('users.id', 'users.name')
            ->having('total_orders', '>', 0)
            ->orderBy('delivered_orders', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($logistic) {
                $deliveryRate = $logistic->total_orders > 0 
                    ? round(($logistic->delivered_orders / $logistic->total_orders) * 100, 2) 
                    : 0;
                    
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'total_orders' => (int) $logistic->total_orders,
                    'delivered_orders' => (int) $logistic->delivered_orders,
                    'delivery_rate' => (float) $deliveryRate,
                ];
            });
    }
}
