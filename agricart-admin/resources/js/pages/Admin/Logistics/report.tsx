import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, Link } from '@inertiajs/react';
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
import { BarChart3, Download, FileText, Search, Filter, X, ChevronDown, CalendarIcon, Users, UserCheck, UserX, UserPlus, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createLogisticsReportTableColumns, LogisticsReportMobileCard } from '@/components/logistics/logistics-report-table-columns';

interface Logistic {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  registration_date?: string;
  email_verified_at?: string;
  created_at: string;
}

interface ReportSummary {
  total_logistics: number;
  active_logistics: number;
  pending_verification: number;
  recent_registrations: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  verification_status: string;
  search?: string;
}

interface ReportPageProps {
  logistics: Logistic[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function LogisticReport({ logistics, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  // Ensure filters are properly normalized
  const normalizedFilters: ReportFilters = {
    ...filters,
    verification_status: filters.verification_status || 'all',
    search: filters.search || ''
  };
  
  const [localFilters, setLocalFilters] = useState<ReportFilters>(normalizedFilters);
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
    if (!startDate && !endDate) return t('admin.no_date_range_selected');
    if (startDate && !endDate) return t('admin.from_date_format', { date: format(startDate, 'MMM dd, yyyy') });
    if (!startDate && endDate) return t('admin.until_date_format', { date: format(endDate, 'MMM dd, yyyy') });
    return t('admin.date_range_format', { 
      start: format(startDate!, 'MMM dd, yyyy'), 
      end: format(endDate!, 'MMM dd, yyyy') 
    });
  };

  const getDurationDisplay = () => {
    if (!startDate || !endDate) return '';
    const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    if (diffInDays === 1) return t('admin.one_day');
    if (diffInDays === 7) return t('admin.one_week');
    if (diffInDays === 30) return t('admin.one_month');
    if (diffInDays < 7) return `${diffInDays} ${t('admin.days')}`;
    if (diffInDays < 30) return `${Math.round(diffInDays / 7)} ${t('admin.weeks')}`;
    return `${Math.round(diffInDays / 30)} ${t('admin.months')}`;
  };

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.verification_status !== 'all') params.verification_status = localFilters.verification_status;
    if (localFilters.search) params.search = localFilters.search;
    
    router.get(route('logistics.report'), params);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      verification_status: 'all',
      search: ''
    });

    router.get(route('logistics.report'), {}, {
      preserveScroll: true,
      only: ['logistics', 'filters']
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date || 
           localFilters.verification_status !== 'all' || localFilters.search;
  };

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Create column definitions
  const logisticsColumns = useMemo(() => {
    return createLogisticsReportTableColumns(t);
  }, [t]);

  // Sort logistics
  const sortedLogistics = useMemo(() => {
    return [...logistics].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          const statusA = a.email_verified_at ? 'verified' : 'pending';
          const statusB = b.email_verified_at ? 'verified' : 'pending';
          comparison = statusA.localeCompare(statusB);
          break;
        case 'registration_date':
          const regDateA = a.registration_date ? new Date(a.registration_date).getTime() : 0;
          const regDateB = b.registration_date ? new Date(b.registration_date).getTime() : 0;
          comparison = regDateA - regDateB;
          break;
        case 'email_verified_at':
          const verifiedA = a.email_verified_at ? new Date(a.email_verified_at).getTime() : 0;
          const verifiedB = b.email_verified_at ? new Date(b.email_verified_at).getTime() : 0;
          comparison = verifiedA - verifiedB;
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [logistics, sortBy, sortOrder]);

  const exportReport = (format: 'csv' | 'pdf', sortByParam?: string, sortOrderParam?: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.verification_status !== 'all') params.append('verification_status', localFilters.verification_status);
    if (localFilters.search) params.append('search', localFilters.search);
    
    // Use the passed parameters or fall back to current state
    const finalSortBy = sortByParam || sortBy;
    const finalSortOrder = sortOrderParam || sortOrder;
    
    if (finalSortBy) params.append('sort_by', finalSortBy);
    if (finalSortOrder) params.append('sort_order', finalSortOrder);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('logistics.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `logistics_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('logistics.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.verification_status !== 'all') displayParams.append('verification_status', localFilters.verification_status);
      if (localFilters.search) displayParams.append('search', localFilters.search);
      if (finalSortBy) displayParams.append('sort_by', finalSortBy);
      if (finalSortOrder) displayParams.append('sort_order', finalSortOrder);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('logistics.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `logistics_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
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
    <PermissionGuard 
      permission="generate logistics report"
      pageTitle={t('admin.logistics_report_access_denied')}
    >
      <AppSidebarLayout>
        <Head title={t('admin.logistics_report')} />
        <div className="min-h-screen bg-background">
          <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
              {/* Mobile Layout */}
              <div className="flex md:hidden items-center gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <h1 className="text-lg font-bold text-foreground truncate">{t('admin.logistics_report')}</h1>
                </div>
                <Link href={route('logistics.index')}>
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
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('admin.logistics_report')}</h1>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t('admin.logistics_report_description')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={route('logistics.index')}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('admin.back_to_logistics')}
                      </Button>
                    </Link>
                    <Button onClick={() => exportReport('csv', sortBy, sortOrder)} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      {t('admin.export_csv')}
                    </Button>
                    <Button onClick={() => exportReport('pdf', sortBy, sortOrder)} variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('admin.export_pdf')}
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('admin.total_logistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{summary.total_logistics}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.all_registered_members')}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {t('admin.active_logistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{summary.active_logistics}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.verified_members')}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    {t('admin.pending_verification')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{summary.pending_verification}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.awaiting_verification')}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('admin.recent_registrations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{summary.recent_registrations}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.new_this_period')}</p>
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
                          placeholder={t('admin.search_logistics_members_placeholder')}
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
                              {startDate ? format(startDate, "MMM dd, yyyy") : t('admin.pick_start_date')}
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
                              {endDate ? format(endDate, "MMM dd, yyyy") : t('admin.pick_end_date')}
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
                        <Label htmlFor="verification_status" className="text-sm font-medium">{t('admin.verification_status')}</Label>
                        <Select value={localFilters.verification_status} onValueChange={(value) => handleFilterChange('verification_status', value)}>
                          <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                            <SelectItem value="verified">{t('admin.verified')}</SelectItem>
                            <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={applyFilters} className="w-full bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                          {t('admin.apply_filters')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Logistics List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t('admin.logistics_members_count', { count: logistics.length })}</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedLogistics.length > 0 ? (
                  <BaseTable
                    data={sortedLogistics}
                    columns={logisticsColumns}
                    keyExtractor={(logistic) => logistic.id}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    renderMobileCard={(logistic) => (
                      <LogisticsReportMobileCard logistic={logistic} t={t} />
                    )}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_logistics_members_found')}</h3>
                      <p className="text-muted-foreground max-w-md">
                        {hasActiveFilters() 
                          ? t('admin.no_logistics_match_filters')
                          : t('admin.no_logistics_data_period')
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
    </PermissionGuard>
  );
}

