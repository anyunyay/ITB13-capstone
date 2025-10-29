import { useState, useEffect } from 'react';
import { usePage, useForm } from '@inertiajs/react';

type Language = 'en' | 'fil';

interface LanguageFormHook {
    language: Language;
    updateLanguage: (newLanguage: Language) => Promise<void>;
    isLoading: boolean;
}

interface PageProps {
    currentLanguage?: string;
    [key: string]: any;
}

/**
 * Alternative language hook using Inertia forms for better CSRF handling
 */
export function useLanguageForm(): LanguageFormHook {
    const { currentLanguage } = usePage<PageProps>().props;
    const [language, setLanguage] = useState<Language>((currentLanguage as Language) || 'en');

    const { data, setData, post, processing, reset } = useForm({
        language: language,
    });

    // Update language when currentLanguage prop changes
    useEffect(() => {
        if (currentLanguage) {
            setLanguage(currentLanguage as Language);
            setData('language', currentLanguage as Language);
        }
    }, [currentLanguage, setData]);

    const updateLanguage = async (newLanguage: Language) => {
        if (newLanguage === language) return;

        return new Promise<void>((resolve, reject) => {
            setData('language', newLanguage);

            post(route('language.switch'), {
                onSuccess: () => {
                    setLanguage(newLanguage);
                    console.log('✅ Language updated successfully');
                    // Reload the page to apply the new language
                    window.location.reload();
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ Language update failed:', errors);
                    reset();

                    // Extract error message
                    let errorMessage = 'Failed to update language preference. Please try again.';
                    if (errors.language) {
                        errorMessage = Array.isArray(errors.language) ? errors.language[0] : errors.language;
                    }

                    reject(new Error(errorMessage));
                },
                onFinish: () => {
                    console.log('🏁 Language update request finished');
                }
            });
        });
    };

    return {
        language,
        updateLanguage,
        isLoading: processing,
    };
}