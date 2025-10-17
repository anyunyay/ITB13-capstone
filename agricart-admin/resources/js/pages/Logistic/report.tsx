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
    packing_duration?: number;
    delivery_duration?: number;
    total_duration?: number;
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
    <div className="min-h-screen bg-gray-900">
      <LogisticHeader />
      <Head title="Logistic Orders Report" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Logistic Orders Report</h1>
            <p className="text-gray-400">Generate and export reports for your assigned orders</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-white border-gray-600 hover:bg-gray-800"
              onClick={() => window.history.back()}
            >
              Back to Dashboard
            </Button>
            <Button onClick={() => exportReport('csv')} variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-white">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-white">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="delivery_status" className="text-white">Delivery Status</Label>
                <Select
                  value={localFilters.delivery_status}
                  onValueChange={(value) => handleFilterChange('delivery_status', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.total_orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-green-400">
                 PHP {Number(summary.total_revenue).toFixed(2)}
               </div>
             </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{summary.pending_orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Out for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{summary.out_for_delivery_orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{summary.delivered_orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg Order Value</CardTitle>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-purple-400">
                 PHP {Number(summary.average_order_value).toFixed(2)}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {orders.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No orders found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
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
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">Order #{order.id}</CardTitle>
            <p className="text-sm text-gray-400">
              {dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getDeliveryStatusBadge(order.delivery_status)}
            {order.ready_for_pickup ? (
              <Badge className="bg-green-600 text-white text-xs">✓ Ready</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">Not Ready</Badge>
            )}
            {order.picked_up ? (
              <Badge className="bg-blue-600 text-white text-xs">✓ Picked Up</Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-600 text-white text-xs">Not Picked Up</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-white">Customer Information</h4>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Name:</span> {order.customer.name}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Email:</span> {order.customer.email}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Order Summary</h4>
                         <p className="text-sm text-gray-300">
               <span className="font-medium">Total Amount:</span> PHP {Number(order.total_amount).toFixed(2)}
             </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Items:</span> {order.audit_trail?.length || 0}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-white">Order Items</h4>
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
                  <div key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>{item.product.name} ({item.category})</span>
                    <span>{item.quantity} {item.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No items found</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
