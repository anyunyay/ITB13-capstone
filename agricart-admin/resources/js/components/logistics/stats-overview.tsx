import { IdCard, UserPlus, UserMinus, Clock } from 'lucide-react';
import { LogisticStats } from '../../types/logistics';
import styles from '../../pages/Admin/Logistics/logistics.module.css';

interface StatsOverviewProps {
    logisticStats: LogisticStats;
}

export const StatsOverview = ({ logisticStats }: StatsOverviewProps) => {
    return (
        <div className={styles.statsDashboard}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <IdCard className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{logisticStats.totalLogistics}</div>
                    <div className={styles.statLabel}>Total Logistics</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{logisticStats.activeLogistics}</div>
                    <div className={styles.statLabel}>Active Logistics</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{logisticStats.deactivatedLogistics}</div>
                    <div className={styles.statLabel}>Deactivated</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Clock className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{logisticStats.pendingRequests}</div>
                    <div className={styles.statLabel}>Pending Requests</div>
                </div>
            </div>
        </div>
    );
};
