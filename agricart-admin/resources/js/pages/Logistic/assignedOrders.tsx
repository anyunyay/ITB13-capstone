import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { Pagination } from '@/components/common/pagination';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { Eye, Truck, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
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
        {/* Header */}
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-foreground truncate">{t('logistic.assigned_orders')}</h1>
            </div>
            <Link href={route('logistic.dashboard')}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg shrink-0">
                <Truck className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('logistic.assigned_orders')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('logistic.manage_assigned_orders')}</p>
              </div>
            </div>
            <Link href={route('logistic.dashboard')}>
              <Button variant="outline" className="flex items-center gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                {t('logistic.back_to_dashboard')}
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={currentStatus} onValueChange={handleStatusFilter} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto lg:h-10 p-1 gap-1">
            <TabsTrigger 
              value="all" 
              disabled={isLoading}
              className="text-xs sm:text-sm col-span-2 sm:col-span-1"
            >
              <span className="truncate">{t('logistic.all_orders')} ({statusCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              <span className="truncate">{t('logistic.pending')} ({statusCounts.pending})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ready_to_pickup" 
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              <span className="truncate">{t('logistic.ready_to_pickup')} ({statusCounts.ready_to_pickup})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="out_for_delivery" 
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              <span className="truncate">{t('logistic.out_for_delivery')} ({statusCounts.out_for_delivery})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="delivered" 
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              <span className="truncate">{t('logistic.delivered')} ({statusCounts.delivered})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('logistic.orders')} ({orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('logistic.no_orders_assigned_yet')}</h3>
                      <p className="text-muted-foreground max-w-md">
                        {t('logistic.no_orders_description')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mobile: Card View */}
                    <div className="block md:hidden space-y-3">
                      {orders.data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} t={t} formatQuantity={formatQuantity} />
                      ))}
                    </div>
                    
                    {/* Desktop: Table View */}
                    <div className="hidden md:block">
                      <OrderTable 
                        orders={orders.data} 
                        t={t} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder}
                        formatQuantity={formatQuantity}
                      />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('logistic.pending')} ({orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('logistic.no_pending_orders')}</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="block md:hidden space-y-3">
                      {orders.data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} t={t} formatQuantity={formatQuantity} />
                      ))}
                    </div>
                    <div className="hidden md:block">
                      <OrderTable 
                        orders={orders.data} 
                        t={t} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder}
                        formatQuantity={formatQuantity}
                      />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready_to_pickup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('logistic.ready_to_pickup')} ({orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('logistic.no_orders_ready_pickup')}</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="block md:hidden space-y-3">
                      {orders.data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} t={t} formatQuantity={formatQuantity} />
                      ))}
                    </div>
                    <div className="hidden md:block">
                      <OrderTable 
                        orders={orders.data} 
                        t={t} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder}
                        formatQuantity={formatQuantity}
                      />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="out_for_delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('logistic.out_for_delivery')} ({orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('logistic.no_orders_out_delivery')}</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="block md:hidden space-y-3">
                      {orders.data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} t={t} formatQuantity={formatQuantity} />
                      ))}
                    </div>
                    <div className="hidden md:block">
                      <OrderTable 
                        orders={orders.data} 
                        t={t} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder}
                        formatQuantity={formatQuantity}
                      />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('logistic.delivered')} ({orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('logistic.no_delivered_orders')}</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="block md:hidden space-y-3">
                      {orders.data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} t={t} formatQuantity={formatQuantity} />
                      ))}
                    </div>
                    <div className="hidden md:block">
                      <OrderTable 
                        orders={orders.data} 
                        t={t} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder}
                        formatQuantity={formatQuantity}
                      />
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
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

function MobileOrderCard({ order, t, formatQuantity }: { 
  order: Order; 
  t: (key: string, params?: any) => string;
  formatQuantity: (quantity: number, category: string) => string;
}) {
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

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dayjs(order.created_at).format('MMM DD, YYYY')}
            </p>
          </div>
          {getDeliveryStatusBadge(order.delivery_status)}
        </div>

        {/* Customer Info */}
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium text-foreground">{order.customer.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-semibold text-foreground">₱{Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="text-sm font-medium text-foreground">{order.audit_trail?.length || 0} items</p>
          </div>
          {order.delivered_time && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-sm font-medium text-foreground">
                {dayjs(order.delivered_time).format('MMM DD, YYYY')}
              </p>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link href={route('logistic.orders.show', order.id)} className="block">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-1" />
            {t('logistic.view_details')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function OrderTable({ orders, t, sortBy, setSortBy, sortOrder, setSortOrder, formatQuantity }: { 
  orders: Order[]; 
  t: (key: string, params?: any) => string;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  formatQuantity: (quantity: number, category: string) => string;
}) {

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'total_amount':
        comparison = a.total_amount - b.total_amount;
        break;
      case 'delivery_status':
        comparison = a.delivery_status.localeCompare(b.delivery_status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'delivered_time':
        const dateA = a.delivered_time ? new Date(a.delivered_time).getTime() : 0;
        const dateB = b.delivered_time ? new Date(b.delivered_time).getTime() : 0;
        comparison = dateA - dateB;
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('id')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Order ID
                {getSortIcon('id')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('customer')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Customer
                {getSortIcon('customer')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('total_amount')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Amount
                {getSortIcon('total_amount')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Items</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('delivery_status')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Status
                {getSortIcon('delivery_status')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Assigned
                {getSortIcon('created_at')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-sm text-foreground font-medium text-center w-full max-w-[80px]">#{order.id}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-[200px]">
                    <div className="text-sm text-foreground font-medium text-left">{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground text-left">{order.customer.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-sm text-foreground text-right font-semibold w-full max-w-[120px]">
                    ₱{Number(order.total_amount).toFixed(2)}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-sm text-foreground text-right w-full max-w-[100px]">
                    {order.audit_trail?.length || 0} items
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-[140px] flex justify-center">
                    {getDeliveryStatusBadge(order.delivery_status)}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-sm text-muted-foreground text-center w-full max-w-[120px]">
                    {dayjs(order.created_at).format('MMM DD, YYYY')}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-[120px] flex justify-center">
                    <Link href={route('logistic.orders.show', order.id)}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 