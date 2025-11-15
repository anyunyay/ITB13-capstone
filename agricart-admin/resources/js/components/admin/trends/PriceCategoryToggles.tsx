import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';

interface PriceCategoryTogglesProps {
    priceCategoryToggles: {
        per_kilo: boolean;
        per_tali: boolean;
        per_pc: boolean;
    };
    availablePriceCategories: string[];
    selectedProducts: string[];
    onToggle: (category: 'per_kilo' | 'per_tali' | 'per_pc') => void;
}

export function PriceCategoryToggles({
    priceCategoryToggles,
    availablePriceCategories,
    selectedProducts,
    onToggle,
}: PriceCategoryTogglesProps) {
    const t = useTranslation();

    return (
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center space-x-2">
                <Switch
                    id="per_kilo"
                    checked={priceCategoryToggles.per_kilo}
                    onCheckedChange={() => onToggle('per_kilo')}
                    disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_kilo')}
                />
                <Label htmlFor="per_kilo" className="text-sm cursor-pointer whitespace-nowrap">
                    {t('admin.per_kilo')}
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="per_tali"
                    checked={priceCategoryToggles.per_tali}
                    onCheckedChange={() => onToggle('per_tali')}
                    disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_tali')}
                />
                <Label htmlFor="per_tali" className="text-sm cursor-pointer whitespace-nowrap">
                    {t('admin.per_tali')}
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="per_pc"
                    checked={priceCategoryToggles.per_pc}
                    onCheckedChange={() => onToggle('per_pc')}
                    disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_pc')}
                />
                <Label htmlFor="per_pc" className="text-sm cursor-pointer whitespace-nowrap">
                    {t('admin.per_piece')}
                </Label>
            </div>
        </div>
    );
}
