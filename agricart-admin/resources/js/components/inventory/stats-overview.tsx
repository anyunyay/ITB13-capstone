import { Package, ShoppingCart, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StockStats } from '@/types/inventory';
import { useTranslation } from '@/hooks/use-translation';

interface StatsOverviewProps {
    stockStats: StockStats;
}

export const StatsOverview = ({ stockStats }: StatsOverviewProps) => {
    const t = useTranslation();
    return (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card border border-border rounded-lg p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-lg sm:text-xl font-bold text-foreground leading-none">{stockStats.totalProducts}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{t('admin.total_products')}</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-lg sm:text-xl font-bold text-foreground leading-none">{stockStats.totalStocks}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{t('admin.total_stocks')}</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-lg sm:text-xl font-bold text-foreground leading-none">{stockStats.availableStocks}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{t('admin.available')}</div>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-card border border-border rounded-lg p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-lg sm:text-xl font-bold text-foreground leading-none">{stockStats.lowStockItems}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{t('admin.low_stock')}</div>
                </div>
            </div>
            {/* Out of Stock stat removed - zero-quantity stocks are now managed in Stock Trail */}
        </div>
    );
};
