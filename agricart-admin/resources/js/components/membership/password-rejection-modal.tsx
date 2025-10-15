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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Reject Password Change
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reject this password change request?
                    </DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-1">Member Details:</h4>
                            <p className="text-red-700">{selectedRequest.member.name}</p>
                            <p className="text-sm text-red-600">Member ID: {selectedRequest.member.member_id}</p>
                            <p className="text-sm text-red-600">
                                Requested: {new Date(selectedRequest.requested_at).toLocaleString()}
                            </p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Reject the password change request</li>
                                <li>Prevent the member from changing their password</li>
                                <li>Mark the request as rejected</li>
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
                        {processing ? 'Rejecting...' : 'Reject'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
