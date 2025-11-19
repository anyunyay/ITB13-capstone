import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';

interface StockLockedBadgeProps {
    isLocked: boolean;
    soldQuantity?: number;
}

export const StockLockedBadge = ({ isLocked, soldQuantity }: StockLockedBadgeProps) => {
    const t = useTranslation();
    
    if (!isLocked) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge 
                    variant="secondary" 
                    className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1"
                >
                    <Lock className="h-3 w-3" />
                    {t('admin.locked')}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('admin.stock_fully_sold_locked')}</p>
                {soldQuantity && <p className="text-xs mt-1">{t('admin.total_sold')}: {soldQuantity}</p>}
            </TooltipContent>
        </Tooltip>
    );
};
