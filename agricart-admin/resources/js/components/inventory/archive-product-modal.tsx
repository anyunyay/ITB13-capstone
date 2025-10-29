import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Archive, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface ArchiveProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const ArchiveProductModal = ({
    isOpen,
    onClose,
    productName,
    reason,
    onReasonChange,
    onSubmit,
    processing
}: ArchiveProductModalProps) => {
    const t = useTranslation();
    const handleClose = () => {
        onClose();
        onReasonChange('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        {t('admin.archive_product')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.confirm_archive_product', { name: productName })}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">{t('admin.reason_for_archiving_optional')}</Label>
                        <Textarea
                            id="reason"
                            placeholder={t('admin.enter_reason_for_archiving')}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            {t('admin.archive_product_warning')}
                        </p>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        {t('ui.cancel')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? t('admin.archiving') : t('admin.archive_product')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
