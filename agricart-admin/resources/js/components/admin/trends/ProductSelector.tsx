import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/use-translation';

type ProductOption = {
    name: string;
    price_categories: string[];
    unit_types: string[];
};

interface ProductSelectorProps {
    selectedCategory: string;
    selectedProducts: string[];
    availableProducts: ProductOption[];
    onCategoryChange: (category: string) => void;
    onProductSelectionChange: (productName: string, checked: boolean) => void;
}

export function ProductSelector({
    selectedCategory,
    selectedProducts,
    availableProducts,
    onCategoryChange,
    onProductSelectionChange,
}: ProductSelectorProps) {
    const t = useTranslation();

    // Group products by their pricing units
    const getGroupedProducts = (products: ProductOption[]) => {
        const groups: { [key: string]: ProductOption[] } = {
            'per_kilo_only': [],
            'per_tali_only': [],
            'per_pc_only': [],
            'per_kilo_tali': [],
            'per_kilo_pc': [],
            'per_tali_pc': [],
            'all_units': []
        };

        products.forEach(product => {
            const { price_categories } = product;
            const hasKilo = price_categories.includes('per_kilo');
            const hasTali = price_categories.includes('per_tali');
            const hasPc = price_categories.includes('per_pc');

            if (hasKilo && hasTali && hasPc) {
                groups.all_units.push(product);
            } else if (hasKilo && hasTali) {
                groups.per_kilo_tali.push(product);
            } else if (hasKilo && hasPc) {
                groups.per_kilo_pc.push(product);
            } else if (hasTali && hasPc) {
                groups.per_tali_pc.push(product);
            } else if (hasKilo) {
                groups.per_kilo_only.push(product);
            } else if (hasTali) {
                groups.per_tali_only.push(product);
            } else if (hasPc) {
                groups.per_pc_only.push(product);
            }
        });

        return groups;
    };

    const groupedProducts = getGroupedProducts(availableProducts);

    return (
        <>
            <div className="space-y-1.5">
                <Label className="text-sm">{t('admin.category')}</Label>
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-full h-9 md:h-10">
                        <SelectValue placeholder={t('admin.select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('admin.all_products')}</SelectItem>
                        <SelectItem value="fruit">{t('admin.fruits')}</SelectItem>
                        <SelectItem value="vegetable">{t('admin.vegetables')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm">{t('admin.products')}</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 md:h-10 text-sm"
                        >
                            <span className="truncate">
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} ${t('admin.selected')}`
                                    : t('admin.select_products')}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px]" align="start">
                        <div className="space-y-4">
                            {Object.entries(groupedProducts).map(([groupKey, products]) => {
                                if (products.length === 0) return null;

                                const groupLabels: { [key: string]: string } = {
                                    'all_units': t('admin.all_pricing_units'),
                                    'per_kilo_only': t('admin.per_kilo_only'),
                                    'per_tali_only': t('admin.per_tali_only'),
                                    'per_pc_only': t('admin.per_pc_only'),
                                    'per_kilo_tali': t('admin.per_kilo_tali'),
                                    'per_kilo_pc': t('admin.per_kilo_pc'),
                                    'per_tali_pc': t('admin.per_tali_pc'),
                                };

                                return (
                                    <div key={groupKey} className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            {groupLabels[groupKey]}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {products.map((product) => (
                                                <div key={product.name} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`product-${product.name}`}
                                                        checked={selectedProducts.includes(product.name)}
                                                        onCheckedChange={(checked) =>
                                                            onProductSelectionChange(product.name, checked as boolean)
                                                        }
                                                        disabled={
                                                            !selectedProducts.includes(product.name) &&
                                                            selectedProducts.length >= 3
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`product-${product.name}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {product.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
                {selectedProducts.length >= 3 && (
                    <p className="text-sm text-amber-600 mt-1">
                        {t('admin.maximum_products_warning')}
                    </p>
                )}
            </div>
        </>
    );
}
