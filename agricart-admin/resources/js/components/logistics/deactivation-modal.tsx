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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Confirm Deactivation
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to deactivate this logistics partner?
                    </DialogDescription>
                </DialogHeader>
                
                {logistic && (
                    <div className="space-y-3">
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-1">Logistics Partner Details:</h4>
                            <p className="text-orange-700">{logistic.name}</p>
                            <p className="text-sm text-orange-600">{logistic.email}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Deactivate the logistics partner account</li>
                                <li>Prevent them from accessing the system</li>
                                <li>Move them to the deactivated logistics list</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
