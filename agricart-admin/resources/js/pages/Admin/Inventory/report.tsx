import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dayjs from 'dayjs';
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
  available_quantity: number;
  sold_stocks: number;
  sold_quantity: number;
  completely_sold_stocks: number;
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
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('inventory.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `inventory_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('inventory.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.category !== 'all') displayParams.append('category', localFilters.category);
      if (localFilters.status !== 'all') displayParams.append('status', localFilters.status);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('inventory.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `inventory_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.total_quantity}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.total_stocks}</div>
              <p className="text-xs text-muted-foreground">{summary.total_quantity} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.available_stocks}</div>
              <p className="text-xs text-muted-foreground">{summary.available_quantity} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sold Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.sold_stocks}</div>
              <p className="text-xs text-muted-foreground">{summary.sold_quantity} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completely Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.completely_sold_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Removed Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.removed_stocks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.total_products}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.total_members}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Stocks ({stocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
              {stocks.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm">No stocks found for the selected filters.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
}

function StockCard({ stock }: { stock: Stock }) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Stock #{stock.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dayjs(stock.created_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(stock)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Product Information</h4>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {stock.product.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Type:</span> {stock.product.produce_type}
            </p>
            <p className="text-sm">
              <span className="font-medium">Category:</span> 
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary ml-2">
                {stock.category}
              </span>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Stock Details</h4>
            <p className="text-sm">
              <span className="font-medium">Quantity:</span> 
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ml-2">
                {stock.quantity}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Member:</span> {stock.member.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {stock.member.email}
            </p>
            {stock.member.contact_number && (
              <p className="text-sm">
                <span className="font-medium">Contact:</span> {stock.member.contact_number}
              </p>
            )}
          </div>
        </div>
        
        {stock.lastCustomer && (
          <div className="mt-4 p-3 bg-muted rounded">
            <h5 className="font-semibold text-sm mb-1">Last Customer:</h5>
            <p className="text-sm text-muted-foreground">
              {stock.lastCustomer.name} ({stock.lastCustomer.email})
            </p>
          </div>
        )}

        {stock.removed_at && (
          <div className="mt-4 p-3 bg-destructive/10 rounded">
            <h5 className="font-semibold text-sm mb-1 text-destructive">Removed:</h5>
            <p className="text-sm text-destructive">
              {dayjs(stock.removed_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
        )}

        {stock.notes && (
          <div className="mt-4 p-3 bg-muted rounded">
            <h5 className="font-semibold text-sm mb-1">Notes:</h5>
            <p className="text-sm text-muted-foreground">{stock.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

