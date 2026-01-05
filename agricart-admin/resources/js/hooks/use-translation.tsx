import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

interface PageProps {
    translations?: Record<string, any>;
    locale?: string;
    userLanguage?: 'en' | 'tl';
    [key: string]: any;
}

/**
 * React hook to access Laravel translations in React components
 * Usage: const t = useTranslation(); t('customer.orders')
 */
export function useTranslation() {
    const { props } = usePage<PageProps>();
    const translations = props.translations || {};
    const locale = props.locale || props.userLanguage || 'en';

    const translate = useMemo(() => {
        return (key: string, params?: Record<string, string | number>): string => {
            // Support dot notation: 'customer.orders' or 'ui.save'
            const keys = key.split('.');
            let value: any = translations;

            // Navigate through the nested object
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    // Fallback to key if translation not found
                    return key;
                }
            }

            // Handle function translations (for dynamic values)
            if (typeof value === 'function') {
                return value(params || {});
            }

            // Handle string translations with parameter replacement
            if (typeof value === 'string' && params) {
                return value.replace(/:(\w+)/g, (match, param) => {
                    return params[param]?.toString() || match;
                });
            }

            // Return the translation or fallback to key
            return typeof value === 'string' ? value : key;
        };
    }, [translations, locale]);

    return translate;
}

/**
 * Get translation from a specific namespace
 * Usage: getTranslationByNamespace('customer', 'orders')
 */
export function useTranslationByNamespace(namespace: string) {
    const { props } = usePage<PageProps>();
    const translations = props.translations || {};
    const namespaceTranslations = translations[namespace] || {};

    const translate = useMemo(() => {
        return (key: string, params?: Record<string, string | number>): string => {
            const keys = key.split('.');
            let value: any = namespaceTranslations;

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key;
                }
            }

            if (typeof value === 'function') {
                return value(params || {});
            }

            if (typeof value === 'string' && params) {
                return value.replace(/:(\w+)/g, (match, param) => {
                    return params[param]?.toString() || match;
                });
            }

            return typeof value === 'string' ? value : key;
        };
    }, [namespaceTranslations]);

    return translate;
}

