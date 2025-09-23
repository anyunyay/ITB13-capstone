import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dayjs from 'dayjs';
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

        {/* Sales Table */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sales ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Processed By</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Logistic</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-600">#{sale.id}</td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={sale.customer.name}>
                          {sale.customer.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{sale.customer.email}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ₱{Number(sale.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={sale.admin?.name || 'N/A'}>
                          {sale.admin?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={sale.logistic?.name || 'N/A'}>
                          {sale.logistic?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                        {dayjs(sale.created_at).format('MMM DD, YYYY')}
                        <div className="text-xs text-gray-400">{dayjs(sale.created_at).format('HH:mm')}</div>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-sm">No sales found for the selected filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
