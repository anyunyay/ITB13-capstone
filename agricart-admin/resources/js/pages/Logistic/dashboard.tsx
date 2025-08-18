import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface LogisticDashboardProps {
  assignedOrders: Order[];
  stats: {
    pending: number;
    out_for_delivery: number;
    delivered: number;
    total: number;
  };
}

export default function LogisticDashboard({ assignedOrders, stats }: LogisticDashboardProps) {
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
    <div className="min-h-screen bg-gray-900">
      <LogisticHeader />
      <Head title="Logistic Dashboard" />
      
              <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Logistic Dashboard</h1>
            <p className="text-gray-400">Manage your assigned orders and delivery status</p>
          </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pending Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Out for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.out_for_delivery}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Orders */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Assigned Orders</CardTitle>
              <div className="flex space-x-2">
                <Link href={route('logistic.report')}>
                  <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                    Generate Report
                  </Button>
                </Link>
                <Link href={route('logistic.orders.index')}>
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
                         {assignedOrders.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-gray-400">No orders assigned to you yet.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {assignedOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Order #{order.id}</h3>
                                                 <p className="text-sm text-gray-400">
                           Customer: {order.customer.name}
                         </p>
                         <p className="text-sm text-gray-400">
                           Date: {format(new Date(order.created_at), 'MMM dd, yyyy')}
                         </p>
                         <p className="text-sm text-gray-400">
                           Total: ₱{order.total_amount.toFixed(2)}
                         </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDeliveryStatusBadge(order.delivery_status)}
                        <Link href={route('logistic.orders.show', order.id)}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 