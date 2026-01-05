import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OctagonAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { MemberSelector } from './member-selector';

interface Member {
    id: number;
    name: string;
}

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    members: Member[];
    availableCategories: string[];
    memberId: string;
    quantity: string;
    category: string;
    onMemberIdChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubmit: () => void;
    processing: boolean;
    errors: Record<string, string>;
}

export const AddStockModal = ({
    isOpen,
    onClose,
    productId,
    productName,
    members,
    availableCategories,
    memberId,
    quantity,
    category,
    onMemberIdChange,
    onQuantityChange,
    onCategoryChange,
    onSubmit,
    processing,
    errors
}: AddStockModalProps) => {
    const t = useTranslation();

    // Prevent 'e', '+', '-' and other non-numeric characters in number inputs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };

    // Prevent decimal input for non-Kilo categories (integers only)
    const handleKeyDownInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent 'e', '+', '-', and decimal point for integer inputs
        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.' || e.key === ',') {
            e.preventDefault();
        }
    };

    // Handle quantity change for integer inputs - strip decimals
    const handleIntegerQuantityChange = (value: string) => {
        // Remove any decimal points and only keep whole numbers
        const integerValue = value.replace(/[.,]/g, '');
        onQuantityChange(integerValue);
    };

    // Handle decimal quantity change - limit to 2 decimal places
    const handleDecimalQuantityChange = (value: string) => {
        // Allow empty or just decimal point
        if (value === '' || value === '.') {
            onQuantityChange(value);
            return;
        }
        
        // Check if value has more than 2 decimal places
        const parts = value.split('.');
        if (parts.length === 2 && parts[1].length > 2) {
            // Truncate to 2 decimal places
            const truncated = parts[0] + '.' + parts[1].substring(0, 2);
            onQuantityChange(truncated);
            return;
        }
        
        onQuantityChange(value);
    };

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    // Check if form is valid
    const isFormValid = () => {
        return memberId && category && quantity && parseFloat(quantity) > 0;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('admin.add_stock_to_product')}</DialogTitle>
                    <DialogDescription>
                        {t('admin.add_stock_description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitForm} className="space-y-4">
                    {/* Display Errors */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>{t('admin.error_title')}</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4 space-y-1">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key} className="text-sm">{message}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Product Name */}
                    <div className='space-y-2'>
                        <Label htmlFor='product_name'>{t('admin.product_label')}</Label>
                        <div className="text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-md">
                            {productName}
                        </div>
                    </div>

                    {/* Member Selection with Search and Pagination */}
                    <MemberSelector
                        members={members}
                        selectedMemberId={memberId}
                        onMemberSelect={onMemberIdChange}
                        itemsPerPage={5}
                    />

                    {/* Category Selection */}
                    <div className='space-y-2'>
                        <Label htmlFor="category">
                            {t('admin.category')} <span className="text-destructive">*</span>
                        </Label>
                        <Select value={category} onValueChange={onCategoryChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('admin.select_a_category')} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat === 'Kilo' ? t('admin.category_kilo') : cat === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity Input - Show for Kilo category */}
                    {category === "Kilo" && (
                        <div className='space-y-2'>
                            <Label htmlFor="quantity">
                                {t('admin.quantity')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={quantity}
                                onChange={(e) => handleDecimalQuantityChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    )}

                    {/* Quantity Input - Show for non-Kilo categories (Pc, Tali) */}
                    {category !== "Kilo" && (
                        <div className='space-y-2'>
                            <Label htmlFor="quantity">
                                {t('admin.quantity')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                step={1}
                                value={quantity}
                                onChange={(e) => handleIntegerQuantityChange(e.target.value)}
                                onKeyDown={handleKeyDownInteger}
                                placeholder="0"
                                required
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            {t('ui.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing || !isFormValid()}>
                            {processing ? t('admin.adding') : t('admin.add_stock')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
