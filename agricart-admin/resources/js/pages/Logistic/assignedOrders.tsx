import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogisticHeader } from '@/components/logistic-header';
import { format } from 'date-fns';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  created_at: string;
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

interface AssignedOrdersProps {
  orders: Order[];
  currentStatus: string;
}

export default function AssignedOrders({ orders, currentStatus }: AssignedOrdersProps) {
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

  const handleStatusFilter = (status: string) => {
    router.get(route('logistic.orders.index'), { status }, {
      preserveState: true,
      replace: true,
    });
  };

  const pendingOrders = orders.filter(order => order.delivery_status === 'pending');
  const outForDeliveryOrders = orders.filter(order => order.delivery_status === 'out_for_delivery');
  const deliveredOrders = orders.filter(order => order.delivery_status === 'delivered');

  return (
    <div className="min-h-screen bg-gray-900">
      <LogisticHeader />
      <Head title="Assigned Orders" />
      
              <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Assigned Orders</h1>
              <p className="text-gray-400">Manage your assigned orders and update delivery status</p>
            </div>
            <Link href={route('logistic.dashboard')}>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                Back to Dashboard
              </Button>
            </Link>
          </div>

        <Tabs value={currentStatus} onValueChange={handleStatusFilter} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="out_for_delivery">Out for Delivery ({outForDeliveryOrders.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
                         {orders.length === 0 ? (
               <Card className="bg-gray-800 border-gray-700">
                 <CardContent className="text-center py-8">
                   <p className="text-gray-400">No orders assigned to you yet.</p>
                 </CardContent>
               </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} getDeliveryStatusBadge={getDeliveryStatusBadge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
                         {pendingOrders.length === 0 ? (
               <Card className="bg-gray-800 border-gray-700">
                 <CardContent className="text-center py-8">
                   <p className="text-gray-400">No pending orders.</p>
                 </CardContent>
               </Card>
            ) : (
              <div className="grid gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} getDeliveryStatusBadge={getDeliveryStatusBadge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="out_for_delivery" className="space-y-4">
                         {outForDeliveryOrders.length === 0 ? (
               <Card className="bg-gray-800 border-gray-700">
                 <CardContent className="text-center py-8">
                   <p className="text-gray-400">No orders out for delivery.</p>
                 </CardContent>
               </Card>
            ) : (
              <div className="grid gap-4">
                {outForDeliveryOrders.map((order) => (
                  <OrderCard key={order.id} order={order} getDeliveryStatusBadge={getDeliveryStatusBadge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
                         {deliveredOrders.length === 0 ? (
               <Card className="bg-gray-800 border-gray-700">
                 <CardContent className="text-center py-8">
                   <p className="text-gray-400">No delivered orders.</p>
                 </CardContent>
               </Card>
            ) : (
              <div className="grid gap-4">
                {deliveredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} getDeliveryStatusBadge={getDeliveryStatusBadge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({ order, getDeliveryStatusBadge }: { order: Order; getDeliveryStatusBadge: (status: string) => JSX.Element }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">Order #{order.id}</h3>
              {getDeliveryStatusBadge(order.delivery_status)}
            </div>
                         <p className="text-sm text-gray-400">
               Customer: {order.customer.name} ({order.customer.email})
             </p>
             <p className="text-sm text-gray-400">
               Date: {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
             </p>
             <p className="text-sm text-gray-400">
               Total: ₱{order.total_amount.toFixed(2)}
             </p>
             <div className="text-sm text-gray-400">
               Items: {order.audit_trail.length} product(s)
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('logistic.orders.show', order.id)}>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 