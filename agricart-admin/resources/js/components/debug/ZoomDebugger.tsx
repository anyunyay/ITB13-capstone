import { useDisplayScale } from '@/hooks/use-display-scale';
import { useState, useEffect } from 'react';

/**
 * ZoomDebugger - Visual debug component for testing zoom and scaling
 * Shows real-time information about browser zoom and display scaling
 * 
 * Usage: Add to any page during development
 * <ZoomDebugger />
 */
export function ZoomDebugger() {
  const scale = useDisplayScale();
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');

  // Hide in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const cyclePosition = () => {
    const positions: Array<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'> = 
      ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPosition(positions[nextIndex]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-[9999]"
        title="Show Zoom Debugger"
      >
        🔍
      </button>
    );
  }

  return (
    <div 
      className={`fixed ${positionClasses[position]} bg-card/95 backdrop-blur-sm border-2 border-primary/20 p-4 rounded-lg shadow-2xl text-xs font-mono z-[9999] max-w-xs`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {scale.isBrowserZoom ? '🔍' : '🖥️'}
          </span>
          <span className="font-bold text-sm text-primary">
            {scale.isBrowserZoom ? 'Browser Zoom' : 'Display Scaling'}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={cyclePosition}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Change position"
          >
            ↻
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Hide debugger"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">DPR</div>
            <div className="text-foreground font-bold">{scale.devicePixelRatio.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">Scale</div>
            <div className="text-foreground font-bold">{scale.scalePercentage}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">Factor</div>
            <div className="text-foreground font-bold">{scale.scaleFactor.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">Zoom</div>
            <div className="text-foreground font-bold">{scale.browserZoom}%</div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-muted-foreground text-[10px] uppercase mb-1">Resolution</div>
          <div className="text-foreground">
            <div>Screen: {scale.screenWidth}×{scale.screenHeight}</div>
            <div>Window: {scale.effectiveWidth}×{scale.effectiveHeight}</div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-muted-foreground text-[10px] uppercase mb-1">Status</div>
          <div className="flex flex-wrap gap-1">
            {scale.isScaled && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px]">
                Scaled
              </span>
            )}
            {scale.isBrowserZoom && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded text-[10px]">
                Browser Zoom
              </span>
            )}
            {!scale.isScaled && !scale.isBrowserZoom && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-[10px]">
                Normal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground">
        <div className="font-semibold mb-1">Test:</div>
        <div>• Ctrl/Cmd + Plus: Zoom in</div>
        <div>• Ctrl/Cmd + Minus: Zoom out</div>
        <div>• Ctrl/Cmd + 0: Reset zoom</div>
      </div>
    </div>
  );
}

/**
 * Minimal zoom indicator - shows only when zoomed
 */
export function ZoomIndicator() {
  const scale = useDisplayScale();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!scale.isBrowserZoom && !scale.isScaled) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-xs font-semibold z-[9999] animate-in fade-in slide-in-from-top-2">
      {scale.isBrowserZoom ? '🔍' : '🖥️'} {scale.scalePercentage}%
    </div>
  );
}
