import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Member } from '../../types/membership';
import { useTranslation } from '@/hooks/use-translation';

interface DeactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedMember: Member | null;
    onConfirm: () => void;
    processing: boolean;
    isReactivation?: boolean;
}

export const DeactivationModal = ({
    isOpen,
    onClose,
    selectedMember,
    onConfirm,
    processing,
    isReactivation = false
}: DeactivationModalProps) => {
    const t = useTranslation();
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isReactivation ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        {isReactivation ? t('admin.confirm_reactivation') : t('admin.confirm_deactivation')}
                    </DialogTitle>
                    <DialogDescription>
                        {isReactivation 
                            ? t('admin.confirm_reactivate_member')
                            : t('admin.confirm_deactivate_member')
                        }
                    </DialogDescription>
                </DialogHeader>
                
                {selectedMember && (
                    <div className="space-y-3">
                        <div className={`p-3 border rounded-lg ${
                            isReactivation 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-orange-50 border-orange-200'
                        }`}>
                            <h4 className={`font-medium mb-1 ${
                                isReactivation ? 'text-green-800' : 'text-orange-800'
                            }`}>
                                {t('admin.member_details')}:
                            </h4>
                            <p className={isReactivation ? 'text-green-700' : 'text-orange-700'}>
                                {selectedMember.name}
                            </p>
                            <p className={`text-sm ${
                                isReactivation ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {t('admin.member_id')}: {selectedMember.member_id}
                            </p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>{t('admin.this_action_will')}:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                {isReactivation ? (
                                    <>
                                        <li>{t('admin.reactivate_member_account')}</li>
                                        <li>{t('admin.allow_system_access')}</li>
                                        <li>{t('admin.move_to_active_list')}</li>
                                    </>
                                ) : (
                                    <>
                                        <li>{t('admin.deactivate_member_account')}</li>
                                        <li>{t('admin.prevent_system_access')}</li>
                                        <li>{t('admin.move_to_deactivated_list')}</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('ui.cancel')}
                    </Button>
                    <Button 
                        variant={isReactivation ? "default" : "destructive"}
                        onClick={onConfirm}
                        disabled={processing}
                        className={isReactivation ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                        {processing 
                            ? (isReactivation ? t('admin.reactivating') : t('admin.deactivating'))
                            : (isReactivation ? t('admin.reactivate_member') : t('admin.deactivate_member'))
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
