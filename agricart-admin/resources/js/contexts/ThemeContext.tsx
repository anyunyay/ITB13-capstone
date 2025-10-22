import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Appearance = 'light' | 'dark' | 'system';

interface ThemeContextType {
    appearance: Appearance;
    updateAppearance: (mode: Appearance) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        
        // Store in localStorage for client-side persistence
        localStorage.setItem('appearance', mode);
        
        // Store in cookie for SSR
        const setCookie = (name: string, value: string, days = 365) => {
            const maxAge = days * 24 * 60 * 60;
            document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
        };
        setCookie('appearance', mode);
        
        // Apply theme immediately
        applyTheme(mode);
    };

    const applyTheme = (appearance: Appearance) => {
        const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
        document.documentElement.classList.toggle('dark', isDark);
    };

    const prefersDark = () => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    // Initialize theme on mount
    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance;
        const themeToUse = savedAppearance || 'system';
        
        setAppearance(themeToUse);
        applyTheme(themeToUse);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = () => {
            const currentAppearance = localStorage.getItem('appearance') as Appearance;
            applyTheme(currentAppearance || 'system');
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ appearance, updateAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
