import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Logistic } from '../../types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface DeactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    logistic: Logistic | null;
    processing: boolean;
}

export const DeactivationModal = ({
    isOpen,
    onClose,
    onConfirm,
    logistic,
    processing
}: DeactivationModalProps) => {
    const t = useTranslation();
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {t('admin.confirm_deactivation')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.are_you_sure_deactivate_logistics')}
                    </DialogDescription>
                </DialogHeader>
                
                {logistic && (
                    <div className="space-y-3">
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-1">{t('admin.logistics_partner_details')}</h4>
                            <p className="text-orange-700">{logistic.name}</p>
                            <p className="text-sm text-orange-600">{logistic.email}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>{t('admin.this_action_will')}</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>{t('admin.deactivate_logistics_account')}</li>
                                <li>{t('admin.prevent_system_access')}</li>
                                <li>{t('admin.move_to_deactivated_logistics_list')}</li>
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
                        {processing ? t('admin.deactivating') : t('admin.deactivate')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
