import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseSeamlessRefreshOptions {
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  showLoadingOverlay?: boolean;
  loadingMessage?: string;
  preserveState?: boolean;
  preserveScroll?: boolean;
  only?: string[];
}

export function useSeamlessRefresh(options: UseSeamlessRefreshOptions = {}) {
  const {
    refreshInterval = 60000, // 1 minute default
    enableAutoRefresh = true,
    showLoadingOverlay = true,
    loadingMessage = 'Refreshing data...',
    preserveState = true,
    preserveScroll = true,
    only = []
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  // Function to perform seamless refresh
  const performRefresh = useCallback(async () => {
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
      setIsRefreshing(true);
      
      if (showLoadingOverlay) {
        setIsLoading(true);
      }
      
      console.log('Performing seamless refresh...');
      
      // Use a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      router.reload({
        only,
        preserveState,
        preserveScroll,
        onStart: () => {
          console.log('Refresh started');
        },
        onFinish: () => {
          console.log('Refresh finished');
          setIsRefreshing(false);
          setIsLoading(false);
          isRefreshingRef.current = false;
        },
        onError: () => {
          console.log('Refresh error');
          setIsRefreshing(false);
          setIsLoading(false);
          isRefreshingRef.current = false;
        }
      });
    } catch (error) {
      console.error('Error during seamless refresh:', error);
      setIsRefreshing(false);
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [only, preserveState, preserveScroll, showLoadingOverlay]);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enableAutoRefresh) {
      intervalRef.current = setInterval(performRefresh, refreshInterval);
    }
  }, [enableAutoRefresh, refreshInterval, performRefresh]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect to manage auto-refresh
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [startAutoRefresh, stopAutoRefresh]);

  // Handle window focus for refresh
  useEffect(() => {
    const handleFocus = () => {
      performRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [performRefresh]);

  // Handle visibility change for refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        performRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [performRefresh]);

  return {
    isRefreshing,
    isLoading,
    refresh: performRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    loadingMessage
  };
}
