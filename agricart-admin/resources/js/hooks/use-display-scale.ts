import { useEffect, useState } from 'react';

interface DisplayScaleInfo {
  devicePixelRatio: number;
  scaleFactor: number;
  isScaled: boolean;
  scalePercentage: number;
  screenWidth: number;
  screenHeight: number;
  effectiveWidth: number;
  effectiveHeight: number;
}

/**
 * Hook to detect and calculate display scaling information
 * Detects when users have display scaling enabled (e.g., 125%, 150%)
 * Works with Windows display scaling and browser zoom
 * 
 * @returns DisplayScaleInfo object with scaling details
 */
export function useDisplayScale(): DisplayScaleInfo {
  const [scaleInfo, setScaleInfo] = useState<DisplayScaleInfo>(() => {
    const dpr = window.devicePixelRatio || 1;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const effectiveWidth = window.innerWidth;
    const effectiveHeight = window.innerHeight;
    
    // Calculate scale factor for aggressive compensation
    // 100% (DPR 1.0) → scale: 1.0
    // 125% (DPR 1.25) → scale: 0.8
    // 150% (DPR 1.5) → scale: 0.6
    // 175%+ (DPR 1.75+) → scale: 0.2
    let scaleFactor = 1;
    if (dpr >= 1.75) {
      scaleFactor = 0.2;
    } else if (dpr >= 1.5) {
      scaleFactor = 0.6;
    } else if (dpr >= 1.25) {
      scaleFactor = 0.8;
    }
    
    return {
      devicePixelRatio: dpr,
      scaleFactor,
      isScaled: dpr > 1.1,
      scalePercentage: Math.round(dpr * 100),
      screenWidth,
      screenHeight,
      effectiveWidth,
      effectiveHeight,
    };
  });

  useEffect(() => {
    const updateScale = () => {
      const dpr = window.devicePixelRatio || 1;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const effectiveWidth = window.innerWidth;
      const effectiveHeight = window.innerHeight;
      
      // Aggressive scale compensation
      let scaleFactor = 1;
      if (dpr >= 1.75) {
        scaleFactor = 0.2;
      } else if (dpr >= 1.5) {
        scaleFactor = 0.6;
      } else if (dpr >= 1.25) {
        scaleFactor = 0.8;
      }
      
      setScaleInfo({
        devicePixelRatio: dpr,
        scaleFactor,
        isScaled: dpr > 1.1,
        scalePercentage: Math.round(dpr * 100),
        screenWidth,
        screenHeight,
        effectiveWidth,
        effectiveHeight,
      });
    };

    // Listen for zoom/scale changes
    const mediaQuery = window.matchMedia('screen');
    mediaQuery.addEventListener('change', updateScale);
    
    // Listen for resize events which can indicate scale changes
    window.addEventListener('resize', updateScale);
    
    // Listen for DPI changes (Windows display scaling)
    window.matchMedia('(resolution: 1dppx)').addEventListener('change', updateScale);

    return () => {
      mediaQuery.removeEventListener('change', updateScale);
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return scaleInfo;
}

/**
 * Hook to get responsive scale class based on device pixel ratio
 * Returns Tailwind scale class that can be applied to elements
 * 
 * @returns Tailwind scale class string
 */
export function useResponsiveScale(): string {
  const { devicePixelRatio } = useDisplayScale();
  
  // Adjust scale based on DPR to maintain consistent visual size
  if (devicePixelRatio >= 1.75) {
    return 'scale-[0.2]'; // 175%+ scaling
  } else if (devicePixelRatio >= 1.5) {
    return 'scale-[0.6]'; // 150% scaling
  } else if (devicePixelRatio >= 1.25) {
    return 'scale-[0.8]'; // 125% scaling
  }
  
  return 'scale-100'; // Normal (100%)
}

/**
 * Hook to get CSS custom properties for dynamic scaling
 * Returns an object with CSS variables that can be applied to root element
 * 
 * @returns CSS properties object
 */
export function useScaleCSSProperties(): React.CSSProperties {
  const { scaleFactor, devicePixelRatio } = useDisplayScale();
  
  return {
    '--scale-factor': scaleFactor.toString(),
    '--dpr': devicePixelRatio.toString(),
    '--base-font-size': `${16 * scaleFactor}px`,
    '--scale-compensation': `${scaleFactor}`,
  } as React.CSSProperties;
}

/**
 * Hook to get adjusted font size based on display scaling
 * Useful for dynamic font size adjustments
 * 
 * @param baseSize - Base font size in pixels
 * @returns Adjusted font size string
 */
export function useScaledFontSize(baseSize: number): string {
  const { scaleFactor } = useDisplayScale();
  return `${baseSize * scaleFactor}px`;
}

/**
 * Hook to get adjusted spacing based on display scaling
 * Useful for dynamic spacing adjustments
 * 
 * @param baseSpacing - Base spacing in rem
 * @returns Adjusted spacing string
 */
export function useScaledSpacing(baseSpacing: number): string {
  const { scaleFactor } = useDisplayScale();
  return `${baseSpacing * scaleFactor}rem`;
}
