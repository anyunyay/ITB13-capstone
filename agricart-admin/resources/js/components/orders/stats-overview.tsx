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
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Pending',
            value: orderStats.pendingOrders,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            label: 'Approved',
            value: orderStats.approvedOrders,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Rejected',
            value: orderStats.rejectedOrders,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            label: 'Delayed',
            value: orderStats.delayedOrders,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                            <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="text-2xl font-bold text-foreground leading-none">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
