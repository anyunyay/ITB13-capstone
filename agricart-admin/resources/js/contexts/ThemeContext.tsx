import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isLoading: boolean;
    error: string | null;
    systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = 'system' }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

    // Detect system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme changes to DOM
    useEffect(() => {
        const root = document.documentElement;
        
        // Remove ALL existing theme classes to prevent remnants
        root.classList.remove('light', 'dark', 'system');
        
        // Also remove any data-theme attributes
        root.removeAttribute('data-theme');
        
        // Apply the appropriate theme
        const effectiveTheme = theme === 'system' ? systemTheme : theme;
        root.classList.add(effectiveTheme);
        root.setAttribute('data-theme', effectiveTheme);
        
        // Force a re-render by updating a data attribute that CSS can watch
        root.setAttribute('data-theme-change', Date.now().toString());
        
        // Store in localStorage for instant switching
        localStorage.setItem('appearance', theme);
        
        // Trigger a custom event for components that need to know about theme changes
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: effectiveTheme, originalTheme: theme } 
        }));
    }, [theme, systemTheme]);

    // Load theme from server on mount
    useEffect(() => {
        const loadThemeFromServer = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await axios.get('/user/appearance');
                if (response.data.success) {
                    const serverTheme = response.data.data.appearance;
                    setThemeState(serverTheme);
                }
            } catch (err) {
                console.warn('Failed to load theme from server, using localStorage fallback:', err);
                // Fallback to localStorage
                const localTheme = localStorage.getItem('appearance') as Theme;
                if (localTheme && ['light', 'dark', 'system'].includes(localTheme)) {
                    setThemeState(localTheme);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadThemeFromServer();
    }, []);

    const setTheme = async (newTheme: Theme) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Store previous theme for potential rollback
            const previousTheme = theme;
            
            // Optimistically update the UI immediately
            setThemeState(newTheme);
            
            // Save to server
            const response = await axios.patch('/user/appearance', {
                appearance: newTheme,
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to save theme preference');
            }
            
            // Update localStorage after successful save
            localStorage.setItem('appearance', newTheme);
            
        } catch (err) {
            console.error('Failed to save theme preference:', err);
            setError(err instanceof Error ? err.message : 'Failed to save theme preference');
            
            // Revert to previous theme on error
            setThemeState(previousTheme);
            
            // Also revert localStorage
            localStorage.setItem('appearance', previousTheme);
        } finally {
            setIsLoading(false);
        }
    };

    const value: ThemeContextType = {
        theme,
        setTheme,
        isLoading,
        error,
        systemTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}