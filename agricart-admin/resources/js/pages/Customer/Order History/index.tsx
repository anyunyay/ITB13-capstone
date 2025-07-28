import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';

interface OrderItem {
  id: number;
  product: {
    name: string;
    price: number;
  };
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
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
  notifications?: Array<{
    id: string;
    order_id: number;
    status: string;
    message: string;
    created_at: string;
  }>;
}

export default function History({ orders, notifications = [] }: HistoryProps) {
  useEffect(() => {
    if (notifications.length > 0) {
      // Mark notifications as read after display
      router.post('/customer/notifications/mark-read', {
        ids: notifications.map(n => n.id),
      }, { preserveScroll: true });
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

  return (
    <AppHeaderLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded text-white ${n.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}`}>
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
                      <TableCell>₱{Number(item.product.price).toFixed(2)}</TableCell>
                      <TableCell>₱{(Number(item.quantity) * Number(item.product.price)).toFixed(2)}</TableCell>
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
