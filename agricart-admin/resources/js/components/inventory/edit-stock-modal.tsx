import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OctagonAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Stock } from '@/types/inventory';
import { MemberSelector } from './member-selector';

interface Member {
    id: number;
    name: string;
}

interface EditStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    stock: Stock | null;
    members: Member[];
    availableCategories: string[];
    memberId: string;
    quantity: number | string;
    category: string;
    onMemberIdChange: (value: string) => void;
    onQuantityChange: (value: number | string) => void;
    onCategoryChange: (value: string) => void;
    onSubmit: () => void;
    processing: boolean;
    errors: Record<string, string>;
}

export const EditStockModal = ({
    isOpen,
    onClose,
    stock,
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
}: EditStockModalProps) => {
    const t = useTranslation();

    // Prevent 'e', '+', '-' and other non-numeric characters in number inputs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    // Check if form is valid
    const isFormValid = () => {
        const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
        return memberId && category && quantity && quantityNum > 0;
    };

    if (!stock) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('admin.edit_stock')}</DialogTitle>
                    <DialogDescription>
                        {t('admin.edit_stock_description')}
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

                    {/* Current Stock Information */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                {t('admin.current_stock_information')}
                            </Label>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">{t('admin.product_label')}:</span>
                                <p className="font-medium">{stock.product?.name || '-'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('admin.stock_id')}:</span>
                                <p className="font-medium">#{stock.id}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('admin.current_member')}:</span>
                                <p className="font-medium">{stock.member?.name || t('admin.unassigned')}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('admin.current_quantity')}:</span>
                                <p className="font-medium">
                                    {stock.category === 'Kilo' 
                                        ? `${stock.quantity} kg` 
                                        : `${Math.floor(stock.quantity)} ${stock.category?.toLowerCase() || ''}`
                                    }
                                </p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground">{t('admin.current_category')}:</span>
                                <p className="font-medium">{stock.category}</p>
                            </div>
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
                                onChange={(e) => onQuantityChange(Number(e.target.value))}
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
                                value={quantity}
                                onChange={(e) => onQuantityChange(Number(e.target.value))}
                                onKeyDown={handleKeyDown}
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
                            {processing ? t('admin.updating') : t('admin.update_stock')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
