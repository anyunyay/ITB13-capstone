import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';

interface DateSelectorProps {
    timePeriod: string;
    startDate?: Date;
    endDate?: Date;
    selectedMonth?: number;
    selectedYear?: number;
    dateValidationError: string;
    onStartDateChange: (date?: Date) => void;
    onEndDateChange: (date?: Date) => void;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    onValidateDates: () => void;
}

export function DateSelector({
    timePeriod,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    dateValidationError,
    onStartDateChange,
    onEndDateChange,
    onMonthChange,
    onYearChange,
    onValidateDates,
}: DateSelectorProps) {
    const t = useTranslation();

    if (timePeriod === 'specific') {
        return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm">{t('admin.start_date')}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal h-9 md:h-10 text-sm ${dateValidationError ? 'border-red-500 focus:ring-red-500' : ''}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                    {startDate ? format(startDate, "PPP") : t('admin.pick_date')}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    onStartDateChange(date);
                                    if (date && endDate) {
                                        onValidateDates();
                                    }
                                }}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(23, 59, 59, 999);
                                    if (date > today) return true;
                                    if (endDate && date > endDate) return true;
                                    return false;
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm">{t('admin.end_date')}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal h-9 md:h-10 text-sm ${dateValidationError ? 'border-red-500 focus:ring-red-500' : ''}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                    {endDate ? format(endDate, "PPP") : t('admin.pick_date')}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                    onEndDateChange(date);
                                    if (date && startDate) {
                                        onValidateDates();
                                    }
                                }}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(23, 59, 59, 999);
                                    if (date > today) return true;
                                    if (startDate && date < startDate) return true;
                                    return false;
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        );
    }

    if (timePeriod === 'monthly') {
        return (
            <>
                <div className="space-y-1.5">
                    <Label className="text-sm">{t('admin.select_month')}</Label>
                    <Select
                        value={selectedMonth?.toString() || ""}
                        onValueChange={(value) => onMonthChange(parseInt(value))}
                    >
                        <SelectTrigger className="w-full h-9 md:h-10">
                            <SelectValue placeholder={t('admin.select_month')} />
                        </SelectTrigger>
                        <SelectContent>
                            {(() => {
                                const currentYear = dayjs().year();
                                const currentMonth = dayjs().month();
                                const months = [
                                    { value: 0, label: t('admin.january') },
                                    { value: 1, label: t('admin.february') },
                                    { value: 2, label: t('admin.march') },
                                    { value: 3, label: t('admin.april') },
                                    { value: 4, label: t('admin.may') },
                                    { value: 5, label: t('admin.june') },
                                    { value: 6, label: t('admin.july') },
                                    { value: 7, label: t('admin.august') },
                                    { value: 8, label: t('admin.september') },
                                    { value: 9, label: t('admin.october') },
                                    { value: 10, label: t('admin.november') },
                                    { value: 11, label: t('admin.december') }
                                ];

                                return months.map(month => {
                                    const isDisabled = selectedYear === currentYear && month.value > currentMonth;

                                    return (
                                        <SelectItem
                                            key={month.value}
                                            value={month.value.toString()}
                                            disabled={isDisabled}
                                        >
                                            {month.label}
                                        </SelectItem>
                                    );
                                });
                            })()}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm">{t('admin.select_year')}</Label>
                    <Select
                        value={selectedYear?.toString() || ""}
                        onValueChange={(value) => onYearChange(parseInt(value))}
                    >
                        <SelectTrigger className="w-full h-9 md:h-10">
                            <SelectValue placeholder={t('admin.select_year')} />
                        </SelectTrigger>
                        <SelectContent>
                            {(() => {
                                const currentYear = dayjs().year();
                                const startYear = 2020;
                                const yearCount = currentYear - startYear + 1;

                                return Array.from({ length: yearCount }, (_, i) => startYear + i).map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ));
                            })()}
                        </SelectContent>
                    </Select>
                </div>
            </>
        );
    }

    if (timePeriod === 'yearly') {
        return (
            <div className="space-y-1.5">
                <Label className="text-sm">{t('admin.select_year')}</Label>
                <Select
                    value={selectedYear?.toString() || ""}
                    onValueChange={(value) => onYearChange(parseInt(value))}
                >
                    <SelectTrigger className="w-full h-9 md:h-10">
                        <SelectValue placeholder={t('admin.select_year')} />
                    </SelectTrigger>
                    <SelectContent>
                        {(() => {
                            const currentYear = dayjs().year();
                            const startYear = 2020;
                            const yearCount = currentYear - startYear + 1;

                            return Array.from({ length: yearCount }, (_, i) => startYear + i).map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ));
                        })()}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return null;
}
