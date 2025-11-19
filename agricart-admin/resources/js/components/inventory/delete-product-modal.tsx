import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface DeleteProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onSubmit: () => void;
    processing: boolean;
}

export const DeleteProductModal = ({
    isOpen,
    onClose,
    productName,
    onSubmit,
    processing
}: DeleteProductModalProps) => {
    const t = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        {t('admin.delete_product')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.confirm_delete_product', { name: productName })}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                        {t('admin.delete_product_warning')}
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
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? t('ui.deleting') : t('admin.delete_product')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
