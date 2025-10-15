import { Package, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { OrderStats } from '@/types/orders';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface DashboardHeaderProps {
    orderStats: OrderStats;
}

export const DashboardHeader = ({ orderStats }: DashboardHeaderProps) => {
    return (
        <div className={styles.dashboardHeader}>
            <div className={styles.headerMain}>
                <div className={styles.headerTitleSection}>
                    <div className={styles.titleContainer}>
                        <div className={styles.headerIcon}>
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className={styles.headerTitle}>Order Management</h1>
                            <p className={styles.headerSubtitle}>
                                Monitor and manage customer orders, track delivery status, and process order requests efficiently
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate permission="generate order report">
                        <Button asChild variant="outline" className={styles.secondaryAction}>
                            <Link href={route('admin.orders.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview orderStats={orderStats} />
        </div>
    );
};
