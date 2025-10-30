import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { Logistic } from '../../types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface ReactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    logistic: Logistic | null;
    processing: boolean;
}

export const ReactivationModal = ({
    isOpen,
    onClose,
    onConfirm,
    logistic,
    processing
}: ReactivationModalProps) => {
    const t = useTranslation();
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {t('admin.confirm_reactivation')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin.are_you_sure_reactivate_logistics')}
                    </DialogDescription>
                </DialogHeader>
                
                {logistic && (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-1">{t('admin.logistics_partner_details')}</h4>
                            <p className="text-green-700">{logistic.name}</p>
                            <p className="text-sm text-green-600">{logistic.email}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>{t('admin.this_action_will')}</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>{t('admin.reactivate_logistics_account')}</li>
                                <li>{t('admin.allow_system_access')}</li>
                                <li>{t('admin.move_to_active_logistics_list')}</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('admin.cancel')}
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? t('admin.reactivating') : t('admin.reactivate')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
