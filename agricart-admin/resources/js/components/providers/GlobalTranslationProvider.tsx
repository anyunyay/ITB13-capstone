import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { __ } from '@/lib/i18n';
import { autoTranslate } from '@/utils/autoTranslate';

interface GlobalTranslationContextType {
    locale: string;
    t: (key: string, fallback?: string) => string;
    auto: (text: string) => string;
    isEnglish: boolean;
    isTagalog: boolean;
}

const GlobalTranslationContext = createContext<GlobalTranslationContextType | undefined>(undefined);

interface GlobalTranslationProviderProps {
    children: ReactNode;
}

/**
 * Global translation provider that wraps the entire application
 * Provides translation context without breaking existing components
 * Uses a safe approach that doesn't depend on Inertia being initialized
 */
export function GlobalTranslationProvider({ children }: GlobalTranslationProviderProps) {
    const [locale, setLocale] = useState<string>('en');

    // Safely get locale from Inertia props when available
    useEffect(() => {
        try {
            // Try to get current language from window object (set by Inertia)
            const inertiaPage = (window as any).page;
            if (inertiaPage?.props?.currentLanguage) {
                setLocale(inertiaPage.props.currentLanguage);
            }
        } catch (error) {
            // Fallback to English if Inertia not available
            console.warn('Could not get language from Inertia, using default:', error);
        }
    }, []);

    const t = (key: string, fallback?: string): string => {
        return __(key, locale) || fallback || key;
    };

    const auto = (text: string): string => {
        return autoTranslate(text, locale);
    };

    const contextValue: GlobalTranslationContextType = {
        locale,
        t,
        auto,
        isEnglish: locale === 'en',
        isTagalog: locale === 'fil',
    };

    return (
        <GlobalTranslationContext.Provider value={contextValue}>
            {children}
        </GlobalTranslationContext.Provider>
    );
}

/**
 * Hook to use global translation context
 * Provides safe fallback if not within provider
 */
export function useGlobalTranslation() {
    const context = useContext(GlobalTranslationContext);
    if (context === undefined) {
        // Safe fallback if not within provider
        const locale = 'en'; // Default to English
        
        return {
            locale,
            t: (key: string, fallback?: string) => __(key, locale) || fallback || key,
            auto: (text: string) => autoTranslate(text, locale),
            isEnglish: locale === 'en',
            isTagalog: locale === 'fil',
        };
    }
    return context;
}

/**
 * HOC that provides translation context to any component
 */
export function withTranslation<P extends object>(
    Component: React.ComponentType<P>
) {
    return function TranslatedComponent(props: P) {
        const translation = useGlobalTranslation();
        return <Component {...props} translation={translation} />;
    };
}