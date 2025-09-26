import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowLeft, FileText, Download } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member-header';

interface ProductSale {
  product_id: number;
  product_name: string;
  total_quantity: number;
  price_per_unit: number;
  total_revenue: number;
  category: string;
  sales_count: number;
  customers: string[];
}

interface OrderDetail {
  order_id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  total_quantity: number;
  created_at: string;
  products: {
    product_name: string;
    quantity: number;
    category: string;
    price_per_unit: number;
    total_price: number;
  }[];
}

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  totalQuantitySold: number;
  productSales: ProductSale[];
  orderDetails: OrderDetail[];
}

interface ReportSummary {
  total_revenue: number;
  total_orders: number;
  total_quantity_sold: number;
  average_order_value: number;
  total_products: number;
  date_range: {
    start?: string;
    end?: string;
  };
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

interface ReportPageProps {
  salesData: SalesData;
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function MemberRevenueReport({ salesData, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    
    router.get(route('member.revenueReport'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('member.revenueReport')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_revenue_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('member.revenueReport')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('member.revenueReport')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_revenue_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
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
      <MemberHeader />
      <div className="p-6">
        <Head title="Revenue Report" />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Link href={route('member.dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Revenue Report</h1>
              <p className="text-gray-400 mt-2">Track your sales performance and revenue</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => exportReport('csv')} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportReport('pdf')} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-gray-300">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-gray-300">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">₱{Number(summary.total_revenue).toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                From {summary.total_orders} orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.total_orders}</div>
              <p className="text-xs text-gray-400">
                Completed orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₱{Number(summary.average_order_value).toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                Per order
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Quantity Sold</CardTitle>
              <Package className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.total_quantity_sold}</div>
              <p className="text-xs text-gray-400">
                Total units sold
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Sales Performance */}
        {salesData.productSales.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Product Sales Performance ({salesData.productSales.length} products)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.productSales.map((product, index) => (
                  <ProductSaleCard key={product.product_id} product={product} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {salesData.orderDetails.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Details ({salesData.orderDetails.length} orders)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th className="px-3 py-2 text-left font-medium text-gray-300 text-xs uppercase tracking-wider">Order ID</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-300 text-xs uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-300 text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-300 text-xs uppercase tracking-wider">Quantity</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-300 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-600">
                    {salesData.orderDetails.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-300">#{order.order_id}</td>
                        <td className="px-3 py-2 max-w-xs">
                          <div className="text-sm font-medium text-white truncate" title={order.customer_name}>
                            {order.customer_name}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{order.customer_email}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                            ₱{Number(order.total_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-white">
                          {order.total_quantity}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">
                          {dayjs(order.created_at).format('MMM DD, YYYY')}
                          <div className="text-xs text-gray-400">{dayjs(order.created_at).format('HH:mm')}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {salesData.orderDetails.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No sales data found for the selected filters.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProductSaleCard({ product, index }: { product: ProductSale; index: number }) {
  const averageRevenue = product.sales_count > 0 ? product.total_revenue / product.sales_count : 0;

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={index < 3 ? "default" : "secondary"} className="bg-blue-600 text-white">
              #{index + 1}
            </Badge>
            <div>
              <CardTitle className="text-lg text-white">{product.product_name}</CardTitle>
              <p className="text-sm text-gray-400">{product.category}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              ₱{Number(product.total_revenue).toFixed(2)}
            </div>
            <p className="text-sm text-gray-400">{product.sales_count} sales</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-white">Performance Metrics</h4>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Total Sales:</span> {product.sales_count}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Total Revenue:</span> ₱{Number(product.total_revenue).toFixed(2)}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Average Revenue:</span> ₱{Number(averageRevenue).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Quantity & Pricing</h4>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Total Quantity:</span> {product.total_quantity}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Price Per Unit:</span> ₱{Number(product.price_per_unit).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Customers</h4>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Unique Customers:</span> {product.customers.length}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              {product.customers.slice(0, 3).join(', ')}
              {product.customers.length > 3 && ` +${product.customers.length - 3} more`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
