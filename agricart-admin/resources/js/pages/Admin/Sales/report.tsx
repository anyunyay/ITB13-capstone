import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  created_at: string;
  admin?: {
    name: string;
  };
  logistic?: {
    name: string;
  };
}

interface MemberSale {
  member_id: number;
  member_name: string;
  member_email: string;
  total_orders: number;
  total_revenue: number;
  total_quantity_sold: number;
}

interface ReportSummary {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

interface ReportPageProps {
  sales: Sale[];
  memberSales: MemberSale[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function SalesReport({ sales, memberSales, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    
    router.get(route('admin.sales.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    params.append('format', format);
    
    window.open(`${route('admin.sales.report')}?${params.toString()}`, '_blank');
  };

  return (
    <AppLayout>
      <Head title="Sales Report" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sales Report</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_revenue).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {summary.total_orders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_orders}</div>
              <p className="text-xs text-muted-foreground">
                Approved orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{Number(summary.average_order_value).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_customers}</div>
              <p className="text-xs text-muted-foreground">
                Unique customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sales ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))}
              {sales.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No sales found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Sales */}
        {memberSales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Member Sales Performance ({memberSales.length} members)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberSales.map((member, index) => (
                  <MemberSaleCard key={member.member_id} member={member} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function SaleCard({ sale }: { sale: Sale }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sale #{sale.id}</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₱{Number(sale.total_amount).toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {sale.customer.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {sale.customer.email}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Sale Details</h4>
            <p className="text-sm">
              <span className="font-medium">Total Amount:</span> ₱{Number(sale.total_amount).toFixed(2)}
            </p>
            {sale.admin && (
              <p className="text-sm">
                <span className="font-medium">Processed by:</span> {sale.admin.name}
              </p>
            )}
            {sale.logistic && (
              <p className="text-sm">
                <span className="font-medium">Logistic:</span> {sale.logistic.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberSaleCard({ member, index }: { member: MemberSale; index: number }) {
  const averageRevenue = member.total_orders > 0 ? member.total_revenue / member.total_orders : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={index < 3 ? "default" : "secondary"}>
              #{index + 1}
            </Badge>
            <div>
              <CardTitle className="text-lg">{member.member_name}</CardTitle>
              <p className="text-sm text-gray-500">{member.member_email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₱{Number(member.total_revenue).toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">{member.total_orders} orders</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Performance Metrics</h4>
            <p className="text-sm">
              <span className="font-medium">Total Orders:</span> {member.total_orders}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Revenue:</span> ₱{Number(member.total_revenue).toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Average Revenue:</span> ₱{Number(averageRevenue).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quantity Sold</h4>
            <p className="text-sm">
              <span className="font-medium">Total Quantity:</span> {member.total_quantity_sold}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
