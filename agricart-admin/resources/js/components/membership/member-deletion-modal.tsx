import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Member } from '@/types/membership';
import { useTranslation } from '@/hooks/use-translation';

interface MemberDeletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
    onConfirm: () => void;
    processing: boolean;
}

export const MemberDeletionModal = ({
    isOpen,
    onClose,
    member,
    onConfirm,
    processing
}: MemberDeletionModalProps) => {
    const t = useTranslation();

    if (!member) return null;

    const canDelete = member.can_be_deleted;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {canDelete ? t('admin.confirm_delete') : t('admin.cannot_delete')}
                    </DialogTitle>
                    <DialogDescription>
                        {canDelete ? (
                            <div className="space-y-2">
                                <p>{t('admin.delete_member_warning', { name: member.name })}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.delete_action_permanent')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-destructive font-medium">
                                    {member.deletion_reason || t('admin.cannot_delete_has_linked_data')}
                                </p>
                                <p className="text-sm">
                                    {t('admin.please_deactivate_instead')}
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
                    {canDelete && (
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={processing}
                        >
                            {processing ? t('ui.deleting') : t('ui.delete')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
