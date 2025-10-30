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
import { useTranslation } from '@/hooks/use-translation';

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
    const t = useTranslation();

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
                        <div className="text-foreground text-xl">{t('member.loading_dashboard')}</div>
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
                            <h1 className="text-3xl font-bold text-foreground">{t('member.welcome', { name: auth?.user?.name })}</h1>
                            <p className="text-muted-foreground mt-2">{t('member.track_stocks_and_activity')}</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route('member.revenueReport')}>
                                <FileText className="h-4 w-4 mr-2" />
                                {t('member.revenue_report')}
                            </Link>
                        </Button>
                    </div>
                </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                {/* Available Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.available_stock')}</CardTitle>
                        <Package className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{summary.availableStocks}</div>
                        <p className="text-xs text-muted-foreground">{t('member.units_ready_for_sale', { units: summary.availableQuantity })}</p>
                    </CardContent>
                </Card>
                {/* Sold Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.sold_stock')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{summary.soldQuantity}</div>
                        <p className="text-xs text-muted-foreground">{t('member.total_units_sold')}</p>
                    </CardContent>
                </Card>
                {/* Completely Sold Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.completely_sold')}</CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">{summary.completelySoldStocks}</div>
                        <p className="text-xs text-muted-foreground">{t('member.stocks_fully_sold_out')}</p>
                    </CardContent>
                </Card>
                {/* Total Stock Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.total_stock')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{summary.totalStocks}</div>
                        <p className="text-xs text-muted-foreground">{t('member.total_units', { units: summary.totalQuantity })}</p>
                    </CardContent>
                </Card>
                {/* Revenue Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.total_revenue')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">₱{summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{t('member.from_sales', { sales: summary.totalSales })}</p>
                    </CardContent>
                </Card>
                {/* COGS Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.cogs')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">₱{summary.totalCogs.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{t('member.cost_of_goods_sold')}</p>
                    </CardContent>
                </Card>
                {/* Gross Profit Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">{t('member.gross_profit')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">₱{summary.totalGrossProfit.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{t('member.revenue_minus_cogs')}</p>
                    </CardContent>
                </Card>
            </div>
            {/* Stock Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Stocks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">{t('member.available_stocks')}</CardTitle>
                            <CardDescription className="text-muted-foreground">{t('member.ready_for_sale')}</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('member.availableStocks')}>{t('member.view_all')}</Link>
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
                                                {stock.quantity} {stock.category} {t('member.available_label')}
                                            </p>
                                            {stock.sold_quantity > 0 && (
                                                <p className="text-xs text-blue-400">
                                                    {stock.sold_quantity} {stock.category} {t('member.sold')}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="default" className="text-xs">{t('member.available')}</Badge>
                                    </div>
                                ))}
                                {availableStocks.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-muted-foreground">{t('member.more_items', { count: availableStocks.length - 3 })}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm">{t('member.no_available_stocks')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sold Stocks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">{t('member.sold_stocks')}</CardTitle>
                            <CardDescription className="text-muted-foreground">{t('member.sales_performance')}</CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('member.soldStocks')}>{t('member.view_all')}</Link>
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
                                                {sale.total_quantity} {sale.category} {t('member.sold')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {sale.customers.length} {sale.customers.length !== 1 ? t('member.customers_plural') : t('member.customers')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="default" className="text-xs mb-1">{t('member.sold')}</Badge>
                                            <p className="text-xs text-green-400">₱{sale.total_revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {salesData.salesBreakdown.length > 3 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-muted-foreground">{t('member.more_sales', { count: salesData.salesBreakdown.length - 3 })}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm">{t('member.no_sales_recorded')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View All Stocks Button */}
            <div className="mt-8 text-center">
                <Button asChild size="lg">
                    <Link href={route('member.allStocks')}>{t('member.all_stocks')}</Link>
                </Button>
            </div>


        </div>
        </div>
    );
} 