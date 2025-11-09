import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { format } from 'date-fns';
import { CheckCircle, Eye, Truck, Package, Clock, TrendingUp, ArrowRight, MapPin, Calendar } from 'lucide-react';
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

interface LogisticDashboardProps {
  assignedOrders: PaginatedOrders;
  stats: {
    pending: number;
    ready_to_pickup: number;
    out_for_delivery: number;
    delivered: number;
    total: number;
  };
}

export default function LogisticDashboard({ assignedOrders, stats }: LogisticDashboardProps) {
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

  return (
    <div className="min-h-screen bg-background">
      <LogisticsHeader />
      <Head title={t('logistic.dashboard')} />
      
      <div className="p-6 pt-25 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{t('logistic.welcome_back')}</h1>
          <p className="text-lg text-muted-foreground">{t('logistic.whats_happening_today')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.total_orders')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('logistic.all_time_orders')}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-[color-mix(in_srgb,var(--destructive)_70%,yellow_30%)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.pending')}</CardTitle>
              <Clock className="h-4 w-4 text-[color-mix(in_srgb,var(--destructive)_70%,yellow_30%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[color-mix(in_srgb,var(--destructive)_70%,yellow_30%)]">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('logistic.awaiting_preparation')}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.ready_to_pickup')}</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.ready_to_pickup}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('logistic.ready_for_collection')}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.out_for_delivery')}</CardTitle>
              <Truck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.out_for_delivery}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('logistic.in_transit')}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.delivered')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('logistic.successfully_delivered')}</p>
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
                  {t('logistic.recent_orders')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t('logistic.latest_assigned_orders')}</p>
              </div>
              <Link href={route('logistic.report')}>
                <Button variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t('logistic.generate_report')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {assignedOrders.data.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('logistic.no_orders_assigned')}</h3>
                <p className="text-muted-foreground">{t('logistic.orders_will_appear_here')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedOrders.data.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-foreground text-lg">{t('logistic.order_number', { id: order.id })}</h3>
                          {getDeliveryStatusBadge(order.delivery_status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{t('logistic.customer')}:</span>
                            <span className="font-medium text-foreground">{order.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{t('logistic.date')}:</span>
                            <span className="font-medium text-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{t('logistic.total')}:</span>
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
                            {t('logistic.view_details')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {assignedOrders.total > 5 && (
                  <div className="flex justify-center pt-4">
                    <Link href={route('logistic.orders.index')}>
                      <Button variant="outline" className="group">
                        {t('logistic.view_all_orders')}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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