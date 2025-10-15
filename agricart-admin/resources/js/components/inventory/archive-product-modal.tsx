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
import { Archive, AlertTriangle } from 'lucide-react';

interface ArchiveProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const ArchiveProductModal = ({
    isOpen,
    onClose,
    productName,
    reason,
    onReasonChange,
    onSubmit,
    processing
}: ArchiveProductModalProps) => {
    const handleClose = () => {
        onClose();
        onReasonChange('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Archive Product
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to archive "{productName}"? This will remove it from active products.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Archiving (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for archiving this product..."
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            This product will be moved to archived products and can be restored later.
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
                        variant="default"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? 'Archiving...' : 'Archive Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
