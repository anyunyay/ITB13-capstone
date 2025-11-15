import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

interface TimePeriodSelectorProps {
    timePeriod: string;
    onTimePeriodChange: (period: 'specific' | 'monthly' | 'yearly') => void;
}

export function TimePeriodSelector({ timePeriod, onTimePeriodChange }: TimePeriodSelectorProps) {
    const t = useTranslation();

    return (
        <div className="flex items-center gap-2 lg:gap-3">
            <Label className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
                {t('admin.time_period')}
            </Label>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="flex items-center space-x-1.5">
                    <input
                        type="radio"
                        id="specific"
                        name="timePeriod"
                        value="specific"
                        checked={timePeriod === 'specific'}
                        onChange={(e) => onTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="specific" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                        {t('admin.specific_date')}
                    </Label>
                </div>
                <div className="flex items-center space-x-1.5">
                    <input
                        type="radio"
                        id="monthly"
                        name="timePeriod"
                        value="monthly"
                        checked={timePeriod === 'monthly'}
                        onChange={(e) => onTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="monthly" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                        {t('admin.monthly')}
                    </Label>
                </div>
                <div className="flex items-center space-x-1.5">
                    <input
                        type="radio"
                        id="yearly"
                        name="timePeriod"
                        value="yearly"
                        checked={timePeriod === 'yearly'}
                        onChange={(e) => onTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="yearly" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                        {t('admin.yearly')}
                    </Label>
                </div>
            </div>
        </div>
    );
}
