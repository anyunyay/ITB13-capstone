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
    Star
} from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

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
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, label: 'Pending' },
            approved: { variant: 'default' as const, label: 'Approved' },
            rejected: { variant: 'destructive' as const, label: 'Rejected' },
            delayed: { variant: 'destructive' as const, label: 'Delayed' },
            delivered: { variant: 'default' as const, label: 'Delivered' },
            out_for_delivery: { variant: 'default' as const, label: 'Out for Delivery' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <PermissionGuard 
            permissions={['view inventory', 'view orders', 'view logistics', 'view staffs', 'view members']}
            pageTitle="Dashboard Access Denied"
        >
            <AppSidebarLayout>
                <Head title="Admin Dashboard" />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-foreground leading-tight m-0">Admin Dashboard</h1>
                                            <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                                Overview of all system activities and performance metrics
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Button variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('admin.orders.index')}>
                                            <ShoppingCart className="h-4 w-4 mr-2 inline" />
                                            View Orders
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('inventory.index')}>
                                            <Package className="h-4 w-4 mr-2 inline" />
                                            Manage Inventory
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Orders Today */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{ordersStats.today.orders}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(ordersStats.today.revenue)} revenue
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Products */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
                                <p className="text-xs text-muted-foreground">
                                    {inventoryStats.activeProducts} active, {inventoryStats.archivedProducts} archived
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Users */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.values(userStats.userCounts).reduce((a, b) => a + b, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {userStats.newUsersThisMonth} new this month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Revenue */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(salesStats.totalSales)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {salesStats.totalOrders} total orders
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts and Urgent Items */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Urgent Orders */}
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-800">Urgent Orders</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800">{ordersStats.urgentOrders}</div>
                                <p className="text-xs text-red-600">
                                    Need immediate attention
                                </p>
                                {ordersStats.urgentOrders > 0 && (
                                    <Link href={route('admin.orders.index', { urgent_approval: true })}>
                                        <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                                            View Urgent Orders
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Low Stock Alerts */}
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800">Low Stock</CardTitle>
                                <Package className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-800">{lowStockAlerts.length}</div>
                                <p className="text-xs text-orange-600">
                                    Products need restocking
                                </p>
                                {lowStockAlerts.length > 0 && (
                                    <Link href={route('inventory.index')}>
                                        <Button size="sm" className="mt-2 bg-orange-600 hover:bg-orange-700">
                                            Manage Stock
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delayed Orders */}
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-yellow-800">Delayed Orders</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-800">{ordersStats.delayedOrders}</div>
                                <p className="text-xs text-yellow-600">
                                    Over 24 hours pending
                                </p>
                                {ordersStats.delayedOrders > 0 && (
                                    <Link href={route('admin.orders.index', { status: 'delayed' })}>
                                        <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700">
                                            View Delayed
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {/* Order Status Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Status Breakdown</CardTitle>
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
                                        <CardTitle>User Distribution</CardTitle>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Order Growth
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {ordersStats.orderGrowth > 0 ? '+' : ''}{ordersStats.orderGrowth}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            vs last month ({ordersStats.month.orders} vs {ordersStats.lastMonth.orders})
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Revenue Growth
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {ordersStats.revenueGrowth > 0 ? '+' : ''}{ordersStats.revenueGrowth}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            vs last month ({formatCurrency(ordersStats.month.revenue)} vs {formatCurrency(ordersStats.lastMonth.revenue)})
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {/* Top Selling Products */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5" />
                                            Top Selling Products
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {topSellingProducts.slice(0, 5).map((product, index) => (
                                                <div key={product.id} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {product.produce_type} • {product.order_count} orders
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{product.total_quantity} sold</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Member Performance */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5" />
                                            Top Members
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {memberPerformance.slice(0, 5).map((member, index) => (
                                                <div key={member.id} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {member.sold_stocks}/{member.total_stocks} stocks sold
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">{formatCurrency(member.total_earnings)}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatCurrency(member.available_earnings)} available
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Logistics Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Logistics Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {logisticsPerformance.slice(0, 6).map((logistic) => (
                                            <div key={logistic.id} className="border rounded-lg p-4">
                                                <div className="font-medium">{logistic.name}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {logistic.delivered_orders}/{logistic.total_orders} delivered
                                                </div>
                                                <div className="text-lg font-bold text-green-600 mt-2">
                                                    {logistic.delivery_rate}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {/* Stock Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stock Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Total Stock</span>
                                                <span className="font-medium">{inventoryStats.totalStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Available Stock</span>
                                                <span className="font-medium text-green-600">{inventoryStats.availableStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sold Stock</span>
                                                <span className="font-medium text-blue-600">{inventoryStats.soldStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Completely Sold</span>
                                                <span className="font-medium text-purple-600">{inventoryStats.completelySoldStock}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Products by Category */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Products by Category</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {inventoryStats.productsByCategory.map((category) => (
                                                <div key={category.category} className="flex items-center justify-between">
                                                    <span className="capitalize">{category.category}</span>
                                                    <div className="text-right">
                                                        <div className="font-medium">{category.count} products</div>
                                                        <div className="text-sm text-muted-foreground">{category.total_quantity} total stock</div>
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
                                            Low Stock Alerts
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {lowStockAlerts.slice(0, 10).map((stock) => (
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
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Recent Activity Tab */}
                        <TabsContent value="activity" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {/* Recent Orders */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Orders</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pendingOrders.slice(0, 5).map((order) => (
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
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {recentActivity.slice(0, 8).map((activity) => (
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
