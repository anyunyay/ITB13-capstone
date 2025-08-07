import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useState } from 'react';

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

interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  delivered_orders: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: ReportSummary;
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
    
    router.get(route('admin.orders.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    params.append('format', format);
    
    window.open(`${route('admin.orders.report')}?${params.toString()}`, '_blank');
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
    <AppSidebarLayout>
      <Head title="Order Report" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order Report</h1>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('csv')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline">
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
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₱{Number(summary.total_revenue).toFixed(2)}
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
                <OrderCard key={order.id} order={order} />
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
            {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
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