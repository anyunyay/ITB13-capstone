import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGate } from '@/components/permission-gate';
import { PermissionGuard } from '@/components/permission-guard';
import { useEffect } from 'react';
import { UrgentOrderPopup } from '@/components/urgent-order-popup';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'delayed' | 'cancelled';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  created_at: string;
  admin?: {
    name: string;
  };
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>;
  is_urgent?: boolean;
}

interface OrdersPageProps {
  orders: Order[];
  allOrders: Order[];
  currentStatus: string;
  logistics: Array<{
    id: number;
    name: string;
    contact_number?: string;
  }>;
  highlightOrderId?: string;
  urgentOrders?: Order[];
  showUrgentApproval?: boolean;
}

export default function OrdersIndex({ orders, allOrders, currentStatus, highlightOrderId, urgentOrders = [], showUrgentApproval = false }: OrdersPageProps) {
  // Ensure urgentOrders is always an array
  const safeUrgentOrders = Array.isArray(urgentOrders) ? urgentOrders : [];

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


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  // Use allOrders for consistent tab counts
  const pendingOrders = allOrders.filter(order => order.status === 'pending');
  const approvedOrders = allOrders.filter(order => order.status === 'approved');
  const rejectedOrders = allOrders.filter(order => order.status === 'rejected');
  const delayedOrders = allOrders.filter(order => order.status === 'delayed');

  return (
    <PermissionGuard 
      permissions={['view orders', 'create orders', 'edit orders', 'generate order report']}
      pageTitle="Order Management Access Denied"
    >
      <AppSidebarLayout>
        <Head title="Order Management" />
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <PermissionGate permission="generate order report">
            <Link href={route('admin.orders.report')}>
              <Button variant="outline">
                Generate Report
              </Button>
            </Link>
          </PermissionGate>
        </div>

        <Tabs defaultValue={currentStatus} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => router.get(route('admin.orders.index'), { status: 'all' })}>
              All Orders ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => router.get(route('admin.orders.index'), { status: 'pending' })}>
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => router.get(route('admin.orders.index'), { status: 'approved' })}>
              Approved ({approvedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => router.get(route('admin.orders.index'), { status: 'rejected' })}>
              Rejected ({rejectedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delayed" onClick={() => router.get(route('admin.orders.index'), { status: 'delayed' })}>
              Delayed ({delayedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  highlight={highlightOrderId === order.id.toString()}
                  isUrgent={safeUrgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No orders found.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  highlight={highlightOrderId === order.id.toString()}
                  isUrgent={safeUrgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No pending orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  highlight={highlightOrderId === order.id.toString()}
                  isUrgent={safeUrgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No approved orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  highlight={highlightOrderId === order.id.toString()}
                  isUrgent={safeUrgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent}
                />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No rejected orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="delayed" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  highlight={highlightOrderId === order.id.toString()}
                  isUrgent={false} // Delayed orders are not urgent
                />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No delayed orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Urgent order popup */}
      <UrgentOrderPopup urgentOrders={safeUrgentOrders} />
    </AppSidebarLayout>
    </PermissionGuard>
  );
}

function OrderCard({ order, highlight = false, isUrgent = false }: { order: Order; highlight?: boolean; isUrgent?: boolean }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className={`transition-all duration-1000 ${
      highlight ? 'border-2 border-blue-500 shadow-lg' : 
      isUrgent ? 'border-2 border-orange-500 shadow-lg' : ''
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                {order.is_urgent ? 'Urgent (Manual)' : 'Urgent'}
              </Badge>
            )}
            <div className="flex gap-2">
              <PermissionGate permission="view orders">
                <Link href={route('admin.orders.show', order.id)}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </PermissionGate>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {order.customer.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {order.customer.email}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Order Summary</h4>
            <p className="text-sm">
              <span className="font-medium">Total Amount:</span> ₱{Number(order.total_amount).toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Items:</span> {order.audit_trail?.length || 0}
            </p>
            {order.admin && (
              <p className="text-sm">
                <span className="font-medium">Processed by:</span> {order.admin.name}
              </p>
            )}
            {order.logistic && (
              <p className="text-sm">
                <span className="font-medium">Assigned to:</span> {order.logistic.name}
                {order.logistic.contact_number && (
                  <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                )}
              </p>
            )}
            {order.status === 'approved' && (
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Delivery Status:</span> {getDeliveryStatusBadge(order.delivery_status)}
                </p>
                {!order.logistic && (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    <span className="font-medium">⚠️ Needs logistic assignment</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {order.admin_notes && (
          <div className="mt-4 p-3 bg-muted rounded">
            <h5 className="font-semibold text-sm mb-1">Admin Notes:</h5>
            <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Order Items</h4>
          <div className="space-y-2">
            {(() => {
              // Group items by product ID and combine quantities
              const groupedItems = order.audit_trail?.reduce((acc, item) => {
                const key = `${item.product.id}-${item.category}`;
                if (!acc[key]) {
                  acc[key] = {
                    id: item.id,
                    product: item.product,
                    category: item.category,
                    quantity: 0
                  };
                }
                acc[key].quantity += Number(item.quantity);
                return acc;
              }, {} as Record<string, any>) || {};

              const combinedItems = Object.values(groupedItems);

              return combinedItems.length > 0 ? (
                combinedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} ({item.category})</span>
                    <span>{item.quantity} {item.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No items found</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 