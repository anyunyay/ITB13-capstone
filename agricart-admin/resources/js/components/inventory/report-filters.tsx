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
import { Search, Filter, X, ChevronDown, CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from '@/hooks/use-translation';
import { ReportFilters as ReportFiltersType, Member } from '@/types/inventory-report';

interface ReportFiltersProps {
  localFilters: ReportFiltersType;
  setLocalFilters: React.Dispatch<React.SetStateAction<ReportFiltersType>>;
  members: Member[];
  productTypes: string[];
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
  localFilters, setLocalFilters, members, productTypes, filtersOpen, setFiltersOpen,
  startDate, endDate, setStartDate, setEndDate, onApply, onClear, hasActiveFilters
}: ReportFiltersProps) {
  const t = useTranslation();

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

  const handleMemberToggle = (memberId: string) => {
    setLocalFilters(prev => {
      const isSelected = prev.member_ids.includes(memberId);
      if (isSelected) {
        return { ...prev, member_ids: prev.member_ids.filter(id => id !== memberId) };
      } else {
        if (prev.member_ids.length >= 5) return prev;
        return { ...prev, member_ids: [...prev.member_ids, memberId] };
      }
    });
  };

  const selectAllMembers = () => {
    setLocalFilters(prev => ({
      ...prev,
      member_ids: members.slice(0, 5).map(member => member.id.toString())
    }));
  };

  const deselectAllMembers = () => {
    setLocalFilters(prev => ({ ...prev, member_ids: [] }));
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
          <CardContent>
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
                      setLocalFilters(prev => ({ ...prev, start_date: '', end_date: '' }));
                    }}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t('ui.clear')}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('admin.start_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary">
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary">
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
                    <Button type="button" variant="outline" size="sm" onClick={selectAllMembers} className="text-xs px-2 py-1 h-6">
                      {t('admin.select_all_max_five')}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllMembers} className="text-xs px-2 py-1 h-6">
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
                          <div key={member.id} className={`flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors ${isDisabled ? 'opacity-50' : ''}`}>
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleMemberToggle(member.id.toString())}
                              disabled={isDisabled}
                              className="border-border"
                            />
                            <Label htmlFor={`member-${member.id}`} className={`text-sm font-normal cursor-pointer flex-1 truncate ${isDisabled ? 'cursor-not-allowed' : ''}`}>
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
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
              <Button onClick={onApply} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                {t('admin.apply_filters')}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
