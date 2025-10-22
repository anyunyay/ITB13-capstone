import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface ScrollPosition {
  x: number;
  y: number;
}

interface PageState {
  scrollPosition: ScrollPosition;
  timestamp: number;
}

// Store scroll positions in sessionStorage
const SCROLL_STORAGE_KEY = 'scroll_positions';

export function useScrollRestoration(pageKey: string) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Save scroll position
  const saveScrollPosition = (x: number, y: number) => {
    try {
      const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      const positions = stored ? JSON.parse(stored) : {};
      
      positions[pageKey] = {
        scrollPosition: { x, y },
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
    } catch (error) {
      console.warn('Failed to save scroll position:', error);
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    try {
      const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (!stored) return;

      const positions = JSON.parse(stored);
      const pageState = positions[pageKey] as PageState;
      
      if (pageState && pageState.scrollPosition) {
        const { x, y } = pageState.scrollPosition;
        window.scrollTo({ left: x, top: y, behavior: 'smooth' });
      }
    } catch (error) {
      console.warn('Failed to restore scroll position:', error);
    }
  };

  // Clear old scroll positions (older than 1 hour)
  const cleanupOldPositions = () => {
    try {
      const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (!stored) return;

      const positions = JSON.parse(stored);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      const cleanedPositions = Object.fromEntries(
        Object.entries(positions).filter(([_, state]: [string, any]) => 
          state.timestamp > oneHourAgo
        )
      );
      
      sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(cleanedPositions));
    } catch (error) {
      console.warn('Failed to cleanup old positions:', error);
    }
  };

  // Set up scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      // Debounce scroll saving
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        saveScrollPosition(window.scrollX, window.scrollY);
      }, 150);
    };

    // Restore scroll position on mount
    restoreScrollPosition();
    
    // Set up scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup old positions periodically
    cleanupOldPositions();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pageKey]);

  return {
    saveScrollPosition,
    restoreScrollPosition
  };
}

// Hook for preserving page state (view modes, filters, etc.)
export function usePageState<T>(pageKey: string, initialState: T) {
  const STATE_STORAGE_KEY = 'page_states';

  // Save page state
  const savePageState = (state: T) => {
    try {
      const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
      const states = stored ? JSON.parse(stored) : {};
      
      states[pageKey] = {
        state,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to save page state:', error);
    }
  };

  // Load page state
  const loadPageState = (): T | null => {
    try {
      const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
      if (!stored) return null;

      const states = JSON.parse(stored);
      const pageState = states[pageKey];
      
      if (pageState && pageState.state) {
        return pageState.state;
      }
    } catch (error) {
      console.warn('Failed to load page state:', error);
    }
    return null;
  };

  // Clear old states (older than 1 hour)
  const cleanupOldStates = () => {
    try {
      const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
      if (!stored) return;

      const states = JSON.parse(stored);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      const cleanedStates = Object.fromEntries(
        Object.entries(states).filter(([_, state]: [string, any]) => 
          state.timestamp > oneHourAgo
        )
      );
      
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(cleanedStates));
    } catch (error) {
      console.warn('Failed to cleanup old states:', error);
    }
  };

  // Cleanup on mount
  useEffect(() => {
    cleanupOldStates();
  }, []);

  return {
    savePageState,
    loadPageState
  };
}
