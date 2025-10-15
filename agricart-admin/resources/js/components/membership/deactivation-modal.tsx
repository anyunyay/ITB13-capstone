import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from 'lucide-react';
import { Member } from '../../types/membership';

interface DeactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedMember: Member | null;
    onConfirm: () => void;
    processing: boolean;
}

export const DeactivationModal = ({
    isOpen,
    onClose,
    selectedMember,
    onConfirm,
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
                        Are you sure you want to deactivate this member?
                    </DialogDescription>
                </DialogHeader>
                
                {selectedMember && (
                    <div className="space-y-3">
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-1">Member Details:</h4>
                            <p className="text-orange-700">{selectedMember.name}</p>
                            <p className="text-sm text-orange-600">Member ID: {selectedMember.member_id}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Deactivate the member account</li>
                                <li>Prevent them from accessing the system</li>
                                <li>Move them to the deactivated members list</li>
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
