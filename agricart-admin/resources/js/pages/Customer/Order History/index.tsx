import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

interface OrderItem {
  id: number;
  product: {
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | null;
  created_at: string;
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  auditTrail: OrderItem[];
}

interface HistoryProps {
  orders: Order[];
}

export default function History({ orders }: HistoryProps) {
  const page = usePage<{ customerNotifications?: Array<any> }>();
  const notifications = page.props.customerNotifications || [];

  useEffect(() => {
    if (notifications.length > 0) {
      // Mark notifications as read after a delay to ensure they're visible
      const timer = setTimeout(() => {
        router.post('/customer/notifications/mark-read', {
          ids: notifications.map(n => n.id),
        }, { preserveScroll: true });
      }, 2000); // Wait 2 seconds before marking as read

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'out_for_delivery':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AppHeaderLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded text-white ${
                n.delivery_status ? 
                  (n.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-blue-600') :
                  (n.status === 'approved' ? 'bg-green-600' : 'bg-red-600')
              }`}>
                <span className="font-semibold">Order #{n.order_id}:</span> {n.message}
                <span className="ml-2 text-xs opacity-80">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            ))}
          </div>
        )}
        {orders.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">No orders found.</Card>
        ) : (
          orders.map((order: Order) => (
            <Card key={order.id} className="mb-6 p-4">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <span className="font-medium">Order ID:</span> #{order.id}<br />
                  <span className="font-medium">Date:</span> {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}
                  <div className="text-lg font-semibold text-primary">
                    Total: ₱{Number(order.total_amount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Delivery Status Tracker */}
              {order.status === 'approved' && order.delivery_status && (
                <div className="mb-4">
                  <h5 className="font-semibold text-sm mb-3 text-gray-700">Delivery Status</h5>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center ${(order.delivery_status || 'pending') === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        {(order.delivery_status || 'pending') === 'pending' ? '1' : '✓'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Preparing</span>
                    </div>
                    <div className={`flex items-center ${(order.delivery_status || 'pending') === 'out_for_delivery' ? 'text-blue-600' : (order.delivery_status || 'pending') === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'out_for_delivery' || (order.delivery_status || 'pending') === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        {(order.delivery_status || 'pending') === 'out_for_delivery' ? '2' : (order.delivery_status || 'pending') === 'delivered' ? '✓' : '2'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Out for Delivery</span>
                    </div>
                    <div className={`flex items-center ${(order.delivery_status || 'pending') === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                        {(order.delivery_status || 'pending') === 'delivered' ? '✓' : '3'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Delivered</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    {getDeliveryStatusBadge(order.delivery_status || 'pending')}
                  </div>
                </div>
              )}
              
              {order.admin_notes && (
                <div className="mb-4 p-3 bg-amber-100 border-l-4 border-amber-400 rounded">
                  <h5 className="font-semibold text-sm mb-1 text-amber-800">Admin Notes:</h5>
                  <p className="text-sm text-amber-900">{order.admin_notes}</p>
                </div>
              )}

              {order.logistic && (
                <div className="mb-4 p-3 bg-teal-50 border-l-4 border-teal-400 rounded">
                  <h5 className="font-semibold text-sm mb-1 text-teal-800">Delivery Information:</h5>
                  <p className="text-sm text-teal-900">
                    <span className="font-medium">Assigned to:</span> {order.logistic.name}
                    {order.logistic.contact_number && (
                      <span className="ml-2">({order.logistic.contact_number})</span>
                    )}
                  </p>
                </div>
              )}

              <Table className="mt-2 border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.auditTrail?.map((item: OrderItem) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.category}</TableCell>
                      <TableCell>
                        {item.category === 'Kilo' && item.product.price_kilo && `₱${Number(item.product.price_kilo).toFixed(2)}`}
                        {item.category === 'Pc' && item.product.price_pc && `₱${Number(item.product.price_pc).toFixed(2)}`}
                        {item.category === 'Tali' && item.product.price_tali && `₱${Number(item.product.price_tali).toFixed(2)}`}
                        {(!item.product.price_kilo && !item.product.price_pc && !item.product.price_tali) && 'No price set'}
                      </TableCell>
                      <TableCell>
                        {item.category === 'Kilo' && item.product.price_kilo && `₱${(Number(item.quantity) * Number(item.product.price_kilo)).toFixed(2)}`}
                        {item.category === 'Pc' && item.product.price_pc && `₱${(Number(item.quantity) * Number(item.product.price_pc)).toFixed(2)}`}
                        {item.category === 'Tali' && item.product.price_tali && `₱${(Number(item.quantity) * Number(item.product.price_tali)).toFixed(2)}`}
                        {(!item.product.price_kilo && !item.product.price_pc && !item.product.price_tali) && 'N/A'}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          ))
        )}
      </div>
    </AppHeaderLayout>
  );
}
