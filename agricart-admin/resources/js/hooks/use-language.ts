import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

type Language = 'en' | 'fil';

interface LanguageHook {
    language: Language;
    updateLanguage: (newLanguage: Language) => Promise<void>;
    isLoading: boolean;
}

interface PageProps {
    currentLanguage?: string;
    [key: string]: any;
}

export function useLanguage(): LanguageHook {
    const { currentLanguage } = usePage<PageProps>().props;
    const [language, setLanguage] = useState<Language>((currentLanguage as Language) || 'en');
    const [isLoading, setIsLoading] = useState(false);

    // Update language when currentLanguage prop changes
    useEffect(() => {
        if (currentLanguage) {
            setLanguage(currentLanguage as Language);
        }
    }, [currentLanguage]);

    const updateLanguage = async (newLanguage: Language) => {
        if (newLanguage === language) return;

        setIsLoading(true);
        
        try {
            const response = await fetch('/language/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ language: newLanguage }),
            });

            if (response.ok) {
                setLanguage(newLanguage);
                // Reload the page to apply the new language
                window.location.reload();
            } else {
                throw new Error('Failed to update language');
            }
        } catch (error) {
            console.error('Failed to update language:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        language,
        updateLanguage,
        isLoading,
    };
}