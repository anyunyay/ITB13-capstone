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
                        {isReactivation ? 'Confirm Reactivation' : 'Confirm Deactivation'}
                    </DialogTitle>
                    <DialogDescription>
                        {isReactivation 
                            ? 'Are you sure you want to reactivate this member?'
                            : 'Are you sure you want to deactivate this member?'
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
                                Member Details:
                            </h4>
                            <p className={isReactivation ? 'text-green-700' : 'text-orange-700'}>
                                {selectedMember.name}
                            </p>
                            <p className={`text-sm ${
                                isReactivation ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                Member ID: {selectedMember.member_id}
                            </p>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <p><strong>This action will:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                {isReactivation ? (
                                    <>
                                        <li>Reactivate the member account</li>
                                        <li>Allow them to access the system again</li>
                                        <li>Move them back to the active members list</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Deactivate the member account</li>
                                        <li>Prevent them from accessing the system</li>
                                        <li>Move them to the deactivated members list</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant={isReactivation ? "default" : "destructive"}
                        onClick={onConfirm}
                        disabled={processing}
                        className={isReactivation ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                        {processing 
                            ? (isReactivation ? 'Reactivating...' : 'Deactivating...')
                            : (isReactivation ? 'Reactivate' : 'Deactivate')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
