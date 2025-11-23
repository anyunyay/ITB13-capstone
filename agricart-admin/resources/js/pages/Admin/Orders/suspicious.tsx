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

    // Get orders marked as suspicious in database
    const markedSuspiciousOrders = useMemo(() => {
        return orders.filter(order => order.is_suspicious);
    }, [orders]);

    // Group orders for suspicious pattern detection
    const orderGroups = useMemo(() => {
        return groupSuspiciousOrders(orders, 10); // 10 minute window
    }, [orders]);

    // Filter to only show suspicious groups with 2+ orders (pattern-detected)
    const patternSuspiciousGroups = useMemo(() => {
        return orderGroups.filter(g => g.isSuspicious && g.orders.length >= 2);
    }, [orderGroups]);

    // Combine both: pattern-detected groups AND individually marked suspicious orders
    const allSuspiciousGroups = useMemo(() => {
        const groups = [...patternSuspiciousGroups];
        
        // Add individually marked suspicious orders as single-order groups
        markedSuspiciousOrders.forEach(order => {
            // Check if this order is already in a pattern group
            const alreadyInGroup = groups.some(g => 
                g.orders.some(o => o.id === order.id)
            );
            
            // Only add if not already in a group
            if (!alreadyInGroup) {
                groups.push({
                    type: 'suspicious',
                    orders: [order],
                    isSuspicious: true,
                    minutesDiff: 0,
                });
            }
        });
        
        // Sort by most recent first
        return groups.sort((a, b) => {
            const aTime = new Date(a.orders[0].created_at).getTime();
            const bTime = new Date(b.orders[0].created_at).getTime();
            return bTime - aTime;
        });
    }, [patternSuspiciousGroups, markedSuspiciousOrders]);

    // Get suspicious order statistics
    const suspiciousStats = useMemo(() => {
        return getSuspiciousOrderStats(allSuspiciousGroups);
    }, [allSuspiciousGroups]);

    // Pagination
    const totalPages = Math.ceil(allSuspiciousGroups.length / itemsPerPage);
    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allSuspiciousGroups.slice(startIndex, startIndex + itemsPerPage);
    }, [allSuspiciousGroups, currentPage, itemsPerPage]);

    return (
        <AppLayout>
            <Head title={t('admin.suspicious_orders')} />

            <PermissionGuard permission="view orders">
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            {/* Header */}
                            <div className="mb-4 pb-3 border-b border-border">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">
                                                {t('admin.suspicious_orders')}
                                            </h2>
                                            <p className="text-sm text-muted-foreground m-0">
                                                {t('admin.suspicious_orders_description')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 items-center self-end md:self-auto">
                                        <Link href={route('admin.orders.index')}>
                                            <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                {t('admin.back_to_orders')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Banner */}
                            {suspiciousStats.suspiciousGroups > 0 && (
                                <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl sm:text-2xl flex-shrink-0">⚠️</span>
                                        <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-300 m-0 break-words">
                                            Suspicious Order Patterns Detected
                                        </h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 m-0 break-words">
                                        Found {suspiciousStats.suspiciousGroups} suspicious order group(s) with {suspiciousStats.totalSuspiciousOrders} orders 
                                        (Total: ₱{suspiciousStats.totalSuspiciousAmount.toFixed(2)})
                                    </p>
                                </div>
                            )}

                            {/* Content */}
                            <div className="space-y-4">
                                {allSuspiciousGroups.length === 0 ? (
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
                                            totalItems={allSuspiciousGroups.length}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
