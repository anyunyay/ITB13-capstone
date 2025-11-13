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

export default function OrdersIndex({ orders, allOrders, currentStatus, highlightOrderId, urgentOrders = [], showUrgentApproval = false }: OrdersPageProps) {
  const t = useTranslation();
  // Ensure urgentOrders is always an array
  const safeUrgentOrders = Array.isArray(urgentOrders) ? urgentOrders : [];

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [isMobile, setIsMobile] = useState(false);

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
  const itemsPerPage = currentView === 'cards' 
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

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    let filtered = allOrders;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by delivery status
    if (selectedDeliveryStatus !== 'all') {
      filtered = filtered.filter(order => order.delivery_status === selectedDeliveryStatus);
    }

    return filtered;
  }, [allOrders, searchTerm, selectedStatus, selectedDeliveryStatus]);

  // Paginate filtered orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle status change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when changing status
    router.get(route('admin.orders.index'), { status }, { preserveState: true });
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedDeliveryStatus, showSearch]);

  // Reset pagination when view changes (cards vs table) or screen size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentView, isMobile]);

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
              orders={orders}
              allOrders={allOrders}
              currentStatus={selectedStatus}
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
              filteredOrders={filteredOrders}
              paginatedOrders={paginatedOrders}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onStatusChange={handleStatusChange}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </div>
        </div>

        {/* Urgent order popup */}
        <UrgentOrderPopup urgentOrders={safeUrgentOrders} />
      </AppLayout>
    </PermissionGuard>
  );
}
