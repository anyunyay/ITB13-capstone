import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';

interface UrgentFlashNotificationProps {
  urgentOrderCount: number;
  isVisible: boolean;
  onDismiss: () => void;
}

export function UrgentFlashNotification({ 
  urgentOrderCount, 
  isVisible, 
  onDismiss 
}: UrgentFlashNotificationProps) {
  const t = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible && urgentOrderCount > 0) {
      setShow(true);
    }
  }, [isVisible, urgentOrderCount]);

  const handleGoToOrders = () => {
    router.visit('/admin/orders?urgent_approval=true&status=pending');
    handleDismiss();
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss();
  };

  if (!show || urgentOrderCount === 0) {
    return null;
  }

  return (
    <div className="w-full px-6 py-3 border-b border-sidebar-border/50">
      <Alert className="border-amber-200 bg-amber-50 shadow-sm">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-amber-800">
            <strong className="font-semibold">{t('admin.urgent_orders_count', { count: urgentOrderCount })}</strong> {t('admin.need_urgent_approval_8h')}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToOrders}
              className="text-amber-700 border-amber-300 hover:bg-amber-100 bg-white shadow-sm"
            >
              {t('admin.go_to_orders')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-amber-600 hover:bg-amber-100 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
