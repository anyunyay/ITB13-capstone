import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Download, FileText, Filter, X, ChevronDown, CalendarIcon, UserCheck, Clock, UserPlus, Search, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useTranslation } from '@/hooks/use-translation';
import { PaginationControls } from '@/components/inventory/pagination-controls';
import { BaseTable } from '@/components/common/base-table';
import { createMembershipReportTableColumns, MembershipReportMobileCard } from '@/components/membership/membership-report-table-columns';

interface Member {
  id: number;
  member_id?: string;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  registration_date?: string;
  document?: string;
  email_verified_at?: string;
  created_at: string;
}

interface ReportSummary {
  total_members: number;
  active_members: number;
  pending_verification: number;
  recent_registrations: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  search?: string;
}

interface ReportPageProps {
  members: Member[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function MembershipReport({ members, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 5 : 10;

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
    if (localFilters.search) params.search = localFilters.search;
    params.sort_by = sortBy;
    params.sort_order = sortOrder;

    router.get(route('membership.report'), params);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      search: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date ||
      localFilters.search;
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

  // Create column definitions
  const columns = useMemo(() => createMembershipReportTableColumns(t), [t]);

  // Sort members data
  const sortedMembers = [...members].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'member_id':
        comparison = (a.member_id || '').localeCompare(b.member_id || '');
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'registration_date':
        const dateA = a.registration_date ? new Date(a.registration_date).getTime() : 0;
        const dateB = b.registration_date ? new Date(b.registration_date).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.search) params.append('search', localFilters.search);
    params.append('format', format);
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);

    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('membership.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `membership_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('membership.report')}?${params.toString()}`;

      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.search) displayParams.append('search', localFilters.search);
      displayParams.append('format', format);
      displayParams.append('sort_by', sortBy);
      displayParams.append('sort_order', sortOrder);
      displayParams.append('display', 'true');
      const displayUrl = `${route('membership.report')}?${displayParams.toString()}`;

      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `membership_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
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
      permission="generate membership report"
      pageTitle={t('admin.access_denied')}
    >
      <AppSidebarLayout>
        <Head title={t('admin.membership_report')} />
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
                  <h1 className="text-lg font-bold text-foreground truncate">{t('admin.membership_report')}</h1>
                </div>
                <Link href={route('admin.dashboard')}>
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
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('admin.membership_report')}</h1>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t('admin.membership_report_description')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={route('admin.dashboard')}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('admin.back_to_dashboard')}
                      </Button>
                    </Link>
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

              {/* Mobile Export Buttons */}
              <div className="flex md:hidden gap-2 mt-2">
                <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </Button>
                <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('admin.total_members')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{summary.total_members}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.all_registered_members')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {t('admin.active_members')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summary.active_members}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.verified_and_active')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('admin.pending_verification')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{summary.pending_verification}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.awaiting_verification')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('admin.recent_registrations_30d')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{summary.recent_registrations}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.new_registrations')}</p>
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
                          placeholder="Search by member name or ID..."
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

            {/* Members List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t('admin.members_report', { count: members.length })}</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <>
                    <BaseTable
                      data={paginatedMembers}
                      columns={columns}
                      keyExtractor={(member) => member.id}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                      renderMobileCard={(member) => <MembershipReportMobileCard member={member} t={t} />}
                    />
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={sortedMembers.length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_members_found')}</h3>
                      <p className="text-muted-foreground max-w-md">
                        {hasActiveFilters()
                          ? t('admin.no_members_match_filter')
                          : t('admin.no_membership_data_period')}
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