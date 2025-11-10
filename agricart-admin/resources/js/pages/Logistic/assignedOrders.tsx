import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { Pagination } from '@/components/common/pagination';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useEffect } from 'react';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
  };
  delivery_address?: string;
  total_amount: number;
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered';
  delivery_packed_time?: string;
  delivered_time?: string;
  delivery_timeline?: {
    packed_at?: string;
    delivered_at?: string;
  };
  created_at: string;
  audit_trail: Array<{
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
  }>;
}

interface PaginatedOrders {
  data: Order[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  current_page: number;
  last_page: number;
  per_page: number;
  from: number;
  to: number;
  total: number;
}

interface AssignedOrdersProps {
  orders: PaginatedOrders;
  currentStatus: string;
  statusCounts: {
    all: number;
    pending: number;
    ready_to_pickup: number;
    out_for_delivery: number;
    delivered: number;
  };
}

export default function AssignedOrders({ orders, currentStatus, statusCounts }: AssignedOrdersProps) {
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsLoading(false);
  }, [orders]);
  
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-accent text-accent-foreground">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-secondary text-secondary">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatQuantity = (quantity: number, category: string) => {
    switch (category.toLowerCase()) {
      case 'kilo':
        return `${quantity} ${t('logistic.kg')}`;
      case 'pc':
        return `${quantity} ${t('logistic.pc')}`;
      case 'tali':
        return `${quantity} ${t('logistic.tali')}`;
      default:
        return `${quantity} ${category}`;
    }
  };

  // Note: Backend now provides aggregated quantities, so no need for client-side aggregation

  const handleStatusFilter = (status: string) => {
    setIsLoading(true);
    router.get(route('logistic.orders.index'), { status, page: 1 }, {
      preserveState: true,
      replace: true,
      onFinish: () => setIsLoading(false),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LogisticsHeader />
      <Head title={t('logistic.assigned_orders')} />
      
      <div className="p-6 pt-25 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('logistic.assigned_orders')}</h1>
            <p className="text-muted-foreground">{t('logistic.manage_assigned_orders')}</p>
          </div>
          <Link href={route('logistic.dashboard')}>
            <Button variant="outline">
              {t('logistic.back_to_dashboard')}
            </Button>
          </Link>
        </div>

        <Tabs value={currentStatus} onValueChange={handleStatusFilter} className="space-y-4">
          <TabsList className="h-auto flex-wrap lg:flex-nowrap lg:h-10 inline-flex p-1">
            <TabsTrigger 
              value="all" 
              disabled={isLoading}
              className="flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 text-xs sm:text-sm lg:text-sm"
            >
              <span className="truncate">{t('logistic.all_orders')} ({statusCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              disabled={isLoading}
              className="flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 text-xs sm:text-sm lg:text-sm"
            >
              <span className="truncate">{t('logistic.pending')} ({statusCounts.pending})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ready_to_pickup" 
              disabled={isLoading}
              className="flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 text-xs sm:text-sm lg:text-sm"
            >
              <span className="truncate">{t('logistic.ready_to_pickup')} ({statusCounts.ready_to_pickup})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="out_for_delivery" 
              disabled={isLoading}
              className="flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 text-xs sm:text-sm lg:text-sm"
            >
              <span className="truncate">{t('logistic.out_for_delivery')} ({statusCounts.out_for_delivery})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="delivered" 
              disabled={isLoading}
              className="flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 text-xs sm:text-sm lg:text-sm"
            >
              <span className="truncate">{t('logistic.delivered')} ({statusCounts.delivered})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.data.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_assigned_yet')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {orders.data.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getDeliveryStatusBadge={getDeliveryStatusBadge}
                      formatQuantity={formatQuantity}
                      t={t}
                    />
                  ))}
                </div>
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {orders.data.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_pending_orders')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {orders.data.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getDeliveryStatusBadge={getDeliveryStatusBadge}
                      formatQuantity={formatQuantity}
                      t={t}
                    />
                  ))}
                </div>
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="ready_to_pickup" className="space-y-4">
            {orders.data.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_ready_pickup')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {orders.data.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getDeliveryStatusBadge={getDeliveryStatusBadge}
                      formatQuantity={formatQuantity}
                      t={t}
                    />
                  ))}
                </div>
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="out_for_delivery" className="space-y-4">
            {orders.data.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_out_delivery')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {orders.data.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getDeliveryStatusBadge={getDeliveryStatusBadge}
                      formatQuantity={formatQuantity}
                      t={t}
                    />
                  ))}
                </div>
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {orders.data.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_delivered_orders')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {orders.data.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getDeliveryStatusBadge={getDeliveryStatusBadge}
                      formatQuantity={formatQuantity}
                      t={t}
                    />
                  ))}
                </div>
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({ order, getDeliveryStatusBadge, formatQuantity, t }: { 
  order: Order; 
  getDeliveryStatusBadge: (status: string) => React.ReactElement;
  formatQuantity: (quantity: number, category: string) => string;
  t: (key: string, params?: any) => string;
}) {
  // Backend now provides aggregated quantities
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="font-semibold text-foreground">{t('logistic.order_number', { id: order.id })}</h3>
              {getDeliveryStatusBadge(order.delivery_status)}
            </div>
            {/* Button hidden on mobile, shown on desktop */}
            <Link href={route('logistic.orders.show', order.id)} className="hidden sm:block">
              <Button 
                variant="outline" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('logistic.view_details')}
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('logistic.customer')}:</span> {order.customer.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('logistic.email')}:</span> {order.customer.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('logistic.date')}:</span> {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('logistic.total')}:</span> ₱{order.total_amount.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t('logistic.products_in_order')}:</p>
              <div className="space-y-1">
                {order.audit_trail.slice(0, 3).map((item, index) => (
                  <div key={`${item.product.name}-${item.category}-${index}`} className="text-sm text-muted-foreground">
                    • {item.product.name} - {formatQuantity(item.quantity, item.category)}
                  </div>
                ))}
                {order.audit_trail.length > 3 && (
                  <div className="text-sm text-muted-foreground/70">
                    {t('logistic.more_items', { count: order.audit_trail.length - 3 })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Button shown on mobile at bottom, hidden on desktop */}
          <Link href={route('logistic.orders.show', order.id)} className="block sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('logistic.view_details')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 