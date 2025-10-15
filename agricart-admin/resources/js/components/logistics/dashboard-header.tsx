import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { IdCard, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { LogisticStats } from '../../types/logistics';
import styles from '../../pages/Admin/Logistics/logistics.module.css';

interface DashboardHeaderProps {
    logisticStats: LogisticStats;
}

export const DashboardHeader = ({ logisticStats }: DashboardHeaderProps) => {
    return (
        <div className={styles.dashboardHeader}>
            <div className={styles.headerMain}>
                <div className={styles.headerTitleSection}>
                    <div className={styles.titleContainer}>
                        <IdCard className={styles.headerIcon} />
                        <div>
                            <h1 className={styles.headerTitle}>Logistics Management</h1>
                            <p className={styles.headerSubtitle}>
                                Manage logistics partners, track registrations, and handle logistics operations
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate permission="create logistics">
                        <Button asChild className={styles.primaryAction}>
                            <Link href={route('logistics.add')}>
                                <IdCard className="h-4 w-4 mr-2" />
                                Add Logistic
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="generate logistics report">
                        <Button asChild variant="outline" className={styles.secondaryAction}>
                            <Link href={route('logistics.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview logisticStats={logisticStats} />
        </div>
    );
};
