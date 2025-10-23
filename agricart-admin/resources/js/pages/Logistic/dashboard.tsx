import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogisticHeader } from '@/components/logistic-header';
import { format } from 'date-fns';
import { CheckCircle, Eye, Truck, Package, Clock, TrendingUp, ArrowRight, MapPin, Calendar } from 'lucide-react';

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
    };
    category: string;
    quantity: number;
  }>;
}

interface LogisticDashboardProps {
  assignedOrders: Order[];
  stats: {
    pending: number;
    ready_to_pickup: number;
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
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">Ready to Pick Up</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-blue-600 text-white">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-green-600 text-green-600">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LogisticHeader />
      <Head title="Logistic Dashboard" />
      
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-lg text-muted-foreground">Here's what's happening with your deliveries today</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time orders</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting preparation</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Pickup</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.ready_to_pickup}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for collection</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out for Delivery</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.out_for_delivery}</div>
              <p className="text-xs text-muted-foreground mt-1">In transit</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Orders */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Your latest assigned orders</p>
              </div>
              <div className="flex space-x-2">
                <Link href={route('logistic.report')}>
                  <Button variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Link>
                <Link href={route('logistic.orders.index')}>
                  <Button variant="outline" className="group">
                    View All Orders
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assignedOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders assigned</h3>
                <p className="text-muted-foreground">You'll see your assigned orders here once they're available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-foreground text-lg">Order #{order.id}</h3>
                          {getDeliveryStatusBadge(order.delivery_status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-medium text-foreground">{order.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium text-foreground">₱{order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={route('logistic.orders.show', order.id)}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {assignedOrders.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href={route('logistic.orders.index')}>
                      <Button variant="ghost" className="text-primary hover:text-primary/80">
                        View {assignedOrders.length - 5} more orders
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 