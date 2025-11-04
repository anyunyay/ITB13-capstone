import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Download, FileText, Filter, X, ChevronDown, CalendarIcon, UserCheck, UserX, Clock, UserPlus, Search, Phone, MapPin, FileImage, LayoutGrid, Table } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { SafeImage } from '@/lib/image-utils';
import { useTranslation } from '@/hooks/use-translation';

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
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  
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

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.search) params.append('search', localFilters.search);
    params.append('format', format);
    
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
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('admin.membership_report')}</h1>
                    <p className="text-muted-foreground mt-1">{t('admin.membership_report_description')}</p>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t('admin.members_report', {count: members.length})}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {members.length > 0 ? t('admin.showing_members', {count: members.length}) : t('admin.no_members_found')}
                    </div>
                    <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <>
                    {currentView === 'cards' ? (
                      <div className="space-y-4">
                        {members.map((member) => (
                          <MemberCard key={member.id} member={member} />
                        ))}
                      </div>
                    ) : (
                      <MemberTable members={members} />
                    )}
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

function MemberCard({ member }: { member: Member }) {
  const t = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('admin.member_with_id', {id: member.id})}</CardTitle>
            {member.member_id && (
              <p className="text-sm text-blue-600 font-mono font-semibold">
                {t('admin.member_id')}: <span className="font-mono text-blue-600 font-semibold">{member.member_id}</span>
              </p>
            )}
            <p className="text-sm text-gray-500">
              {dayjs(member.created_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <h4 className="font-semibold mb-2">{t('admin.member_information')}</h4>
            {member.member_id && (
              <p className="text-sm">
                {t('admin.member_id')}: <span className="font-mono text-blue-600 font-semibold">{member.member_id}</span>
              </p>
            )}
            <p className="text-sm">
              {t('admin.name')}: {member.name}
            </p>
            {member.contact_number && (
              <p className="text-sm">
                {t('admin.contact_number')}: {member.contact_number}
              </p>
            )}
            {member.address && (
              <p className="text-sm">
                {t('admin.address')}: {member.address}
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t('admin.registration_details')}</h4>
            <p className="text-sm">
              {t('admin.registration_date_label')}: {member.registration_date ? dayjs(member.registration_date).format('MMM DD, YYYY') : t('admin.not_assigned')}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">{t('admin.document')}</h4>
          <div className="flex justify-center">
            <SafeImage 
              src={member.document} 
              alt={`Document for ${member.name}`}
              className="max-w-xs max-h-32 object-contain border rounded"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ViewToggle Component
function ViewToggle({ currentView, onViewChange }: { currentView: 'cards' | 'table'; onViewChange: (view: 'cards' | 'table') => void }) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border">
      <Button
        variant={currentView === 'cards' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}

// MemberTable Component
function MemberTable({ members }: { members: Member[] }) {
  const t = useTranslation();
  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <UserCheck className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('admin.member_id')}</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('admin.name')}</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('admin.contact_number')}</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('admin.address')}</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('admin.registration_date_label')}</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                {member.member_id ? (
                  <span className="font-mono text-blue-600 font-semibold">{member.member_id}</span>
                ) : (
                  <span className="text-muted-foreground">{t('admin.not_assigned')}</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-foreground">{member.name}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground">
                  {member.contact_number || t('admin.not_assigned')}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                  {member.address || t('admin.not_assigned')}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {member.registration_date ? dayjs(member.registration_date).format('MMM DD, YYYY') : t('admin.not_assigned')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 