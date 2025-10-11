import React from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemLockoutProps {
  lockoutInfo: {
    date: string;
    lockout_time: string | null;
    admin_action: 'pending' | 'keep_prices' | 'price_change';
    price_change_status: 'pending' | 'cancelled' | 'approved' | null;
    message: string;
  };
}

export default function SystemLockout({ lockoutInfo }: SystemLockoutProps) {
  const getStatusIcon = () => {
    if (lockoutInfo.admin_action === 'pending') {
      return <Clock className="h-8 w-8 text-orange-500" />;
    }
    if (lockoutInfo.admin_action === 'price_change' && lockoutInfo.price_change_status === 'pending') {
      return <Clock className="h-8 w-8 text-yellow-500" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-500" />;
  };

  const getStatusTitle = () => {
    if (lockoutInfo.admin_action === 'pending') {
      return 'System Maintenance in Progress';
    }
    if (lockoutInfo.admin_action === 'price_change' && lockoutInfo.price_change_status === 'pending') {
      return 'Price Updates in Progress';
    }
    return 'System Temporarily Unavailable';
  };

  return (
    <>
      <Head title="System Temporarily Unavailable" />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
              <CardDescription>
                We're currently updating our system. Please check back later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {lockoutInfo.message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{lockoutInfo.date}</span>
                </div>
                {lockoutInfo.lockout_time && (
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>{new Date(lockoutInfo.lockout_time).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Thank you for your patience. We'll be back online shortly.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Agricart Admin System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
