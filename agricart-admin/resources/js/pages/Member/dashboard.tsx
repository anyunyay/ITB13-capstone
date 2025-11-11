import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, History, TrendingUp, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member/member-header';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';

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
    totalKilo?: number;
    totalPiece?: number;
    totalTali?: number;
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
                    <Head title={t('member.dashboard')} />
                    <div className="text-center py-12">
                        <div className="text-foreground text-xl">{t('member.loading_dashboard')}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Use category totals from backend summary
    const totalKilo = summary.totalKilo || 0;
    const totalPiece = summary.totalPiece || 0;
    const totalTali = summary.totalTali || 0;

    return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-4 lg:p-6 pt-20 lg:pt-30">
                <Head title={t('member.dashboard')} />
                <div className="mb-2 lg:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t('member.welcome', { name: auth?.user?.name })}</h1>
                            <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">{t('member.track_stocks_and_activity')}</p>
                        </div>
                        {/* Member-specific revenue report: member sees only their own revenue */}
                        <Button asChild variant="outline" size="sm" className="w-full lg:w-auto">
                            <Link href={route('member.revenueReport')}>
                                <FileText className="h-4 w-4 mr-2" />
                                {/* Make this label explicit for members */}
                                Your Revenue Report
                            </Link>
                        </Button>
                    </div>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4 mb-2 lg:mb-4">
                    {/* Total Kilo Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.total_kilo')}</CardTitle>
                            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-blue-400">{totalKilo}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.total_in_kilos')}</p>
                        </CardContent>
                    </Card>
                    {/* Total Piece Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.total_piece')}</CardTitle>
                            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-purple-400">{totalPiece}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.total_pieces')}</p>
                        </CardContent>
                    </Card>
                    {/* Total Tali Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.total_tali')}</CardTitle>
                            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-green-400 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-green-400">{totalTali}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.total_in_tali')}</p>
                        </CardContent>
                    </Card>
                    {/* Available Stock Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.available_stock')}</CardTitle>
                            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-green-400 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-green-400">{summary.availableQuantity}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.items_ready_for_sale')}</p>
                        </CardContent>
                    </Card>
                    {/* Sold Stock Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.sold_stock')}</CardTitle>
                            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-blue-400">{summary.soldQuantity}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.items_sold')}</p>
                        </CardContent>
                    </Card>
                    {/* Total Stocks Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">{t('member.total_stock')}</CardTitle>
                            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl lg:text-3xl font-bold text-foreground">{summary.totalStocks}</div>
                            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{t('member.total_stock_entries')}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Stock Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Available Stocks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('member.available_stocks')}</CardTitle>
                            <CardDescription className="text-muted-foreground">{t('member.ready_for_sale')}</CardDescription>
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
                                                <p className="text-xs text-muted-foreground">
                                                    {t('member.added')}: {format(new Date(stock.created_at), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                            <Badge className="bg-green-600 text-white shadow-md text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {t('member.available')}
                                            </Badge>
                                        </div>
                                    ))}
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
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('member.sold_stocks')}</CardTitle>
                            <CardDescription className="text-muted-foreground">{t('member.sales_performance')}</CardDescription>
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
                                                <Badge className="bg-red-600 text-white shadow-md text-xs mb-1">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    Sold
                                                </Badge>
                                                <p className="text-xs text-green-400">₱{sale.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                                            </div>
                                        </div>
                                    ))}
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
                <div className="mt-4 lg:mt-6 text-center">
                    <Button asChild size="lg" className="w-full lg:w-1/3">
                        <Link href={route('member.allStocks')}>{t('member.all_stocks')}</Link>
                    </Button>
                </div>


            </div>
        </div>
    );
} 