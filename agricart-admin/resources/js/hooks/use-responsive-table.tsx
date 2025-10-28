import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
    mobile: number;
    tablet: number;
    desktop: number;
}

export interface ResponsiveTableState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    columnsToShow: number;
    shouldShowScrollHint: boolean;
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
};

export function useResponsiveTable(
    totalColumns: number = 6,
    breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
): ResponsiveTableState {
    const [screenWidth, setScreenWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = screenWidth < breakpoints.mobile;
    const isTablet = screenWidth >= breakpoints.mobile && screenWidth < breakpoints.desktop;
    const isDesktop = screenWidth >= breakpoints.desktop;

    // Calculate how many columns to show based on screen size
    const getColumnsToShow = (): number => {
        if (isMobile) {
            return Math.min(3, totalColumns); // Show max 3 columns on mobile
        } else if (isTablet) {
            return Math.min(5, totalColumns); // Show max 5 columns on tablet
        } else {
            return totalColumns; // Show all columns on desktop
        }
    };

    const columnsToShow = getColumnsToShow();
    const shouldShowScrollHint = columnsToShow < totalColumns;

    return {
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        columnsToShow,
        shouldShowScrollHint
    };
}