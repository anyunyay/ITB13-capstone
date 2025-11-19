import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Staff } from '@/types/staff';
import { useTranslation } from '@/hooks/use-translation';

interface StaffDeactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff | null;
    onConfirm: () => void;
    processing: boolean;
}

export const StaffDeactivationModal = ({
    isOpen,
    onClose,
    staff,
    onConfirm,
    processing
}: StaffDeactivationModalProps) => {
    const t = useTranslation();

    if (!staff) return null;

    const canDeactivate = staff.can_be_deactivated;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {canDeactivate ? t('admin.confirm_deactivate') : t('admin.cannot_deactivate')}
                    </DialogTitle>
                    <DialogDescription>
                        {canDeactivate ? (
                            <div className="space-y-2">
                                <p>{t('admin.deactivate_staff_warning', { name: staff.name })}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.deactivate_staff_description')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-destructive font-medium">
                                    {staff.deactivation_reason || t('admin.cannot_deactivate_staff')}
                                </p>
                            </div>
                        )}
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
                    {canDeactivate && (
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={processing}
                        >
                            {processing ? t('ui.deactivating') : t('admin.deactivate')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
