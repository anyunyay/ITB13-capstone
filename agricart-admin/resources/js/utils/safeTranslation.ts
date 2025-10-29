import { translate } from '@/lib/i18n';
import { autoTranslate } from '@/utils/autoTranslate';

/**
 * Safe translation utilities that can be used outside of React components
 * These functions don't rely on hooks and can be used anywhere
 */

/**
 * Get current locale from various sources
 */
function getCurrentLocale(): string {
    try {
        // Try to get from Inertia page props
        const inertiaPage = (window as any).page;
        if (inertiaPage?.props?.currentLanguage) {
            return inertiaPage.props.currentLanguage;
        }

        // Try to get from document meta tag
        const metaTag = document.querySelector('meta[name="app-locale"]');
        if (metaTag) {
            return metaTag.getAttribute('content') || 'en';
        }

        // Try to get from localStorage
        const stored = localStorage.getItem('app-locale');
        if (stored) {
            return stored;
        }
    } catch (error) {
        console.warn('Could not determine locale, using default:', error);
    }

    return 'en'; // Default fallback
}

/**
 * Safe translation function that can be used anywhere
 */
export function safeT(key: string, fallback?: string): string {
    const locale = getCurrentLocale();
    return translate(key, locale) || fallback || key;
}

/**
 * Safe auto-translation function that can be used anywhere
 */
export function safeAuto(text: string): string {
    const locale = getCurrentLocale();
    return autoTranslate(text, locale);
}

/**
 * Common translations that can be used anywhere
 */
export const safeCommon = {
    // Actions
    save: () => safeT('common.save', 'Save'),
    cancel: () => safeT('common.cancel', 'Cancel'),
    delete: () => safeT('common.delete', 'Delete'),
    edit: () => safeT('common.edit', 'Edit'),
    add: () => safeT('common.add', 'Add'),
    submit: () => safeT('common.submit', 'Submit'),
    reset: () => safeT('common.reset', 'Reset'),
    search: () => safeT('common.search', 'Search'),
    
    // Status
    active: () => safeT('common.active', 'Active'),
    inactive: () => safeT('common.inactive', 'Inactive'),
    pending: () => safeT('common.pending', 'Pending'),
    approved: () => safeT('common.approved', 'Approved'),
    rejected: () => safeT('common.rejected', 'Rejected'),
    completed: () => safeT('common.completed', 'Completed'),
    cancelled: () => safeT('common.cancelled', 'Cancelled'),
    
    // Fields
    name: () => safeT('common.name', 'Name'),
    email: () => safeT('common.email', 'Email'),
    phone: () => safeT('common.phone', 'Phone'),
    address: () => safeT('common.address', 'Address'),
    
    // Messages
    loading: () => safeT('common.loading', 'Loading...'),
    success: () => safeT('common.success', 'Success!'),
    error: () => safeT('common.error', 'Error!'),
};

/**
 * Update locale in localStorage for persistence
 */
export function updateStoredLocale(locale: string): void {
    try {
        localStorage.setItem('app-locale', locale);
    } catch (error) {
        console.warn('Could not store locale:', error);
    }
}