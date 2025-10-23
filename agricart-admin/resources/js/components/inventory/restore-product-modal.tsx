import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Archive, CheckCircle } from 'lucide-react';

interface RestoreProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onSubmit: () => void;
    processing: boolean;
}

export const RestoreProductModal = ({
    isOpen,
    onClose,
    productName,
    onSubmit,
    processing
}: RestoreProductModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Restore Product
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to restore "{productName}"? This will move it back to active products.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <p className="text-sm text-primary">
                        This product will be moved back to active products and will be available for stock management.
                    </p>
                </div>
                
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={onSubmit}
                        disabled={processing}
                    >
                        {processing ? 'Restoring...' : 'Restore Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
