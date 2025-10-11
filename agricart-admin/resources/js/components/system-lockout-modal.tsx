import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemLockoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    id: number;
    system_date: string;
    is_locked: boolean;
    admin_action: 'pending' | 'keep_prices' | 'price_change';
    price_change_status: 'pending' | 'cancelled' | 'approved' | null;
    lockout_time: string | null;
    admin_action_time: string | null;
    price_change_action_time: string | null;
    admin_user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
  canTakeAction: boolean;
  nextAction: string | null;
  onKeepPrices: () => void;
  onApplyPriceChanges: () => void;
  onCancelPriceChanges: () => void;
  onApprovePriceChanges: () => void;
  isLoading: boolean;
}

export default function SystemLockoutModal({
  isOpen,
  onClose,
  schedule,
  canTakeAction,
  nextAction,
  onKeepPrices,
  onApplyPriceChanges,
  onCancelPriceChanges,
  onApprovePriceChanges,
  isLoading
}: SystemLockoutModalProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setConfirmAction(action);
  };

  const confirmActionHandler = () => {
    switch (confirmAction) {
      case 'keep_prices':
        onKeepPrices();
        break;
      case 'apply_price_changes':
        onApplyPriceChanges();
        break;
      case 'cancel_price_changes':
        onCancelPriceChanges();
        break;
      case 'approve_price_changes':
        onApprovePriceChanges();
        break;
    }
    setConfirmAction(null);
  };

  const getStatusIcon = () => {
    if (schedule.admin_action === 'keep_prices') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (schedule.admin_action === 'price_change') {
      if (schedule.price_change_status === 'approved') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      }
      if (schedule.price_change_status === 'cancelled') {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusMessage = () => {
    if (schedule.admin_action === 'pending') {
      return 'Waiting for admin decision on pricing updates';
    }
    if (schedule.admin_action === 'keep_prices') {
      return 'Prices kept as is. Customer access restored.';
    }
    if (schedule.admin_action === 'price_change') {
      if (schedule.price_change_status === 'pending') {
        return 'Price changes approved. Waiting for final confirmation.';
      }
      if (schedule.price_change_status === 'approved') {
        return 'Price changes approved and applied. Customer access restored.';
      }
      if (schedule.price_change_status === 'cancelled') {
        return 'Price changes cancelled. Customer access restored.';
      }
    }
    return 'System status unknown';
  };

  const getActionButtons = () => {
    if (!canTakeAction) {
      return null;
    }

    if (nextAction === 'admin_decision') {
      return (
        <div className="flex gap-3">
          <Button
            onClick={() => handleAction('keep_prices')}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Keep Prices As Is
          </Button>
          <Button
            onClick={() => handleAction('apply_price_changes')}
            className="flex-1"
            disabled={isLoading}
          >
            Apply Price Changes
          </Button>
        </div>
      );
    }

    if (nextAction === 'price_change_action') {
      return (
        <div className="flex gap-3">
          <Button
            onClick={() => handleAction('cancel_price_changes')}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAction('approve_price_changes')}
            className="flex-1"
            disabled={isLoading}
          >
            Good to Go
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Daily System Lockout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getStatusIcon()}
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                {getStatusMessage()}
              </CardDescription>
            </CardContent>
          </Card>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{schedule.system_date}</span>
            </div>
            {schedule.lockout_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lockout Time:</span>
                <span>{new Date(schedule.lockout_time).toLocaleString()}</span>
              </div>
            )}
            {schedule.admin_action_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin Action:</span>
                <span>{new Date(schedule.admin_action_time).toLocaleString()}</span>
              </div>
            )}
            {schedule.admin_user && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action By:</span>
                <span>{schedule.admin_user.name}</span>
              </div>
            )}
          </div>

          {canTakeAction && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Customer access is currently blocked. Please make a decision to restore access.
              </AlertDescription>
            </Alert>
          )}

          {getActionButtons()}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {confirmAction === 'keep_prices' && 
                  'Are you sure you want to keep prices as is? This will immediately restore customer access.'}
                {confirmAction === 'apply_price_changes' && 
                  'Are you sure you want to apply price changes? You will need to confirm this action again.'}
                {confirmAction === 'cancel_price_changes' && 
                  'Are you sure you want to cancel the price changes? This will restore customer access with current prices.'}
                {confirmAction === 'approve_price_changes' && 
                  'Are you sure you want to approve the price changes? This will apply the changes and restore customer access.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setConfirmAction(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmActionHandler}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
