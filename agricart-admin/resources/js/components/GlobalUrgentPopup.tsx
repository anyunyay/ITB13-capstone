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

interface GlobalUrgentPopupProps {
  urgentOrders?: UrgentOrder[];
}

export function GlobalUrgentPopup({ urgentOrders = [] }: GlobalUrgentPopupProps) {
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);
  const [lastUrgentCount, setLastUrgentCount] = useState(0);

  // Check for new session on component mount
  useEffect(() => {
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    const currentTime = Date.now();
    
    // If no session start time or it's been more than 2 hours, consider it a new session
    if (!sessionStartTime || (currentTime - parseInt(sessionStartTime)) > 2 * 60 * 60 * 1000) {
      console.log('Global urgent popup: New session detected');
      // Clear previous notification status for new session
      sessionStorage.removeItem('urgentOrdersNotified');
      sessionStorage.removeItem('urgentOrdersNotifiedTime');
      sessionStorage.setItem('sessionStartTime', currentTime.toString());
      
      // Mark this as a new session for initial popup showing
      sessionStorage.setItem('isNewSession', 'true');
    } else {
      // Not a new session
      sessionStorage.removeItem('isNewSession');
    }
  }, []);

  // Show popup when urgent orders are detected
  useEffect(() => {
    const currentUrgentCount = urgentOrders.length;
    
    if (currentUrgentCount > 0) {
      const isNewSession = sessionStorage.getItem('isNewSession') === 'true';
      const hasBeenNotified = sessionStorage.getItem('urgentOrdersNotified');
      const lastNotifiedTime = sessionStorage.getItem('urgentOrdersNotifiedTime');
      const currentTime = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Show popup if:
      // 1. It's a new session and there are urgent orders
      // 2. Count has increased (new urgent orders)
      // 3. It's been more than 30 minutes since last notification
      const shouldShow = isNewSession || 
                        currentUrgentCount > lastUrgentCount || 
                        (!lastNotifiedTime || (currentTime - parseInt(lastNotifiedTime)) > thirtyMinutes);
      
      if (shouldShow) {
        console.log('Global urgent popup: Showing popup for', currentUrgentCount, 'urgent orders', 
                   isNewSession ? '(new session)' : currentUrgentCount > lastUrgentCount ? '(count increased)' : '(30min elapsed)');
        setShowUrgentPopup(true);
        setLastUrgentCount(currentUrgentCount);
        
        // Mark as notified for this session
        sessionStorage.setItem('urgentOrdersNotified', 'true');
        sessionStorage.setItem('urgentOrdersNotifiedTime', currentTime.toString());
        // Clear new session flag after showing
        sessionStorage.removeItem('isNewSession');
      }
    }
    
    // Update last count
    if (currentUrgentCount !== lastUrgentCount) {
      setLastUrgentCount(currentUrgentCount);
    }
  }, [urgentOrders.length, lastUrgentCount]);


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
    // Update the notification time to prevent immediate re-showing
    sessionStorage.setItem('urgentOrdersNotifiedTime', Date.now().toString());
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