function LogisticCard({ logistic }: { logistic: Logistic }) {
  const t = useTranslation();
  
  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">{t('admin.verified')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.pending')}</Badge>;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{logistic.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('admin.member_id_format', { id: logistic.id })} • {dayjs(logistic.created_at).format('MMM DD, YYYY HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getVerificationBadge(!!logistic.email_verified_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('admin.contact_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.email')}:</span> 
                <span className="text-muted-foreground ml-2">{logistic.email}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.contact')}:</span> 
                <span className="text-muted-foreground ml-2">{logistic.contact_number || t('admin.not_available')}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.address')}:</span> 
                <span className="text-muted-foreground ml-2">{logistic.address || t('admin.not_available')}</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              {t('admin.registration_details')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.registration_date')}:</span> 
                <span className="text-muted-foreground ml-2">
                  {logistic.registration_date ? dayjs(logistic.registration_date).format('MMM DD, YYYY') : t('admin.not_available')}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.email_verified')}:</span> 
                <span className="text-muted-foreground ml-2">
                  {logistic.email_verified_at ? dayjs(logistic.email_verified_at).format('MMM DD, YYYY') : t('admin.not_verified')}
                </span>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.member_id')}:</span> 
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  #{logistic.id}
                </Badge>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LogisticTable({ logistics, sortBy, setSortBy, sortOrder, setSortOrder }: { 
  logistics: Logistic[];
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}) {
  const t = useTranslation();

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

  // Sort logistics
  const sortedLogistics = [...logistics].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        const statusA = a.email_verified_at ? 'verified' : 'pending';
        const statusB = b.email_verified_at ? 'verified' : 'pending';
        comparison = statusA.localeCompare(statusB);
        break;
      case 'registration_date':
        const regDateA = a.registration_date ? new Date(a.registration_date).getTime() : 0;
        const regDateB = b.registration_date ? new Date(b.registration_date).getTime() : 0;
        comparison = regDateA - regDateB;
        break;
      case 'email_verified_at':
        const verifiedA = a.email_verified_at ? new Date(a.email_verified_at).getTime() : 0;
        const verifiedB = b.email_verified_at ? new Date(b.email_verified_at).getTime() : 0;
        comparison = verifiedA - verifiedB;
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">{t('admin.verified')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.pending')}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('id')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                {t('admin.member_id')}
                {getSortIcon('id')}
              </Button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                {t('admin.name')}
                {getSortIcon('name')}
              </Button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              {t('admin.email')}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              {t('admin.contact')}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              {t('admin.address')}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                {t('admin.status')}
                {getSortIcon('status')}
              </Button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('registration_date')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                {t('admin.registration_date')}
                {getSortIcon('registration_date')}
              </Button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <Button
                variant="ghost"
                onClick={() => handleSort('email_verified_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
              >
                {t('admin.email_verified')}
                {getSortIcon('email_verified_at')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLogistics.map((logistic, index) => (
            <tr key={logistic.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  #{logistic.id}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-foreground">{logistic.name}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground">{logistic.email}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground">{logistic.contact_number || t('admin.not_available')}</div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate" title={logistic.address || t('admin.not_available')}>
                    {logistic.address || t('admin.not_available')}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4">
                {getVerificationBadge(!!logistic.email_verified_at)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {logistic.registration_date ? dayjs(logistic.registration_date).format('MMM DD, YYYY') : t('admin.not_available')}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {logistic.email_verified_at ? dayjs(logistic.email_verified_at).format('MMM DD, YYYY') : t('admin.not_verified')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 