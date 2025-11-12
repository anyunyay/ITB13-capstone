import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
    ShoppingCart, 
    Package, 
    Users, 
    TrendingUp, 
    AlertTriangle, 
    Clock,
    DollarSign,
    BarChart3,
    UserCheck,
    Truck,
    Star,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';

interface DashboardProps {
    ordersStats: {
        today: { orders: number; revenue: number };
        week: { orders: number; revenue: number };
        month: { orders: number; revenue: number };
        lastMonth: { orders: number; revenue: number };
        statusBreakdown: Record<string, number>;
        deliveryStatusBreakdown: Record<string, number>;
        urgentOrders: number;
        delayedOrders: number;
        orderGrowth: number;
        revenueGrowth: number;
    };
    salesStats: {
        totalSales: number;
        totalOrders: number;
        avgOrderValue: number;
        salesByDay: Array<{ date: string; orders: number; revenue: number }>;
        salesByCategory: Array<{ category: string; orders: number; quantity: number; revenue: number }>;
    };
    inventoryStats: {
        totalProducts: number;
        activeProducts: number;
        archivedProducts: number;
        totalStock: number;
        availableStock: number;
        soldStock: number;
        completelySoldStock: number;
        lowStockProducts: Array<any>;
        outOfStockProducts: Array<any>;
        productsByCategory: Array<{ category: string; count: number; total_quantity: number }>;
    };
    userStats: {
        userCounts: Record<string, number>;
        newUsersThisMonth: number;
        activeCustomers: number;
        activeMembers: number;
        activeLogistics: number;
    };
    recentActivity: Array<{
        id: number;
        type: string;
        description: string;
        created_at: string;
        [key: string]: any;
    }>;
    lowStockAlerts: Array<any>;
    pendingOrders: Array<any>;
    topSellingProducts: Array<{
        id: number;
        name: string;
        produce_type: string;
        total_quantity: number;
        order_count: number;
    }>;
    memberPerformance: Array<{
        id: number;
        name: string;
        total_stocks: number;
        sold_stocks: number;
        total_earnings: number;
        available_earnings: number;
    }>;
    logisticsPerformance: Array<{
        id: number;
        name: string;
        total_orders: number;
        delivered_orders: number;
        delivery_rate: number;
    }>;
}

