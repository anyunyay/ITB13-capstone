import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useEffect, useState, useMemo } from 'react';
import { UrgentOrderPopup } from '@/components/common/modals/urgent-order-popup';
import { DashboardHeader } from '@/components/orders/dashboard-header';
import { OrderManagement } from '@/components/orders/order-management';
import { Order, OrdersPageProps } from '@/types/orders';
import animations from './orders-animations.module.css';
import { useTranslation } from '@/hooks/use-translation';
import { groupSuspiciousOrders } from '@/utils/order-grouping';

export default function OrdersIndex({ 
  orders, 
  allOrders, 
  currentStatus, 
  highlightOrderId, 
  urgentOrders = [], 
  showUrgentApproval = false,
  pagination 
}: OrdersPageProps) {
  const t = useTranslation();
  // Ensure urgentOrders is always an array
  const safeUrgentOrders = Array.isArray(urgentOrders) ? urgentOrders : [];

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [backendPage, setBackendPage] = useState(1);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Dynamic items per page based on view type and screen size
  const targetVisibleCount = currentView === 'cards' 
    ? (isMobile ? 4 : 8) 
    : (isMobile ? 5 : 10);

  // Handle highlighting effect when coming from notification
  useEffect(() => {
    if (highlightOrderId) {
      // Add a temporary highlight effect
      const timer = setTimeout(() => {
        // Remove highlight after 3 seconds
        const url = new URL(window.location.href);
        url.searchParams.delete('highlight_order');
        window.history.replaceState({}, '', url.toString());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightOrderId]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const approvedOrders = allOrders.filter(order => order.status === 'approved').length;
    const rejectedOrders = allOrders.filter(order => order.status === 'rejected').length;
    const delayedOrders = allOrders.filter(order => order.status === 'delayed').length;

    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
      delayedOrders
    };
  }, [allOrders]);

  // Detect suspicious order groups first
  const suspiciousOrderIds = useMemo(() => {
    const groups = groupSuspiciousOrders(allOrders, 10);
    const suspiciousGroups = groups.filter(g => g.isSuspicious && g.orders.length >= 2);
    const ids = new Set<number>();
    suspiciousGroups.forEach(group => {
      group.orders.forEach(order => ids.add(order.id));
    });
    return ids;
  }, [allOrders]);

  // Filter and sort orders (client-side)
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = allOrders;

    // Filter out suspicious orders from main index (they go to dedicated page)
    // This includes both individually marked suspicious AND orders in suspicious groups
    filtered = filtered.filter(order => 
      !order.is_suspicious && !suspiciousOrderIds.has(order.id)
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Apply delivery status filter
    if (selectedDeliveryStatus !== 'all') {
      filtered = filtered.filter(order => order.delivery_status === selectedDeliveryStatus);
    }

    // Sort orders
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'customer':
          comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '');
          break;
        case 'total_amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'delivery_status':
          comparison = (a.delivery_status || '').localeCompare(b.delivery_status || '');
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allOrders, searchTerm, selectedStatus, selectedDeliveryStatus, sortBy, sortOrder]);

  // Client-side pagination: slice to show exactly targetVisibleCount items
  const paginatedOrders = useMemo(() => {
    const startIndex = (backendPage - 1) * targetVisibleCount;
    const endIndex = startIndex + targetVisibleCount;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, backendPage, targetVisibleCount]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / targetVisibleCount);

  // Simple page change handler
  const handlePageChange = (page: number) => {
    setBackendPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setBackendPage(1);
  }, [searchTerm, selectedStatus, selectedDeliveryStatus, currentView, isMobile]);

  return (
    <PermissionGuard 
      permissions={['view orders', 'manage orders', 'generate order report']}
      pageTitle={t('admin.order_management_access_denied')}
    >
      <AppLayout>
        <Head title={t('admin.order_management')} />
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
            <DashboardHeader orderStats={orderStats} />
            <OrderManagement
              allOrders={allOrders}
              highlightOrderId={highlightOrderId}
              urgentOrders={safeUrgentOrders}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedDeliveryStatus={selectedDeliveryStatus}
              setSelectedDeliveryStatus={setSelectedDeliveryStatus}
              filteredOrders={filteredAndSortedOrders}
              paginatedOrders={paginatedOrders}
              currentPage={backendPage}
              setCurrentPage={handlePageChange}
              totalPages={totalPages}
              itemsPerPage={targetVisibleCount}
              currentView={currentView}
              setCurrentView={setCurrentView}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              isLoading={false}
              hasMore={false}
            />
          </div>
        </div>

        {/* Urgent order popup */}
        <UrgentOrderPopup urgentOrders={safeUrgentOrders} />
      </AppLayout>
    </PermissionGuard>
  );
}
