import React, { useState, useEffect } from 'react';
import { UrgentFlashNotification } from './UrgentFlashNotification';

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

interface GlobalUrgentFlashProps {
  urgentOrders?: UrgentOrder[];
}

export function GlobalUrgentFlash({ urgentOrders = [] }: GlobalUrgentFlashProps) {
  const [showFlashNotification, setShowFlashNotification] = useState(false);

  // Check if popup was dismissed and flash should be shown
  useEffect(() => {
    if (urgentOrders.length > 0) {
      const popupDismissed = sessionStorage.getItem('urgentPopupDismissed') === 'true';
      const lastNotifiedTime = sessionStorage.getItem('urgentOrdersNotifiedTime');
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      // Show flash if popup was dismissed recently and urgent orders still exist
      if (popupDismissed && lastNotifiedTime && (currentTime - parseInt(lastNotifiedTime)) < fiveMinutes) {
        setShowFlashNotification(true);
      }
    } else {
      // Hide flash if no urgent orders
      setShowFlashNotification(false);
      sessionStorage.removeItem('urgentPopupDismissed');
    }
  }, [urgentOrders.length]);

  const handleFlashDismiss = () => {
    setShowFlashNotification(false);
    sessionStorage.removeItem('urgentPopupDismissed');
    // Update notification time when flash is dismissed to prevent immediate re-showing
    sessionStorage.setItem('urgentOrdersNotifiedTime', Date.now().toString());
  };

  if (!showFlashNotification || urgentOrders.length === 0) {
    return null;
  }

  return (
    <UrgentFlashNotification
      urgentOrderCount={urgentOrders.length}
      isVisible={showFlashNotification}
      onDismiss={handleFlashDismiss}
    />
  );
}