export default function Dashboard({
    ordersStats,
    salesStats,
    inventoryStats,
    userStats,
    recentActivity,
    lowStockAlerts,
    pendingOrders,
    topSellingProducts,
    memberPerformance,
    logisticsPerformance
}: DashboardProps) {
    const t = useTranslation();
    const [lowStockPage, setLowStockPage] = useState(1);
    const [pendingOrdersPage, setPendingOrdersPage] = useState(1);
    const itemsPerPage = 5;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    // Pagination logic for low stock alerts
    const totalLowStockPages = Math.ceil(lowStockAlerts.length / itemsPerPage);
    const paginatedLowStockAlerts = lowStockAlerts.slice(
        (lowStockPage - 1) * itemsPerPage,
        lowStockPage * itemsPerPage
    );

    // Pagination logic for pending orders
    const totalPendingOrdersPages = Math.ceil(pendingOrders.length / itemsPerPage);
    const paginatedPendingOrders = pendingOrders.slice(
        (pendingOrdersPage - 1) * itemsPerPage,
        pendingOrdersPage * itemsPerPage
    );

    // Limit recent activity to 5 most recent entries
    const recentActivityLimited = recentActivity.slice(0, 5);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, label: t('admin.pending') },
            approved: { variant: 'default' as const, label: t('admin.approved') },
            rejected: { variant: 'destructive' as const, label: t('admin.rejected') },
            delayed: { variant: 'destructive' as const, label: t('admin.delayed') },
            delivered: { variant: 'default' as const, label: t('admin.delivered') },
            out_for_delivery: { variant: 'default' as const, label: t('admin.out_for_delivery') }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <PermissionGuard 
            permissions={['view inventory', 'view orders', 'view logistics', 'view staffs', 'view members']}
            pageTitle={t('admin.dashboard_access_denied')}
        >
            <AppSidebarLayout>
                <Head title={t('admin.dashboard_title')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">{t('admin.dashboard_title')}</h1>
                                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                                {t('admin.dashboard_description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                    <Button variant="outline" className="bg-background text-foreground border border-border px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('admin.orders.index')} className="flex items-center justify-center w-full">
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            <span className="text-sm sm:text-base">{t('admin.view_orders')}</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="bg-background text-foreground border border-border px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('inventory.index')} className="flex items-center justify-center w-full">
                                            <Package className="h-4 w-4 mr-2" />
                                            <span className="text-sm sm:text-base">{t('admin.manage_inventory')}</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Orders Today */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('admin.orders_today')}</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{ordersStats.today.orders}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(ordersStats.today.revenue)} {t('admin.revenue')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Products */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('admin.total_products')}</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
                                <p className="text-xs text-muted-foreground">
                                    {inventoryStats.activeProducts} {t('admin.active')}, {inventoryStats.archivedProducts} {t('admin.archived')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Users */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('admin.total_users')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.values(userStats.userCounts).reduce((a, b) => a + b, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {userStats.newUsersThisMonth} {t('admin.new_this_month')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Revenue */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('admin.total_revenue')}</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(salesStats.totalSales)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {salesStats.totalOrders} {t('admin.total_orders')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts and Urgent Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {/* Urgent Orders */}
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-800">{t('admin.urgent_orders')}</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800">{ordersStats.urgentOrders}</div>
                                <p className="text-xs text-red-600">
                                    {t('admin.need_immediate_attention')}
                                </p>
                                {ordersStats.urgentOrders > 0 && (
                                    <Link href={route('admin.orders.index', { urgent_approval: true })}>
                                        <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                                            {t('admin.view_urgent_orders')}
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Low Stock Alerts */}
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800">{t('admin.low_stock')}</CardTitle>
                                <Package className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-800">{lowStockAlerts.length}</div>
                                <p className="text-xs text-orange-600">
                                    {t('admin.products_need_restocking')}
                                </p>
                                {lowStockAlerts.length > 0 && (
                                    <Link href={route('inventory.index')}>
                                        <Button size="sm" className="mt-2 bg-orange-600 hover:bg-orange-700">
                                            {t('admin.manage_stock')}
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delayed Orders */}
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-yellow-800">{t('admin.delayed_orders')}</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-800">{ordersStats.delayedOrders}</div>
                                <p className="text-xs text-yellow-600">
                                    {t('admin.over_24_hours_pending')}
                                </p>
                                {ordersStats.delayedOrders > 0 && (
                                    <Link href={route('admin.orders.index', { status: 'delayed' })}>
                                        <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700">
                                            {t('admin.view_delayed')}
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                            <TabsTrigger value="overview" className="text-base">{t('admin.overview_tab')}</TabsTrigger>
                            <TabsTrigger value="performance" className="text-base">{t('admin.performance_tab')}</TabsTrigger>
                            <TabsTrigger value="inventory" className="text-base">{t('admin.inventory_tab')}</TabsTrigger>
                            <TabsTrigger value="activity" className="text-base">{t('admin.activity_tab')}</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-2">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                {/* Order Status Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.order_status_breakdown')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(ordersStats.statusBreakdown).map(([status, count]) => (
                                                <div key={status} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(status)}
                                                    </div>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* User Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.user_distribution')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(userStats.userCounts).map(([type, count]) => (
                                                <div key={type} className="flex items-center justify-between">
                                                    <span className="capitalize">{type}s</span>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Growth Metrics */}
                            <div className="grid grid-cols-2 gap-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            {t('admin.order_growth')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl lg:text-3xl font-bold">
                                            {ordersStats.orderGrowth > 0 ? '+' : ''}{ordersStats.orderGrowth}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('admin.vs_last_month')} ({ordersStats.month.orders} vs {ordersStats.lastMonth.orders})
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            {t('admin.revenue_growth')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl lg:text-3xl font-bold">
                                            {ordersStats.revenueGrowth > 0 ? '+' : ''}{ordersStats.revenueGrowth}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('admin.vs_last_month')} ({formatCurrency(ordersStats.month.revenue)} vs {formatCurrency(ordersStats.lastMonth.revenue)})
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-2">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                {/* Top Selling Products */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5" />
                                            {t('admin.top_selling_products')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {topSellingProducts.length > 0 ? (
                                            <div className="space-y-3">
                                                {topSellingProducts.slice(0, 5).map((product, index) => (
                                                    <div key={product.id} className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {product.produce_type} • {product.order_count} {t('admin.orders')}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="flex-shrink-0">{product.total_quantity} {t('admin.sold')}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>{t('admin.no_top_selling_products')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Member Performance */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5" />
                                            {t('admin.top_members')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {memberPerformance.length > 0 ? (
                                            <div className="space-y-3">
                                                {memberPerformance.slice(0, 5).map((member, index) => (
                                                    <div key={member.id} className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{member.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {member.sold_stocks || 0}/{member.total_stocks || 0} {t('admin.stocks_sold')}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="font-medium">{formatCurrency(member.total_earnings || 0)}</div>
                                                            {member.available_earnings > 0 && (
                                                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                                                    {formatCurrency(member.available_earnings)} {t('admin.available')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>{t('admin.no_member_performance')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Logistics Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        {t('admin.logistics_performance')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {logisticsPerformance.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {logisticsPerformance.slice(0, 6).map((logistic) => (
                                                <div key={logistic.id} className="border rounded-lg p-4">
                                                    <div className="font-medium truncate">{logistic.name}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {logistic.delivered_orders || 0}/{logistic.total_orders || 0} {t('admin.delivered')}
                                                    </div>
                                                    <div className="text-lg font-bold text-green-600 mt-2">
                                                        {logistic.delivery_rate || 0}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>{t('admin.no_logistics_performance')}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="space-y-2">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                {/* Stock Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.stock_overview')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>{t('admin.total_stock')}</span>
                                                <span className="font-medium">{inventoryStats.totalStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t('admin.available_stock')}</span>
                                                <span className="font-medium text-green-600">{inventoryStats.availableStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t('admin.sold_stock')}</span>
                                                <span className="font-medium text-blue-600">{inventoryStats.soldStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t('admin.completely_sold_stock')}</span>
                                                <span className="font-medium text-purple-600">{inventoryStats.completelySoldStock}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Products by Category */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.products_by_category')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {inventoryStats.productsByCategory.map((category) => (
                                                <div key={category.category} className="flex items-center justify-between">
                                                    <span className="capitalize">{category.category}</span>
                                                    <div className="text-right">
                                                        <div className="font-medium">{category.count} {t('admin.products')}</div>
                                                        <div className="text-sm text-muted-foreground">{category.total_quantity} {t('admin.total_stock')}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Low Stock Alerts */}
                            {lowStockAlerts.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-orange-600">
                                            <AlertTriangle className="h-5 w-5" />
                                            {t('admin.low_stock_products')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {paginatedLowStockAlerts.map((stock) => (
                                                <div key={stock.id} className="flex items-center justify-between border rounded p-2">
                                                    <div>
                                                        <div className="font-medium">{stock.product.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {stock.member.name} • {stock.category}
                                                        </div>
                                                    </div>
                                                    <Badge variant="destructive">{stock.quantity} left</Badge>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalLowStockPages > 1 && (
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {((lowStockPage - 1) * itemsPerPage) + 1}-{Math.min(lowStockPage * itemsPerPage, lowStockAlerts.length)} of {lowStockAlerts.length}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setLowStockPage(prev => Math.max(1, prev - 1))}
                                                        disabled={lowStockPage === 1}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-sm">
                                                        Page {lowStockPage} of {totalLowStockPages}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setLowStockPage(prev => Math.min(totalLowStockPages, prev + 1))}
                                                        disabled={lowStockPage === totalLowStockPages}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Recent Activity Tab */}
                        <TabsContent value="activity" className="space-y-2">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                {/* Pending Orders */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.pending_orders')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {pendingOrders.length > 0 ? (
                                            <>
                                                <div className="space-y-3">
                                                    {paginatedPendingOrders.map((order) => (
                                                        <div key={order.id} className="flex items-center justify-between border rounded p-3">
                                                            <div>
                                                                <div className="font-medium">Order #{order.id}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {order.customer.name} • {formatCurrency(order.total_amount)}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                {getStatusBadge(order.status)}
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination Controls */}
                                                {totalPendingOrdersPages > 1 && (
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                                        <div className="text-sm text-muted-foreground">
                                                            Showing {((pendingOrdersPage - 1) * itemsPerPage) + 1}-{Math.min(pendingOrdersPage * itemsPerPage, pendingOrders.length)} of {pendingOrders.length}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setPendingOrdersPage(prev => Math.max(1, prev - 1))}
                                                                disabled={pendingOrdersPage === 1}
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <span className="text-sm">
                                                                Page {pendingOrdersPage} of {totalPendingOrdersPages}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setPendingOrdersPage(prev => Math.min(totalPendingOrdersPages, prev + 1))}
                                                                disabled={pendingOrdersPage === totalPendingOrdersPages}
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>{t('admin.no_pending_orders')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('admin.recent_activity')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {recentActivityLimited.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentActivityLimited.map((activity) => (
                                                    <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm">{activity.description}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>{t('admin.no_recent_activity')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                    </div>
                </div>
            </AppSidebarLayout>
        </PermissionGuard>
    );
}
