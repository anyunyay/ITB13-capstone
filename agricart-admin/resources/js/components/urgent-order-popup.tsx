import React, { useEffect, useState } from 'react';
import { UrgentApprovalPopup } from './UrgentApprovalPopup';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

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
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);
  const page = usePage<SharedData>();

  // Generate a unique session identifier on component mount
  useEffect(() => {
    // Create a unique login session identifier if it doesn't exist
    if (!sessionStorage.getItem('loginSessionId')) {
      const loginSessionId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('loginSessionId', loginSessionId);
      console.log('Global urgent popup: New login session created:', loginSessionId);
    }
  }, []);

  // Show popup only once per login session when urgent orders are detected
  useEffect(() => {
    const currentUrgentCount = urgentOrders.length;
    
    if (currentUrgentCount > 0) {
      const loginSessionId = sessionStorage.getItem('loginSessionId');
      const popupShownKey = `urgentPopupShown_${loginSessionId}`;
      const hasShownInThisSession = sessionStorage.getItem(popupShownKey) === 'true';
      
      // Show popup only if it hasn't been shown in this login session
      if (!hasShownInThisSession && loginSessionId) {
        console.log('Global urgent popup: Showing popup for', currentUrgentCount, 'urgent orders (first time this login session)');
        setShowUrgentPopup(true);
        
        // Mark as shown for this login session
        sessionStorage.setItem(popupShownKey, 'true');
      }
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
  };

  return (
    <UrgentApprovalPopup
      isOpen={showUrgentPopup}
      onClose={handleClose}
      onGoToOrders={handleGoToOrders}
      urgentOrderCount={urgentOrders.length}
    />
  );
}
