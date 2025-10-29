import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface UrgentApprovalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOrders?: () => void;
  urgentOrderCount: number;
}

export function UrgentApprovalPopup({ isOpen, onClose, onGoToOrders, urgentOrderCount }: UrgentApprovalPopupProps) {
  const handleGoToOrders = () => {
    if (onGoToOrders) {
      onGoToOrders();
    }
    onClose();
    // Navigate to orders page with urgent approval highlighting
    router.visit('/admin/orders?urgent_approval=true&status=pending');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Urgent Order Approval Required
          </DialogTitle>
          <DialogDescription>
            You have orders that need immediate attention.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 shadow-sm">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong className="font-semibold">{urgentOrderCount} order{urgentOrderCount !== 1 ? 's' : ''}</strong> need{urgentOrderCount === 1 ? 's' : ''} approval within the next 8 hours.
              <br />
              <span className="text-sm text-amber-700">Orders must be approved within 24 hours of placement.</span>
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground">
            <p>Please review and approve these orders to avoid automatic expiration.</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Dismiss
          </Button>
          <Button onClick={handleGoToOrders} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            Go to Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
