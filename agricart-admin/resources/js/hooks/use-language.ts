import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

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
        
        return new Promise<void>((resolve, reject) => {
            router.post('/language/switch', 
                { language: newLanguage },
                {
                    onSuccess: (page) => {
                        console.log('Language switch successful:', page);
                        setLanguage(newLanguage);
                        // Reload the page to apply the new language
                        window.location.reload();
                        resolve();
                    },
                    onError: (errors) => {
                        console.error('Language switch failed with errors:', errors);
                        setIsLoading(false);
                        
                        // Extract error message
                        let errorMessage = 'Failed to update language preference. Please try again.';
                        if (errors.language) {
                            errorMessage = Array.isArray(errors.language) ? errors.language[0] : errors.language;
                        } else if (errors.message) {
                            errorMessage = errors.message;
                        }
                        
                        reject(new Error(errorMessage));
                    },
                    onFinish: () => {
                        console.log('Language switch request finished');
                    },
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        });
    };

    return {
        language,
        updateLanguage,
        isLoading,
    };
}