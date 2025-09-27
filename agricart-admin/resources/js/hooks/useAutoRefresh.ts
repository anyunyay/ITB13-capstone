import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

interface UseAutoRefreshOptions {
  interval?: number; // Polling interval in milliseconds
  enabled?: boolean; // Whether auto-refresh is enabled
  refreshOnFocus?: boolean; // Whether to refresh when window gains focus
  refreshOnVisibilityChange?: boolean; // Whether to refresh when page becomes visible
  preserveState?: boolean; // Whether to preserve state during refresh
  preserveScroll?: boolean; // Whether to preserve scroll position
  only?: string[]; // Only refresh specific props
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const {
    interval = 60000, // 1 minute default
    enabled = true,
    refreshOnFocus = true,
    refreshOnVisibilityChange = true,
    preserveState = true,
    preserveScroll = true,
    only = []
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Function to perform refresh
  const refresh = () => {
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      console.log('Auto-refreshing page...');
      
      router.reload({
        only,
        preserveScroll,
      });
    } catch (error) {
      console.error('Error during auto-refresh:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // Start auto-refresh
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(refresh, interval);
  };

  // Stop auto-refresh
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Effect to manage auto-refresh
  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [enabled, interval]);

  // Handle window focus
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      if (enabled) {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refreshOnFocus]);

  // Handle visibility change
  useEffect(() => {
    if (!refreshOnVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (enabled && !document.hidden) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, refreshOnVisibilityChange]);

  return {
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshing: intervalRef.current !== null,
  };
}
