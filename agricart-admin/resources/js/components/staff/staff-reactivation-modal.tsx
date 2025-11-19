import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Staff } from '@/types/staff';
import { useTranslation } from '@/hooks/use-translation';

interface StaffReactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff | null;
    onConfirm: () => void;
    processing: boolean;
}

export const StaffReactivationModal = ({
    isOpen,
    onClose,
    staff,
    onConfirm,
    processing
}: StaffReactivationModalProps) => {
    const t = useTranslation();

    if (!staff) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-green-600" />
                        {t('admin.confirm_reactivate')}
                    </DialogTitle>
                    <DialogDescription>
                        <div className="space-y-2">
                            <p>{t('admin.reactivate_staff_warning', { name: staff.name })}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('admin.reactivate_staff_description')}
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        {t('ui.cancel')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {processing ? t('ui.reactivating') : t('admin.reactivate')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
