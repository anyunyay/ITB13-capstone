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

interface UseSmartRefreshOptions {
  // Notification polling options
  notificationInterval?: number; // How often to check for new notifications
  autoRefreshOnNewNotifications?: boolean; // Whether to refresh when new notifications are detected
  
  // General auto-refresh options
  generalRefreshInterval?: number; // How often to perform general refresh
  enableGeneralRefresh?: boolean; // Whether to enable general auto-refresh
  
  // Window event options
  refreshOnFocus?: boolean; // Whether to refresh when window gains focus
  refreshOnVisibilityChange?: boolean; // Whether to refresh when page becomes visible
  
  // Refresh behavior options
  preserveState?: boolean; // Whether to preserve state during refresh
  preserveScroll?: boolean; // Whether to preserve scroll position
  only?: string[]; // Only refresh specific props
}

export function useSmartRefresh(
  initialNotifications: Notification[] = [],
  options: UseSmartRefreshOptions = {}
) {
  const {
    // Notification polling
    notificationInterval = 10000, // 10 seconds
    autoRefreshOnNewNotifications = true,
    
    // General refresh
    generalRefreshInterval = 120000, // 2 minutes
    enableGeneralRefresh = true,
    
    // Window events
    refreshOnFocus = true,
    refreshOnVisibilityChange = true,
    
    // Refresh behavior
    preserveState = true,
    preserveScroll = true,
    only = []
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [lastNotificationCount, setLastNotificationCount] = useState(initialNotifications.length);
  const [lastUnreadCount, setLastUnreadCount] = useState(
    initialNotifications.filter(n => !n.read_at).length
  );

  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generalIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // Function to fetch latest notifications
  const fetchNotifications = async () => {
    if (isPollingRef.current) return;
    
    try {
      isPollingRef.current = true;
      
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
        
        // Auto-refresh page if new notifications are detected
        if (autoRefreshOnNewNotifications && (hasNewNotifications || hasNewUnreadNotifications)) {
          console.log('New notifications detected, refreshing page...');
          performRefresh();
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      isPollingRef.current = false;
    }
  };

  // Function to perform refresh
  const performRefresh = () => {
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      console.log('Refreshing page...');
      
      router.reload({
        only,
        preserveScroll,
      });
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // Start notification polling
  const startNotificationPolling = () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    
    notificationIntervalRef.current = setInterval(fetchNotifications, notificationInterval);
  };

  // Stop notification polling
  const stopNotificationPolling = () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
  };

  // Start general auto-refresh
  const startGeneralRefresh = () => {
    if (generalIntervalRef.current) {
      clearInterval(generalIntervalRef.current);
    }
    
    generalIntervalRef.current = setInterval(performRefresh, generalRefreshInterval);
  };

  // Stop general auto-refresh
  const stopGeneralRefresh = () => {
    if (generalIntervalRef.current) {
      clearInterval(generalIntervalRef.current);
      generalIntervalRef.current = null;
    }
  };

  // Start all refresh mechanisms
  const startAll = () => {
    startNotificationPolling();
    if (enableGeneralRefresh) {
      startGeneralRefresh();
    }
  };

  // Stop all refresh mechanisms
  const stopAll = () => {
    stopNotificationPolling();
    stopGeneralRefresh();
  };

  // Effect to manage all refresh mechanisms
  useEffect(() => {
    startAll();
    return () => stopAll();
  }, [notificationInterval, generalRefreshInterval, enableGeneralRefresh]);

  // Handle window focus
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      performRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus]);

  // Handle visibility change
  useEffect(() => {
    if (!refreshOnVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        performRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshOnVisibilityChange]);

  // Update notifications when initialNotifications change
  useEffect(() => {
    setNotifications(initialNotifications);
    setLastNotificationCount(initialNotifications.length);
    setLastUnreadCount(initialNotifications.filter(n => !n.read_at).length);
  }, [initialNotifications]);

  return {
    notifications,
    refresh: performRefresh,
    refreshNotifications: fetchNotifications,
    startAll,
    stopAll,
    isPolling: notificationIntervalRef.current !== null,
    isGeneralRefreshing: generalIntervalRef.current !== null,
  };
}
