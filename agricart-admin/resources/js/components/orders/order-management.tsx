import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, Search } from 'lucide-react';
import { PaginationControls } from './pagination-controls';
import { OrderCard } from './order-card';
import { BaseTable } from '@/components/common/base-table';
import { createOrderTableColumns, OrderMobileCard } from './order-table-columns';
import { SearchFilter } from './search-filter';
import { ViewToggle } from './view-toggle';
import { Order } from '@/types/orders';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface OrderManagementProps {
    orders: Order[];
    allOrders: Order[];
    currentStatus: string;
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
    onStatusChange: (status: string) => void;
    currentView: 'cards' | 'table';
    setCurrentView: (view: 'cards' | 'table') => void;
    sortBy: string;
    setSortBy: (field: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const OrderManagement = ({
    orders,
    allOrders,
    currentStatus,
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
    onStatusChange,
    currentView,
    setCurrentView,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}: OrderManagementProps) => {
    
    // Use allOrders for consistent tab counts
    const pendingOrders = allOrders.filter(order => order.status === 'pending');
    const approvedOrders = allOrders.filter(order => order.status === 'approved');
    const rejectedOrders = allOrders.filter(order => order.status === 'rejected');
    const delayedOrders = allOrders.filter(order => order.status === 'delayed');

    const t = useTranslation();
    
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

    const renderOrders = (ordersToRender: Order[]) => {
        if (ordersToRender.length === 0) {
            return (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_orders_found')}</h3>
                    <p className="text-muted-foreground">
                        {currentStatus === 'all' 
                            ? t('admin.no_orders_match_filters')
                            : t('admin.no_orders_found')
                        }
                    </p>
                </div>
            );
        }

        return (
            <>
                {currentView === 'cards' ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                        {ordersToRender.map((order) => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                highlight={highlightOrderId === order.id.toString()}
                                isUrgent={urgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                            />
                        ))}
                    </div>
                ) : (
                    <BaseTable
                        data={ordersToRender}
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
                />
            </>
        );
    };

    return (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="mb-4 pb-3 border-b border-border">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg flex items-center justify-center flex-shrink-0" />
                        <div>
                            <h2 className="text-xl font-semibold text-foreground m-0 mb-1 leading-tight">{t('admin.order_management')}</h2>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">{t('admin.order_management_description')}</p>
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

                <Tabs value={currentStatus} onValueChange={onStatusChange} className="w-full">
                    <TabsList className="grid w-full gap-2 h-auto p-2 grid-cols-1 md:grid-cols-5 md:gap-0 md:p-1">
                        <TabsTrigger value="all" className="text-sm w-full md:col-span-1">{t('admin.all_orders_label')} ({allOrders.length})</TabsTrigger>
                        <div className="grid grid-cols-2 gap-2 md:contents">
                            <TabsTrigger value="pending" className="text-sm w-full">{t('admin.pending_orders_label')} ({pendingOrders.length})</TabsTrigger>
                            <TabsTrigger value="approved" className="text-sm w-full">{t('admin.approved_orders_label')} ({approvedOrders.length})</TabsTrigger>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:contents">
                            <TabsTrigger value="rejected" className="text-sm w-full">{t('admin.rejected_orders_label')} ({rejectedOrders.length})</TabsTrigger>
                            <TabsTrigger value="delayed" className="text-sm w-full">{t('admin.delayed_orders_label')} ({delayedOrders.length})</TabsTrigger>
                        </div>
                    </TabsList>

                    <TabsContent value="all" className="mt-2">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="pending" className="mt-2">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="approved" className="mt-2">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-2">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="delayed" className="mt-2">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
