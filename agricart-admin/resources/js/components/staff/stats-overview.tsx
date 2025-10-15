import { UsersRound, UserPlus, UserMinus, Shield, Clock } from 'lucide-react';
import { StaffStats } from '../../types/staff';
import styles from '../../pages/Admin/Staff/staff.module.css';

interface StatsOverviewProps {
    staffStats: StaffStats;
}

export const StatsOverview = ({ staffStats }: StatsOverviewProps) => {
    return (
        <div className={styles.statsDashboard}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UsersRound className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{staffStats.totalStaff}</div>
                    <div className={styles.statLabel}>Total Staff</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{staffStats.activeStaff}</div>
                    <div className={styles.statLabel}>Active Staff</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{staffStats.inactiveStaff}</div>
                    <div className={styles.statLabel}>Inactive Staff</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Shield className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{staffStats.totalPermissions}</div>
                    <div className={styles.statLabel}>Total Permissions</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Clock className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{staffStats.recentStaff}</div>
                    <div className={styles.statLabel}>Recent Additions</div>
                </div>
            </div>
        </div>
    );
};
