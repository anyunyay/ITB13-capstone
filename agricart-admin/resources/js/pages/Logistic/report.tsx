import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogisticHeader } from '@/components/logistic-header';
import dayjs from 'dayjs';
import { FileText, FileSpreadsheet } from 'lucide-react';
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
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
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

interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  out_for_delivery_orders: number;
  delivered_orders: number;
  average_order_value: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  delivery_status: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function LogisticReport({ orders, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    
    router.get(route('logistic.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('logistic.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `logistic_orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('logistic.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.delivery_status !== 'all') displayParams.append('delivery_status', localFilters.delivery_status);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('logistic.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `logistic_orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LogisticHeader />
      <Head title={t('logistic.logistics_report')} />
      
      <div className="p-6 pt-25">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('logistic.logistics_report')}</h1>
            <p className="text-muted-foreground">{t('logistic.logistics_report_description')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              {t('logistic.back_to_dashboard')}
            </Button>
            <Button onClick={() => exportReport('csv')} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {t('logistic.export_csv')}
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              {t('logistic.export_pdf')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">{t('admin.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="start_date">{t('admin.start_date')}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">{t('admin.end_date')}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="delivery_status">{t('logistic.delivery_status')}</Label>
                <Select
                  value={localFilters.delivery_status}
                  onValueChange={(value) => handleFilterChange('delivery_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                    <SelectItem value="pending">{t('logistic.pending')}</SelectItem>
                    <SelectItem value="out_for_delivery">{t('logistic.out_for_delivery')}</SelectItem>
                    <SelectItem value="delivered">{t('logistic.delivered')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90">
                  {t('admin.apply_filters')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.total_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.total_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_revenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ₱{Number(summary.total_revenue).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.pending_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.out_for_delivery')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.out_for_delivery_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.delivered_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.delivered_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.average_order_value')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                ₱{Number(summary.average_order_value).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{t('logistic.orders')} ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} t={t} />
              ))}
              {orders.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {t('admin.no_orders_found_filter')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderCard({ order, t }: { order: Order; t: (key: string, params?: any) => string }) {
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-blue-600 text-white">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-green-600 text-green-600">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{t('logistic.order_number', { id: order.id })}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getDeliveryStatusBadge(order.delivery_status)}
            {(order as any).ready_for_pickup ? (
              <Badge className="bg-green-600 text-white text-xs">✓ {t('logistic.ready')}</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">{t('admin.not_ready')}</Badge>
            )}
            {(order as any).picked_up ? (
              <Badge className="bg-blue-600 text-white text-xs">✓ {t('admin.picked_up')}</Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">{t('admin.not_picked_up')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-foreground">{t('logistic.customer_information')}</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{t('admin.name')}:</span> {order.customer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{t('logistic.email')}:</span> {order.customer.email}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-foreground">{t('admin.order_summary')}</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{t('logistic.total_amount')}:</span> ₱{Number(order.total_amount).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{t('admin.items')}:</span> {order.audit_trail?.length || 0}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-foreground">{t('logistic.order_items')}</h4>
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
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.product.name} ({item.category})</span>
                    <span>{item.quantity} {item.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('admin.no_items_found')}</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
