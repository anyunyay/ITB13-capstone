import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface UseNotificationPollingOptions {
  interval?: number; // Polling interval in milliseconds
  autoRefresh?: boolean; // Whether to automatically refresh the page on new notifications
  enabled?: boolean; // Whether polling is enabled
}

export function useNotificationPolling(
  initialNotifications: Notification[] = [],
  options: UseNotificationPollingOptions = {}
) {
  const {
    interval = 3000, // 3 seconds default
    autoRefresh = true,
    enabled = true
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [lastNotificationCount, setLastNotificationCount] = useState(initialNotifications.length);
  const [lastUnreadCount, setLastUnreadCount] = useState(
    initialNotifications.filter(n => !n.read_at).length
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const lastRequestTimeRef = useRef(0);

  // Function to fetch latest notifications
  const fetchNotifications = async () => {
    if (isPollingRef.current) return;
    
    // Debounce requests - don't make requests more than once every 2 seconds
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 2000) {
      return;
    }
    lastRequestTimeRef.current = now;
    
    try {
      isPollingRef.current = true;
      
      // Make a lightweight request to get updated notifications
      const response = await fetch('/api/notifications/latest', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        
        setNotifications(newNotifications);
        
        const newUnreadCount = newNotifications.filter((n: Notification) => !n.read_at).length;
        const newTotalCount = newNotifications.length;
        
        // Check if there are new notifications
        const hasNewNotifications = newTotalCount > lastNotificationCount;
        const hasNewUnreadNotifications = newUnreadCount > lastUnreadCount;
        
        // Update counters
        setLastNotificationCount(newTotalCount);
        setLastUnreadCount(newUnreadCount);
        
        // Auto-refresh page if new notifications are detected and autoRefresh is enabled
        if (autoRefresh && (hasNewNotifications || hasNewUnreadNotifications)) {
          console.log('New notifications detected, refreshing page...');
          // Use a more targeted refresh that only updates notifications
          router.reload({ 
            only: ['notifications'],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      isPollingRef.current = false;
    }
  };

  // Start polling
  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(fetchNotifications, interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Manual refresh
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Effect to manage polling
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, interval]);

  // Update notifications when initialNotifications change
  useEffect(() => {
    setNotifications(initialNotifications);
    setLastNotificationCount(initialNotifications.length);
    setLastUnreadCount(initialNotifications.filter(n => !n.read_at).length);
  }, [initialNotifications]);

  return {
    notifications,
    refreshNotifications,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
  };
}
