import { useCallback, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

export type Language = 'en' | 'tl';

interface UseLanguageReturn {
    language: Language;
    updateLanguage: (lang: Language) => Promise<void>;
    isLoading: boolean;
}

interface PageProps {
    userLanguage?: Language;
    locale?: string;
    [key: string]: any;
}

export function useLanguage(): UseLanguageReturn {
    const { props } = usePage<PageProps>();
    const [language, setLanguage] = useState<Language>('en');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize from server or localStorage
    useEffect(() => {
        // Try to get from page props first (shared from HandleInertiaRequests)
        if (props.userLanguage && ['en', 'tl'].includes(props.userLanguage)) {
            setLanguage(props.userLanguage);
            localStorage.setItem('language', props.userLanguage);
            return;
        }

        // Fallback to localStorage
        const savedLanguage = localStorage.getItem('language') as Language | null;
        if (savedLanguage && ['en', 'tl'].includes(savedLanguage)) {
            setLanguage(savedLanguage);
        }
    }, [props.userLanguage]);

    const updateLanguage = useCallback(async (lang: Language) => {
        try {
            setIsLoading(true);
            setLanguage(lang);

            // Store in localStorage for client-side persistence
            localStorage.setItem('language', lang);

            // Update on server
            const response = await axios.patch('/user/language', {
                language: lang,
            });

            if (response.data.success) {
                // Reload the page to apply the new locale server-side
                router.reload({ only: [] });
            } else {
                throw new Error('Failed to update language');
            }
        } catch (error) {
            console.error('Failed to update language:', error);
            // Revert on error
            const savedLanguage = localStorage.getItem('language') as Language | null;
            if (savedLanguage && ['en', 'tl'].includes(savedLanguage)) {
                setLanguage(savedLanguage);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        language,
        updateLanguage,
        isLoading,
    };
}

