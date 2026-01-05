import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { Package, TrendingDown, TrendingUp, AlertTriangle, History, Trash2 } from 'lucide-react';

interface StockTrailSummaryCardsProps {
    totalChanges: number;
    totalAdded: number;
    totalSold: number;
    totalRemoved: number;
    totalRemovedValue: number;
    formatCurrency: (value: number) => string;
}

export const StockTrailSummaryCards = ({
    totalChanges,
    totalAdded,
    totalSold,
    totalRemoved,
    totalRemovedValue,
    formatCurrency
}: StockTrailSummaryCardsProps) => {
    const t = useTranslation();

    return (
        <>
            {/* Total Changes */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">
                        {t('member.total_changes') || 'Total Changes'}
                    </CardTitle>
                    <History className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-foreground">{totalChanges}</div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                        {t('member.all_stock_movements') || 'All stock movements'}
                    </p>
                </CardContent>
            </Card>

            {/* Total Added */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">
                        {t('member.stock_added') || 'Stock Added'}
                    </CardTitle>
                    <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-green-600">{totalAdded}</div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                        {t('member.new_stock_entries') || 'New stock entries'}
                    </p>
                </CardContent>
            </Card>

            {/* Total Sold */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">
                        {t('member.stock_sold') || 'Stock Sold'}
                    </CardTitle>
                    <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-purple-600">{totalSold}</div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                        {t('member.successful_sales') || 'Successful sales'}
                    </p>
                </CardContent>
            </Card>

            {/* Total Removed (Losses) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-foreground leading-tight">
                        {t('member.stock_removed') || 'Stock Removed'}
                    </CardTitle>
                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-red-600">{totalRemoved}</div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                        {t('member.perished_damaged') || 'Perished/Damaged'}
                    </p>
                </CardContent>
            </Card>

            {/* Losses in Sales (Value) */}
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-red-900 leading-tight">
                        {t('member.losses_in_sales') || 'Losses in Sales'}
                    </CardTitle>
                    <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-red-600">
                        {formatCurrency(totalRemovedValue)}
                    </div>
                    <p className="text-[10px] lg:text-xs text-red-700 mt-1">
                        {t('member.potential_revenue_lost') || 'Potential revenue lost'}
                    </p>
                </CardContent>
            </Card>
        </>
    );
};
