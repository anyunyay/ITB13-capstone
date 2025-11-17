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
  browserZoom: number;
  isBrowserZoom: boolean;
}

/**
 * Detect if the DPR change is from browser zoom or display scaling
 * Browser zoom changes DPR in larger increments and affects window.innerWidth
 */
function detectZoomType(dpr: number, innerWidth: number): { isBrowserZoom: boolean; zoomLevel: number } {
  // Store initial values on first load
  if (typeof window !== 'undefined' && !window.__initialDPR) {
    window.__initialDPR = dpr;
    window.__initialWidth = innerWidth;
  }

  const initialDPR = window.__initialDPR || 1;
  const initialWidth = window.__initialWidth || innerWidth;

  // Calculate zoom level based on width change
  const widthRatio = initialWidth / innerWidth;
  const dprRatio = dpr / initialDPR;

  // Browser zoom: both DPR and width change proportionally
  // Display scaling: only DPR changes, width stays relatively same
  const isBrowserZoom = Math.abs(widthRatio - dprRatio) < 0.1 && Math.abs(dprRatio - 1) > 0.05;
  
  return {
    isBrowserZoom,
    zoomLevel: Math.round(dprRatio * 100)
  };
}

/**
 * Hook to detect and calculate display scaling information
 * Detects when users have display scaling enabled (e.g., 125%, 150%)
 * AND when users zoom in/out in their browser (Ctrl +/-)
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
    
    const { isBrowserZoom, zoomLevel } = detectZoomType(dpr, effectiveWidth);
    
    // For browser zoom, use gentler scaling
    // For display scaling, use more aggressive compensation
    let scaleFactor = 1;
    
    if (isBrowserZoom) {
      // Browser zoom: minimal adjustment, let browser handle it naturally
      scaleFactor = 1;
    } else {
      // Display scaling: apply compensation
      // Optimized for 125% Windows scaling (most common scenario)
      if (dpr >= 1.75) {
        scaleFactor = 0.75; // 175%+ scaling - moderate compensation
      } else if (dpr >= 1.5) {
        scaleFactor = 0.85; // 150% scaling - gentle compensation
      } else if (dpr >= 1.25) {
        scaleFactor = 0.95; // 125% scaling - very minimal compensation (optimal for Windows)
      }
    }
    
    return {
      devicePixelRatio: dpr,
      scaleFactor,
      isScaled: dpr > 1.05,
      scalePercentage: Math.round(dpr * 100),
      screenWidth,
      screenHeight,
      effectiveWidth,
      effectiveHeight,
      browserZoom: zoomLevel,
      isBrowserZoom,
    };
  });

  useEffect(() => {
    let rafId: number;
    
    const updateScale = () => {
      // Use requestAnimationFrame to debounce rapid changes
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const dpr = window.devicePixelRatio || 1;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const effectiveWidth = window.innerWidth;
        const effectiveHeight = window.innerHeight;
        
        const { isBrowserZoom, zoomLevel } = detectZoomType(dpr, effectiveWidth);
        
        let scaleFactor = 1;
        
        if (isBrowserZoom) {
          // Browser zoom: let browser handle it naturally
          scaleFactor = 1;
        } else {
          // Display scaling: apply compensation
          if (dpr >= 1.75) {
            scaleFactor = 0.75;
          } else if (dpr >= 1.5) {
            scaleFactor = 0.85;
          } else if (dpr >= 1.25) {
            scaleFactor = 0.95;
          }
        }
        
        setScaleInfo({
          devicePixelRatio: dpr,
          scaleFactor,
          isScaled: dpr > 1.05,
          scalePercentage: Math.round(dpr * 100),
          screenWidth,
          screenHeight,
          effectiveWidth,
          effectiveHeight,
          browserZoom: zoomLevel,
          isBrowserZoom,
        });
      });
    };

    // Listen for zoom/scale changes
    const mediaQuery = window.matchMedia('screen');
    mediaQuery.addEventListener('change', updateScale);
    
    // Listen for resize events (browser zoom changes window size)
    window.addEventListener('resize', updateScale);
    
    // Listen for DPI changes (Windows display scaling)
    const dpiQuery = window.matchMedia('(resolution: 1dppx)');
    dpiQuery.addEventListener('change', updateScale);
    
    // Listen for visual viewport changes (better zoom detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateScale);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      mediaQuery.removeEventListener('change', updateScale);
      window.removeEventListener('resize', updateScale);
      dpiQuery.removeEventListener('change', updateScale);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateScale);
      }
    };
  }, []);

  return scaleInfo;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __initialDPR?: number;
    __initialWidth?: number;
  }
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
    return 'scale-[0.4]'; // 175%+ scaling
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
