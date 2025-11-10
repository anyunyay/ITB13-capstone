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
import { BarChart3, Download, FileText, Search, Filter, X, LayoutGrid, Table, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState, useEffect } from 'react';
import { PaginationControls } from '@/components/inventory/pagination-controls';

dayjs.extend(utc);
dayjs.extend(timezone);
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useTranslation } from '@/hooks/use-translation';

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

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface AdminStaff {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'staff';
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
  delivery_status: string;
  logistic_ids: string[];
  admin_ids: string[];
  search?: string;
  min_amount?: string;
  max_amount?: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: ReportSummary;
  logistics: Logistic[];
  admins: AdminStaff[];
  filters: ReportFilters;
}

export default function OrderReport({ orders, summary, logistics, admins, filters }: ReportPageProps) {
  const t = useTranslation();
  const normalizedFilters: ReportFilters = {
    ...filters,
    logistic_ids: Array.isArray(filters.logistic_ids) ? filters.logistic_ids : [],
    admin_ids: Array.isArray(filters.admin_ids) ? filters.admin_ids : []
  };
  const [localFilters, setLocalFilters] = useState<ReportFilters>(normalizedFilters);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [adminsOpen, setAdminsOpen] = useState(false);
  
  // Sort state for table view
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      start_date: date ? formatInTimeZone(date, 'Asia/Manila', 'yyyy-MM-dd') : ''
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setLocalFilters(prev => ({
      ...prev,
      end_date: date ? formatInTimeZone(date, 'Asia/Manila', 'yyyy-MM-dd') : ''
    }));
  };

  const getDateRangeDisplay = () => {
    if (!startDate && !endDate) return t('admin.no_date_range_selected');
    if (startDate && !endDate) return t('admin.from_date', { date: formatInTimeZone(startDate, 'Asia/Manila', 'MMM dd, yyyy') });
    if (!startDate && endDate) return t('admin.until_date', { date: formatInTimeZone(endDate, 'Asia/Manila', 'MMM dd, yyyy') });
    return t('admin.date_range_display', { start: formatInTimeZone(startDate!, 'Asia/Manila', 'MMM dd, yyyy'), end: formatInTimeZone(endDate!, 'Asia/Manila', 'MMM dd, yyyy') });
  };

  const getDurationDisplay = () => {
    if (!startDate || !endDate) return '';
    const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    if (diffInDays === 1) return t('admin.duration_one_day');
    if (diffInDays === 7) return t('admin.duration_one_week');
    if (diffInDays === 30) return t('admin.duration_one_month');
    if (diffInDays < 7) return t('admin.duration_days', { days: diffInDays });
    if (diffInDays < 30) return t('admin.duration_weeks', { weeks: Math.round(diffInDays / 7) });
    return t('admin.duration_months', { months: Math.round(diffInDays / 30) });
  };

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.status !== 'all') params.status = localFilters.status;
    if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
    if (localFilters.logistic_ids.length > 0) params.logistic_ids = localFilters.logistic_ids;
    if (localFilters.admin_ids.length > 0) params.admin_ids = localFilters.admin_ids;
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
    if (localFilters.logistic_ids.length > 0) {
      localFilters.logistic_ids.forEach(id => params.append('logistic_ids[]', id));
    }
    if (localFilters.admin_ids.length > 0) {
      localFilters.admin_ids.forEach(id => params.append('admin_ids[]', id));
    }
    if (localFilters.search) params.append('search', localFilters.search);
    if (localFilters.min_amount) params.append('min_amount', localFilters.min_amount);
    if (localFilters.max_amount) params.append('max_amount', localFilters.max_amount);
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);
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
      if (localFilters.logistic_ids.length > 0) {
        localFilters.logistic_ids.forEach(id => displayParams.append('logistic_ids[]', id));
      }
      if (localFilters.admin_ids.length > 0) {
        localFilters.admin_ids.forEach(id => displayParams.append('admin_ids[]', id));
      }
      if (localFilters.search) displayParams.append('search', localFilters.search);
      if (localFilters.min_amount) displayParams.append('min_amount', localFilters.min_amount);
      if (localFilters.max_amount) displayParams.append('max_amount', localFilters.max_amount);
      displayParams.append('sort_by', sortBy);
      displayParams.append('sort_order', sortOrder);
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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.ready_for_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">{t('admin.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('admin.delivered')}</Badge>;
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
      logistic_ids: [],
      admin_ids: [],
      search: '',
      min_amount: '',
      max_amount: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.status !== 'all' || localFilters.delivery_status !== 'all' ||
      localFilters.logistic_ids.length > 0 || localFilters.admin_ids.length > 0 ||
      localFilters.search || localFilters.min_amount || localFilters.max_amount;
  };

  const handleLogisticToggle = (logisticId: string) => {
    setLocalFilters(prev => {
      const isSelected = prev.logistic_ids.includes(logisticId);
      if (isSelected) {
        return { ...prev, logistic_ids: prev.logistic_ids.filter(id => id !== logisticId) };
      } else {
        return { ...prev, logistic_ids: [...prev.logistic_ids, logisticId] };
      }
    });
  };

  const handleAdminToggle = (adminId: string) => {
    setLocalFilters(prev => {
      const isSelected = prev.admin_ids.includes(adminId);
      if (isSelected) {
        return { ...prev, admin_ids: prev.admin_ids.filter(id => id !== adminId) };
      } else {
        return { ...prev, admin_ids: [...prev.admin_ids, adminId] };
      }
    });
  };

  const getLogisticsLabel = () => {
    const count = localFilters.logistic_ids.length;
    if (count === 0) return t('admin.select_logistics');
    if (count === 1) {
      const logistic = logistics.find(l => l.id.toString() === localFilters.logistic_ids[0]);
      return logistic?.name || t('admin.selected_count', { count });
    }
    return t('admin.selected_count', { count });
  };

  const getAdminsLabel = () => {
    const count = localFilters.admin_ids.length;
    if (count === 0) return t('admin.select_processed_by');
    if (count === 1) {
      const admin = admins.find(a => a.id.toString() === localFilters.admin_ids[0]);
      return admin?.name || t('admin.selected_count', { count });
    }
    return t('admin.selected_count', { count });
  };

  return (
    <AppSidebarLayout>
      <Head title={t('admin.order_report')} />
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('admin.order_report')}</h1>
                  <p className="text-muted-foreground mt-1">
                    {t('admin.order_report_description')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('admin.export_csv')}
                </Button>
                <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('admin.export_pdf')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_revenue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₱{Number(summary.total_revenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.gross_revenue')}</p>
              </CardContent>
            </Card>


            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.pending_orders_label')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.awaiting_approval')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.approved_orders_label')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{summary.approved_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.approved_orders_desc')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.rejected_orders_label')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{summary.rejected_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.rejected_orders_desc')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.delivered_orders_label')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{summary.delivered_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.successfully_delivered')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters - Collapsible */}
          <Card className="shadow-sm">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{t('admin.advanced_filters')}</CardTitle>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {t('admin.active')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters() && (
                        <Button onClick={clearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          {t('admin.clear_filters')}
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
                        placeholder={t('admin.search_orders_placeholder')}
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
                          <h4 className="font-semibold text-primary mb-1">{t('admin.selected_date_range')}</h4>
                          <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                          {getDurationDisplay() && (
                            <p className="text-xs text-primary/70 mt-1">
                              {t('admin.duration')}: {getDurationDisplay()}
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
                          {t('ui.clear')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('admin.start_date')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? formatInTimeZone(startDate, 'Asia/Manila', "MMM dd, yyyy") : t('admin.pick_start_date')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                            disabled={(date) => {
                              const today = dayjs().tz('Asia/Manila').startOf('day').toDate();
                              const minDate = new Date("1900-01-01");
                              return date > today || date < minDate;
                            }}
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
                            {endDate ? formatInTimeZone(endDate, 'Asia/Manila', "MMM dd, yyyy") : t('admin.pick_end_date')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                            disabled={(date) => {
                              const today = dayjs().tz('Asia/Manila').startOf('day').toDate();
                              const minDate = new Date("1900-01-01");
                              return date > today || date < minDate || (startDate ? date < startDate : false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">{t('admin.status')}</Label>
                      <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                          <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                          <SelectItem value="approved">{t('admin.approved')}</SelectItem>
                          <SelectItem value="rejected">{t('admin.rejected')}</SelectItem>
                          <SelectItem value="delayed">{t('admin.delayed')}</SelectItem>
                          <SelectItem value="cancelled">{t('admin.cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_status" className="text-sm font-medium">{t('admin.delivery_status')}</Label>
                      <Select value={localFilters.delivery_status} onValueChange={(value) => handleFilterChange('delivery_status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.all_delivery_status')}</SelectItem>
                          <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                          <SelectItem value="ready_to_pickup">{t('admin.ready_for_pickup')}</SelectItem>
                          <SelectItem value="out_for_delivery">{t('admin.out_for_delivery')}</SelectItem>
                          <SelectItem value="delivered">{t('admin.delivered')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min_amount" className="text-sm font-medium">{t('admin.min_amount')}</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        placeholder={t('admin.minimum_amount')}
                        value={localFilters.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_amount" className="text-sm font-medium">{t('admin.max_amount')}</Label>
                      <Input
                        id="max_amount"
                        type="number"
                        placeholder={t('admin.maximum_amount')}
                        value={localFilters.max_amount || ''}
                        onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logistics" className="text-sm font-medium">{t('admin.logistics')}</Label>
                      <Popover open={logisticsOpen} onOpenChange={setLogisticsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={logisticsOpen}
                            className="w-full justify-between border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
                          >
                            <span className="truncate text-left">{getLogisticsLabel()}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <div className="p-3 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder={t('admin.search_logistics')}
                                className="pl-8 h-9"
                              />
                            </div>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto p-2">
                            {logistics.length > 0 ? (
                              <div className="space-y-1">
                                {logistics.map((logistic) => {
                                  const isSelected = localFilters.logistic_ids.includes(logistic.id.toString());
                                  return (
                                    <div
                                      key={logistic.id}
                                      className="flex items-center space-x-2 px-2 py-2 rounded-sm hover:bg-accent cursor-pointer"
                                      onClick={() => handleLogisticToggle(logistic.id.toString())}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleLogisticToggle(logistic.id.toString())}
                                        className="pointer-events-none"
                                      />
                                      <span className="text-sm flex-1">{logistic.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-6">{t('admin.no_logistics_available')}</p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processed_by" className="text-sm font-medium">{t('admin.processed_by')}</Label>
                      <Popover open={adminsOpen} onOpenChange={setAdminsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={adminsOpen}
                            className="w-full justify-between border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
                          >
                            <span className="truncate text-left">{getAdminsLabel()}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <div className="p-3 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder={t('admin.search_admins')}
                                className="pl-8 h-9"
                              />
                            </div>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto p-2">
                            {admins.length > 0 ? (
                              <div className="space-y-1">
                                {admins.map((admin) => {
                                  const isSelected = localFilters.admin_ids.includes(admin.id.toString());
                                  return (
                                    <div
                                      key={admin.id}
                                      className="flex items-center space-x-2 px-2 py-2 rounded-sm hover:bg-accent cursor-pointer"
                                      onClick={() => handleAdminToggle(admin.id.toString())}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleAdminToggle(admin.id.toString())}
                                        className="pointer-events-none"
                                      />
                                      <span className="text-sm flex-1">{admin.name}</span>
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                        {admin.type}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-6">{t('admin.no_admins_available')}</p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
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
                <CardTitle className="text-xl">{t('admin.order_report')} ({orders.length} {t('admin.orders').toLowerCase()})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {orders.length > 0 ? t('admin.showing_orders_count', { count: orders.length }) : t('admin.no_orders_found')}
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
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  ) : (
                    <OrderTable 
                      orders={orders} 
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                    />
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
  const t = useTranslation();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.ready_for_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">{t('admin.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('admin.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{t('admin.order_number', { id: order.id })}</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('admin.customer_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.name')}:</span>
                <span className="text-muted-foreground ml-2">{order.customer.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.email')}:</span>
                <span className="text-muted-foreground ml-2">{order.customer.email}</span>
              </p>
              {order.customer.contact_number && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.contact_number')}:</span>
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
                <span className="font-medium text-foreground">{t('admin.total_amount')}:</span>
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

function OrderTable({ 
  orders, 
  sortBy, 
  sortOrder, 
  onSortChange 
}: { 
  orders: Order[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
}) {
  const t = useTranslation();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newOrder);
    } else {
      onSortChange(field, 'desc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

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
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'delivery_status':
        comparison = a.delivery_status.localeCompare(b.delivery_status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'admin':
        const adminA = a.admin?.name || '';
        const adminB = b.admin?.name || '';
        comparison = adminA.localeCompare(adminB);
        break;
      case 'logistic':
        const logisticA = a.logistic?.name || '';
        const logisticB = b.logistic?.name || '';
        comparison = logisticA.localeCompare(logisticB);
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.ready_for_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">{t('admin.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('admin.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('id')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.order_id_header')}
                {getSortIcon('id')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('customer')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.customer')}
                {getSortIcon('customer')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('total_amount')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.total_amount')}
                {getSortIcon('total_amount')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.status')}
                {getSortIcon('status')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('delivery_status')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.delivery_status')}
                {getSortIcon('delivery_status')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.created')}
                {getSortIcon('created_at')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('admin')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.processed_by')}
                {getSortIcon('admin')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('logistic')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.logistic')}
                {getSortIcon('logistic')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => (
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
              <td className="py-3 px-4 text-right">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={sortedOrders.length}
        />
      )}
    </div>
  );
}