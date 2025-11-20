import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarIcon, Package, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import axios from 'axios';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  category: string;
  quantity: number;
  unit_price?: number;
  subtotal?: number;
  coop_share?: number;
  total_amount?: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled' | 'delivered';
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered' | null;
  created_at: string;
  delivered_at?: string;
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: OrderItem[];
  source?: 'sales_audit' | 'sales';
  customer_received?: boolean;
  customer_rate?: number;
  customer_feedback?: string;
  customer_confirmed_at?: string;
}

interface HistoryProps {
  orders: Order[];
  currentStatus: string;
  currentDeliveryStatus: string;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    delivered: number;
  };
}

export default function History({ 
  orders: initialOrders, 
  currentStatus, 
  currentDeliveryStatus, 
  pagination: initialPagination, 
  counts 
}: HistoryProps) {
  const t = useTranslation();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [offset, setOffset] = useState(initialPagination.offset + initialPagination.limit);
  const [hasMore, setHasMore] = useState(initialPagination.has_more);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: currentStatus,
    delivery_status: currentDeliveryStatus
  });

  // Reset orders when initial data changes (filter change)
  useEffect(() => {
    setOrders(initialOrders);
    setOffset(initialPagination.offset + initialPagination.limit);
    setHasMore(initialPagination.has_more);
  }, [initialOrders, initialPagination]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/customer/orders/history', {
        params: {
          offset: offset,
          limit: 4,
          status: filters.status,
          delivery_status: filters.delivery_status
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      const newOrders = response.data.props.orders;
      const newPagination = response.data.props.pagination;
      
      // Append new orders
      setOrders(prev => [...prev, ...newOrders]);
      
      // Update offset
      setOffset(newPagination.offset + newPagination.limit);
      
      // Check if there are more orders
      setHasMore(newPagination.has_more);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryStatusFilter = (deliveryStatus: string) => {
    setFilters(prev => ({ ...prev, delivery_status: deliveryStatus }));
    
    router.get('/customer/orders/history', {
      delivery_status: deliveryStatus !== 'all' ? deliveryStatus : undefined,
      offset: 0,
      limit: 4
    }, {
      preserveScroll: false,
      preserveState: false,
      only: ['orders', 'counts', 'pagination', 'currentDeliveryStatus'],
    });
  };

  // Navigate to specific order from notification
  const navigateToOrder = async (orderId: number) => {
    // Check if order is already loaded
    const existingOrder = orders.find(o => o.id === orderId);
    
    if (existingOrder) {
      // Scroll to order
      scrollToOrder(orderId);
    } else {
      // Fetch order separately
      try {
        const response = await axios.get(`/customer/orders/${orderId}`);
        const order = response.data.order;
        
        // Add to top of list
        setOrders(prev => [order, ...prev]);
        
        // Scroll to order
        setTimeout(() => scrollToOrder(orderId), 100);
      } catch (error) {
        console.error('Failed to load order:', error);
      }
    }
  };

  const scrollToOrder = (orderId: number) => {
    const orderElement = document.getElementById(`order-${orderId}`);
    if (orderElement) {
      const elementPosition = orderElement.offsetTop;
      const offsetPosition = elementPosition - 100;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Highlight the order
      orderElement.style.transition = 'box-shadow 0.3s ease';
      orderElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      setTimeout(() => {
        orderElement.style.boxShadow = '';
      }, 2000);
    }
  };

  // Handle notification navigation on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#order-')) {
      const orderId = parseInt(hash.replace('#order-', ''));
      setTimeout(() => navigateToOrder(orderId), 500);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('customer.pending_approval')}</Badge>;
      case 'approved':
        return <Badge className="status-approved">{t('customer.approved')}</Badge>;
      case 'rejected':
        return <Badge className="status-rejected">{t('customer.rejected')}</Badge>;
      case 'delayed':
        return <Badge className="status-delayed">{t('customer.delayed')}</Badge>;
      case 'cancelled':
        return <Badge className="status-cancelled">{t('customer.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="status-pending">{t('customer.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="status-ready">{t('customer.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="status-out-for-delivery">{t('customer.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge className="status-delivered">{t('customer.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppHeaderLayout>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 mt-20 mb-8 sm:mb-12 md:mb-16 lg:mb-16">
        <header className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary p-2 truncate">
            {t('customer.order_history')}
          </h2>
        </header>

        <Tabs value={currentDeliveryStatus} onValueChange={handleDeliveryStatusFilter} className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-full">
              <TabsTrigger value="all">
                {t('customer.all')} ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t('customer.pending')} ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="out_for_delivery">
                {t('customer.out_for_delivery')} ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                {t('customer.delivered')} ({counts.delivered})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={currentDeliveryStatus} className="mt-0">
            {orders.length === 0 ? (
              <Card className="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-muted rounded-2xl">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <Package className="h-12 sm:h-16 md:h-20 w-12 sm:w-16 md:w-20 text-muted-foreground" />
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground">
                    {t('customer.no_orders_found')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                    {t('customer.try_adjusting_filters_check_later')}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {orders.map((order: Order) => (
                    <Card key={order.id} id={`order-${order.id}`} className="p-4 sm:p-5 md:p-6 lg:p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base md:text-lg font-semibold">
                              {t('customer.order_id_label')}
                            </span>
                            <span className="text-base md:text-lg font-bold text-primary">
                              #{order.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <time className="text-sm md:text-base text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                            </time>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {order.delivery_status && (
                        <div className="mb-4">
                          {getDeliveryStatusBadge(order.delivery_status)}
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm font-semibold">{t('customer.items')}:</p>
                        {order.audit_trail.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product.name} ({item.category}) x{item.quantity}</span>
                            <span>₱{item.total_amount?.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold">
                            <span>{t('customer.total')}:</span>
                            <span>₱{order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Show More Button */}
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      size="lg"
                      className="w-full sm:w-auto px-8"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('customer.loading')}...
                        </>
                      ) : (
                        t('customer.show_more')
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && orders.length > 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                    {t('customer.no_more_orders')}
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </AppHeaderLayout>
  );
}
