import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SmoothTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function SmoothTransition({ 
  children, 
  className,
  duration = 300,
  delay = 0
}: SmoothTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-in-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ 
  children, 
  className,
  delay = 0,
  duration = 300
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  delay?: number;
  duration?: number;
}

export function SlideIn({ 
  children, 
  direction = 'up',
  className,
  delay = 0,
  duration = 300
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformClasses = () => {
    switch (direction) {
      case 'up':
        return isVisible ? 'translate-y-0' : 'translate-y-4';
      case 'down':
        return isVisible ? 'translate-y-0' : '-translate-y-4';
      case 'left':
        return isVisible ? 'translate-x-0' : 'translate-x-4';
      case 'right':
        return isVisible ? 'translate-x-0' : '-translate-x-4';
      default:
        return isVisible ? 'translate-y-0' : 'translate-y-4';
    }
  };

  return (
    <div
      className={cn(
        'transition-transform ease-in-out',
        getTransformClasses(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
