import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, FileText, Filter, X, ChevronDown, CalendarIcon, DollarSign, ShoppingCart, TrendingUp, Users, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { PaginationControls } from '@/components/inventory/pagination-controls';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  coop_share: number;
  member_share: number;
  cogs: number;
  gross_profit: number;
  created_at: string;
  delivered_at?: string;
  admin?: {
    name: string;
    id: number;
  };
  logistic?: {
    name: string;
    id: number;
  };
}

interface ReportSummary {
  total_revenue: number;
  total_coop_share: number;
  total_member_share: number;
  total_cogs: number;
  total_gross_profit: number;
  total_orders: number;
  average_order_value: number;
  average_coop_share: number;
  total_customers: number;
}


interface ReportFilters {
  start_date?: string;
  end_date?: string;
  min_amount?: string;
  max_amount?: string;
  search?: string;
}

interface ReportPageProps {
  sales: Sale[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function SalesReport({ sales, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (localFilters.min_amount) params.min_amount = localFilters.min_amount;
    if (localFilters.max_amount) params.max_amount = localFilters.max_amount;
    if (localFilters.search) params.search = localFilters.search;

    router.get(route('admin.sales.report'), params);
  };

  const exportReport = (format: 'csv' | 'pdf', exportType: 'sales' | 'members' = 'sales') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.min_amount) params.append('min_amount', localFilters.min_amount);
    if (localFilters.max_amount) params.append('max_amount', localFilters.max_amount);
    if (localFilters.search) params.append('search', localFilters.search);
    params.append('format', format);
    params.append('export_type', exportType);
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);

    const filename = exportType === 'members' ? 'member_sales_report' : 'sales_report';

    if (format === 'csv') {
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;

      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.min_amount) displayParams.append('min_amount', localFilters.min_amount);
      if (localFilters.max_amount) displayParams.append('max_amount', localFilters.max_amount);
      if (localFilters.search) displayParams.append('search', localFilters.search);
      displayParams.append('format', format);
      displayParams.append('export_type', exportType);
      displayParams.append('sort_by', sortBy);
      displayParams.append('sort_order', sortOrder);
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.sales.report')}?${displayParams.toString()}`;

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      search: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.min_amount || localFilters.max_amount ||
      localFilters.search;
  };

  // Helper to get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ?
      <ArrowUp className="h-4 w-4 ml-1" /> :
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Sort sales data
  const sortedSales = [...sales].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'total_amount':
        comparison = a.total_amount - b.total_amount;
        break;
      case 'coop_share':
        comparison = (a.coop_share || 0) - (b.coop_share || 0);
        break;
      case 'member_share':
        comparison = a.member_share - b.member_share;
        break;
      case 'cogs':
        comparison = a.cogs - b.cogs;
        break;
      case 'gross_profit':
        comparison = a.gross_profit - b.gross_profit;
        break;
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'delivered_at':
        comparison = new Date(a.delivered_at || 0).getTime() - new Date(b.delivered_at || 0).getTime();
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  return (
    <AppLayout>
      <Head title={t('admin.sales_report')} />
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
                  <h1 className="text-3xl font-bold text-foreground">{t('admin.sales_report_page_title')}</h1>
                  <p className="text-muted-foreground mt-1">
                    {t('admin.generate_comprehensive_sales_reports')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => exportReport('csv', 'sales')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('admin.export_csv')}
                </Button>
                <Button onClick={() => exportReport('pdf', 'sales')} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('admin.export_pdf')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('admin.total_revenue_label')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_revenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.from_orders', { orders: summary.total_orders })}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('admin.coop_share_percent')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_coop_share).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.coop_share_10_percent')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('admin.revenue_100_percent')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₱{Number(summary.total_member_share).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.full_product_revenue')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {t('admin.total_orders_label')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.unique_customers')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('admin.cogs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₱{Number(summary.total_cogs).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.cost_of_goods_sold')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('admin.gross_profit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_gross_profit).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.revenue_minus_cogs')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.average_order_value_label')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₱{Number(summary.average_order_value).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.per_order')}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.total_customers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{summary.total_customers}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.unique_buyers')}</p>
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
                        placeholder={t('admin.search_by_customer_sale_id')}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
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
                      <Label className="text-sm font-medium">Min Amount (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Minimum"
                        value={localFilters.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Max Amount (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Maximum"
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

          {/* Sales Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{t('admin.sales_report_transactions', { count: sales.length })}</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length > 0 ? (
                <div className="rounded-md border">
                  <Table className="w-full border-collapse text-sm">
                    <TableHeader className="bg-muted/50 border-b-2">
                      <TableRow>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('id')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.id_column')}
                            {getSortIcon('id')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('customer')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.customer')}
                            {getSortIcon('customer')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('total_amount')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.total_amount')}
                            {getSortIcon('total_amount')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('coop_share')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.coop_share')}
                            {getSortIcon('coop_share')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('member_share')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.revenue_column')}
                            {getSortIcon('member_share')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('cogs')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.cogs')}
                            {getSortIcon('cogs')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('gross_profit')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.gross_profit')}
                            {getSortIcon('gross_profit')}
                          </button>
                        </TableHead>
                        <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                          <button onClick={() => handleSort('delivered_at')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
                            {t('admin.delivered_date')}
                            {getSortIcon('delivered_at')}
                          </button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSales.map((sale) => (
                        <TableRow key={sale.id} className="border-b transition-all hover:bg-muted/20">
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[100px] text-center">
                                <Badge variant="outline" className="font-mono">#{sale.id}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[180px] text-left">
                                <div className="font-medium text-sm">{sale.customer.name}</div>
                                <div className="text-xs text-muted-foreground">{sale.customer.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold text-sm">₱{Number(sale.total_amount).toFixed(2)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold text-sm text-green-600">₱{Number(sale.coop_share || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold text-sm text-blue-600">₱{Number(sale.member_share || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold text-sm text-orange-600">₱{Number(sale.cogs || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold text-sm text-green-600">₱{Number(sale.gross_profit || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 align-top border-b">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                              <div className="w-full max-w-[150px] text-left">
                                <div className="text-sm">{sale.delivered_at ? dayjs(sale.delivered_at).format('MMM DD, YYYY') : 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{sale.delivered_at ? dayjs(sale.delivered_at).format('HH:mm') : ''}</div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedSales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground p-8">
                            No sales found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={sortedSales.length}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No sales found</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters()
                        ? 'No sales match your current filter criteria. Try adjusting your filters to see more results.'
                        : 'No sales data available for the selected time period.'
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
    </AppLayout>
  );
}


