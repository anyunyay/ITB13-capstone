import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import SystemLockoutModal from '@/components/system-lockout-modal';
import { toast } from 'sonner';

interface SystemLockoutIndexProps {
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
}

export default function SystemLockoutIndex({ 
  schedule: initialSchedule, 
  canTakeAction: initialCanTakeAction, 
  nextAction: initialNextAction 
}: SystemLockoutIndexProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [canTakeAction, setCanTakeAction] = useState(initialCanTakeAction);
  const [nextAction, setNextAction] = useState(initialNextAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/admin/system-lockout/status');
      const data = await response.json();
      setSchedule(data.schedule);
      setCanTakeAction(data.canTakeAction);
      setNextAction(data.nextAction);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/admin/system-lockout/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setSchedule(data.schedule);
        setCanTakeAction(data.canTakeAction);
        setNextAction(data.nextAction);
        setIsModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to process action. Please try again.');
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (schedule.admin_action === 'pending') {
      return <Badge variant="destructive">Pending Decision</Badge>;
    }
    if (schedule.admin_action === 'keep_prices') {
      return <Badge variant="default">Prices Kept</Badge>;
    }
    if (schedule.admin_action === 'price_change') {
      if (schedule.price_change_status === 'pending') {
        return <Badge variant="secondary">Price Change Pending</Badge>;
      }
      if (schedule.price_change_status === 'approved') {
        return <Badge variant="default">Price Changes Applied</Badge>;
      }
      if (schedule.price_change_status === 'cancelled') {
        return <Badge variant="outline">Price Changes Cancelled</Badge>;
      }
    }
    return <Badge variant="outline">Unknown</Badge>;
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
      return 'System is locked and waiting for admin decision on pricing updates.';
    }
    if (schedule.admin_action === 'keep_prices') {
      return 'Prices were kept as is. Customer access has been restored.';
    }
    if (schedule.admin_action === 'price_change') {
      if (schedule.price_change_status === 'pending') {
        return 'Price changes were approved. Waiting for final confirmation to apply changes.';
      }
      if (schedule.price_change_status === 'approved') {
        return 'Price changes were approved and applied. Customer access has been restored.';
      }
      if (schedule.price_change_status === 'cancelled') {
        return 'Price changes were cancelled. Customer access has been restored with current prices.';
      }
    }
    return 'System status is unknown.';
  };

  // Auto-refresh every 30 seconds if action is pending
  useEffect(() => {
    if (canTakeAction || nextAction) {
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [canTakeAction, nextAction]);

  return (
    <>
      <Head title="System Lockout Management" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Lockout Management</h1>
            <p className="text-muted-foreground">
              Manage daily system lockouts and customer access
            </p>
          </div>
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Current Status
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getStatusMessage()}
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{schedule.system_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Locked:</span>
                  <span className={schedule.is_locked ? 'text-red-500' : 'text-green-500'}>
                    {schedule.is_locked ? 'Yes' : 'No'}
                  </span>
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
                {schedule.price_change_action_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Change Action:</span>
                    <span>{new Date(schedule.price_change_action_time).toLocaleString()}</span>
                  </div>
                )}
                {schedule.admin_user && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action By:</span>
                    <span>{schedule.admin_user.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canTakeAction ? (
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Customer access is currently blocked. Take action to restore access.
                    </AlertDescription>
                  </Alert>
                  
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {nextAction === 'admin_decision' ? 'Make Decision' : 'Take Action'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No action required at this time.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    onClick={fetchStatus}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <SystemLockoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          schedule={schedule}
          canTakeAction={canTakeAction}
          nextAction={nextAction}
          onKeepPrices={() => handleAction('keep-prices')}
          onApplyPriceChanges={() => handleAction('apply-price-changes')}
          onCancelPriceChanges={() => handleAction('cancel-price-changes')}
          onApprovePriceChanges={() => handleAction('approve-price-changes')}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
