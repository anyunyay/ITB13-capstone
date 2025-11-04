import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogisticHeader } from '@/components/logistic-header';
import { ViewToggle } from '@/components/inventory/view-toggle';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { BarChart3, Download, FileText, Search, Filter, X, ChevronDown, CalendarIcon, Truck } from 'lucide-react';
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
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
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
  orders: Order[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function LogisticReport({ orders, summary, filters }: ReportPageProps) {
  const t = useTranslation();
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
    if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
    if (localFilters.search) params.search = localFilters.search;

    router.get(route('logistic.report'), params);
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
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.delivery_status !== 'all' || localFilters.search;
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
    <div className="min-h-screen bg-background">
      <LogisticHeader />
      <Head title={t('logistic.logistics_report')} />

      <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8 pt-25">
        {/* Header */}
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t('logistic.logistics_report')}</h1>
                <p className="text-muted-foreground mt-1">
                  {t('logistic.logistics_report_description')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('logistic.back_to_dashboard')}
              </Button>
              <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('logistic.export_csv')}
              </Button>
              <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('logistic.export_pdf')}
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Card className="shadow-sm">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{t('admin.filters')}</CardTitle>
                    {hasActiveFilters() && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                      placeholder="Search orders by customer, order ID, or items..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('admin.start_date')}</Label>
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
                    <Label className="text-sm font-medium">{t('admin.end_date')}</Label>
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
                    <Label htmlFor="delivery_status" className="text-sm font-medium">{t('logistic.delivery_status')}</Label>
                    <Select
                      value={localFilters.delivery_status}
                      onValueChange={(value) => handleFilterChange('delivery_status', value)}
                    >
                      <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                        <SelectItem value="pending">{t('logistic.pending')}</SelectItem>
                        <SelectItem value="out_for_delivery">{t('logistic.out_for_delivery')}</SelectItem>
                        <SelectItem value="delivered">{t('logistic.delivered')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={applyFilters} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                    {t('admin.apply_filters')}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.total_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.total_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">All orders assigned</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_revenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₱{Number(summary.total_revenue).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total order value</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.pending_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting pickup</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('logistic.out_for_delivery')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.out_for_delivery_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently delivering</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.delivered_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{summary.delivered_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.average_order_value')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                ₱{Number(summary.average_order_value).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{t('logistic.orders')} ({orders.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {orders.length > 0 ? `Showing ${orders.length} orders` : 'No orders found'}
                </div>
                <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <>
                {currentView === 'cards' ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} t={t} />
                    ))}
                  </div>
                ) : (
                  <OrderTable orders={orders} t={t} />
                )}
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

function OrderCard({ order, t }: { order: Order; t: (key: string, params?: any) => string }) {
  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      out_for_delivery: { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
      delivered: { variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {t(`logistic.${status}`)}
      </Badge>
    );
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Order #{order.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getDeliveryStatusBadge(order.delivery_status)}
            {(order as any).ready_for_pickup ? (
              <Badge className="bg-green-600 text-white text-xs">✓ {t('logistic.ready')}</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">{t('admin.not_ready')}</Badge>
            )}
            {(order as any).picked_up ? (
              <Badge className="bg-blue-600 text-white text-xs">✓ {t('admin.picked_up')}</Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">{t('admin.not_picked_up')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('logistic.customer_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.name')}:</span>
                <span className="text-muted-foreground ml-2">{order.customer.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('logistic.email')}:</span>
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
              {t('admin.order_summary')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('logistic.total_amount')}:</span>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  ₱{Number(order.total_amount).toFixed(2)}
                </Badge>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.items')}:</span>
                <Badge variant="outline" className="ml-2 bg-secondary/10 text-secondary border-secondary/20">
                  {order.audit_trail?.length || 0} items
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
          <h5 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            {t('logistic.order_items')}
          </h5>
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
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {item.quantity} {item.category}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('admin.no_items_found')}</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderTable({ orders, t }: { orders: Order[]; t: (key: string, params?: any) => string }) {
  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      out_for_delivery: { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
      delivered: { variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {t(`logistic.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-center py-3 px-4 font-semibold text-foreground">Order ID</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Items</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Amount</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Created</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Delivered</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4 text-center">
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
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {order.audit_trail?.length || 0} items
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  ₱{Number(order.total_amount).toFixed(2)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                {getDeliveryStatusBadge(order.delivery_status)}
              </td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                {dayjs(order.created_at).format('MMM DD, YYYY')}
              </td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                {order.delivered_time ? dayjs(order.delivered_time).format('MMM DD, YYYY') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
