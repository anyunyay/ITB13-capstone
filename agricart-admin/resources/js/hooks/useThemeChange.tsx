import { useEffect, useState } from 'react';

/**
 * Hook that forces component re-render when theme changes
 * This ensures all components update properly when theme switches
 */
export function useThemeChange() {
    const [themeChangeKey, setThemeChangeKey] = useState(0);

    useEffect(() => {
        const handleThemeChange = () => {
            // Force re-render by updating the key
            setThemeChangeKey(prev => prev + 1);
        };

        // Listen for theme change events
        window.addEventListener('themeChanged', handleThemeChange);

        return () => {
            window.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    return themeChangeKey;
}

/**
 * Hook that provides the current effective theme (resolves system theme)
 */
export function useEffectiveTheme() {
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const updateEffectiveTheme = () => {
            const root = document.documentElement;
            const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
            setEffectiveTheme(currentTheme);
        };

        // Initial check
        updateEffectiveTheme();

        // Listen for theme changes
        window.addEventListener('themeChanged', updateEffectiveTheme);

        return () => {
            window.removeEventListener('themeChanged', updateEffectiveTheme);
        };
    }, []);

    return effectiveTheme;
}
