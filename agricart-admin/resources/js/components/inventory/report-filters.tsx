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
import { ReportFilters as ReportFiltersType, Member } from '@/types/inventory-report';
import React from 'react';

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
  const [memberSearch, setMemberSearch] = React.useState('');
  const [memberPage, setMemberPage] = React.useState(1);
  const membersPerPage = 5;

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
        return { ...prev, member_ids: [...prev.member_ids, memberId] };
      }
    });
  };

  const filteredMembers = React.useMemo(() => {
    if (!memberSearch.trim()) return members;
    return members.filter(member => 
      member.name.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [members, memberSearch]);

  const allFilteredMembersSelected = React.useMemo(() => {
    if (filteredMembers.length === 0) return false;
    const filteredMemberIds = filteredMembers.map(m => m.id.toString());
    return filteredMemberIds.every(id => localFilters.member_ids.includes(id));
  }, [filteredMembers, localFilters.member_ids]);

  const toggleSelectAllMembers = () => {
    if (allFilteredMembersSelected) {
      // Remove all filtered members from selection
      const filteredMemberIds = filteredMembers.map(m => m.id.toString());
      setLocalFilters(prev => ({
        ...prev,
        member_ids: prev.member_ids.filter(id => !filteredMemberIds.includes(id))
      }));
    } else {
      // Select ALL filtered members regardless of pagination
      const allMemberIds = filteredMembers.map(member => member.id.toString());
      // Merge with existing selections (in case some members from other searches are selected)
      setLocalFilters(prev => ({
        ...prev,
        member_ids: Array.from(new Set([...prev.member_ids, ...allMemberIds]))
      }));
    }
  };

  const deselectAllMembers = () => {
    setLocalFilters(prev => ({ ...prev, member_ids: [] }));
  };

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  
  const paginatedMembers = React.useMemo(() => {
    const startIndex = (memberPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, memberPage, membersPerPage]);

  React.useEffect(() => {
    setMemberPage(1);
  }, [memberSearch]);

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
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none" />
                <Input
                  placeholder={t('admin.search_inventory_report_placeholder')}
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] text-xs sm:text-sm h-9 sm:h-10 md:h-11 w-full"
                />
              </div>
            </div>

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

            {/* Mobile: Row 1 - Start Date, End Date | Desktop: All in one row */}
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
              
              {/* Mobile: Row 2 - Min Quantity, Max Quantity */}
              <div className="space-y-2">
                <Label htmlFor="min_quantity" className="text-sm lg:text-base font-medium block">{t('admin.min_quantity')}</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  placeholder={t('admin.minimum')}
                  value={localFilters.min_quantity || ''}
                  onChange={(e) => handleFilterChange('min_quantity', e.target.value)}
                  className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_quantity" className="text-sm lg:text-base font-medium block">{t('admin.max_quantity')}</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  placeholder={t('admin.maximum')}
                  value={localFilters.max_quantity || ''}
                  onChange={(e) => handleFilterChange('max_quantity', e.target.value)}
                  className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                />
              </div>
            </div>

            {/* Mobile: Row 3 - Category, Stock Status, Product Type (in 3 columns) */}
            <div className="grid grid-cols-3 lg:hidden gap-3 mb-3">
              <div className="space-y-2">
                <Label htmlFor="category-mobile" className="text-sm font-medium block">{t('admin.category') || 'Category'}</Label>
                <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger id="category-mobile" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs h-9 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_categories') || 'All Categories'}</SelectItem>
                    <SelectItem value="Kilo">{t('admin.category_kilo') || 'Kilo'}</SelectItem>
                    <SelectItem value="Pc">{t('admin.category_pc') || 'Pc'}</SelectItem>
                    <SelectItem value="Tali">{t('admin.category_tali') || 'Tali'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-mobile" className="text-sm font-medium block">{t('admin.stock_status') || 'Stock Status'}</Label>
                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status-mobile" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs h-9 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_status') || 'All Status'}</SelectItem>
                    <SelectItem value="available">{t('admin.available') || 'Available'}</SelectItem>
                    <SelectItem value="sold">{t('admin.sold') || 'Sold'}</SelectItem>
                    <SelectItem value="removed">{t('admin.removed') || 'Removed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type-mobile" className="text-sm font-medium block">{t('admin.product_type') || 'Product Type'}</Label>
                <Select value={localFilters.product_type} onValueChange={(value) => handleFilterChange('product_type', value)}>
                  <SelectTrigger id="product_type-mobile" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-xs h-9 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_types') || 'All Types'}</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile: Members Section (Full Width) */}
            <div className="lg:hidden mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm lg:text-base font-medium flex-shrink-0">{t('admin.members') || 'Members'}</Label>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button 
                      type="button" 
                      variant={allFilteredMembersSelected ? "default" : "outline"}
                      size="sm" 
                      onClick={toggleSelectAllMembers} 
                      className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7 whitespace-nowrap transition-colors ${
                        allFilteredMembersSelected 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : ''
                      }`}
                    >
                      {allFilteredMembersSelected 
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllMembers} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 h-6 sm:h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_members') || 'Search members...'}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {members.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredMembers.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedMembers.map((member) => {
                              const isSelected = localFilters.member_ids.includes(member.id.toString());
                              return (
                                <div key={member.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`member-mobile-${member.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleMemberToggle(member.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`member-mobile-${member.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {member.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_members_found') || 'No members found'}
                            </p>
                          </div>
                        )}
                      </div>
                      {filteredMembers.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMemberPage(prev => Math.max(1, prev - 1))}
                                disabled={memberPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {memberPage} / {totalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMemberPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={memberPage === totalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.member_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.member_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_members_available') || 'No members available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: Members + Category/Stock Status Column + Product Type */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2 col-span-2 row-span-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-base font-medium flex-shrink-0">{t('admin.members') || 'Members'}</Label>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      type="button" 
                      variant={allFilteredMembersSelected ? "default" : "outline"}
                      size="sm" 
                      onClick={toggleSelectAllMembers} 
                      className={`text-sm px-2.5 py-1 h-7 whitespace-nowrap transition-colors ${
                        allFilteredMembersSelected 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : ''
                      }`}
                    >
                      {allFilteredMembersSelected 
                        ? (t('admin.remove_all') || 'Remove All')
                        : (t('admin.select_all') || 'Select All')
                      }
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={deselectAllMembers} className="text-sm px-2.5 py-1 h-7">
                      {t('ui.clear') || 'Clear'}
                    </Button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none" />
                  <Input
                    placeholder={t('admin.search_members') || 'Search members...'}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-7 sm:pl-8 pr-8 sm:pr-9 py-1.5 border-border rounded-lg bg-background text-foreground focus:border-primary text-[11px] sm:text-xs h-7 sm:h-8 w-full"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-lg bg-background">
                  {members.length > 0 ? (
                    <>
                      <div className="min-h-[160px] sm:min-h-[180px] p-2 sm:p-2.5">
                        {filteredMembers.length > 0 ? (
                          <div className="space-y-1 sm:space-y-1.5">
                            {paginatedMembers.map((member) => {
                              const isSelected = localFilters.member_ids.includes(member.id.toString());
                              return (
                                <div key={member.id} className="flex items-center space-x-2 sm:space-x-2.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded hover:bg-muted/50 transition-colors min-h-[32px] sm:min-h-[36px]">
                                  <Checkbox
                                    id={`member-${member.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleMemberToggle(member.id.toString())}
                                    className="border-border flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  />
                                  <Label htmlFor={`member-${member.id}`} className="text-xs sm:text-sm font-normal cursor-pointer flex-1 truncate leading-tight">
                                    {member.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-[10px] sm:text-xs text-muted-foreground text-center px-2">
                              {t('admin.no_members_found') || 'No members found'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {filteredMembers.length > 0 && (
                        <div className="border-t border-border p-1.5 sm:p-2 bg-muted/30">
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMemberPage(prev => Math.max(1, prev - 1))}
                                disabled={memberPage === 1}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {memberPage} / {totalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMemberPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={memberPage === totalPages}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                            {localFilters.member_ids.length > 0 && (
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                {localFilters.member_ids.length} {t('admin.selected') || 'selected'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 sm:p-2.5 min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">{t('admin.no_members_available') || 'No members available'}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Category and Stock Status Column */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium block">{t('admin.category') || 'Category'}</Label>
                  <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger id="category" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-sm h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.all_categories') || 'All Categories'}</SelectItem>
                      <SelectItem value="Kilo">{t('admin.category_kilo') || 'Kilo'}</SelectItem>
                      <SelectItem value="Pc">{t('admin.category_pc') || 'Pc'}</SelectItem>
                      <SelectItem value="Tali">{t('admin.category_tali') || 'Tali'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-medium block">{t('admin.stock_status') || 'Stock Status'}</Label>
                  <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger id="status" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-sm h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.all_status') || 'All Status'}</SelectItem>
                      <SelectItem value="available">{t('admin.available') || 'Available'}</SelectItem>
                      <SelectItem value="sold">{t('admin.sold') || 'Sold'}</SelectItem>
                      <SelectItem value="removed">{t('admin.removed') || 'Removed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product_type" className="text-base font-medium block">{t('admin.product_type') || 'Product Type'}</Label>
                <Select value={localFilters.product_type} onValueChange={(value) => handleFilterChange('product_type', value)}>
                  <SelectTrigger id="product_type" className="border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_types') || 'All Types'}</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2 sm:pt-3">
              <Button onClick={onApply} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium w-full sm:w-auto h-9 sm:h-10 rounded-lg">
                {t('admin.apply_filters')}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
