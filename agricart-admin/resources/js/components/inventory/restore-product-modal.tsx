import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Archive, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface RestoreProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onSubmit: () => void;
    processing: boolean;
}

export const RestoreProductModal = ({
    isOpen,
    onClose,
    productName,
    onSubmit,
    processing
}: RestoreProductModalProps) => {
    const t = useTranslation();
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        {t('admin.restore_product')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.confirm_restore_product', { name: productName })}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <p className="text-sm text-primary">
                        {t('admin.restore_product_warning')}
                    </p>
                </div>
                
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        {t('ui.cancel')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? t('admin.restoring') : t('admin.restore_product')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
