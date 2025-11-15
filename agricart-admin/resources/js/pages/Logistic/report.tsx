import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { Pagination } from '@/components/common/pagination';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { Download, FileText, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, CalendarIcon, Truck, ArrowLeft } from 'lucide-react';
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
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered';
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

interface PaginatedOrders {
  data: Order[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  current_page: number;
  last_page: number;
  per_page: number;
  from: number;
  to: number;
  total: number;
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
  search?: string;
}

interface ReportPageProps {
  orders: PaginatedOrders;
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function LogisticReport({ orders, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply mobile pagination on initial load if needed
  useEffect(() => {
    if (isMobile && orders.per_page !== 5) {
      const params: Record<string, any> = {};
      if (localFilters.start_date) params.start_date = localFilters.start_date;
      if (localFilters.end_date) params.end_date = localFilters.end_date;
      if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
      if (localFilters.search) params.search = localFilters.search;
      params.per_page = 5;

      router.get(route('logistic.report'), params, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  }, [isMobile]);

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
    if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
    if (localFilters.search) params.search = localFilters.search;
    
    // Set per_page based on screen size
    if (isMobile) {
      params.per_page = 5;
    }

    setIsLoading(true);
    router.get(route('logistic.report'), params, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      delivery_status: 'all',
      search: ''
    });
    
    const params: Record<string, any> = {};
    // Maintain per_page for mobile even when clearing filters
    if (isMobile) {
      params.per_page = 5;
    }
    
    setIsLoading(true);
    router.get(route('logistic.report'), params, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.delivery_status !== 'all' || localFilters.search;
  };

  const exportReport = (format: 'csv' | 'pdf', sortByParam?: string, sortOrderParam?: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    
    // Use the passed parameters or fall back to current state
    const finalSortBy = sortByParam || sortBy;
    const finalSortOrder = sortOrderParam || sortOrder;
    
    if (finalSortBy) params.append('sort_by', finalSortBy);
    if (finalSortOrder) params.append('sort_order', finalSortOrder);
    params.append('format', format);
    
    console.log('Export params:', { sortBy: finalSortBy, sortOrder: finalSortOrder, format });

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
      if (finalSortBy) displayParams.append('sort_by', finalSortBy);
      if (finalSortOrder) displayParams.append('sort_order', finalSortOrder);
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
      <LogisticsHeader />
      <Head title={t('logistic.logistics_report')} />

      <div className="p-6 pt-25 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-foreground truncate">{t('logistic.logistics_report')}</h1>
            </div>
            <Link href={route('logistic.dashboard')}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg shrink-0">
                  <Truck className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('logistic.logistics_report')}</h1>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t('logistic.logistics_report_description')}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={route('logistic.dashboard')}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t('logistic.back_to_dashboard')}
                  </Button>
                </Link>
                <Button onClick={() => exportReport('csv', sortBy, sortOrder)} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('logistic.export_csv')}
                </Button>
                <Button onClick={() => exportReport('pdf', sortBy, sortOrder)} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('logistic.export_pdf')}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Export Buttons */}
          <div className="flex md:hidden gap-2 mt-2">
            <Button onClick={() => exportReport('csv', sortBy, sortOrder)} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </Button>
            <Button onClick={() => exportReport('pdf', sortBy, sortOrder)} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
              <FileText className="h-3.5 w-3.5" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className='gap-0'>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <CardTitle className="text-xl font-semibold">{t('admin.filters')}</CardTitle>
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              {hasActiveFilters() && (
                <Button onClick={clearFilters} variant="outline" size="sm" className="h-8 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
                {/* Date Range Summary */}
                {(startDate || endDate) && (
                  <div className="mb-3 p-2.5 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-primary">{getDateRangeDisplay()}</p>
                        {getDurationDisplay() && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getDurationDisplay()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
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
                        className="h-7 px-2 text-xs flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Filter Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative lg:col-span-1">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input
                      placeholder="Order ID, customer..."
                      value={localFilters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-9 pr-3 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-9 text-sm"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
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
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-9 text-sm"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
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
                  <div>
                    <Select
                      value={localFilters.delivery_status}
                      onValueChange={(value) => handleFilterChange('delivery_status', value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                        <SelectItem value="pending">{t('logistic.pending')}</SelectItem>
                        <SelectItem value="ready_to_pickup">{t('logistic.ready_to_pickup')}</SelectItem>
                        <SelectItem value="out_for_delivery">{t('logistic.out_for_delivery')}</SelectItem>
                        <SelectItem value="delivered">{t('logistic.delivered')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button 
                      onClick={applyFilters} 
                      disabled={isLoading}
                      className="w-full h-9 text-sm disabled:opacity-50"
                    >
                      {isLoading ? t('admin.loading') || 'Loading...' : t('admin.apply_filters')}
                    </Button>
                  </div>
                </div>
              </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">{t('logistic.orders')} ({orders.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Truck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              </div>
            ) : orders.data.length > 0 ? (
              <>
                {/* Mobile: Card View */}
                <div className="block md:hidden space-y-3">
                  {orders.data.map((order) => (
                    <MobileOrderCard key={order.id} order={order} t={t} />
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden md:block">
                  <OrderTable orders={orders.data} t={t} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />
                </div>
                
                <Pagination
                  links={orders.links}
                  from={orders.from}
                  to={orders.to}
                  total={orders.total}
                  currentPage={orders.current_page}
                  lastPage={orders.last_page}
                  perPage={orders.per_page}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-8 h-8 text-muted-foreground" />
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
  );
}

function MobileOrderCard({ order, t }: { order: Order; t: (key: string, params?: any) => string }) {
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-accent text-accent-foreground">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-secondary text-secondary">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dayjs(order.created_at).format('MMM DD, YYYY')}
            </p>
          </div>
          {getDeliveryStatusBadge(order.delivery_status)}
        </div>

        {/* Customer Info */}
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium text-foreground">{order.customer.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-semibold text-foreground">₱{Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="text-sm font-medium text-foreground">{order.audit_trail?.length || 0} items</p>
          </div>
          {order.delivered_time && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-sm font-medium text-foreground">
                {dayjs(order.delivered_time).format('MMM DD, YYYY')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderTable({ orders, t, sortBy, setSortBy, sortOrder, setSortOrder }: { 
  orders: Order[]; 
  t: (key: string, params?: any) => string;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}) {

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'total_amount':
        comparison = a.total_amount - b.total_amount;
        break;
      case 'delivery_status':
        comparison = a.delivery_status.localeCompare(b.delivery_status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'delivered_time':
        const dateA = a.delivered_time ? new Date(a.delivered_time).getTime() : 0;
        const dateB = b.delivered_time ? new Date(b.delivered_time).getTime() : 0;
        comparison = dateA - dateB;
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-accent text-accent-foreground">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-secondary text-secondary">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('id')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Order ID
                {getSortIcon('id')}
              </Button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('customer')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                Customer
                {getSortIcon('customer')}
              </Button>
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('total_amount')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-end w-full"
              >
                Amount
                {getSortIcon('total_amount')}
              </Button>
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Items</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('delivery_status')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Status
                {getSortIcon('delivery_status')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Assigned
                {getSortIcon('created_at')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('delivered_time')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                Delivered
                {getSortIcon('delivered_time')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 text-sm text-foreground font-medium text-center">#{order.id}</td>
              <td className="py-3 px-4">
                <div className="text-sm text-foreground font-medium">{order.customer.name}</div>
                <div className="text-sm text-muted-foreground">{order.customer.email}</div>
              </td>
              <td className="py-3 px-4 text-sm text-foreground text-right font-semibold">
                ₱{Number(order.total_amount).toFixed(2)}
              </td>
              <td className="py-3 px-4 text-sm text-foreground text-right">
                {order.audit_trail?.length || 0} items
              </td>
              <td className="py-3 px-4 text-center">
                {getDeliveryStatusBadge(order.delivery_status)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground text-center">
                {dayjs(order.created_at).format('MMM DD, YYYY')}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground text-center">
                {order.delivered_time ? dayjs(order.delivered_time).format('MMM DD, YYYY') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
