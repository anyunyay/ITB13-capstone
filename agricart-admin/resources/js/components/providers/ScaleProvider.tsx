import { useEffect } from 'react';
import { useDisplayScale, useScaleCSSProperties } from '@/hooks/use-display-scale';

interface ScaleProviderProps {
  children: React.ReactNode;
  enableAutoScale?: boolean;
  debugMode?: boolean;
}

/**
 * ScaleProvider - Automatically adjusts content for display scaling
 * 
 * This component detects Windows display scaling (125%, 150%, etc.) and
 * applies CSS custom properties to maintain consistent visual appearance.
 * 
 * @param enableAutoScale - Enable automatic scaling compensation (default: true)
 * @param debugMode - Show debug info in console (default: false)
 */
export function ScaleProvider({ 
  children, 
  enableAutoScale = true,
  debugMode = false 
}: ScaleProviderProps) {
  const scaleInfo = useDisplayScale();
  const cssProperties = useScaleCSSProperties();

  useEffect(() => {
    if (!enableAutoScale) return;

    // Apply CSS custom properties to root
    const root = document.documentElement;
    Object.entries(cssProperties).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    // Add data attribute for CSS targeting
    root.setAttribute('data-display-scale', scaleInfo.scalePercentage.toString());
    root.setAttribute('data-scaled', scaleInfo.isScaled ? 'true' : 'false');

    if (debugMode) {
      console.log('🎨 Display Scale Info:', {
        devicePixelRatio: scaleInfo.devicePixelRatio,
        scalePercentage: `${scaleInfo.scalePercentage}%`,
        scaleFactor: scaleInfo.scaleFactor.toFixed(3),
        isScaled: scaleInfo.isScaled,
        screenResolution: `${scaleInfo.screenWidth}x${scaleInfo.screenHeight}`,
        effectiveResolution: `${scaleInfo.effectiveWidth}x${scaleInfo.effectiveHeight}`,
      });
    }

    return () => {
      // Cleanup on unmount
      Object.keys(cssProperties).forEach((key) => {
        root.style.removeProperty(key);
      });
      root.removeAttribute('data-display-scale');
      root.removeAttribute('data-scaled');
    };
  }, [scaleInfo, cssProperties, enableAutoScale, debugMode]);

  return <>{children}</>;
}
