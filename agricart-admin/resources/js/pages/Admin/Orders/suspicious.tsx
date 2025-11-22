import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PermissionGuard } from '@/components/common/permission-guard';
import { Order } from '@/types/orders';
import { User } from '@/types';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { groupSuspiciousOrders, getSuspiciousOrderStats } from '@/utils/order-grouping';
import { GroupedOrderCard } from '@/components/orders/grouped-order-card';
import { Package, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PaginationControls } from '@/components/orders/pagination-controls';
import { Button } from '@/components/ui/button';

interface SuspiciousOrdersPageProps {
    orders: Order[];
    logistics: User[];
}

export default function SuspiciousOrdersPage({ orders, logistics }: SuspiciousOrdersPageProps) {
    const t = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Group orders for suspicious pattern detection
    const orderGroups = useMemo(() => {
        return groupSuspiciousOrders(orders, 10); // 10 minute window
    }, [orders]);

    // Filter to only show suspicious groups
    const suspiciousGroups = useMemo(() => {
        return orderGroups.filter(g => g.isSuspicious);
    }, [orderGroups]);

    // Get suspicious order statistics
    const suspiciousStats = useMemo(() => {
        return getSuspiciousOrderStats(orderGroups);
    }, [orderGroups]);

    // Pagination
    const totalPages = Math.ceil(suspiciousGroups.length / itemsPerPage);
    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return suspiciousGroups.slice(startIndex, startIndex + itemsPerPage);
    }, [suspiciousGroups, currentPage, itemsPerPage]);

    return (
        <AppLayout>
            <Head title={t('admin.suspicious_orders')} />

            <PermissionGuard permission="view orders">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                        {/* Header */}
                        <div className="mb-6 pb-4 border-b border-border">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-semibold text-foreground m-0 mb-1">
                                            {t('admin.suspicious_orders')}
                                        </h1>
                                        <p className="text-sm text-muted-foreground m-0">
                                            {t('admin.suspicious_orders_description')}
                                        </p>
                                    </div>
                                </div>
                                <Link href={route('admin.orders.index')}>
                                    <Button variant="outline" className="whitespace-nowrap">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {t('admin.back_to_orders')}
                                    </Button>
                                </Link>
                            </div>

                        {/* Statistics Banner */}
                        {suspiciousStats.suspiciousGroups > 0 && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">⚠️</span>
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 m-0">
                                        Suspicious Order Patterns Detected
                                    </h3>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-400 m-0">
                                    Found {suspiciousStats.suspiciousGroups} suspicious order group(s) with {suspiciousStats.totalSuspiciousOrders} orders 
                                    (Total: ₱{suspiciousStats.totalSuspiciousAmount.toFixed(2)})
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {suspiciousGroups.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {t('admin.no_suspicious_orders')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t('admin.no_suspicious_orders_description')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                                {paginatedGroups.map((group) => (
                                    <GroupedOrderCard
                                        key={`group-${group.orders.map(o => o.id).join('-')}`}
                                        orders={group.orders}
                                        highlight={false}
                                    />
                                ))}
                            </div>

                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                totalItems={suspiciousGroups.length}
                            />
                        </>
                    )}
                </div>
            </div>
            </PermissionGuard>
        </AppLayout>
    );
}
