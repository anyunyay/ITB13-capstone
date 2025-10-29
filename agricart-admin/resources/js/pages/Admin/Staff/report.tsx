import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Download, FileText, Search, Filter, X, LayoutGrid, Table, ChevronDown, CalendarIcon, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState } from 'react';
import { ViewToggle } from '@/components/inventory/view-toggle';

interface Permission {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  created_at: string;
  email_verified_at?: string;
  permissions: Permission[];
}

interface ReportSummary {
  total_staff: number;
  active_staff: number;
  staff_with_permissions: number;
  total_permissions: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
  search?: string;
}

interface ReportPageProps {
  staff: Staff[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function StaffReport({ staff, summary, filters }: ReportPageProps) {
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
    if (localFilters.search) params.search = localFilters.search;
    
    router.get(route('admin.staff.report'), params);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.search) params.append('search', localFilters.search);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('admin.staff.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `staff_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('admin.staff.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.status !== 'all') displayParams.append('status', localFilters.status);
      if (localFilters.search) displayParams.append('search', localFilters.search);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.staff.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `staff_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  const getStatusBadge = (staff: Staff) => {
    if (staff.email_verified_at) {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>;
    }
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      status: 'all',
      search: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date || 
           localFilters.status !== 'all' || localFilters.search;
  };

  return (
    <AppSidebarLayout>
      <Head title="Staff Report" />
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
                  <h1 className="text-3xl font-bold text-foreground">Staff Report</h1>
                  <p className="text-muted-foreground mt-1">
                    Generate comprehensive staff reports and analytics
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary.total_staff}</div>
                <p className="text-xs text-muted-foreground mt-1">All staff members</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summary.active_staff}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified accounts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">With Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{summary.staff_with_permissions}</div>
                <p className="text-xs text-muted-foreground mt-1">Have assigned permissions</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{summary.total_permissions}</div>
                <p className="text-xs text-muted-foreground mt-1">Available permissions</p>
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
                      <CardTitle className="text-xl">Advanced Filters</CardTitle>
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
                        placeholder="Search staff by name, email, or permissions..."
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
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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

          {/* Staff List */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Staff Report ({staff.length} members)</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {staff.length > 0 ? `Showing ${staff.length} staff members` : 'No members found'}
                  </div>
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <>
                  {currentView === 'cards' ? (
                    <div className="space-y-4">
                      {staff.map((member) => (
                        <StaffCard key={member.id} staff={member} />
                      ))}
                    </div>
                  ) : (
                    <StaffTable staff={staff} />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No staff found</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters() 
                        ? 'No staff match your current filter criteria. Try adjusting your filters to see more results.'
                        : 'No staff data available for the selected time period.'
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

function StaffCard({ staff }: { staff: Staff }) {
  const getStatusBadge = (staff: Staff) => {
    if (staff.email_verified_at) {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>;
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
              <CardTitle className="text-lg text-foreground">{staff.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Staff ID: #{staff.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(staff)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Contact Information
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">Email:</span> 
                <span className="text-muted-foreground ml-2">{staff.email}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">Contact:</span> 
                <span className="text-muted-foreground ml-2">{staff.contact_number || 'N/A'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">Created:</span> 
                <span className="text-muted-foreground ml-2">{dayjs(staff.created_at).format('MMM DD, YYYY')}</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Permissions ({staff.permissions.length})
            </h4>
            <div className="space-y-2">
              {staff.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {staff.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                      {permission.name}
                    </Badge>
                  ))}
                  {staff.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-muted/20">
                      +{staff.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No permissions assigned</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StaffTable({ staff }: { staff: Staff[] }) {
  const getStatusBadge = (staff: Staff) => {
    if (staff.email_verified_at) {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-center py-3 px-4 font-semibold text-foreground">Staff ID</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Name</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Email</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Contact</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Permissions</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Created</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member, index) => (
            <tr key={member.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  #{member.id}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-foreground">{member.name}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground">{member.email}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-muted-foreground">{member.contact_number || 'N/A'}</div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  {member.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.slice(0, 2).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                          {permission.name}
                        </Badge>
                      ))}
                      {member.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-muted/20">
                          +{member.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(member)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {dayjs(member.created_at).format('MMM DD, YYYY')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}