import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Download, FileText, Search, Filter, X, Grid3X3, Table, ChevronDown, CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState } from 'react';
import { ViewToggle } from '@/components/inventory/view-toggle';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  total_amount: number;
  subtotal: number;
  coop_share: number;
  member_share: number;
  status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | 'ready_to_pickup';
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
  total_subtotal: number;
  total_coop_share: number;
  total_member_share: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  delivered_orders: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
  delivery_status: string;
  search?: string;
  min_amount?: string;
  max_amount?: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function OrderReport({ orders, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Date handling functions
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setLocalFilters(prev => ({
      ...prev,
      start_date: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setLocalFilters(prev => ({
      ...prev,
      end_date: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const getDateRangeDisplay = () => {
    if (!startDate && !endDate) return 'No date range selected';
    if (startDate && !endDate) return `From ${format(startDate, 'MMM dd, yyyy')}`;
    if (!startDate && endDate) return `Until ${format(endDate, 'MMM dd, yyyy')}`;
    return `${format(startDate!, 'MMM dd, yyyy')} - ${format(endDate!, 'MMM dd, yyyy')}`;
  };

  const getDurationDisplay = () => {
    if (!startDate || !endDate) return '';
    const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    if (diffInDays === 1) return '1 day';
    if (diffInDays === 7) return '1 week';
    if (diffInDays === 30) return '1 month';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.round(diffInDays / 7)} weeks`;
    return `${Math.round(diffInDays / 30)} months`;
  };

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.status !== 'all') params.status = localFilters.status;
    if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
    if (localFilters.search) params.search = localFilters.search;
    if (localFilters.min_amount) params.min_amount = localFilters.min_amount;
    if (localFilters.max_amount) params.max_amount = localFilters.max_amount;
    
    router.get(route('admin.orders.report'), params);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    if (localFilters.search) params.append('search', localFilters.search);
    if (localFilters.min_amount) params.append('min_amount', localFilters.min_amount);
    if (localFilters.max_amount) params.append('max_amount', localFilters.max_amount);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('admin.orders.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('admin.orders.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.status !== 'all') displayParams.append('status', localFilters.status);
      if (localFilters.delivery_status !== 'all') displayParams.append('delivery_status', localFilters.delivery_status);
      if (localFilters.search) displayParams.append('search', localFilters.search);
      if (localFilters.min_amount) displayParams.append('min_amount', localFilters.min_amount);
      if (localFilters.max_amount) displayParams.append('max_amount', localFilters.max_amount);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.orders.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      status: 'all',
      delivery_status: 'all',
      search: '',
      min_amount: '',
      max_amount: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date || 
           localFilters.status !== 'all' || localFilters.delivery_status !== 'all' ||
           localFilters.search || localFilters.min_amount || localFilters.max_amount;
  };

  return (
    <AppSidebarLayout>
      <Head title="Order Report" />
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-4 flex flex-col gap-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Order Report</h1>
                  <p className="text-muted-foreground mt-1">
                    Generate comprehensive order reports and analytics
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">All orders</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₱{Number(summary.total_revenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gross revenue</p>
              </CardContent>
            </Card>
            
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{summary.approved_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Approved orders</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{summary.rejected_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Rejected orders</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{summary.delivered_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters - Collapsible */}
          <Card className="shadow-sm">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">Advanced Filters</CardTitle>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {hasActiveFilters() && (
                        <Button onClick={clearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Clear Filters
                        </Button>
                      )}
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search orders, customers, or admin notes..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 pr-4 py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                      />
                    </div>
                  </div>

                  {/* Date Range Summary */}
                  {(startDate || endDate) && (
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Selected Date Range</h4>
                          <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                          {getDurationDisplay() && (
                            <p className="text-xs text-primary/70 mt-1">
                              Duration: {getDurationDisplay()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStartDate(undefined);
                            setEndDate(undefined);
                            setLocalFilters(prev => ({
                              ...prev,
                              start_date: '',
                              end_date: ''
                            }));
                          }}
                          className="text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd, yyyy") : "Pick an end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                            disabled={(date) => 
                              date > new Date() || 
                              date < new Date("1900-01-01") || 
                              (startDate ? date < startDate : false)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_status" className="text-sm font-medium">Delivery Status</Label>
                      <Select value={localFilters.delivery_status} onValueChange={(value) => handleFilterChange('delivery_status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Delivery Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="ready_to_pickup">Ready for Pickup</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min_amount" className="text-sm font-medium">Min Amount</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        placeholder="Minimum amount"
                        value={localFilters.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_amount" className="text-sm font-medium">Max Amount</Label>
                      <Input
                        id="max_amount"
                        type="number"
                        placeholder="Maximum amount"
                        value={localFilters.max_amount || ''}
                        onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={applyFilters} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Orders List */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order Report ({orders.length} orders)</CardTitle>
                <div className="flex items-center gap-4">
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                  <div className="text-sm text-muted-foreground">
                    {orders.length > 0 ? `Showing ${orders.length} orders` : 'No orders found'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <>
                  {currentView === 'cards' ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  ) : (
                    <OrderTable orders={orders} />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters() 
                        ? 'No orders match your current filter criteria. Try adjusting your filters to see more results.'
                        : 'No order data available for the selected time period.'
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarLayout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Order #{order.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Customer Information
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">Name:</span> 
                <span className="text-muted-foreground ml-2">{order.customer.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">Email:</span> 
                <span className="text-muted-foreground ml-2">{order.customer.email}</span>
              </p>
              {order.customer.contact_number && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Contact:</span> 
                  <span className="text-muted-foreground ml-2">{order.customer.contact_number}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Order Summary
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">Total Amount:</span> 
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                  ₱{Number(order.total_amount).toFixed(2)}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">Subtotal:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(order.subtotal || 0).toFixed(2)}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">Items:</span> 
                <span className="text-muted-foreground ml-2">{order.audit_trail?.length || 0}</span>
              </p>
              {order.admin && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Processed by:</span> 
                  <span className="text-muted-foreground ml-2">{order.admin.name}</span>
                </p>
              )}
              {order.logistic && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Assigned to:</span> 
                  <span className="text-muted-foreground ml-2">{order.logistic.name}</span>
                  {order.logistic.contact_number && (
                    <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {order.admin_notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h5 className="font-semibold text-sm mb-1 text-foreground">Admin Notes:</h5>
            <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-foreground">Order Items</h4>
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
                    <span className="text-foreground">{item.product.name} ({item.category})</span>
                    <span className="text-muted-foreground">{item.quantity} {item.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No items found</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderTable({ orders }: { orders: Order[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Total Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Delivery Status</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Admin</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Logistic</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  #{order.id}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{order.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  ₱{Number(order.total_amount).toFixed(2)}
                </Badge>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(order.status)}
              </td>
              <td className="py-3 px-4">
                {order.delivery_status ? getDeliveryStatusBadge(order.delivery_status) : <span className="text-muted-foreground">-</span>}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  {order.admin ? (
                    <p className="text-sm text-foreground">{order.admin.name}</p>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  {order.logistic ? (
                    <p className="text-sm text-foreground">{order.logistic.name}</p>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}