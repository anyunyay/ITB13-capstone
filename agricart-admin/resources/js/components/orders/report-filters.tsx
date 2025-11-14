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
import { Search, Filter, X, ChevronDown, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from '@/hooks/use-translation';
import { ReportFilters as ReportFiltersType, Logistic, AdminStaff } from '@/types/order-report';
import React from 'react';

interface ReportFiltersProps {
  localFilters: ReportFiltersType;
  setLocalFilters: React.Dispatch<React.SetStateAction<ReportFiltersType>>;
  logistics: Logistic[];
  admins: AdminStaff[];
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ReportFilters({
  localFilters, setLocalFilters, logistics, admins, filtersOpen, setFiltersOpen,
  startDate, endDate, setStartDate, setEndDate, onApply, onClear, hasActiveFilters
}: ReportFiltersProps) {
  const t = useTranslation();
  const [logisticSearch, setLogisticSearch] = React.useState('');
  const [adminSearch, setAdminSearch] = React.useState('');
  const [logisticPage, setLogisticPage] = React.useState(1);
  const [adminPage, setAdminPage] = React.useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (key: keyof ReportFiltersType, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

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

  // Filtered logistics
  const filteredLogistics = React.useMemo(() => {
    if (!logisticSearch.trim()) return logistics;
    return logistics.filter(logistic =>
      logistic.name.toLowerCase().includes(logisticSearch.toLowerCase())
    );
  }, [logistics, logisticSearch]);

  // Filtered admins
  const filteredAdmins = React.useMemo(() => {
    if (!adminSearch.trim()) return admins;
    return admins.filter(admin =>
      admin.name.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [admins, adminSearch]);

  // Select all logistics
  const allFilteredLogisticsSelected = React.useMemo(() => {
    if (filteredLogistics.length === 0) return false;
    const filteredLogisticIds = filteredLogistics.map(l => l.id.toString());
    return filteredLogisticIds.every(id => localFilters.logistic_ids.includes(id));
  }, [filteredLogistics, localFilters.logistic_ids]);

  const toggleSelectAllLogistics = () => {
    if (allFilteredLogisticsSelected) {
      const filteredLogisticIds = filteredLogistics.map(l => l.id.toString());
      setLocalFilters(prev => ({
        ...prev,
        logistic_ids: prev.logistic_ids.filter(id => !filteredLogisticIds.includes(id))
      }));
    } else {
      const allLogisticIds = filteredLogistics.map(logistic => logistic.id.toString());
      setLocalFilters(prev => ({
        ...prev,
        logistic_ids: Array.from(new Set([...prev.logistic_ids, ...allLogisticIds]))
      }));
    }
  };

  const deselectAllLogistics = () => {
    setLocalFilters(prev => ({ ...prev, logistic_ids: [] }));
  };

  // Select all admins
  const allFilteredAdminsSelected = React.useMemo(() => {
    if (filteredAdmins.length === 0) return false;
    const filteredAdminIds = filteredAdmins.map(a => a.id.toString());
    return filteredAdminIds.every(id => localFilters.admin_ids.includes(id));
  }, [filteredAdmins, localFilters.admin_ids]);

  const toggleSelectAllAdmins = () => {
    if (allFilteredAdminsSelected) {
      const filteredAdminIds = filteredAdmins.map(a => a.id.toString());
      setLocalFilters(prev => ({
        ...prev,
        admin_ids: prev.admin_ids.filter(id => !filteredAdminIds.includes(id))
      }));
    } else {
      const allAdminIds = filteredAdmins.map(admin => admin.id.toString());
      setLocalFilters(prev => ({
        ...prev,
        admin_ids: Array.from(new Set([...prev.admin_ids, ...allAdminIds]))
      }));
    }
  };

  const deselectAllAdmins = () => {
    setLocalFilters(prev => ({ ...prev, admin_ids: [] }));
  };

  // Pagination
  const logisticTotalPages = Math.ceil(filteredLogistics.length / itemsPerPage);
  const adminTotalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const paginatedLogistics = React.useMemo(() => {
    const startIndex = (logisticPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogistics.slice(startIndex, endIndex);
  }, [filteredLogistics, logisticPage, itemsPerPage]);

  const paginatedAdmins = React.useMemo(() => {
    const startIndex = (adminPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAdmins.slice(startIndex, endIndex);
  }, [filteredAdmins, adminPage, itemsPerPage]);

  React.useEffect(() => {
    setLogisticPage(1);
  }, [logisticSearch]);

  React.useEffect(() => {
    setAdminPage(1);
  }, [adminSearch]);

  return (
    <Card className="shadow-sm">
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-base lg:text-xl truncate">{t('admin.advanced_filters')}</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs flex-shrink-0">
                    {t('admin.active')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {hasActiveFilters && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear();
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{t('admin.clear_filters')}</span>
                    <span className="sm:hidden">{t('ui.clear')}</span>
                  </Button>
                )}
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform flex-shrink-0 ${filtersOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className='pt-4'>
            {/* Search Bar */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none" />
                <Input
                  placeholder={t('admin.search_orders_placeholder')}
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] text-xs sm:text-sm h-9 sm:h-10 md:h-11 w-full"
                />
              </div>
            </div>

            {/* Date Range Summary */}
            {(startDate || endDate) && (
              <div className="mb-3 sm:mb-4 md:mb-6 p-2.5 sm:p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-primary mb-1 sm:mb-1.5 text-xs sm:text-sm md:text-base">{t('admin.selected_date_range')}</h4>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-words leading-relaxed">{getDateRangeDisplay()}</p>
                    {getDurationDisplay() && (
                      <p className="text-[10px] sm:text-xs text-primary/70 mt-1 sm:mt-1.5">
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
                      setLocalFilters(prev => ({ ...prev, start_date: '', end_date: '' }));
                    }}
                    className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 self-start md:self-auto flex-shrink-0 w-full sm:w-auto"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    {t('ui.clear')}
                  </Button>
                </div>
              </div>
            )}

            {/* Filter Grid - Date, Status, Delivery Status, Min/Max Amount */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="space-y-2">
                <Label className="text-sm lg:text-base font-medium block">{t('admin.start_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
                      <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{startDate ? formatInTimeZone(startDate, 'Asia/Manila', "MMM dd, yyyy") : t('admin.pick_start_date')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
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
                <Label className="text-sm lg:text-base font-medium block">{t('admin.end_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
                      <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{endDate ? formatInTimeZone(endDate, 'Asia/Manila', "MMM dd, yyyy") : t('admin.pick_end_date')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
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
                <Label htmlFor="min_amount" className="text-sm lg:text-base font-medium block">{t('admin.min_amount')}</Label>
                <Input
                  id="min_amount"
                  type="number"
                  placeholder={t('admin.minimum_amount')}
                  value={localFilters.min_amount || ''}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount" className="text-sm lg:text-base font-medium block">{t('admin.max_amount')}</Label>
                <Input
                  id="max_amount"
                  type="number"
                  placeholder={t('admin.maximum_amount')}
                  value={localFilters.max_amount || ''}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                  className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                />
              </div>
            </div>

            {/* Status and Delivery Status - Mobile: 2 columns, Desktop: 2 columns */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm lg:text-base font-medium block">{t('admin.status')}</Label>
                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
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
                <Label htmlFor="delivery_status" className="text-sm lg:text-base font-medium block">{t('admin.delivery_status')}</Label>
                <Select value={localFilters.delivery_status} onValueChange={(value) => handleFilterChange('delivery_status', value)}>
                  <SelectTrigger id="delivery_status" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
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
            </div>

            {/* Mobile: Logistics Section (Full Width) */}
            <div className="lg:hidden mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm lg:text-base font-medium flex-shrink-0">{t('admin.logistics')}</Label>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant={allFilteredLogisticsSelected ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSelectAllLogistics}
                      className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7 whitespace-nowrap transition-colors ${allFilteredLogisticsSelected
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                        }`}
                    >
                      {allFilteredLogisticsSelected
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllLogistics} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_logistics') || 'Search logistics...'}
                    value={logisticSearch}
                    onChange={(e) => setLogisticSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {logisticSearch && (
                    <button
                      onClick={() => setLogisticSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {logistics.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredLogistics.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedLogistics.map((logistic) => {
                              const isSelected = localFilters.logistic_ids.includes(logistic.id.toString());
                              return (
                                <div key={logistic.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`logistic-mobile-${logistic.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleLogisticToggle(logistic.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`logistic-mobile-${logistic.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {logistic.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_logistics_found') || 'No logistics found'}
                            </p>
                          </div>
                        )}
                      </div>
                      {filteredLogistics.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLogisticPage(prev => Math.max(1, prev - 1))}
                                disabled={logisticPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {logisticPage} / {logisticTotalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLogisticPage(prev => Math.min(logisticTotalPages, prev + 1))}
                                disabled={logisticPage === logisticTotalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.logistic_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.logistic_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_logistics_available') || 'No logistics available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Admins Section (Full Width) */}
            <div className="lg:hidden mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm lg:text-base font-medium flex-shrink-0">{t('admin.processed_by')}</Label>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant={allFilteredAdminsSelected ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSelectAllAdmins}
                      className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7 whitespace-nowrap transition-colors ${allFilteredAdminsSelected
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                        }`}
                    >
                      {allFilteredAdminsSelected
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllAdmins} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_admins') || 'Search admins...'}
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {admins.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredAdmins.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedAdmins.map((admin) => {
                              const isSelected = localFilters.admin_ids.includes(admin.id.toString());
                              return (
                                <div key={admin.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`admin-mobile-${admin.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleAdminToggle(admin.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`admin-mobile-${admin.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {admin.name}
                                  </Label>
                                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 flex-shrink-0">
                                    {admin.type}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_admins_found') || 'No admins found'}
                            </p>
                          </div>
                        )}
                      </div>
                      {filteredAdmins.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminPage(prev => Math.max(1, prev - 1))}
                                disabled={adminPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {adminPage} / {adminTotalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminPage(prev => Math.min(adminTotalPages, prev + 1))}
                                disabled={adminPage === adminTotalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.admin_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.admin_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_admins_available') || 'No admins available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: Logistics and Admins side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 mb-6">
              {/* Logistics Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-base font-medium flex-shrink-0">{t('admin.logistics')}</Label>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant={allFilteredLogisticsSelected ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSelectAllLogistics}
                      className={`text-sm px-2.5 py-1 h-7 whitespace-nowrap transition-colors ${allFilteredLogisticsSelected
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                        }`}
                    >
                      {allFilteredLogisticsSelected
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllLogistics} className="text-sm px-2.5 py-1 h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_logistics') || 'Search logistics...'}
                    value={logisticSearch}
                    onChange={(e) => setLogisticSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {logisticSearch && (
                    <button
                      onClick={() => setLogisticSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {logistics.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredLogistics.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedLogistics.map((logistic) => {
                              const isSelected = localFilters.logistic_ids.includes(logistic.id.toString());
                              return (
                                <div key={logistic.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`logistic-${logistic.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleLogisticToggle(logistic.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`logistic-${logistic.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {logistic.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_logistics_found') || 'No logistics found'}
                            </p>
                          </div>
                        )}
                      </div>

                      {filteredLogistics.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLogisticPage(prev => Math.max(1, prev - 1))}
                                disabled={logisticPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {logisticPage} / {logisticTotalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLogisticPage(prev => Math.min(logisticTotalPages, prev + 1))}
                                disabled={logisticPage === logisticTotalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.logistic_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.logistic_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_logistics_available') || 'No logistics available'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admins Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-base font-medium flex-shrink-0">{t('admin.processed_by')}</Label>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant={allFilteredAdminsSelected ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSelectAllAdmins}
                      className={`text-sm px-2.5 py-1 h-7 whitespace-nowrap transition-colors ${allFilteredAdminsSelected
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                        }`}
                    >
                      {allFilteredAdminsSelected
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllAdmins} className="text-sm px-2.5 py-1 h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_admins') || 'Search admins...'}
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {admins.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredAdmins.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedAdmins.map((admin) => {
                              const isSelected = localFilters.admin_ids.includes(admin.id.toString());
                              return (
                                <div key={admin.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`admin-${admin.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleAdminToggle(admin.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`admin-${admin.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {admin.name}
                                  </Label>
                                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 flex-shrink-0">
                                    {admin.type}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_admins_found') || 'No admins found'}
                            </p>
                          </div>
                        )}
                      </div>

                      {filteredAdmins.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminPage(prev => Math.max(1, prev - 1))}
                                disabled={adminPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {adminPage} / {adminTotalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminPage(prev => Math.min(adminTotalPages, prev + 1))}
                                disabled={adminPage === adminTotalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.admin_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.admin_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_admins_available') || 'No admins available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={onApply} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                {t('admin.apply_filters') || 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
