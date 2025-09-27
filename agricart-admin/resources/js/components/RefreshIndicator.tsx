import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RefreshIndicator({ 
  isRefreshing, 
  message = 'Refreshing...', 
  className,
  size = 'sm'
}: RefreshIndicatorProps) {
  if (!isRefreshing) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn(
      'flex items-center space-x-2 text-muted-foreground',
      className
    )}>
      <RefreshCw className={cn(sizeClasses[size], 'animate-spin')} />
      <span className={textSizeClasses[size]}>{message}</span>
    </div>
  );
}

interface RefreshButtonProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function RefreshButton({ 
  isRefreshing, 
  onRefresh, 
  className,
  size = 'sm',
  variant = 'outline'
}: RefreshButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        sizeClasses[size],
        className
      )}
    >
      <RefreshCw className={cn(
        'h-4 w-4',
        isRefreshing && 'animate-spin'
      )} />
    </button>
  );
}
