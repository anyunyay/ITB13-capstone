/**
 * Utility functions for display scaling calculations
 */

/**
 * Calculate scaled value based on device pixel ratio
 * @param baseValue - Base value to scale
 * @param dpr - Device pixel ratio
 * @returns Scaled value
 */
export function calculateScaledValue(baseValue: number, dpr: number): number {
  if (dpr <= 1) return baseValue;
  
  let scaleFactor = 1;
  if (dpr >= 1.75) {
    scaleFactor = 0.4;
  } else if (dpr >= 1.5) {
    scaleFactor = 0.6;
  } else if (dpr >= 1.25) {
    scaleFactor = 0.8;
  }
  
  return baseValue * scaleFactor;
}

/**
 * Get Tailwind scale class for given DPR
 * @param dpr - Device pixel ratio
 * @returns Tailwind scale class
 */
export function getScaleClass(dpr: number): string {
  if (dpr >= 1.75) return 'scale-[0.4]';
  if (dpr >= 1.5) return 'scale-[0.6]';
  if (dpr >= 1.25) return 'scale-[0.8]';
  return 'scale-100';
}

/**
 * Get responsive grid columns based on DPR
 * Adjusts grid density for scaled displays
 * @param dpr - Device pixel ratio
 * @returns Tailwind grid class
 */
export function getResponsiveGridCols(dpr: number): string {
  if (dpr >= 1.5) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

/**
 * Get adjusted spacing class based on DPR
 * @param dpr - Device pixel ratio
 * @param baseSpacing - Base spacing class (e.g., 'p-4', 'gap-6')
 * @returns Adjusted spacing class
 */
export function getAdjustedSpacing(dpr: number, baseSpacing: string): string {
  if (dpr < 1.25) return baseSpacing;
  
  // Extract number from spacing class
  const match = baseSpacing.match(/(\D+)(\d+)/);
  if (!match) return baseSpacing;
  
  const [, prefix, value] = match;
  const numValue = parseInt(value);
  
  // Reduce spacing for scaled displays
  if (dpr >= 1.5) {
    return `${prefix}${Math.max(1, numValue - 1)}`;
  } else if (dpr >= 1.25) {
    return `${prefix}${Math.max(1, Math.floor(numValue * 0.9))}`;
  }
  
  return baseSpacing;
}

/**
 * Get adjusted font size class based on DPR
 * @param dpr - Device pixel ratio
 * @param baseFontSize - Base font size class (e.g., 'text-lg', 'text-2xl')
 * @returns Adjusted font size class
 */
export function getAdjustedFontSize(dpr: number, baseFontSize: string): string {
  if (dpr < 1.25) return baseFontSize;
  
  const sizeMap: Record<string, string> = {
    'text-xs': 'text-xs',
    'text-sm': 'text-xs',
    'text-base': 'text-sm',
    'text-lg': 'text-base',
    'text-xl': 'text-lg',
    'text-2xl': 'text-xl',
    'text-3xl': 'text-2xl',
    'text-4xl': 'text-3xl',
    'text-5xl': 'text-4xl',
    'text-6xl': 'text-5xl',
    'text-7xl': 'text-6xl',
    'text-8xl': 'text-7xl',
    'text-9xl': 'text-8xl',
  };
  
  if (dpr >= 1.5) {
    return sizeMap[baseFontSize] || baseFontSize;
  }
  
  return baseFontSize;
}

/**
 * Check if device has high DPI display
 * @returns boolean indicating high DPI
 */
export function isHighDPI(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.devicePixelRatio > 1 ||
    (window.matchMedia && 
     window.matchMedia('(-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi)').matches)
  );
}

/**
 * Get optimal image resolution multiplier
 * @param dpr - Device pixel ratio
 * @returns Image resolution multiplier (1x, 2x, 3x)
 */
export function getImageResolutionMultiplier(dpr: number): string {
  if (dpr >= 2.5) return '3x';
  if (dpr >= 1.5) return '2x';
  return '1x';
}

/**
 * Calculate container max-width based on DPR
 * @param baseMaxWidth - Base max-width in pixels
 * @param dpr - Device pixel ratio
 * @returns Adjusted max-width in pixels
 */
export function getAdjustedMaxWidth(baseMaxWidth: number, dpr: number): number {
  if (dpr <= 1) return baseMaxWidth;
  
  let scaleFactor = 1;
  if (dpr >= 1.75) {
    scaleFactor = 0.4;
  } else if (dpr >= 1.5) {
    scaleFactor = 0.6;
  } else if (dpr >= 1.25) {
    scaleFactor = 0.8;
  }
  
  return Math.round(baseMaxWidth * scaleFactor);
}

/**
 * Get CSS transform scale value
 * @param dpr - Device pixel ratio
 * @returns Scale value as number
 */
export function getTransformScale(dpr: number): number {
  if (dpr >= 1.75) return 0.4;
  if (dpr >= 1.5) return 0.6;
  if (dpr >= 1.25) return 0.8;
  return 1.0;
}

/**
 * Format DPR as percentage string
 * @param dpr - Device pixel ratio
 * @returns Formatted percentage (e.g., "125%")
 */
export function formatDPRAsPercentage(dpr: number): string {
  return `${Math.round(dpr * 100)}%`;
}

/**
 * Detect if user is on Windows with display scaling
 * @returns boolean indicating Windows display scaling
 */
export function isWindowsScaled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isWindows = navigator.platform.toLowerCase().includes('win');
  const hasScaling = window.devicePixelRatio > 1 && window.devicePixelRatio < 2;
  
  return isWindows && hasScaling;
}

/**
 * Get recommended breakpoint adjustments for scaled displays
 * @param dpr - Device pixel ratio
 * @returns Object with adjusted breakpoint values
 */
export function getAdjustedBreakpoints(dpr: number): Record<string, number> {
  const baseBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };
  
  if (dpr <= 1) return baseBreakpoints;
  
  const scaleFactor = 1 / Math.pow(dpr, 0.3);
  
  return Object.entries(baseBreakpoints).reduce((acc, [key, value]) => {
    acc[key] = Math.round(value * scaleFactor);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Create inline style object for scaling
 * @param dpr - Device pixel ratio
 * @returns React CSSProperties object
 */
export function createScaleStyle(dpr: number): React.CSSProperties {
  const scale = getTransformScale(dpr);
  
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    willChange: 'transform',
  };
}

/**
 * Get optimal carousel item size based on DPR
 * @param baseSize - Base item size (e.g., 'basis-1/3')
 * @param dpr - Device pixel ratio
 * @returns Adjusted basis class
 */
export function getCarouselItemSize(baseSize: string, dpr: number): string {
  if (dpr < 1.25) return baseSize;
  
  const sizeMap: Record<string, string> = {
    'basis-1/4': 'basis-1/3',
    'basis-1/3': 'basis-1/2',
    'basis-1/2': 'basis-full',
  };
  
  if (dpr >= 1.5) {
    return sizeMap[baseSize] || baseSize;
  }
  
  return baseSize;
}
