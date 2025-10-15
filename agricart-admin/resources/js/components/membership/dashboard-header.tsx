import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { MemberStats } from '../../types/membership';
import styles from '../../pages/Admin/Membership/membership.module.css';

interface DashboardHeaderProps {
    memberStats: MemberStats;
}

export const DashboardHeader = ({ memberStats }: DashboardHeaderProps) => {
    return (
        <div className={styles.dashboardHeader}>
            <div className={styles.headerMain}>
                <div className={styles.headerTitleSection}>
                    <div className={styles.titleContainer}>
                        <UsersRound className={styles.headerIcon} />
                        <div>
                            <h1 className={styles.headerTitle}>Membership Management</h1>
                            <p className={styles.headerSubtitle}>
                                Manage member accounts, track registrations, and handle member requests
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate permission="create members">
                        <Button asChild className={styles.primaryAction}>
                            <Link href={route('membership.add')}>
                                <UsersRound className="h-4 w-4 mr-2" />
                                Add Member
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="generate membership report">
                        <Button asChild variant="outline" className={styles.secondaryAction}>
                            <Link href={route('membership.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview memberStats={memberStats} />
        </div>
    );
};
