import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  created_at: string;
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

interface ReportFilters {
  start_date: string;
  end_date: string;
  status: string;
  delivery_status: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    approved_orders: number;
    rejected_orders: number;
    delivered_orders: number;
  };
  filters: ReportFilters;
}

export default function OrderReport({ orders, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    
    router.get('/customer/orders/report', Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    params.append('format', format);
    
    window.open(`/customer/orders/report?${params.toString()}`, '_blank');
  };

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

  return (
    <AppHeaderLayout>
      <Head title="My Orders Report" />
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Orders Report</h1>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('csv')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={localFilters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery_status">Delivery Status</Label>
                <Select value={localFilters.delivery_status} onValueChange={(value) => handleFilterChange('delivery_status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Delivery Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₱{Number(summary.total_spent).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.approved_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.rejected_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.delivered_orders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      {getDeliveryStatusBadge(order.delivery_status)}
                      <span className="font-semibold text-lg">
                        ₱{Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {order.admin_notes && (
                    <div className="mb-2 p-2 bg-amber-100 border-l-4 border-amber-400 rounded">
                      <p className="text-sm text-amber-900">
                        <strong>Admin Notes:</strong> {order.admin_notes}
                      </p>
                    </div>
                  )}

                  {order.logistic && (
                    <div className="mb-2 p-2 bg-teal-50 border-l-4 border-teal-400 rounded">
                      <p className="text-sm text-teal-900">
                        <strong>Delivery:</strong> {order.logistic.name}
                        {order.logistic.contact_number && (
                          <span> ({order.logistic.contact_number})</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <strong>Items:</strong> {order.audit_trail.map(item => 
                      `${item.product.name} (${item.quantity} ${item.category})`
                    ).join(', ')}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No orders found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppHeaderLayout>
  );
} 