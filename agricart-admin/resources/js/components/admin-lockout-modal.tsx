import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLockoutModalProps {
  isOpen: boolean;
  lockoutInfo: {
    id: number;
    type: 'scheduled' | 'daily';
    scheduled_at?: string;
    executed_at?: string;
    description?: string;
    status: string;
    admin_action_required: boolean;
  };
  onStayAsIs: () => Promise<void>;
  onPriceChange: () => Promise<void>;
  onCancelPriceChange: () => Promise<void>;
  onApprovePriceChange: () => Promise<void>;
  isLoading: boolean;
}

export default function AdminLockoutModal({
  isOpen,
  lockoutInfo,
  onStayAsIs,
  onPriceChange,
  onCancelPriceChange,
  onApprovePriceChange,
  isLoading
}: AdminLockoutModalProps) {
  const [currentStep, setCurrentStep] = useState<'decision' | 'price_change_confirmation'>('decision');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('decision');
      setActionLoading(null);
    }
  }, [isOpen]);

  const handleStayAsIs = async () => {
    setActionLoading('stay_as_is');
    try {
      await onStayAsIs();
      toast.success('Customer access has been restored. Prices remain unchanged.');
    } catch (error) {
      toast.error('Failed to restore customer access. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePriceChange = async () => {
    setActionLoading('price_change');
    try {
      await onPriceChange();
      setCurrentStep('price_change_confirmation');
      toast.success('Price change approved. Please confirm to proceed.');
    } catch (error) {
      toast.error('Failed to approve price changes. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelPriceChange = async () => {
    setActionLoading('cancel_price_change');
    try {
      await onCancelPriceChange();
      toast.success('Price changes cancelled. Customer access restored.');
    } catch (error) {
      toast.error('Failed to cancel price changes. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprovePriceChange = async () => {
    setActionLoading('approve_price_change');
    try {
      await onApprovePriceChange();
      toast.success('Price changes approved and applied. Customer access restored.');
    } catch (error) {
      toast.error('Failed to approve price changes. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = () => {
    if (lockoutInfo.type === 'scheduled') {
      return <Clock className="h-8 w-8 text-orange-500" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-500" />;
  };

  const getStatusTitle = () => {
    if (lockoutInfo.type === 'scheduled') {
      return 'Scheduled System Lockout Active';
    }
    return 'Daily System Lockout Active';
  };

  const getStatusMessage = () => {
    if (lockoutInfo.type === 'scheduled') {
      return 'A scheduled system lockout is currently active. Customer access is blocked until you make a decision.';
    }
    return 'Daily system lockout is active. Customer access is blocked until you make a decision.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-6 w-6 text-red-500" />
            Mandatory Admin Action Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                {getStatusIcon()}
                {getStatusTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-red-700">
                {getStatusMessage()}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Lockout Details */}
          <div className="space-y-2 text-sm">
            {lockoutInfo.scheduled_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Time:</span>
                <span>{new Date(lockoutInfo.scheduled_at).toLocaleString()}</span>
              </div>
            )}
            {lockoutInfo.executed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Executed Time:</span>
                <span>{new Date(lockoutInfo.executed_at).toLocaleString()}</span>
              </div>
            )}
            {lockoutInfo.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description:</span>
                <span className="text-right max-w-xs">{lockoutInfo.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{lockoutInfo.status}</span>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Action Required:</strong> Customer access is currently blocked. You must make a decision to restore access.
            </AlertDescription>
          </Alert>

          {/* Decision Step */}
          {currentStep === 'decision' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose Your Action</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select how you want to proceed with the current pricing:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleStayAsIs}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  disabled={isLoading || actionLoading !== null}
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-semibold">Stay as Is</div>
                    <div className="text-xs text-muted-foreground">Keep current prices and restore access</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePriceChange}
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  disabled={isLoading || actionLoading !== null}
                >
                  <Shield className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Price Change</div>
                    <div className="text-xs opacity-90">Apply price changes and restore access</div>
                  </div>
                </Button>
              </div>

              {actionLoading === 'stay_as_is' && (
                <div className="text-center text-sm text-muted-foreground">
                  Restoring customer access...
                </div>
              )}

              {actionLoading === 'price_change' && (
                <div className="text-center text-sm text-muted-foreground">
                  Processing price change approval...
                </div>
              )}
            </div>
          )}

          {/* Price Change Confirmation Step */}
          {currentStep === 'price_change_confirmation' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Confirm Price Changes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have approved price changes. Please confirm to proceed:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCancelPriceChange}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  disabled={isLoading || actionLoading !== null}
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div className="text-center">
                    <div className="font-semibold">Cancel</div>
                    <div className="text-xs text-muted-foreground">Cancel changes and restore access</div>
                  </div>
                </Button>

                <Button
                  onClick={handleApprovePriceChange}
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  disabled={isLoading || actionLoading !== null}
                >
                  <CheckCircle className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Good to Go</div>
                    <div className="text-xs opacity-90">Apply changes and restore access</div>
                  </div>
                </Button>
              </div>

              {actionLoading === 'cancel_price_change' && (
                <div className="text-center text-sm text-muted-foreground">
                  Cancelling price changes...
                </div>
              )}

              {actionLoading === 'approve_price_change' && (
                <div className="text-center text-sm text-muted-foreground">
                  Applying price changes...
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>This action is required to restore customer access</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
