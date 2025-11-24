import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Users, PackageCheck, PackageOpen, PackageX } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface TransactionSummaryProps {
    summary: {
        total_transactions: number;
        total_quantity: number;
        total_revenue: number;
        total_member_share: number;
        total_cogs: number;
        total_gross_profit: number;
    };
    formatCurrency: (amount: number) => string;
}

interface StockSummaryProps {
    totalAvailable: number;
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    totalLoss: number;
    totalStock: number;
    availableStock: number;
    soldOutStock: number;
    totalSold: number;
    formatCurrency: (amount: number) => string;
}

export function TransactionSummaryCards({ summary, formatCurrency }: TransactionSummaryProps) {
    const t = useTranslation();

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_transactions')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{summary?.total_transactions || 0}</div>
                    <p className="text-xs text-muted-foreground">{t('member.all_time')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_quantity')}</CardTitle>
                    <Package className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{summary?.total_quantity || 0}</div>
                    <p className="text-xs text-muted-foreground">{t('member.items_sold_label')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_revenue')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_revenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.gross_sales')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.member_revenue')}</CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_member_share || 0)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.your_product_revenue')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.cogs')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-400">{formatCurrency(summary?.total_cogs || 0)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.cost_of_goods_sold_label')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.gross_profit')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(summary?.total_gross_profit || 0)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.revenue_minus_cogs')}</p>
                </CardContent>
            </Card>
        </>
    );
}

export function StockSummaryCards({ 
    totalAvailable, 
    totalRevenue, 
    totalCogs, 
    totalGrossProfit,
    totalLoss, 
    totalStock, 
    availableStock, 
    soldOutStock, 
    totalSold, 
    formatCurrency 
}: StockSummaryProps) {
    const t = useTranslation();

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_revenue')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.gross_sales')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.cogs')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-400">{formatCurrency(totalCogs)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.cost_of_goods_sold_label')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.gross_profit')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(totalGrossProfit)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.revenue_minus_cogs')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.loss') || 'Loss'}</CardTitle>
                    <PackageX className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-400">{formatCurrency(totalLoss)}</div>
                    <p className="text-xs text-muted-foreground">{t('member.losses_in_sales') || 'From damaged/defective'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_stock_label')}</CardTitle>
                    <Package className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{totalStock}</div>
                    <p className="text-xs text-muted-foreground">{t('member.total_items_added')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.available_stock')}</CardTitle>
                    <PackageCheck className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-400">{availableStock}</div>
                    <p className="text-xs text-muted-foreground">{t('member.products_in_stock')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.sold_out')}</CardTitle>
                    <PackageOpen className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-400">{soldOutStock}</div>
                    <p className="text-xs text-muted-foreground">{t('member.products_sold_out')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">{t('member.sold_quantity')}</CardTitle>
                    <PackageOpen className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-400">{totalSold}</div>
                    <p className="text-xs text-muted-foreground">{t('member.items_sold')}</p>
                </CardContent>
            </Card>
        </>
    );
}
