import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
    reason: string;
    otherReason: string;
    onReasonChange: (reason: string) => void;
    onOtherReasonChange: (otherReason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const RemoveStockModal = ({
    isOpen,
    onClose,
    selectedStock,
    reason,
    otherReason,
    onReasonChange,
    onOtherReasonChange,
    onSubmit,
    processing
}: RemoveStockModalProps) => {
    const t = useTranslation();
    const handleClose = () => {
        onClose();
        onReasonChange('');
        onOtherReasonChange('');
    };

    const otherReasonKey = t('admin.rejection_reason_other');
    const isSubmitDisabled = !selectedStock || !reason || (reason === otherReasonKey && !otherReason) || processing;

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
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.quantity_label')}</p>
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
                            <Label htmlFor="reason" className="text-sm font-medium">{t('admin.reason_for_removal')}</Label>
                            <Select 
                                value={reason} 
                                onValueChange={onReasonChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.select_reason_for_removal')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={t('admin.removal_reason_sold_out')}>{t('admin.removal_reason_sold_out')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_discontinued')}>{t('admin.removal_reason_discontinued')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_damaged')}>{t('admin.removal_reason_damaged')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_expired')}>{t('admin.removal_reason_expired')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_season_ended')}>{t('admin.removal_reason_season_ended')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_listing_error')}>{t('admin.removal_reason_listing_error')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_vendor_inactive')}>{t('admin.removal_reason_vendor_inactive')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_under_update')}>{t('admin.removal_reason_under_update')}</SelectItem>
                                    <SelectItem value={t('admin.removal_reason_regulatory_issue')}>{t('admin.removal_reason_regulatory_issue')}</SelectItem>
                                    <SelectItem value={otherReasonKey}>{otherReasonKey}</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {reason === otherReasonKey && (
                                <div className="space-y-2">
                                    <Label htmlFor="other_reason" className="text-sm font-medium">{t('admin.specify_other_reason')}</Label>
                                    <Textarea
                                        id="other_reason"
                                        value={otherReason || ''}
                                        onChange={(e) => onOtherReasonChange(e.target.value)}
                                        placeholder={t('admin.specify_reason_for_removal')}
                                        rows={3}
                                        className="resize-none"
                                    />
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
