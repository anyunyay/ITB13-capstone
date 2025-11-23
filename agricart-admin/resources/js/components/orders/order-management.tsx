import { Button } from '@/components/ui/button';
import { Package, Search, Eye } from 'lucide-react';
import { PaginationControls } from './pagination-controls';
import { OrderCard } from './order-card';
import { BaseTable } from '@/components/common/base-table';
import { createOrderTableColumns, OrderMobileCard } from './order-table-columns';
import { SearchFilter } from './search-filter';
import { ViewToggle } from './view-toggle';
import { Order } from '@/types/orders';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { groupSuspiciousOrders, getSuspiciousOrderStats } from '@/utils/order-grouping';
import { useSuspiciousOrderNotification } from '@/hooks/use-suspicious-order-notification';

interface OrderManagementProps {
    allOrders: Order[];
    highlightOrderId?: string;
    urgentOrders?: Order[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    selectedDeliveryStatus: string;
    setSelectedDeliveryStatus: (status: string) => void;
    filteredOrders: Order[];
    paginatedOrders: Order[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    itemsPerPage: number;
    currentView: 'cards' | 'table';
    setCurrentView: (view: 'cards' | 'table') => void;
    sortBy: string;
    setSortBy: (field: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export const OrderManagement = ({
    allOrders,
    highlightOrderId,
    urgentOrders = [],
    searchTerm,
    setSearchTerm,
    showSearch,
    setShowSearch,
    selectedStatus,
    setSelectedStatus,
    selectedDeliveryStatus,
    setSelectedDeliveryStatus,
    filteredOrders,
    paginatedOrders,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    currentView,
    setCurrentView,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isLoading = false,
    hasMore = false,
    onLoadMore
}: OrderManagementProps) => {
    const t = useTranslation();
    
    // Group ALL orders for suspicious pattern detection (frontend only)
    // Use allOrders to detect all suspicious patterns across the entire dataset
    const orderGroups = useMemo(() => {
        return groupSuspiciousOrders(allOrders, 10); // 10 minute window
    }, [allOrders]);

    // Get suspicious order statistics for the alert banner
    const suspiciousStats = useMemo(() => {
        return getSuspiciousOrderStats(orderGroups);
    }, [orderGroups]);

    // Send notifications for suspicious patterns (frontend-triggered)
    useSuspiciousOrderNotification(orderGroups);
    
    // Create column definitions
    const columns = useMemo(() => createOrderTableColumns(t), [t]);
    
    // Handle sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const renderOrders = () => {
        if (paginatedOrders.length === 0) {
            return (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_orders_found')}</h3>
                    <p className="text-muted-foreground">
                        {t('admin.no_orders_match_filters')}
                    </p>
                </div>
            );
        }

        return (
            <>
                {currentView === 'cards' ? (
                    <>
                        {/* Show suspicious order alert if any found - with link to dedicated page */}
                        {suspiciousStats.suspiciousGroups > 0 && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
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
                                    <Button
                                        onClick={() => window.location.href = route('admin.orders.suspicious')}
                                        variant="default"
                                        className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Suspicious Orders
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                            {paginatedOrders.map((order) => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    highlight={highlightOrderId === order.id.toString()}
                                    isUrgent={urgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <BaseTable
                        data={paginatedOrders}
                        columns={columns}
                        keyExtractor={(order) => order.id}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        renderMobileCard={(order) => <OrderMobileCard order={order} t={t} />}
                    />
                )}
                
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredOrders.length}
                    isLoading={isLoading}
                    hasMore={hasMore}
                    onLoadMore={onLoadMore}
                />
            </>
        );
    };

    return (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="mb-4 pb-3 border-b border-border">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.order_management')}</h2>
                            <p className="text-sm text-muted-foreground m-0">{t('admin.order_management_description')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center self-end md:self-auto">
                        <Button
                            variant={showSearch ? "default" : "outline"}
                            onClick={() => {
                                if (showSearch) {
                                    setSearchTerm('');
                                }
                                setShowSearch(!showSearch);
                            }}
                            size="sm"
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{showSearch ? t('ui.hide_search') : t('ui.search')}</span>
                            <span className="inline sm:hidden">{showSearch ? t('ui.hide') : t('ui.search')}</span>
                        </Button>
                        <ViewToggle 
                            currentView={currentView} 
                            onViewChange={setCurrentView} 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <SearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedDeliveryStatus={selectedDeliveryStatus}
                    setSelectedDeliveryStatus={setSelectedDeliveryStatus}
                    totalResults={allOrders.length}
                    filteredResults={filteredOrders.length}
                    isVisible={showSearch}
                />

                {renderOrders()}
            </div>
        </div>
    );
};
