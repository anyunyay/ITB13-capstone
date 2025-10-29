import { autoTranslate } from './autoTranslate';

/**
 * Migration helper utilities for gradually applying translations
 * without breaking existing functionality
 */

/**
 * Wraps a string with auto-translation if available
 * Safe to use in existing components without breaking changes
 */
export function safeTranslate(text: string, locale?: string): string {
    try {
        return autoTranslate(text, locale);
    } catch (error) {
        console.warn('Translation failed, falling back to original text:', error);
        return text;
    }
}

/**
 * Creates a translation-aware text renderer
 * Can be used to wrap existing text content
 */
export function createTranslatedText(text: string, locale?: string): string {
    return safeTranslate(text, locale);
}

/**
 * Utility to check if a component should use translations
 * Based on environment or feature flags
 */
export function shouldUseTranslations(): boolean {
    // Could be controlled by environment variable or feature flag
    return true; // Always enabled for now
}

/**
 * Gradual migration wrapper for existing components
 * Allows enabling/disabling translations per component
 */
export function withGradualTranslation<T extends Record<string, any>>(
    props: T,
    translationMap?: Record<string, string>
): T {
    if (!shouldUseTranslations() || !translationMap) {
        return props;
    }

    const translatedProps = { ...props };
    
    // Apply translations to mapped properties
    Object.entries(translationMap).forEach(([propKey, text]) => {
        if (typeof translatedProps[propKey] === 'string') {
            translatedProps[propKey] = safeTranslate(text);
        }
    });

    return translatedProps;
}

/**
 * Text replacement utility for common patterns
 * Maps common English text to their translated equivalents
 */
export const commonTextReplacements = {
    // Actions
    'Save': (locale?: string) => safeTranslate('Save', locale),
    'Cancel': (locale?: string) => safeTranslate('Cancel', locale),
    'Delete': (locale?: string) => safeTranslate('Delete', locale),
    'Edit': (locale?: string) => safeTranslate('Edit', locale),
    'Add': (locale?: string) => safeTranslate('Add', locale),
    'Submit': (locale?: string) => safeTranslate('Submit', locale),
    'Search': (locale?: string) => safeTranslate('Search', locale),
    'Filter': (locale?: string) => safeTranslate('Filter', locale),
    'Export': (locale?: string) => safeTranslate('Export', locale),
    'View': (locale?: string) => safeTranslate('View', locale),
    'Close': (locale?: string) => safeTranslate('Close', locale),
    'Back': (locale?: string) => safeTranslate('Back', locale),
    'Next': (locale?: string) => safeTranslate('Next', locale),
    
    // Status
    'Active': (locale?: string) => safeTranslate('Active', locale),
    'Inactive': (locale?: string) => safeTranslate('Inactive', locale),
    'Pending': (locale?: string) => safeTranslate('Pending', locale),
    'Approved': (locale?: string) => safeTranslate('Approved', locale),
    'Rejected': (locale?: string) => safeTranslate('Rejected', locale),
    'Completed': (locale?: string) => safeTranslate('Completed', locale),
    'Cancelled': (locale?: string) => safeTranslate('Cancelled', locale),
    'Processing': (locale?: string) => safeTranslate('Processing', locale),
    'Delivered': (locale?: string) => safeTranslate('Delivered', locale),
    
    // Fields
    'Name': (locale?: string) => safeTranslate('Name', locale),
    'Email': (locale?: string) => safeTranslate('Email', locale),
    'Phone': (locale?: string) => safeTranslate('Phone', locale),
    'Address': (locale?: string) => safeTranslate('Address', locale),
    'Price': (locale?: string) => safeTranslate('Price', locale),
    'Quantity': (locale?: string) => safeTranslate('Quantity', locale),
    'Total': (locale?: string) => safeTranslate('Total', locale),
    'Status': (locale?: string) => safeTranslate('Status', locale),
    'Date': (locale?: string) => safeTranslate('Date', locale),
    
    // Auth
    'Login': (locale?: string) => safeTranslate('Login', locale),
    'Log in': (locale?: string) => safeTranslate('Log in', locale),
    'Register': (locale?: string) => safeTranslate('Register', locale),
    'Password': (locale?: string) => safeTranslate('Password', locale),
    'Remember me': (locale?: string) => safeTranslate('Remember me', locale),
    'Forgot password?': (locale?: string) => safeTranslate('Forgot password?', locale),
};

/**
 * Batch text replacement for arrays of text
 */
export function batchTranslate(texts: string[], locale?: string): string[] {
    return texts.map(text => safeTranslate(text, locale));
}

/**
 * Object property translation utility
 */
export function translateObjectProperties<T extends Record<string, any>>(
    obj: T,
    propertiesToTranslate: (keyof T)[],
    locale?: string
): T {
    const translated = { ...obj };
    
    propertiesToTranslate.forEach(prop => {
        if (typeof translated[prop] === 'string') {
            translated[prop] = safeTranslate(translated[prop] as string, locale);
        }
    });
    
    return translated;
}