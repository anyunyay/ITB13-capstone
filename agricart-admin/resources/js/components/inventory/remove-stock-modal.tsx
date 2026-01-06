import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from 'lucide-react';
import { Stock } from '@/types/inventory';
import { useTranslation } from '@/hooks/use-translation';

interface RemoveStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStock: Stock | null;
    quantity: number;
    reason: string;
    otherReason: string;
    onQuantityChange: (quantity: number) => void;
    onReasonChange: (reason: string) => void;
    onOtherReasonChange: (otherReason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const RemoveStockModal = ({
    isOpen,
    onClose,
    selectedStock,
    quantity,
    reason,
    otherReason,
    onQuantityChange,
    onReasonChange,
    onOtherReasonChange,
    onSubmit,
    processing
}: RemoveStockModalProps) => {
    const t = useTranslation();
    const handleClose = () => {
        onClose();
        onQuantityChange(0);
        onReasonChange('');
        onOtherReasonChange('');
    };

    const isSubmitDisabled = !selectedStock || !reason || !quantity || quantity <= 0 || quantity > (selectedStock?.quantity || 0) || processing;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {t('admin.remove_stock')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.remove_stock_description')}
                    </DialogDescription>
                </DialogHeader>
                
                {selectedStock && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            {selectedStock.product?.image_url && (
                                <img 
                                    src={selectedStock.product.image_url} 
                                    alt={selectedStock.product.name}
                                    onError={(e) => { e.currentTarget.src = '/images/fallback-photo.png'; }}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">{selectedStock.product?.name || t('admin.unknown_product')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.stock_id_label', { id: selectedStock.id })}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="stock_info" className="text-sm font-medium">{t('admin.stock_information')}</Label>
                            <div className="p-4 bg-muted/30 rounded-lg border">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.available_quantity')}</p>
                                        <p className="font-semibold">
                                            {selectedStock.quantity} {selectedStock.category}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.member_label')}</p>
                                        <p className="font-semibold">
                                            {selectedStock.member?.name || t('admin.unassigned')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="quantity" className="text-sm font-medium">{t('admin.quantity_to_remove')}</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={selectedStock.quantity}
                                value={quantity || ''}
                                onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
                                placeholder={`Enter quantity (max: ${selectedStock.quantity})`}
                                className="w-full"
                            />
                            {quantity > selectedStock.quantity && (
                                <p className="text-sm text-destructive">
                                    Cannot remove more than available quantity ({selectedStock.quantity})
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="reason" className="text-sm font-medium">{t('admin.reason_for_removal')}</Label>
                            <Select 
                                value={reason} 
                                onValueChange={onReasonChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.select_reason_for_removal')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sold Outside">Sold Outside</SelectItem>
                                    <SelectItem value="Damaged / Defective">Damaged / Defective</SelectItem>
                                    <SelectItem value="Listing Error">Listing Error</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {/* Show impact information based on selected reason */}
                            {reason && (
                                <div className="p-3 bg-muted/30 rounded-lg border text-sm">
                                    {reason === "Sold Outside" && (
                                        <p className="text-muted-foreground">
                                            <span className="font-semibold text-foreground">Impact:</span> No impact on the system. Does not add revenue or losses. Only removes the stock quantity.
                                        </p>
                                    )}
                                    {reason === "Damaged / Defective" && (
                                        <p className="text-muted-foreground">
                                            <span className="font-semibold text-destructive">Impact:</span> This action creates a loss in the system. Deducts stock and records the loss amount properly in the stock trail or financial logs.
                                        </p>
                                    )}
                                    {reason === "Listing Error" && (
                                        <p className="text-muted-foreground">
                                            <span className="font-semibold text-foreground">Impact:</span> No impact on the system. No revenue or loss recorded. Simply removes the incorrect stock quantity.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <Alert className="border-destructive/50 bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertTitle className="text-destructive">{t('admin.important_notice')}</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                {t('admin.remove_stock_warning')}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleClose}
                        className="flex-1"
                        disabled={processing}
                    >
                        {t('ui.cancel')}
                    </Button>
                    <Button 
                        type="button"
                        disabled={isSubmitDisabled}
                        onClick={onSubmit}
                        variant="destructive"
                        className="flex-1"
                    >
                        {processing ? t('admin.removing') : t('admin.remove_stock')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
