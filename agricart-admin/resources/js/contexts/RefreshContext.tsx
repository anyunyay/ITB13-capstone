import React, { createContext, useContext, ReactNode } from 'react';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface RefreshContextType {
  notifications: Notification[];
  refresh: () => void;
  refreshNotifications: () => void;
  startAll: () => void;
  stopAll: () => void;
  isPolling: boolean;
  isGeneralRefreshing: boolean;
  isLoading: boolean;
  loadingMessage: string;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

interface RefreshProviderProps {
  children: ReactNode;
  initialNotifications: Notification[];
  options?: {
    notificationInterval?: number;
    autoRefreshOnNewNotifications?: boolean;
    generalRefreshInterval?: number;
    enableGeneralRefresh?: boolean;
    refreshOnFocus?: boolean;
    refreshOnVisibilityChange?: boolean;
    preserveState?: boolean;
    preserveScroll?: boolean;
    only?: string[];
  };
}

export function RefreshProvider({ 
  children, 
  initialNotifications, 
  options = {} 
}: RefreshProviderProps) {
  const refreshData = useSmartRefresh(initialNotifications, options);

  return (
    <RefreshContext.Provider value={refreshData}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
