import { Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { OrderStats } from '@/types/orders';
import styles from '../../pages/Admin/Orders/orders.module.css';

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
        <div className={styles.statsDashboard}>
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <IconComponent className="h-6 w-6" />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {stat.value.toLocaleString()}
                            </div>
                            <div className={styles.statLabel}>
                                {stat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
