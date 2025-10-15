import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package } from 'lucide-react';
import { PaginationControls } from './pagination-controls';
import { OrderCard } from './order-card';
import { OrderTable } from './order-table';
import { SearchFilter } from './search-filter';
import { ViewToggle } from './view-toggle';
import { Order } from '@/types/orders';
import { useState } from 'react';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface OrderManagementProps {
    orders: Order[];
    allOrders: Order[];
    currentStatus: string;
    highlightOrderId?: string;
    urgentOrders?: Order[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
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
}

export const OrderManagement = ({
    orders,
    allOrders,
    currentStatus,
    highlightOrderId,
    urgentOrders = [],
    searchTerm,
    setSearchTerm,
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
    onStatusChange
}: OrderManagementProps) => {
    // View state
    const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
    
    // Use allOrders for consistent tab counts
    const pendingOrders = allOrders.filter(order => order.status === 'pending');
    const approvedOrders = allOrders.filter(order => order.status === 'approved');
    const rejectedOrders = allOrders.filter(order => order.status === 'rejected');
    const delayedOrders = allOrders.filter(order => order.status === 'delayed');

    const renderOrders = (ordersToRender: Order[]) => {
        if (ordersToRender.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <Package className={styles.emptyStateIcon} />
                    <h3 className={styles.emptyStateTitle}>No orders found</h3>
                    <p className={styles.emptyStateDescription}>
                        {currentStatus === 'all' 
                            ? 'No orders match your current filters.'
                            : `No ${currentStatus} orders found.`
                        }
                    </p>
                </div>
            );
        }

        return (
            <>
                {currentView === 'cards' ? (
                    <div className={styles.orderGrid}>
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
                    <OrderTable
                        orders={ordersToRender}
                        highlightOrderId={highlightOrderId}
                        urgentOrders={urgentOrders}
                        showActions={true}
                        compact={false}
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
        <div className={styles.orderManagementSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Order Management</h2>
                        <p className={styles.sectionSubtitle}>
                            Monitor and manage customer orders, track delivery status, and process order requests
                        </p>
                    </div>
                </div>
                <div className={styles.sectionActions}>
                    <ViewToggle 
                        currentView={currentView} 
                        onViewChange={setCurrentView} 
                    />
                </div>
            </div>

            <div className={styles.sectionContent}>
                <SearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedDeliveryStatus={selectedDeliveryStatus}
                    setSelectedDeliveryStatus={setSelectedDeliveryStatus}
                    totalResults={allOrders.length}
                    filteredResults={filteredOrders.length}
                />

                <Tabs value={currentStatus} onValueChange={onStatusChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">
                            All Orders ({allOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            Pending ({pendingOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            Approved ({approvedOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            Rejected ({rejectedOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="delayed">
                            Delayed ({delayedOrders.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="pending" className="mt-6">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="approved" className="mt-6">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-6">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>

                    <TabsContent value="delayed" className="mt-6">
                        {renderOrders(paginatedOrders)}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
