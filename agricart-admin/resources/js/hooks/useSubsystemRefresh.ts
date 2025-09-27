import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

interface SubsystemData {
  orders?: any;
  sales?: any;
  inventory?: any;
  logistics?: any;
  membership?: any;
  staff?: any;
  stocks?: any;
}

interface UseSubsystemRefreshOptions {
  checkInterval?: number; // How often to check for changes
  refreshInterval?: number; // How often to perform general refresh
  enableChangeDetection?: boolean; // Whether to enable change detection
  enablePeriodicRefresh?: boolean; // Whether to enable periodic refresh
  refreshOnFocus?: boolean; // Whether to refresh when window gains focus
  refreshOnVisibilityChange?: boolean; // Whether to refresh when page becomes visible
  preserveState?: boolean; // Whether to preserve state during refresh
  preserveScroll?: boolean; // Whether to preserve scroll position
  only?: string[]; // Only refresh specific props
}

export function useSubsystemRefresh(
  initialData: SubsystemData = {},
  options: UseSubsystemRefreshOptions = {}
) {
  const {
    checkInterval = 5000, // Check for changes every 5 seconds
    refreshInterval = 60000, // General refresh every 1 minute
    enableChangeDetection = true,
    enablePeriodicRefresh = true,
    refreshOnFocus = true,
    refreshOnVisibilityChange = true,
    preserveState = true,
    preserveScroll = true,
    only = []
  } = options;

  const [subsystemData, setSubsystemData] = useState<SubsystemData>(initialData);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const lastRefreshTimeRef = useRef(0);
  const previousDataRef = useRef<SubsystemData>(initialData);

  // Function to check for subsystem changes
  const checkForChanges = async () => {
    if (isCheckingRef.current) return;
    
    // Debounce requests - don't make requests more than once every 3 seconds
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 3000) {
      return;
    }
    lastRequestTimeRef.current = now;
    
    try {
      isCheckingRef.current = true;
      
      const response = await fetch('/api/subsystem/changes', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          last_check: lastCheckTime,
          subsystems: ['orders', 'sales']
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.has_changes) {
          console.log('Subsystem changes detected, refreshing page...');
          performRefresh();
        }
        
        setLastCheckTime(Date.now());
      }
    } catch (error) {
      console.error('Error checking for subsystem changes:', error);
    } finally {
      isCheckingRef.current = false;
    }
  };

  // Function to perform refresh
  const performRefresh = async () => {
    if (isRefreshingRef.current) return;
    
    // Add cooldown period to prevent excessive refreshes (minimum 5 seconds between refreshes)
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 5000) {
      console.log('Refresh cooldown active, skipping refresh...');
      return;
    }
    lastRefreshTimeRef.current = now;
    
    try {
      isRefreshingRef.current = true;
      console.log('Refreshing page due to subsystem changes...');
      
      // Add a small delay to make the refresh feel more seamless
      await new Promise(resolve => setTimeout(resolve, 200));
      
      router.reload({
        only,
        onStart: () => {
          console.log('Subsystem refresh started');
        },
        onFinish: () => {
          console.log('Subsystem refresh finished');
          isRefreshingRef.current = false;
        },
        onError: () => {
          console.log('Subsystem refresh error');
          isRefreshingRef.current = false;
        }
      });
    } catch (error) {
      console.error('Error during subsystem refresh:', error);
      isRefreshingRef.current = false;
    }
  };

  // Start change detection
  const startChangeDetection = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    if (enableChangeDetection) {
      checkIntervalRef.current = setInterval(checkForChanges, checkInterval);
    }
  };

  // Stop change detection
  const stopChangeDetection = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  // Start periodic refresh
  const startPeriodicRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    if (enablePeriodicRefresh) {
      refreshIntervalRef.current = setInterval(performRefresh, refreshInterval);
    }
  };

  // Stop periodic refresh
  const stopPeriodicRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Start all refresh mechanisms
  const startAll = () => {
    startChangeDetection();
    startPeriodicRefresh();
  };

  // Stop all refresh mechanisms
  const stopAll = () => {
    stopChangeDetection();
    stopPeriodicRefresh();
  };

  // Effect to manage all refresh mechanisms
  useEffect(() => {
    startAll();
    return () => stopAll();
  }, [checkInterval, refreshInterval, enableChangeDetection, enablePeriodicRefresh]);

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

  // Update data when initialData changes (with ref comparison to prevent infinite loops)
  useEffect(() => {
    const dataChanged = JSON.stringify(initialData) !== JSON.stringify(previousDataRef.current);
    if (dataChanged) {
      setSubsystemData(initialData);
      previousDataRef.current = initialData;
    }
  }, [initialData]);

  return {
    subsystemData,
    refresh: performRefresh,
    checkForChanges,
    startAll,
    stopAll,
    isChecking: checkIntervalRef.current !== null,
    isRefreshing: refreshIntervalRef.current !== null,
  };
}
