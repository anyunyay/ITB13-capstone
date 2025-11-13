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
import { Filter, X, ChevronDown, CalendarIcon, Search, ChevronsUpDown } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';

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

interface ReportFiltersProps {
  localFilters: ReportFilters;
  setLocalFilters: (filters: ReportFilters | ((prev: ReportFilters) => ReportFilters)) => void;
  logistics: Logistic[];
  admins: AdminStaff[];
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  logisticsOpen: boolean;
  setLogisticsOpen: (open: boolean) => void;
  adminsOpen: boolean;
  setAdminsOpen: (open: boolean) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ReportFilters({
  localFilters,
  setLocalFilters,
  logistics,
  admins,
  filtersOpen,
  setFiltersOpen,
  logisticsOpen,
  setLogisticsOpen,
  adminsOpen,
  setAdminsOpen,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
  onClear,
  hasActiveFilters
}: ReportFiltersProps) {
  const t = useTranslation();

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
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

  return (
    <Card className="shadow-sm">
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{t('admin.advanced_filters')}</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {t('admin.active')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button onClick={onClear} variant="outline" size="sm" className="flex items-center gap-2">
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
          <CardContent className={"pt-4"}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('admin.start_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
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
                      className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
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

              {/* Status fields - Same row on mobile, stacked on desktop */}
              <div className="col-span-1 md:contents">
                <div className="grid grid-cols-2 gap-4 md:contents">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">{t('admin.order_status') || t('admin.status')}</Label>
                    <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary h-10">
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
                      <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary h-10">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_amount" className="text-sm font-medium">{t('admin.min_amount')}</Label>
                <Input
                  id="min_amount"
                  type="number"
                  placeholder={t('admin.minimum_amount')}
                  value={localFilters.min_amount || ''}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  className="border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
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
                  className="border-border rounded-lg bg-background text-foreground focus:border-primary h-10"
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
