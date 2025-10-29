import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface OrderActionsProps {
  orderId: number;
  status: string;
  hasInsufficientStock: boolean;
  approveDialogOpen: boolean;
  setApproveDialogOpen: (open: boolean) => void;
  rejectDialogOpen: boolean;
  setRejectDialogOpen: (open: boolean) => void;
  approveForm: {
    data: { admin_notes: string };
    setData: (key: string, value: string) => void;
    processing: boolean;
  };
  rejectForm: {
    data: { admin_notes: string };
    setData: (key: string, value: string) => void;
    processing: boolean;
  };
  selectedRejectionReason: string;
  setSelectedRejectionReason: (reason: string) => void;
  rejectionReasons: string[];
  onApprove: () => void;
  onReject: () => void;
}

export const OrderActions = ({
  orderId,
  status,
  hasInsufficientStock,
  approveDialogOpen,
  setApproveDialogOpen,
  rejectDialogOpen,
  setRejectDialogOpen,
  approveForm,
  rejectForm,
  selectedRejectionReason,
  setSelectedRejectionReason,
  rejectionReasons,
  onApprove,
  onReject
}: OrderActionsProps) => {
  if (status !== 'pending' && status !== 'delayed') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'delayed' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>This order is delayed.</strong> It has exceeded the standard 24-hour processing time but can still be approved or rejected.
            </p>
          </div>
        )}
        {hasInsufficientStock && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ Insufficient Stock Warning:</strong> This order cannot be approved due to insufficient stock. Please check the Available Stock column for details.
            </p>
          </div>
        )}
        
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              variant="default"
              disabled={hasInsufficientStock}
            >
              {hasInsufficientStock ? 'Cannot Approve - Insufficient Stock' : 'Approve Order'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Order #{orderId}</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this order? This will process the stock and complete the order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this approval..."
                  value={approveForm.data.admin_notes}
                  onChange={(e) => approveForm.setData('admin_notes', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onApprove} disabled={approveForm.processing}>
                {approveForm.processing ? 'Approving...' : 'Approve Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => {
                setSelectedRejectionReason('');
                rejectForm.setData('admin_notes', '');
              }}
            >
              Reject Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Order #{orderId}</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this order? Please provide a reason for the rejection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason for Rejection *</label>
                <Select
                  value={selectedRejectionReason}
                  onValueChange={(value) => {
                    setSelectedRejectionReason(value);
                    if (value !== 'Other') {
                      rejectForm.setData('admin_notes', value);
                    } else {
                      rejectForm.setData('admin_notes', '');
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a reason for rejection" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRejectionReason === 'Other' && (
                <div>
                  <label className="text-sm font-medium">Additional Details *</label>
                  <Textarea
                    placeholder="Please provide additional details for the rejection..."
                    value={rejectForm.data.admin_notes}
                    onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectDialogOpen(false);
                setSelectedRejectionReason('');
                rejectForm.setData('admin_notes', '');
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={onReject} 
                disabled={rejectForm.processing || !selectedRejectionReason || (selectedRejectionReason === 'Other' && !rejectForm.data.admin_notes)}
              >
                {rejectForm.processing ? 'Rejecting...' : 'Reject Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
