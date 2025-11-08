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
import { BarChart3, Download, FileText, Search, Filter, X, LayoutGrid, Table, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState, useMemo, useEffect } from 'react';

// Configure dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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
  removed_at?: string;
  notes?: string;
  created_at: string;
  product: Product;
  member: Member;
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
  member_ids: string[];
  product_type: string;
  min_quantity?: string;
  max_quantity?: string;
  search?: string;
}

interface ReportPageProps {
  stocks: Stock[];
  summary: ReportSummary;
  members: Member[];
  productTypes: string[];
  filters: ReportFilters;
}

export default function InventoryReport({ stocks, summary, members, productTypes, filters }: ReportPageProps) {
  const t = useTranslation();
  // Ensure member_ids is always an array
  const normalizedFilters: ReportFilters = {
    ...filters,
    member_ids: Array.isArray(filters.member_ids) ? filters.member_ids : []
  };

  const [localFilters, setLocalFilters] = useState<ReportFilters>(normalizedFilters);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic items per page based on view type
  const itemsPerPage = currentView === 'cards' ? 8 : 10;

  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );

  // Paginate stocks
  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return stocks.slice(startIndex, endIndex);
  }, [stocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(stocks.length / itemsPerPage);

  // Reset pagination when filters change or view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [stocks.length, currentView]);

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

  const handleMemberToggle = (memberId: string) => {
    setLocalFilters(prev => {
      const isSelected = prev.member_ids.includes(memberId);

      if (isSelected) {
        // Remove member if already selected
        return {
          ...prev,
          member_ids: prev.member_ids.filter(id => id !== memberId)
        };
      } else {
        // Add member if not selected (with limit check)
        if (prev.member_ids.length >= 5) {
          return prev; // Max 5 members selected
        }
        return {
          ...prev,
          member_ids: [...prev.member_ids, memberId]
        };
      }
    });
  };

  const selectAllMembers = () => {
    setLocalFilters(prev => ({
      ...prev,
      member_ids: members.slice(0, 5).map(member => member.id.toString()) // Max 5 members
    }));
  };

  const deselectAllMembers = () => {
    setLocalFilters(prev => ({
      ...prev,
      member_ids: []
    }));
  };

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.category !== 'all') params.category = localFilters.category;
    if (localFilters.status !== 'all') params.status = localFilters.status;
    if (localFilters.member_ids.length > 0) {
      params.member_ids = localFilters.member_ids;
    }
    if (localFilters.product_type !== 'all') params.product_type = localFilters.product_type;
    if (localFilters.min_quantity) params.min_quantity = localFilters.min_quantity;
    if (localFilters.max_quantity) params.max_quantity = localFilters.max_quantity;
    if (localFilters.search) params.search = localFilters.search;

    router.get(route('inventory.report'), params);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.category !== 'all') params.append('category', localFilters.category);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.member_ids.length > 0) {
      localFilters.member_ids.forEach(id => params.append('member_ids[]', id));
    }
    if (localFilters.product_type !== 'all') params.append('product_type', localFilters.product_type);
    if (localFilters.min_quantity) params.append('min_quantity', localFilters.min_quantity);
    if (localFilters.max_quantity) params.append('max_quantity', localFilters.max_quantity);
    if (localFilters.search) params.append('search', localFilters.search);
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
      if (localFilters.member_ids.length > 0) {
        localFilters.member_ids.forEach(id => displayParams.append('member_ids[]', id));
      }
      if (localFilters.product_type !== 'all') displayParams.append('product_type', localFilters.product_type);
      if (localFilters.min_quantity) displayParams.append('min_quantity', localFilters.min_quantity);
      if (localFilters.max_quantity) displayParams.append('max_quantity', localFilters.max_quantity);
      if (localFilters.search) displayParams.append('search', localFilters.search);
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
      return <Badge variant="destructive">{t('admin.removed')}</Badge>;
    } else if (stock.quantity == 0) {
      return <Badge variant="default">{t('admin.sold')}</Badge>;
    } else {
      return <Badge variant="outline">{t('admin.available')}</Badge>;
    }
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      category: 'all',
      status: 'all',
      member_ids: [],
      product_type: 'all',
      min_quantity: '',
      max_quantity: '',
      search: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.category !== 'all' || localFilters.status !== 'all' ||
      localFilters.member_ids.length > 0 || localFilters.product_type !== 'all' ||
      localFilters.min_quantity || localFilters.max_quantity || localFilters.search;
  };

  return (
    <AppSidebarLayout>
      <Head title={t('admin.inventory_report')} />
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
                  <h1 className="text-3xl font-bold text-foreground">{t('admin.inventory_report')}</h1>
                  <p className="text-muted-foreground mt-1">
                    {t('admin.inventory_report_description')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_stocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary.total_stocks}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.all_inventory_items')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_quantity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summary.total_quantity}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.available_plus_sold_units')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.available_stocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summary.available_stocks}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.units_available_count', { count: summary.available_quantity })}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.sold_stocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{summary.sold_stocks}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.units_sold_count', { count: summary.sold_quantity })}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.completely_sold')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{summary.completely_sold_stocks}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.fully_depleted_items')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.removed_stocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{summary.removed_stocks}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.removed_items')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_products')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{summary.total_products}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.unique_products')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_members')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{summary.total_members}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.active_members')}</p>
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
                        placeholder={t('admin.search_inventory_report_placeholder')}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
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
                              return date > today ||
                                date < minDate ||
                                (startDate ? date < startDate : false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">{t('admin.category')}</Label>
                      <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.all_categories')}</SelectItem>
                          <SelectItem value="Kilo">{t('admin.category_kilo')}</SelectItem>
                          <SelectItem value="Pc">{t('admin.category_pc')}</SelectItem>
                          <SelectItem value="Tali">{t('admin.category_tali')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">{t('admin.status')}</Label>
                      <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                          <SelectItem value="available">{t('admin.available')}</SelectItem>
                          <SelectItem value="sold">{t('admin.sold')}</SelectItem>
                          <SelectItem value="partial">{t('admin.partial')}</SelectItem>
                          <SelectItem value="removed">{t('admin.removed')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{t('admin.members')}</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={selectAllMembers}
                            className="text-xs px-2 py-1 h-6"
                          >
                            {t('admin.select_all_max_five')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={deselectAllMembers}
                            className="text-xs px-2 py-1 h-6"
                          >
                            {t('ui.clear')}
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                        {members.length > 0 ? (
                          <div className="space-y-1">
                            {members.map((member) => {
                              const isSelected = localFilters.member_ids.includes(member.id.toString());
                              const isDisabled = !isSelected && localFilters.member_ids.length >= 5;

                              return (
                                <div
                                  key={member.id}
                                  className={`flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors ${isDisabled ? 'opacity-50' : ''
                                    }`}
                                >
                                  <Checkbox
                                    id={`member-${member.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleMemberToggle(member.id.toString())}
                                    disabled={isDisabled}
                                    className="border-border"
                                  />
                                  <Label
                                    htmlFor={`member-${member.id}`}
                                    className={`text-sm font-normal cursor-pointer flex-1 truncate ${isDisabled ? 'cursor-not-allowed' : ''
                                      }`}
                                  >
                                    {member.name}
                                  </Label>
                                </div>
                              );
                            })}
                            {localFilters.member_ids.length >= 5 && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                {t('admin.maximum_five_members_selected')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('admin.no_members_available')}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_type" className="text-sm font-medium">{t('admin.product_type')}</Label>
                      <Select value={localFilters.product_type} onValueChange={(value) => handleFilterChange('product_type', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.all_types')}</SelectItem>
                          {productTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min_quantity" className="text-sm font-medium">{t('admin.min_quantity')}</Label>
                      <Input
                        id="min_quantity"
                        type="number"
                        placeholder={t('admin.minimum')}
                        value={localFilters.min_quantity || ''}
                        onChange={(e) => handleFilterChange('min_quantity', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_quantity" className="text-sm font-medium">{t('admin.max_quantity')}</Label>
                      <Input
                        id="max_quantity"
                        type="number"
                        placeholder={t('admin.maximum')}
                        value={localFilters.max_quantity || ''}
                        onChange={(e) => handleFilterChange('max_quantity', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
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

          {/* Stocks List */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{t('admin.stock_report')} ({stocks.length} {t('admin.items')})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {stocks.length > 0 ? t('admin.showing_stock_items_count', { count: stocks.length }) : t('admin.no_items_found')}
                  </div>
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stocks.length > 0 ? (
                <>
                  {currentView === 'cards' ? (
                    <div className="space-y-4">
                      {paginatedStocks.map((stock) => (
                        <StockCard key={stock.id} stock={stock} />
                      ))}
                    </div>
                  ) : (
                    <StockTable stocks={paginatedStocks} />
                  )}

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={stocks.length}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_stocks_found')}</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters()
                        ? t('admin.no_stocks_match_filters')
                        : t('admin.no_stock_data_for_period')
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4">
                        {t('admin.clear_filters')}
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

function StockCard({ stock }: { stock: Stock }) {
  const t = useTranslation();
  const getStatusBadge = (stock: Stock) => {
    if (stock.removed_at) {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.removed')}</Badge>;
    } else if (stock.quantity == 0) {
      return <Badge variant="default" className="bg-secondary/10 text-secondary border-secondary/20">{t('admin.sold')}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('admin.available')}</Badge>;
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
              <CardTitle className="text-lg text-foreground">{t('admin.stock_id_label', { id: stock.id })}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('admin.created_on', { date: dayjs(stock.created_at).format('MMM DD, YYYY HH:mm') })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(stock)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('admin.product_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.name')}:</span>
                <span className="text-muted-foreground ml-2">{stock.product.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.type')}:</span>
                <span className="text-muted-foreground ml-2">{stock.product.produce_type}</span>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.category')}:</span>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              {t('admin.stock_details')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.quantity')}:</span>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {t('admin.quantity_units', { quantity: stock.quantity })}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.member')}:</span>
                <span className="text-muted-foreground ml-2">{stock.member.name}</span>
              </p>
              {stock.member.contact_number && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.contact_number')}:</span>
                  <span className="text-muted-foreground ml-2">{stock.member.contact_number}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {stock.removed_at && (
          <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-destructive flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              {t('admin.removed')}
            </h5>
            <p className="text-sm text-destructive">
              {dayjs(stock.removed_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
        )}

        {stock.notes && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              {t('admin.notes')}
            </h5>
            <p className="text-sm text-muted-foreground">{stock.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: PaginationControlsProps) {
  const t = useTranslation();

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-8 p-4 bg-card border border-border rounded-xl shadow-sm relative">
      <span className="text-sm text-muted-foreground font-medium whitespace-nowrap absolute left-4 top-1/2 transform -translate-y-1/2">
        {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} {t('admin.of')} {totalItems}
      </span>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.5rem]"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('ui.previous')}
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[2.5rem] h-[2.5rem] p-0 border border-border rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${currentPage === page
                    ? 'bg-background text-foreground border-foreground font-semibold'
                    : 'bg-background text-foreground hover:bg-muted hover:border-border hover:text-foreground'
                    }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.5rem]"
        >
          {t('ui.next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StockTable({ stocks }: { stocks: Stock[] }) {
  const t = useTranslation();
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Sort stocks
  const sortedStocks = [...stocks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'product_name':
        comparison = a.product.name.localeCompare(b.product.name);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'member_name':
        comparison = a.member.name.localeCompare(b.member.name);
        break;
      case 'status':
        const statusA = a.removed_at ? 'removed' : (a.quantity === 0 ? 'sold' : 'available');
        const statusB = b.removed_at ? 'removed' : (b.quantity === 0 ? 'sold' : 'available');
        comparison = statusA.localeCompare(statusB);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (stock: Stock) => {
    if (stock.removed_at) {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.removed')}</Badge>;
    } else if (stock.quantity == 0) {
      return <Badge variant="default" className="bg-secondary/10 text-secondary border-secondary/20">{t('admin.sold')}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('admin.available')}</Badge>;
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
                {t('admin.stock_id')}
                {getSortIcon('id')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('product_name')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.product')}
                {getSortIcon('product_name')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('quantity')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.quantity')}
                {getSortIcon('quantity')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('category')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.category')}
                {getSortIcon('category')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('member_name')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.member')}
                {getSortIcon('member_name')}
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
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
              >
                {t('admin.created')}
                {getSortIcon('created_at')}
              </Button>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('admin.notes')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedStocks.map((stock, index) => (
            <tr key={stock.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  #{stock.id}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{stock.product.name}</div>
                  <div className="text-sm text-muted-foreground">{stock.product.produce_type}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {t('admin.quantity_units', { quantity: stock.quantity })}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{stock.member.name}</div>
                  <div className="text-sm text-muted-foreground">{stock.member.email}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(stock)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {dayjs(stock.created_at).format('MMM DD, YYYY')}
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  {stock.notes ? (
                    <p className="text-sm text-muted-foreground truncate" title={stock.notes}>
                      {stock.notes}
                    </p>
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

