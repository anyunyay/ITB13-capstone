import { Package, ShoppingCart, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StockStats } from '@/types/inventory';
import styles from '../../pages/Admin/Inventory/inventory.module.css';

interface StatsOverviewProps {
    stockStats: StockStats;
}

export const StatsOverview = ({ stockStats }: StatsOverviewProps) => {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Package className="h-5 w-5" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{stockStats.totalProducts}</div>
                    <div className={styles.statLabel}>Total Products</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <ShoppingCart className="h-5 w-5" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{stockStats.totalStocks}</div>
                    <div className={styles.statLabel}>Total Stocks</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{stockStats.availableStocks}</div>
                    <div className={styles.statLabel}>Available</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{stockStats.lowStockItems}</div>
                    <div className={styles.statLabel}>Low Stock</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statValue}>{stockStats.outOfStockItems}</div>
                    <div className={styles.statLabel}>Out of Stock</div>
                </div>
            </div>
        </div>
    );
};
