import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, ArrowLeft, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member/member-header';
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

interface PageProps {
    salesData: SalesData;
}

export default function MemberSoldStocks({ salesData }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const t = useTranslation();

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-6 pt-25">
                <Head title={t('member.sold_stocks_page')} />
                <div className="mb-6">
                    <Button asChild variant="outline" className="mb-4">
                        <Link href={route('member.dashboard')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('member.back_to_dashboard')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">{t('member.sold_stocks_page')}</h1>
                    <p className="text-muted-foreground mt-2">{t('member.view_successfully_sold')}</p>
                </div>

                {salesData.salesBreakdown.length > 0 ? (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    {t('member.sales_summary')}
                                </CardTitle>
                                <CardDescription>
                                    {t('member.sold_breakdown', { quantity: salesData.totalQuantitySold, products: salesData.salesBreakdown.length })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                    <div className="text-center p-4 bg-blue-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            {salesData.totalQuantitySold}
                                        </div>
                                        <div className="text-sm text-blue-100">{t('member.units_sold')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            {salesData.totalSales}
                                        </div>
                                        <div className="text-sm text-green-100">{t('member.total_sales')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            ₱{salesData.totalRevenue.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-yellow-100">{t('member.total_revenue_label')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            ₱{salesData.totalCogs.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-orange-100">{t('member.cogs_label')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            ₱{salesData.totalGrossProfit.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-purple-100">{t('member.gross_profit_label')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-cyan-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            ₱{salesData.totalQuantitySold > 0 ? Math.round(salesData.totalRevenue / salesData.totalQuantitySold) : 0}
                                        </div>
                                        <div className="text-sm text-cyan-100">{t('member.avg_price_per_unit')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-teal-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            {salesData.totalRevenue > 0 ? Math.round((salesData.totalGrossProfit / salesData.totalRevenue) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-teal-100">{t('member.profit_margin')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sales Breakdown Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-foreground">{t('member.sales_breakdown')}</CardTitle>
                                <CardDescription className="text-muted-foreground">{t('member.detailed_view_by_product')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableCaption className="text-muted-foreground">{t('member.list_of_sales')}</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center text-foreground/80">{t('member.product')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.total_quantity_sold')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.category')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.price_per_unit')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.total_revenue_label')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.cogs_label')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.gross_profit_label')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.customers')}</TableHead>
                                            <TableHead className="text-center text-foreground/80">{t('member.sales_count')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesData.salesBreakdown.map((sale, index) => (
                                            <TableRow key={index} className="hover:bg-muted">
                                                <TableCell className="text-center font-medium text-foreground">
                                                    {sale.product_name}
                                                </TableCell>
                                                <TableCell className="text-center text-foreground/80">
                                                    {sale.total_quantity}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{sale.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-foreground/80">
                                                    ₱{sale.price_per_unit}
                                                </TableCell>
                                                <TableCell className="text-center text-green-400 font-medium">
                                                    ₱{sale.total_revenue.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center text-orange-400 font-medium">
                                                    ₱{sale.total_cogs.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center text-purple-400 font-medium">
                                                    ₱{sale.total_gross_profit.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center text-foreground/80">
                                                    <div className="text-xs">
                                                        {sale.customers.map((customer, idx) => (
                                                            <div key={idx} className="text-blue-400">
                                                                {customer}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center text-foreground/80">
                                                    {sale.sales_count}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium text-foreground mb-2">{t('member.no_sales_recorded')}</h3>
                            <p className="text-muted-foreground mb-4">
                                {t('member.no_sales_recorded_message')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('member.sales_will_appear')}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 