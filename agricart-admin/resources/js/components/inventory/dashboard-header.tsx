import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { StockStats } from '@/types/inventory';
import styles from '../../pages/Admin/Inventory/inventory.module.css';

interface DashboardHeaderProps {
    stockStats: StockStats;
}

export const DashboardHeader = ({ stockStats }: DashboardHeaderProps) => {
    return (
        <div className={styles.dashboardHeader}>
            <div className={styles.headerMain}>
                <div className={styles.headerTitleSection}>
                    <div className={styles.titleContainer}>
                        <Package className={styles.headerIcon} />
                        <div>
                            <h1 className={styles.headerTitle}>Inventory Management</h1>
                            <p className={styles.headerSubtitle}>
                                Current inventory status and metrics
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate permission="generate inventory report">
                        <Button asChild variant="outline" className={styles.actionButton}>
                            <Link href={route('inventory.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview stockStats={stockStats} />
        </div>
    );
};
