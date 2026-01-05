import { Button } from '@/components/ui/button';
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
    onSubmit: () => void;
    processing: boolean;
}

export const ArchiveProductModal = ({
    isOpen,
    onClose,
    productName,
    onSubmit,
    processing
}: ArchiveProductModalProps) => {
    const t = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        {t('admin.archive_product_warning')}
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
                        {processing ? t('admin.archiving') : t('admin.archive_product')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
