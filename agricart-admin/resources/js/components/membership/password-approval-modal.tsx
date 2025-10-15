import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';

interface PasswordApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRequest: PasswordChangeRequest | null;
    onConfirm: () => void;
    processing: boolean;
}

export const PasswordApprovalModal = ({
    isOpen,
    onClose,
    selectedRequest,
    onConfirm,
    processing
}: PasswordApprovalModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Approve Password Change
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to approve this password change request?
                    </DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-1">Member Details:</h4>
                            <p className="text-green-700">{selectedRequest.member.name}</p>
                            <p className="text-sm text-green-600">Member ID: {selectedRequest.member.member_id}</p>
                            <p className="text-sm text-green-600">
                                Requested: {new Date(selectedRequest.requested_at).toLocaleString()}
                            </p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Approve the password change request</li>
                                <li>Allow the member to change their password</li>
                                <li>Mark the request as processed</li>
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
                        {processing ? 'Approving...' : 'Approve'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
