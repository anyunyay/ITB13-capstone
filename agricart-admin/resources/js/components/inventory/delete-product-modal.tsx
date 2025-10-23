import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const DeleteProductModal = ({
    isOpen,
    onClose,
    productName,
    reason,
    onReasonChange,
    onSubmit,
    processing
}: DeleteProductModalProps) => {
    const handleClose = () => {
        onClose();
        onReasonChange('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Delete Product
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete "{productName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for deleting this product..."
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm text-destructive">
                            This action will permanently delete the product and all associated data. This cannot be undone.
                        </p>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
