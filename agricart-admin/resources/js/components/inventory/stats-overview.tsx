import { Package, ShoppingCart, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StockStats } from '@/types/inventory';

interface StatsOverviewProps {
    stockStats: StockStats;
}

export const StatsOverview = ({ stockStats }: StatsOverviewProps) => {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{stockStats.totalProducts}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Products</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{stockStats.totalStocks}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Stocks</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{stockStats.availableStocks}</div>
                    <div className="text-sm text-muted-foreground mt-1">Available</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{stockStats.lowStockItems}</div>
                    <div className="text-sm text-muted-foreground mt-1">Low Stock</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{stockStats.outOfStockItems}</div>
                    <div className="text-sm text-muted-foreground mt-1">Out of Stock</div>
                </div>
            </div>
        </div>
    );
};
