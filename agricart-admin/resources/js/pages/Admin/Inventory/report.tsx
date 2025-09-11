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

interface Product {
  id: number;
  name: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  description: string;
  image: string;
  image_url?: string;
  produce_type: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  type: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  type: string;
}

interface Stock {
  id: number;
  product_id: number;
  quantity: number;
  member_id: number;
  category: 'Kilo' | 'Pc' | 'Tali';
  status: string;
  last_customer_id?: number;
  removed_at?: string;
  notes?: string;
  created_at: string;
  product: Product;
  member: Member;
  lastCustomer?: Customer;
}

interface ReportSummary {
  total_stocks: number;
  total_quantity: number;
  available_stocks: number;
  sold_stocks: number;
  partial_stocks: number;
  removed_stocks: number;
  total_products: number;
  total_members: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  category: string;
  status: string;
}

interface ReportPageProps {
  stocks: Stock[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function InventoryReport({ stocks, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.category !== 'all') params.append('category', localFilters.category);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    
    router.get(route('inventory.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.category !== 'all') params.append('category', localFilters.category);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    params.append('format', format);
    
    window.open(`${route('inventory.report')}?${params.toString()}`, '_blank');
  };

  const getStatusBadge = (stock: Stock) => {
    if (stock.removed_at) {
      return <Badge variant="destructive">Removed</Badge>;
    } else if (stock.quantity == 0 && stock.last_customer_id) {
      return <Badge variant="default">Sold</Badge>;
    } else if (stock.quantity > 0 && stock.last_customer_id) {
      return <Badge variant="secondary">Partial</Badge>;
    } else {
      return <Badge variant="outline">Available</Badge>;
    }
  };

  return (
    <AppSidebarLayout>
      <Head title="Inventory Report" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Inventory Report</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Label htmlFor="category">Category</Label>
                <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Kilo">Kilo</SelectItem>
                    <SelectItem value="Pc">Pc</SelectItem>
                    <SelectItem value="Tali">Tali</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.total_quantity}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.available_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sold Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.sold_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Partial Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.partial_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Removed Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.removed_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.total_products}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{summary.total_members}</div>
            </CardContent>
          </Card>
        </div>

         {/* Stocks Table */}
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-lg">Stocks ({stocks.length})</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-200">
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">ID</th>
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Product</th>
                     <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs uppercase tracking-wider">Qty</th>
                     <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs uppercase tracking-wider">Cat</th>
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Member</th>
                     <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs uppercase tracking-wider">Status</th>
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Created</th>
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Removed</th>
                     <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Notes</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {stocks.map((stock) => (
                     <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-600">#{stock.id}</td>
                       <td className="px-3 py-2 max-w-xs">
                         <div className="text-sm font-medium text-gray-900 truncate" title={stock.product.name}>
                           {stock.product.name}
                         </div>
                         <div className="text-xs text-gray-500 truncate">{stock.product.produce_type}</div>
                       </td>
                       <td className="px-3 py-2 text-center">
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           {stock.quantity}
                         </span>
                       </td>
                       <td className="px-3 py-2 text-center">
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                           {stock.category}
                         </span>
                       </td>
                       <td className="px-3 py-2 max-w-xs">
                         <div className="text-sm text-gray-900 truncate" title={stock.member.name}>
                           {stock.member.name}
                         </div>
                         <div className="text-xs text-gray-500 truncate">{stock.member.email}</div>
                       </td>
                       <td className="px-3 py-2 text-center">
                         {getStatusBadge(stock)}
                       </td>
                       <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                         {format(new Date(stock.created_at), 'MMM dd, yyyy')}
                         <div className="text-xs text-gray-400">{format(new Date(stock.created_at), 'HH:mm')}</div>
                       </td>
                       <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                         {stock.removed_at ? (
                           <>
                             {format(new Date(stock.removed_at), 'MMM dd, yyyy')}
                             <div className="text-xs text-red-500">{format(new Date(stock.removed_at), 'HH:mm')}</div>
                           </>
                         ) : (
                           <span className="text-gray-400">—</span>
                         )}
                       </td>
                       <td className="px-3 py-2 max-w-xs">
                         <div className="text-xs text-gray-600 truncate" title={stock.notes || ''}>
                           {stock.notes || <span className="text-gray-400">—</span>}
                         </div>
                       </td>
                     </tr>
                   ))}
                   {stocks.length === 0 && (
                     <tr>
                       <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                         <div className="flex flex-col items-center">
                           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                             <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                             </svg>
                           </div>
                           <p className="text-sm">No stocks found for the selected filters.</p>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </CardContent>
         </Card>
      </div>
    </AppSidebarLayout>
  );
}

