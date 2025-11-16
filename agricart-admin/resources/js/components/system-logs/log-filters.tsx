import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Search, X, ChevronDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

interface LogFiltersProps {
    search: string;
    level: string;
    eventType: string;
    userType: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    filtersOpen: boolean;
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onLevelChange: (value: string) => void;
    onEventTypeChange: (value: string) => void;
    onUserTypeChange: (value: string) => void;
    onStartDateChange: (date: Date | undefined) => void;
    onEndDateChange: (date: Date | undefined) => void;
    onFiltersOpenChange: (open: boolean) => void;
    onClearFilters: () => void;
    onApplyFilters: () => void;
}

export const LogFilters: React.FC<LogFiltersProps> = ({
    search,
    level,
    eventType,
    userType,
    startDate,
    endDate,
    filtersOpen,
    hasActiveFilters,
    onSearchChange,
    onLevelChange,
    onEventTypeChange,
    onUserTypeChange,
    onStartDateChange,
    onEndDateChange,
    onFiltersOpenChange,
    onClearFilters,
    onApplyFilters
}) => {
    const t = useTranslation();

    const eventTypes = [
        { value: 'all', label: t('ui.all_events') },
        { value: 'authentication', label: t('ui.authentication') },
        { value: 'security_event', label: t('ui.security_events') },
        { value: 'checkout', label: t('ui.checkout') },
        { value: 'order_status_change', label: t('ui.order_status') },
        { value: 'stock_update', label: t('ui.stock_updates') },
        { value: 'user_management', label: t('ui.user_management') },
        { value: 'product_management', label: t('ui.product_management') },
        { value: 'member_activity', label: t('ui.member_activity') },
        { value: 'admin_activity', label: t('ui.admin_activity') },
        { value: 'customer_activity', label: t('ui.customer_activity') },
        { value: 'logistic_activity', label: t('ui.logistic_activity') },
        { value: 'delivery_status_change', label: t('ui.delivery_status') },
        { value: 'report_generation', label: t('ui.report_generation') },
        { value: 'data_export', label: t('ui.data_export') },
        { value: 'maintenance', label: t('ui.maintenance') },
        { value: 'critical_error', label: t('ui.critical_errors') }
    ];

    const userTypes = [
        { value: 'all', label: t('ui.all_users') },
        { value: 'admin', label: t('admin.admin') },
        { value: 'staff', label: t('staff.staff') },
        { value: 'customer', label: t('customer.customer') },
        { value: 'member', label: t('member.member') },
        { value: 'logistic', label: t('logistic.logistic') }
    ];

    const getDateRangeDisplay = () => {
        if (!startDate && !endDate) return t('ui.no_date_range');
        if (startDate && !endDate) return `${t('ui.from')} ${format(startDate, 'MMM dd, yyyy')}`;
        if (!startDate && endDate) return `${t('ui.until')} ${format(endDate, 'MMM dd, yyyy')}`;
        return `${format(startDate!, 'MMM dd, yyyy')} - ${format(endDate!, 'MMM dd, yyyy')}`;
    };

    const clearDateRange = () => {
        onStartDateChange(undefined);
        onEndDateChange(undefined);
    };

    return (
        <Card className="shadow-sm">
            <Collapsible open={filtersOpen} onOpenChange={onFiltersOpenChange}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl">{t('ui.advanced_filters')}</CardTitle>
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        {t('ui.active')}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button onClick={onClearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                                        <X className="h-4 w-4" />
                                        {t('ui.clear_filters')}
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
                                    placeholder={t('ui.search_logs')}
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                                />
                            </div>
                        </div>

                        {/* Date Range Summary */}
                        {(startDate || endDate) && (
                            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">{t('ui.selected_date_range')}</h4>
                                        <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearDateRange}
                                        className="text-xs"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        {t('ui.clear')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Filter Grid */}
                        <div className="space-y-4 mb-6">
                            {/* Date Range Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">{t('ui.start_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "MMM dd, yyyy") : t('ui.pick_start_date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={startDate}
                                                onSelect={onStartDateChange}
                                                initialFocus
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">{t('ui.end_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "MMM dd, yyyy") : t('ui.pick_end_date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={endDate}
                                                onSelect={onEndDateChange}
                                                initialFocus
                                                disabled={(date) => {
                                                    if (date > new Date()) return true;
                                                    if (startDate && date < startDate) return true;
                                                    return false;
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Event Type and User Type Row - 2 columns on mobile, 2 columns on desktop */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Event Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="event_type" className="text-sm font-medium">{t('ui.event_type')}</Label>
                                    <Select value={eventType} onValueChange={onEventTypeChange}>
                                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* User Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="user_type" className="text-sm font-medium">{t('ui.user_type')}</Label>
                                    <Select value={userType} onValueChange={onUserTypeChange}>
                                        <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Apply Filters Button */}
                        <div className="flex justify-end">
                            <Button onClick={onApplyFilters} className="px-6">
                                <Search className="h-4 w-4 mr-2" />
                                {t('ui.apply_filters')}
                            </Button>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};
