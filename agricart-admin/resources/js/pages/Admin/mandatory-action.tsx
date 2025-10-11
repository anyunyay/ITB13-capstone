import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLockoutModal from '@/components/admin-lockout-modal';
import { toast } from 'sonner';

interface MandatoryActionProps {
  lockoutInfo: {
    id: number;
    type: 'scheduled' | 'daily';
    scheduled_at?: string;
    executed_at?: string;
    description?: string;
    status: string;
    admin_action_required: boolean;
    price_change_confirmation_required?: boolean;
  };
  redirectUrl: string;
}

export default function MandatoryAction({ lockoutInfo, redirectUrl }: MandatoryActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleStayAsIs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/admin/mandatory-action/stay-as-is', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        setIsModalOpen(false);
        router.visit(data.redirect_url || redirectUrl);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/admin/mandatory-action/price-change', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requires_confirmation) {
          // Modal will handle the confirmation step
          toast.success(data.message);
        } else {
          setIsModalOpen(false);
          router.visit(data.redirect_url || redirectUrl);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPriceChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/admin/mandatory-action/cancel-price-change', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        setIsModalOpen(false);
        router.visit(data.redirect_url || redirectUrl);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePriceChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/admin/mandatory-action/approve-price-change', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        setIsModalOpen(false);
        router.visit(data.redirect_url || redirectUrl);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check status periodically to see if mandatory action is still required
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/admin/mandatory-action/status', {
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        
        if (!data.mandatory_action_required) {
          // No more mandatory action required, redirect
          router.visit(redirectUrl);
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [redirectUrl]);

  return (
    <>
      <Head title="Mandatory Admin Action Required" />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Action Required
            </h1>
            <p className="text-gray-600">
              The system is waiting for your decision to restore customer access.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex justify-between">
                <span>Lockout Type:</span>
                <span className="capitalize">{lockoutInfo.type}</span>
              </div>
              {lockoutInfo.scheduled_at && (
                <div className="flex justify-between">
                  <span>Scheduled:</span>
                  <span>{new Date(lockoutInfo.scheduled_at).toLocaleString()}</span>
                </div>
              )}
              {lockoutInfo.executed_at && (
                <div className="flex justify-between">
                  <span>Executed:</span>
                  <span>{new Date(lockoutInfo.executed_at).toLocaleString()}</span>
                </div>
              )}
              {lockoutInfo.description && (
                <div className="text-left">
                  <span className="text-gray-500">Description:</span>
                  <p className="mt-1 text-gray-700">{lockoutInfo.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>Please use the modal to make your decision.</p>
            <p className="mt-2">This page will automatically redirect once the action is completed.</p>
          </div>
        </div>
      </div>

      <AdminLockoutModal
        isOpen={isModalOpen}
        lockoutInfo={lockoutInfo}
        onStayAsIs={handleStayAsIs}
        onPriceChange={handlePriceChange}
        onCancelPriceChange={handleCancelPriceChange}
        onApprovePriceChange={handleApprovePriceChange}
        isLoading={isLoading}
      />
    </>
  );
}
