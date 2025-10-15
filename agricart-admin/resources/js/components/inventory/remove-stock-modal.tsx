import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from 'lucide-react';
import { Stock } from '@/types/inventory';

interface RemoveStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStock: Stock | null;
    reason: string;
    otherReason: string;
    onReasonChange: (reason: string) => void;
    onOtherReasonChange: (otherReason: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

export const RemoveStockModal = ({
    isOpen,
    onClose,
    selectedStock,
    reason,
    otherReason,
    onReasonChange,
    onOtherReasonChange,
    onSubmit,
    processing
}: RemoveStockModalProps) => {
    const handleClose = () => {
        onClose();
        onReasonChange('');
        onOtherReasonChange('');
    };

    const isSubmitDisabled = !selectedStock || !reason || (reason === 'Other' && !otherReason) || processing;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Remove Stock
                    </DialogTitle>
                    <DialogDescription>
                        Remove stock that is no longer available for sale. 
                        This action will record the removal in the stock trail with your reason.
                    </DialogDescription>
                </DialogHeader>
                
                {selectedStock && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            {selectedStock.product?.image_url && (
                                <img 
                                    src={selectedStock.product.image_url} 
                                    alt={selectedStock.product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">{selectedStock.product?.name || 'Unknown Product'}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Stock ID: #{selectedStock.id}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="stock_info" className="text-sm font-medium">Stock Information</Label>
                            <div className="p-4 bg-muted/30 rounded-lg border">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                                        <p className="font-semibold">
                                            {selectedStock.quantity} {selectedStock.category}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Member</p>
                                        <p className="font-semibold">
                                            {selectedStock.member?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="reason" className="text-sm font-medium">Reason for Removal *</Label>
                            <Select 
                                value={reason} 
                                onValueChange={onReasonChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason for removal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sold Out">Sold Out</SelectItem>
                                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                                    <SelectItem value="Damaged/Defective">Damaged/Defective</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Season Ended">Season Ended</SelectItem>
                                    <SelectItem value="Listing Error">Listing Error</SelectItem>
                                    <SelectItem value="Vendor Inactive">Vendor Inactive</SelectItem>
                                    <SelectItem value="Under Update">Under Update</SelectItem>
                                    <SelectItem value="Regulatory Issue">Regulatory Issue</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {reason === 'Other' && (
                                <div className="space-y-2">
                                    <Label htmlFor="other_reason" className="text-sm font-medium">Specify Other Reason *</Label>
                                    <Textarea
                                        id="other_reason"
                                        value={otherReason || ''}
                                        onChange={(e) => onOtherReasonChange(e.target.value)}
                                        placeholder="Please specify the reason for removal"
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        <Alert className="border-destructive/50 bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertTitle className="text-destructive">Important Notice</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                This action will permanently remove the selected stock from inventory. 
                                The removal will be recorded in the stock trail with your provided reason.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleClose}
                        className="flex-1"
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button"
                        disabled={isSubmitDisabled}
                        onClick={onSubmit}
                        variant="destructive"
                        className="flex-1"
                    >
                        {processing ? 'Removing...' : 'Remove Stock'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
