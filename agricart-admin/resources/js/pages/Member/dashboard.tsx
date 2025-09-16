import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, History, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member-header';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
}

interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    lastCustomer?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface SalesData {
    totalSales: number;
    totalRevenue: number;
    totalQuantitySold: number;
    salesBreakdown: Array<{
        product_id: number;
        product_name: string;
        total_quantity: number;
        price_per_unit: number;
        total_revenue: number;
        category: string;
        sales_count: number;
        customers: string[];
    }>;
}

interface MemberEarnings {
    totalEarnings: number;
    totalOrders: number;
    monthlyEarnings: Array<{
        month: string;
        total_earnings: number;
        order_count: number;
    }>;
    recentEarnings: Array<{
        id: number;
        amount: number;
        quantity: number;
        category: string;
        product_name: string;
        customer_name: string;
        sale_id: number;
        created_at: string;
    }>;
}

interface Summary {
    availableStocks: number;
    partialStocks: number;
    soldStocks: number;
    assignedStocks: number;
    totalSales: number;
    totalRevenue: number;
    totalQuantitySold: number;
}

interface PageProps {
    availableStocks: Stock[];
    partialStocks: Stock[];
    soldStocks: Stock[];
    assignedStocks: Stock[];
    salesData: SalesData;
    memberEarnings: MemberEarnings;
    summary: Summary;
}

export default function MemberDashboard({ availableStocks, partialStocks, soldStocks, assignedStocks, salesData, memberEarnings, summary }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    // Add early return if data is not yet available
    if (!summary || !salesData) {
        return (
            <div className="min-h-screen bg-gray-900">
                <MemberHeader />
                <div className="p-6">
                    <Head title="Member Dashboard" />
                    <div className="text-center py-12">
                        <div className="text-white text-xl">Loading dashboard...</div>
                    </div>
                </div>
            </div>
        );
    }

        return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="Member Dashboard" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Welcome, {auth?.user?.name}!</h1>
                    <p className="text-gray-400 mt-2">Track your stocks and view your activity history</p>
                </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Available</CardTitle>
                        <Package className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.availableStocks}</div>
                        <p className="text-xs text-gray-400">Ready for sale</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Partially Sold</CardTitle>
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.partialStocks}</div>
                        <p className="text-xs text-gray-400">Approved & partial</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Sold</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.soldStocks}</div>
                        <p className="text-xs text-gray-400">Completely sold</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Assigned</CardTitle>
                        <History className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.assignedStocks}</div>
                        <p className="text-xs text-gray-400">Total assigned</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Sales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.totalSales}</div>
                        <p className="text-xs text-gray-400">Items sold</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Member Earnings</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₱{memberEarnings.totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-gray-400">From {memberEarnings.totalOrders} orders (90% of sales)</p>
                    </CardContent>
                </Card>
            </div>
            {/* Stock Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Stocks */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Available Stocks</CardTitle>
                            <CardDescription className="text-gray-400">Ready for sale</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Link href={route('member.availableStocks')}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {availableStocks.length > 0 ? (
                            <div className="space-y-3">
                                {availableStocks.slice(0, 3).map((stock: Stock) => (
                                    <div key={stock.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700">
                                        <div>
                                            <h4 className="font-medium text-white text-sm">{stock.product.name}</h4>
                                            <p className="text-xs text-gray-400">
                                                {stock.quantity} {stock.category}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-600 text-white text-xs">Available</Badge>
                                    </div>
                                ))}
                                {availableStocks.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-400">+{availableStocks.length - 3} more</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                                <p className="text-sm">No available stocks</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assigned Stocks */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Assigned Stocks</CardTitle>
                            <CardDescription className="text-gray-400">Partially sold</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Link href={route('member.assignedStocks')}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {assignedStocks.length > 0 ? (
                            <div className="space-y-3">
                                {assignedStocks.filter(stock => stock.quantity > 0).slice(0, 3).map((stock: Stock) => (
                                    <div key={stock.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700">
                                        <div>
                                            <h4 className="font-medium text-white text-sm">{stock.product.name}</h4>
                                            <p className="text-xs text-gray-400">
                                                {stock.quantity} {stock.category}
                                            </p>
                                            {stock.lastCustomer && (
                                                <p className="text-xs text-gray-500">
                                                    {stock.lastCustomer.name}
                                                </p>
                                            )}
                                        </div>
                                        <Badge 
                                            variant="secondary" 
                                            className="bg-yellow-600 text-white"
                                        >
                                            Partial
                                        </Badge>
                                    </div>
                                ))}
                                {assignedStocks.filter(stock => stock.quantity > 0).length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-400">+{assignedStocks.filter(stock => stock.quantity > 0).length - 3} more</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                                <p className="text-sm">No partially sold stocks</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sold Stocks */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Sold Stocks</CardTitle>
                            <CardDescription className="text-gray-400">Sales performance</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Link href={route('member.soldStocks')}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {salesData.salesBreakdown.length > 0 ? (
                            <div className="space-y-3">
                                {salesData.salesBreakdown.slice(0, 3).map((sale, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700">
                                        <div>
                                            <h4 className="font-medium text-white text-sm">{sale.product_name}</h4>
                                            <p className="text-xs text-gray-400">
                                                {sale.total_quantity} {sale.category}
                                            </p>
                                            <p className="text-xs text-blue-400">
                                                {sale.customers.length} customer{sale.customers.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="bg-red-600 text-white text-xs mb-1">Sold</Badge>
                                            <p className="text-xs text-green-400">₱{sale.total_revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {salesData.salesBreakdown.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-400">+{salesData.salesBreakdown.length - 3} more sales</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                                <p className="text-sm">No sales recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Earnings Section */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Recent Earnings</CardTitle>
                    <CardDescription className="text-gray-400">
                        Your latest earnings from approved orders (90% of sales)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {memberEarnings.recentEarnings.length > 0 ? (
                        <div className="space-y-3">
                            {memberEarnings.recentEarnings.map((earning) => (
                                <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-white">{earning.product_name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {earning.category}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {earning.quantity} {earning.category.toLowerCase()} • {earning.customer_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Order #{earning.sale_id} • {earning.created_at}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-400">
                                            ₱{earning.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-gray-400">90% earnings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-sm">No earnings recorded yet</p>
                            <p className="text-xs">Earnings will appear here once your orders are approved</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View All Stocks Button */}
            <div className="mt-8 text-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                    <Link href={route('member.allStocks')}>View All Stocks</Link>
                </Button>
            </div>


        </div>
        </div>
    );
} 