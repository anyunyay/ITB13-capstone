import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useLanguageChangeHandler } from '@/utils/languageChangeHandler';

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
    const languageHandler = useLanguageChangeHandler();
    const [language, setLanguage] = useState<Language>((currentLanguage as Language) || 'en');
    const [isLoading, setIsLoading] = useState(false);

    // Update language when currentLanguage prop changes
    useEffect(() => {
        if (currentLanguage) {
            setLanguage(currentLanguage as Language);
        }
    }, [currentLanguage]);

    // Listen for language changes from the global handler
    useEffect(() => {
        const removeListener = languageHandler.addListener((newLanguage: string) => {
            setLanguage(newLanguage as Language);
        });
        
        return removeListener;
    }, [languageHandler]);

    const updateLanguage = async (newLanguage: Language) => {
        if (newLanguage === language) return;

        setIsLoading(true);
        
        try {
            await languageHandler.changeLanguage(newLanguage, {
                immediate: false, // Use page reload for full translation update
                onSuccess: () => {
                    setLanguage(newLanguage);
                },
                onError: (error: any) => {
                    setIsLoading(false);
                    throw error;
                }
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Language switch failed:', error);
            throw new Error('Failed to update language preference. Please try again.');
        }
    };

    return {
        language,
        updateLanguage,
        isLoading,
    };
}