import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  excludeSidebar?: boolean;
  sidebarWidth?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  className, 
  excludeSidebar = false,
  sidebarWidth = '16rem' // Default 256px (w-64)
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        'fixed bg-background/20 backdrop-blur-sm z-50 flex items-center justify-center',
        excludeSidebar ? 'top-0 right-0 bottom-0' : 'inset-0',
        className
      )}
      style={excludeSidebar ? { left: sidebarWidth } : undefined}
    >
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
