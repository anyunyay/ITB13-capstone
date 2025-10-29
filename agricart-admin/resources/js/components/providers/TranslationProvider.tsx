import React, { createContext, useContext, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';

interface TranslationContextType {
    locale: string;
    t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
    children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
    const { currentLanguage } = usePage<{ currentLanguage?: string }>().props;
    const locale = currentLanguage || 'en';

    const t = (key: string): string => {
        // Import the translation function dynamically to avoid circular dependencies
        const { translate } = require('@/lib/i18n');
        return translate(key, locale);
    };

    return (
        <TranslationContext.Provider value={{ locale, t }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}

// Hook that can be used without provider (fallback)
export function useT() {
    try {
        const { t } = useTranslation();
        return t;
    } catch {
        // Fallback if not within provider
        const { currentLanguage } = usePage<{ currentLanguage?: string }>().props;
        const locale = currentLanguage || 'en';
        
        return (key: string): string => {
            const { translate } = require('@/lib/i18n');
            return translate(key, locale);
        };
    }
}