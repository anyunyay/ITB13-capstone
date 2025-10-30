import React, { useEffect, useState } from 'react';
import { UrgentApprovalPopup } from './UrgentApprovalPopup';
import { usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

interface UrgentOrder {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  status: string;
  created_at: string;
  is_urgent?: boolean;
}

interface UrgentOrderPopupProps {
  urgentOrders?: UrgentOrder[];
}

export function UrgentOrderPopup({ urgentOrders = [] }: UrgentOrderPopupProps) {
  const t = useTranslation();
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});
  const page = usePage<SharedData>();

  // Debug logging
  console.log('UrgentOrderPopup: urgentOrders received:', urgentOrders.length, urgentOrders);

  // Generate a unique session identifier on component mount
  useEffect(() => {
    // Create a unique login session identifier if it doesn't exist
    if (!sessionStorage.getItem('loginSessionId')) {
      const loginSessionId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('loginSessionId', loginSessionId);
      console.log('Global urgent popup: New login session created:', loginSessionId);
    }
  }, []);

  // Calculate time left for each urgent order
  useEffect(() => {
    if (!showUrgentPopup || urgentOrders.length === 0) return;

    const calculateTimeLeft = () => {
      const newTimeLeft: { [key: number]: string } = {};
      
      urgentOrders.forEach(order => {
        const orderTime = new Date(order.created_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60);
        const hoursLeft = Math.max(0, 24 - hoursElapsed);
        
        if (hoursLeft > 0) {
          const hours = Math.floor(hoursLeft);
          const minutes = Math.floor((hoursLeft - hours) * 60);
          newTimeLeft[order.id] = `${hours}h ${minutes}m`;
        } else {
          newTimeLeft[order.id] = t('admin.overdue');
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [showUrgentPopup, urgentOrders]);

  // Show popup only once per login session when urgent orders are detected
  useEffect(() => {
    const currentUrgentCount = urgentOrders.length;
    
    if (currentUrgentCount > 0) {
      const loginSessionId = sessionStorage.getItem('loginSessionId');
      const popupShownKey = `urgentPopupShown_${loginSessionId}`;
      const hasShownInThisSession = sessionStorage.getItem(popupShownKey) === 'true';
      
      // Check for force show parameter (for testing)
      const forceShow = new URLSearchParams(window.location.search).get('force_popup') === 'true';
      
      // Show popup if it hasn't been shown in this login session OR if force show is enabled
      if ((!hasShownInThisSession && loginSessionId) || forceShow) {
        console.log('Global urgent popup: Showing popup for', currentUrgentCount, 'urgent orders', forceShow ? '(forced)' : '(first time this login session)');
        setShowUrgentPopup(true);
        
        // Mark as shown for this login session (only if not forced)
        if (!forceShow) {
          sessionStorage.setItem(popupShownKey, 'true');
        }
      } else {
        console.log('Global urgent popup: Not showing popup - already shown in this session');
      }
    } else {
      console.log('Global urgent popup: No urgent orders found');
    }
  }, [urgentOrders.length]);


  // Don't render anything if no urgent orders
  if (urgentOrders.length === 0) {
    return null;
  }

  const handleClose = () => {
    console.log('Global urgent popup: Closing popup');
    setShowUrgentPopup(false);
    // Mark popup as dismissed for flash notification
    if (urgentOrders.length > 0) {
      sessionStorage.setItem('urgentPopupDismissed', 'true');
    }
  };

  const handleGoToOrders = () => {
    console.log('Global urgent popup: Going to orders');
    setShowUrgentPopup(false);
    // Don't show flash notification when going to orders
    sessionStorage.removeItem('urgentPopupDismissed');
    // Navigate to orders page with urgent approval highlighting
    router.visit('/admin/orders?urgent_approval=true&status=pending');
  };

  const getUrgencyLevel = (order: UrgentOrder) => {
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60);
    const hoursLeft = 24 - hoursElapsed;

    if (hoursLeft <= 0) return 'overdue';
    if (hoursLeft <= 2) return 'critical';
    if (hoursLeft <= 4) return 'high';
    return 'medium';
  };

  const getUrgencyBadge = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue':
        return <Badge variant="destructive" className="animate-pulse">{t('admin.overdue')}</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600 animate-pulse">{t('admin.critical')}</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600">{t('admin.high')}</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('admin.medium')}</Badge>;
      default:
        return <Badge variant="outline">{t('admin.unknown')}</Badge>;
    }
  };

  const getUrgencyMessage = (urgencyLevel: string, hoursLeft: number) => {
    switch (urgencyLevel) {
      case 'overdue':
        return t('admin.order_exceeded_deadline_message');
      case 'critical':
        return t('admin.order_critically_urgent_message');
      case 'high':
        return t('admin.order_highly_urgent_message');
      case 'medium':
        return t('admin.order_needs_urgent_attention_message');
      default:
        return t('admin.order_requires_attention_message');
    }
  };

  // Use the original popup for simple cases, time-based popup for detailed view
  if (urgentOrders.length <= 3) {
    return (
      <UrgentApprovalPopup
        isOpen={showUrgentPopup}
        onClose={handleClose}
        onGoToOrders={handleGoToOrders}
        urgentOrderCount={urgentOrders.length}
      />
    );
  }

  // Use detailed time-based popup for multiple orders
  return (
    <Dialog open={showUrgentPopup} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t('admin.urgent_orders_requiring_attention')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.orders_approaching_deadline_message')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {urgentOrders.map((order) => {
            const urgencyLevel = getUrgencyLevel(order);
            const hoursLeft = timeLeft[order.id] || 'Calculating...';
            
            return (
              <Alert key={order.id} className={`${
                urgencyLevel === 'overdue' ? 'border-destructive/20 bg-destructive/5' :
                urgencyLevel === 'critical' ? 'border-destructive/30 bg-destructive/10' :
                urgencyLevel === 'high' ? 'border-secondary/20 bg-secondary/5' :
                'border-primary/20 bg-primary/5'
              }`}>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{t('admin.order_number', { id: order.id })}</p>
                        <p className="text-sm text-gray-600">{t('admin.customer')}: {order.customer.name}</p>
                        <p className="text-sm text-gray-600">{t('admin.amount')}: ₱{order.total_amount.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        {getUrgencyBadge(urgencyLevel)}
                        <p className="text-sm font-medium mt-1">
                          {hoursLeft === t('admin.overdue') ? t('admin.overdue') : t('admin.time_left', { time: hoursLeft })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      {getUrgencyMessage(urgencyLevel, parseFloat(hoursLeft) || 0)}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            {t('ui.dismiss')}
          </Button>
          <Button onClick={handleGoToOrders} className="bg-primary hover:bg-primary/90">
            <Clock className="h-4 w-4 mr-2" />
            {t('admin.go_to_orders')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
