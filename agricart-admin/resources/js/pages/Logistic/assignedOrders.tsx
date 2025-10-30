import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogisticHeader } from '@/components/logistic-header';
import { format } from 'date-fns';
import { CheckCircle, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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

interface AssignedOrdersProps {
  orders: Order[];
  currentStatus: string;
}

export default function AssignedOrders({ orders, currentStatus }: AssignedOrdersProps) {
  const t = useTranslation();
  
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-blue-600 text-white">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-green-600 text-green-600">{t('logistic.delivered')}</Badge>;
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
    router.get(route('logistic.orders.index'), { status }, {
      preserveState: true,
      replace: true,
    });
  };

  const pendingOrders = orders.filter(order => order.delivery_status === 'pending');
  const readyToPickupOrders = orders.filter(order => order.delivery_status === 'ready_to_pickup');
  const outForDeliveryOrders = orders.filter(order => order.delivery_status === 'out_for_delivery');
  const deliveredOrders = orders.filter(order => order.delivery_status === 'delivered');

  return (
    <div className="min-h-screen bg-background">
      <LogisticHeader />
      <Head title={t('logistic.assigned_orders')} />
      
      <div className="p-6 pt-25 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('logistic.assigned_orders')}</h1>
            <p className="text-muted-foreground">{t('logistic.manage_assigned_orders')}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            {t('logistic.back_to_dashboard')}
          </Button>
        </div>

        <Tabs value={currentStatus} onValueChange={handleStatusFilter} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">{t('logistic.all_orders')} ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">{t('logistic.pending')} ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="ready_to_pickup">{t('logistic.ready_to_pickup')} ({readyToPickupOrders.length})</TabsTrigger>
            <TabsTrigger value="out_for_delivery">{t('logistic.out_for_delivery')} ({outForDeliveryOrders.length})</TabsTrigger>
            <TabsTrigger value="delivered">{t('logistic.delivered')} ({deliveredOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_assigned_yet')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getDeliveryStatusBadge={getDeliveryStatusBadge}
                    formatQuantity={formatQuantity}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_pending_orders')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getDeliveryStatusBadge={getDeliveryStatusBadge}
                    formatQuantity={formatQuantity}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ready_to_pickup" className="space-y-4">
            {readyToPickupOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_ready_pickup')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {readyToPickupOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getDeliveryStatusBadge={getDeliveryStatusBadge}
                    formatQuantity={formatQuantity}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="out_for_delivery" className="space-y-4">
            {outForDeliveryOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_orders_out_delivery')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {outForDeliveryOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getDeliveryStatusBadge={getDeliveryStatusBadge}
                    formatQuantity={formatQuantity}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {deliveredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">{t('logistic.no_delivered_orders')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deliveredOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getDeliveryStatusBadge={getDeliveryStatusBadge}
                    formatQuantity={formatQuantity}
                    t={t}
                  />
                ))}
              </div>
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
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">{t('logistic.order_number', { id: order.id })}</h3>
              {getDeliveryStatusBadge(order.delivery_status)}
            </div>
            <Link href={route('logistic.orders.show', order.id)}>
              <Button 
                variant="outline" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('logistic.view_details')}
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </CardContent>
    </Card>
  );
} 