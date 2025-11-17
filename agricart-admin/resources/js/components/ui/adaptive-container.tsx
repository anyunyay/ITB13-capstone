import { cn } from '@/lib/utils';
import { useResponsiveScale } from '@/hooks/use-display-scale';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enableScale?: boolean;
  scaleMode?: 'transform' | 'font' | 'both';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * AdaptiveContainer - A container that automatically adjusts for display scaling
 * 
 * @param enableScale - Enable automatic scaling (default: true)
 * @param scaleMode - How to apply scaling: 'transform', 'font', or 'both' (default: 'transform')
 * @param as - HTML element to render (default: 'div')
 */
export function AdaptiveContainer({
  children,
  className,
  enableScale = true,
  scaleMode = 'transform',
  as: Component = 'div',
}: AdaptiveContainerProps) {
  const scaleClass = useResponsiveScale();

  const classes = cn(
    enableScale && scaleMode === 'transform' && scaleClass,
    enableScale && scaleMode === 'font' && 'scale-adaptive-text',
    enableScale && scaleMode === 'both' && [scaleClass, 'scale-adaptive-text'],
    'scale-stable', // Prevent layout shift
    className
  );

  return <Component className={classes}>{children}</Component>;
}
