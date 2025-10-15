import { UsersRound, UserPlus, UserMinus, Clock } from 'lucide-react';
import { MemberStats } from '../../types/membership';
import styles from '../../pages/Admin/Membership/membership.module.css';

interface StatsOverviewProps {
    memberStats: MemberStats;
}

export const StatsOverview = ({ memberStats }: StatsOverviewProps) => {
    return (
        <div className={styles.statsDashboard}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UsersRound className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{memberStats.totalMembers}</div>
                    <div className={styles.statLabel}>Total Members</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{memberStats.activeMembers}</div>
                    <div className={styles.statLabel}>Active Members</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{memberStats.deactivatedMembers}</div>
                    <div className={styles.statLabel}>Deactivated</div>
                </div>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Clock className="h-6 w-6" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{memberStats.pendingRequests}</div>
                    <div className={styles.statLabel}>Pending Requests</div>
                </div>
            </div>
        </div>
    );
};
