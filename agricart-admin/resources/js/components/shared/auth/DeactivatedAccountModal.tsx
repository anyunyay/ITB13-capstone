import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeactivatedAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DeactivatedAccountModal({ isOpen, onClose }: DeactivatedAccountModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl">Account Deactivated</DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-2">
                        Your account has been deactivated and you cannot access the system at this time.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 pt-4">
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                        <p className="text-sm text-red-800">
                            If you believe this is an error or need to reactivate your account, please contact support for assistance.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={onClose} variant="default">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
