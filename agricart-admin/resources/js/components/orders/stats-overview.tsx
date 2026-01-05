import { Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { OrderStats } from '@/types/orders';

interface StatsOverviewProps {
    orderStats: OrderStats;
}

export const StatsOverview = ({ orderStats }: StatsOverviewProps) => {
    const stats = [
        {
            label: 'Total Orders',
            value: orderStats.totalOrders,
            icon: Package
        },
        {
            label: 'Pending',
            value: orderStats.pendingOrders,
            icon: Clock
        },
        {
            label: 'Approved',
            value: orderStats.approvedOrders,
            icon: CheckCircle
        },
        {
            label: 'Rejected',
            value: orderStats.rejectedOrders,
            icon: XCircle
        },
        {
            label: 'Delayed',
            value: orderStats.delayedOrders,
            icon: AlertTriangle
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const isLastCard = index === stats.length - 1;
                return (
                    <div 
                        key={index} 
                        className={`bg-card border border-border rounded-lg p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary ${
                            isLastCard ? 'col-span-2 md:col-span-1' : ''
                        }`}
                    >
                        <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-lg sm:text-xl font-bold text-foreground leading-none">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
