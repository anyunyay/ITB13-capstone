import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { XCircle } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';
import { useTranslation } from '@/hooks/use-translation';

interface PasswordRejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRequest: PasswordChangeRequest | null;
    onConfirm: () => void;
    processing: boolean;
}

export const PasswordRejectionModal = ({
    isOpen,
    onClose,
    selectedRequest,
    onConfirm,
    processing
}: PasswordRejectionModalProps) => {
    const t = useTranslation();
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        {t('admin.reject_password_change')}
                    </DialogTitle>
                    <DialogDescription>{t('admin.confirm_reject_password_change')}</DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-1">{t('admin.member_details')}</h4>
                            <p className="text-red-700">{selectedRequest.member.name}</p>
                            <p className="text-sm text-red-600">{t('admin.member_id')}: {selectedRequest.member.member_id}</p>
                            <p className="text-sm text-red-600">{t('admin.requested_at', {date: new Date(selectedRequest.requested_at).toLocaleString()})}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>{t('admin.this_action_will')}</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>{t('admin.reject_password_change_request')}</li>
                                <li>{t('admin.prevent_member_password_change')}</li>
                                <li>{t('admin.mark_request_as_rejected')}</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('ui.cancel')}
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? t('admin.rejecting') : t('admin.reject')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
