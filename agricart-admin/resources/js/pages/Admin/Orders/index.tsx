import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
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
}

interface OrdersPageProps {
  orders: Order[];
  currentStatus: string;
  logistics: Array<{
    id: number;
    name: string;
    contact_number?: string;
  }>;
}

export default function OrdersIndex({ orders, currentStatus }: OrdersPageProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const approvedOrders = orders.filter(order => order.status === 'approved');
  const rejectedOrders = orders.filter(order => order.status === 'rejected');

  return (
    <AppSidebarLayout>
      <Head title="Order Management" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
        </div>

        <Tabs defaultValue={currentStatus} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => router.get(route('admin.orders.index'), { status: 'all' })}>
              All Orders ({orders.length})
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
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No orders found.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {pendingOrders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No pending orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid gap-4">
              {approvedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {approvedOrders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No approved orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-4">
              {rejectedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {rejectedOrders.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No rejected orders.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppSidebarLayout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            <Link href={route('admin.orders.show', order.id)}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
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
                  <span className="text-gray-500 ml-2">({order.logistic.contact_number})</span>
                )}
              </p>
            )}
            {order.status === 'approved' && (
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Delivery Status:</span> {getDeliveryStatusBadge(order.delivery_status)}
                </p>
                {!order.logistic && (
                  <p className="text-sm text-orange-600">
                    <span className="font-medium">⚠️ Needs logistic assignment</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {order.admin_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h5 className="font-semibold text-sm mb-1">Admin Notes:</h5>
            <p className="text-sm text-gray-700">{order.admin_notes}</p>
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
                <p className="text-sm text-gray-500">No items found</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 