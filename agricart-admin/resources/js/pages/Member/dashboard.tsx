import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, History, TrendingUp, FileText, CheckCircle, DollarSign } from 'lucide-react';
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
    sold_quantity: number;
    initial_quantity: number;
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    created_at: string;
}

interface SalesData {
    totalSales: number;
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    totalQuantitySold: number;
    salesBreakdown: Array<{
        product_id: number;
        product_name: string;
        total_quantity: number;
        price_per_unit: number;
        total_revenue: number;
        total_cogs: number;
        total_gross_profit: number;
        category: string;
        sales_count: number;
        customers: string[];
    }>;
}

interface Summary {
    totalStocks: number;
    availableStocks: number;
    soldStocks: number;
    removedStocks: number;
    totalQuantity: number;
    availableQuantity: number;
    soldQuantity: number;
    completelySoldStocks: number;
    totalSales: number;
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    totalQuantitySold: number;
}

interface PageProps {
    availableStocks: Stock[];
    soldStocks: Stock[];
    salesData: SalesData;
    summary: Summary;
}

export default function MemberDashboard({ availableStocks, soldStocks, salesData, summary }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    // Add early return if data is not yet available
    if (!summary || !salesData) {
        return (
            <div className="min-h-screen bg-background">
                <MemberHeader />
                <div className="p-6 pt-25">
                    <Head title="Member Dashboard" />
                    <div className="text-center py-12">
                        <div className="text-foreground text-xl">Loading dashboard...</div>
                    </div>
                </div>
            </div>
        );
    }

        return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-6 pt-25">
                <Head title="Member Dashboard" />
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Welcome, {auth?.user?.name}!</h1>
                            <p className="text-muted-foreground mt-2">Track your stocks and view your activity history</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route('member.revenueReport')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Revenue Report
                            </Link>
                        </Button>
                    </div>
                </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                {/* Available Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Available Stock</CardTitle>
                        <Package className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{summary.availableStocks}</div>
                        <p className="text-xs text-muted-foreground">{summary.availableQuantity} units ready for sale</p>
                    </CardContent>
                </Card>
                {/* Sold Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Sold Stock</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{summary.soldQuantity}</div>
                        <p className="text-xs text-muted-foreground">Total units sold</p>
                    </CardContent>
                </Card>
                {/* Completely Sold Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Completely Sold</CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">{summary.completelySoldStocks}</div>
                        <p className="text-xs text-muted-foreground">Stocks fully sold out</p>
                    </CardContent>
                </Card>
                {/* Total Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Total Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{summary.totalStocks}</div>
                        <p className="text-xs text-muted-foreground">{summary.totalQuantity} total units</p>
                    </CardContent>
                </Card>
                {/* Revenue Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">₱{summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From {summary.totalSales} sales</p>
                    </CardContent>
                </Card>
                {/* COGS Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">COGS</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">₱{summary.totalCogs.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Cost of Goods Sold</p>
                    </CardContent>
                </Card>
                {/* Gross Profit Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Gross Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">₱{summary.totalGrossProfit.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Revenue - COGS</p>
                    </CardContent>
                </Card>
            </div>
            {/* Stock Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Stocks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Available Stocks</CardTitle>
                            <CardDescription className="text-muted-foreground">Ready for sale</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('member.availableStocks')}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {availableStocks.length > 0 ? (
                            <div className="space-y-3">
                                {availableStocks.slice(0, 3).map((stock: Stock) => (
                                    <div key={stock.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted">
                                        <div>
                                            <h4 className="font-medium text-foreground text-sm">{stock.product.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {stock.quantity} {stock.category} available
                                            </p>
                                            {stock.sold_quantity > 0 && (
                                                <p className="text-xs text-blue-400">
                                                    {stock.sold_quantity} {stock.category} sold
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="default" className="text-xs">Available</Badge>
                                    </div>
                                ))}
                                {availableStocks.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-muted-foreground">+{availableStocks.length - 3} more</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm">No available stocks</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sold Stocks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Sold Stocks</CardTitle>
                            <CardDescription className="text-muted-foreground">Sales performance</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('member.soldStocks')}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {salesData.salesBreakdown.length > 0 ? (
                            <div className="space-y-3">
                                {salesData.salesBreakdown.slice(0, 3).map((sale, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted">
                                        <div>
                                            <h4 className="font-medium text-foreground text-sm">{sale.product_name}</h4>
                                            <p className="text-xs text-blue-400">
                                                {sale.total_quantity} {sale.category} sold
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {sale.customers.length} customer{sale.customers.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="default" className="text-xs mb-1">Sold</Badge>
                                            <p className="text-xs text-green-400">₱{sale.total_revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {salesData.salesBreakdown.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-muted-foreground">+{salesData.salesBreakdown.length - 3} more sales</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm">No sales recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View All Stocks Button */}
            <div className="mt-8 text-center">
                <Button asChild size="lg">
                    <Link href={route('member.allStocks')}>View All Stocks</Link>
                </Button>
            </div>


        </div>
        </div>
    );
} 