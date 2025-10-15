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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Confirm Reactivation
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reactivate this logistics partner?
                    </DialogDescription>
                </DialogHeader>
                
                {logistic && (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-1">Logistics Partner Details:</h4>
                            <p className="text-green-700">{logistic.name}</p>
                            <p className="text-sm text-green-600">{logistic.email}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Reactivate the logistics partner account</li>
                                <li>Allow them to access the system again</li>
                                <li>Move them back to the active logistics list</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? 'Reactivating...' : 'Reactivate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
