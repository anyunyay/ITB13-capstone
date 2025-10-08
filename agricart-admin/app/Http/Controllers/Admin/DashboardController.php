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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
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
        // Today's orders
        $todayOrders = SalesAudit::whereDate('created_at', $today)->count();
        $todayRevenue = SalesAudit::whereDate('created_at', $today)->sum('total_amount');
        
        // This week's orders
        $weekOrders = SalesAudit::where('created_at', '>=', $thisWeek)->count();
        $weekRevenue = SalesAudit::where('created_at', '>=', $thisWeek)->sum('total_amount');
        
        // This month's orders
        $monthOrders = SalesAudit::where('created_at', '>=', $thisMonth)->count();
        $monthRevenue = SalesAudit::where('created_at', '>=', $thisMonth)->sum('total_amount');
        
        // Last month's orders for comparison
        $lastMonthOrders = SalesAudit::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();
        $lastMonthRevenue = SalesAudit::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->sum('total_amount');
        
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
        // Total sales (all orders)
        $totalSales = SalesAudit::sum('total_amount');
        $totalOrders = SalesAudit::count();
        
        // Delivered sales (completed orders)
        $deliveredSales = Sales::sum('total_amount');
        $deliveredOrders = Sales::count();
        
        // Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        // Sales by day (last 30 days)
        $salesByDay = SalesAudit::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Sales by product category
        $salesByCategory = DB::table('audit_trails')
            ->join('sales_audit', 'audit_trails.sale_id', '=', 'sales_audit.id')
            ->select(
                'audit_trails.category',
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(audit_trails.quantity) as quantity'),
                DB::raw('SUM(sales_audit.total_amount) as revenue')
            )
            ->where('sales_audit.created_at', '>=', $thisMonth)
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
        
        // Stock statistics
        $totalStock = Stock::active()->sum('quantity');
        $availableStock = Stock::available()->sum('quantity');
        $soldStock = Stock::sold()->count();
        $partialStock = Stock::partial()->count();
        
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
            'partialStock' => $partialStock,
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
        
        // Active members (with stock)
        $activeMembers = User::where('type', 'member')
            ->whereHas('stocks')
            ->count();
        
        // Active logistics (with assigned orders)
        $activeLogistics = User::where('type', 'logistic')
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
        return DB::table('audit_trails')
            ->join('products', 'audit_trails.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.produce_type',
                DB::raw('SUM(audit_trails.quantity) as total_quantity'),
                DB::raw('COUNT(DISTINCT audit_trails.sale_id) as order_count')
            )
            ->where('audit_trails.created_at', '>=', now()->subMonth())
            ->groupBy('products.id', 'products.name', 'products.produce_type')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();
    }

    private function getMemberPerformance()
    {
        return User::where('type', 'member')
            ->withCount(['stocks as total_stocks', 'stocks as sold_stocks' => function($query) {
                $query->where('quantity', 0);
            }])
            ->with(['memberEarnings'])
            ->orderBy('total_stocks', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'total_stocks' => $member->total_stocks,
                    'sold_stocks' => $member->sold_stocks,
                    'total_earnings' => $member->memberEarnings?->total_earnings ?? 0,
                    'available_earnings' => $member->memberEarnings?->available_earnings ?? 0,
                ];
            });
    }

    private function getLogisticsPerformance()
    {
        return User::where('type', 'logistic')
            ->withCount(['assignedOrders as total_orders', 'assignedOrders as delivered_orders' => function($query) {
                $query->where('delivery_status', 'delivered');
            }])
            ->orderBy('total_orders', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($logistic) {
                $deliveryRate = $logistic->total_orders > 0 
                    ? round(($logistic->delivered_orders / $logistic->total_orders) * 100, 2)
                    : 0;
                
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'total_orders' => $logistic->total_orders,
                    'delivered_orders' => $logistic->delivered_orders,
                    'delivery_rate' => $deliveryRate,
                ];
            });
    }
}
