import { translate } from '@/lib/i18n';

/**
 * Auto-translation utility that maps common English text to translation keys
 * This allows gradual translation without breaking existing components
 */

// Common text mappings to translation keys
const textMappings: Record<string, string> = {
    // Actions
    'Save': 'common.save',
    'Cancel': 'common.cancel',
    'Delete': 'common.delete',
    'Edit': 'common.edit',
    'Add': 'common.add',
    'Submit': 'common.submit',
    'Reset': 'common.reset',
    'Search': 'common.search',
    'Filter': 'common.filter',
    'Export': 'common.export',
    'Import': 'common.import',
    'View': 'common.view',
    'Close': 'common.close',
    'Confirm': 'common.confirm',
    'Back': 'common.back',
    'Next': 'common.next',
    'Previous': 'common.previous',
    'Loading...': 'common.loading',
    'Loading': 'common.loading',

    // Status
    'Active': 'common.active',
    'Inactive': 'common.inactive',
    'Pending': 'common.pending',
    'Approved': 'common.approved',
    'Rejected': 'common.rejected',
    'Completed': 'common.completed',
    'Cancelled': 'common.cancelled',
    'Processing': 'common.processing',
    'Delivered': 'common.delivered',
    'Out for Delivery': 'common.out_for_delivery',

    // Fields
    'Name': 'common.name',
    'Email': 'common.email',
    'Phone': 'common.phone',
    'Address': 'common.address',
    'Description': 'common.description',
    'Price': 'common.price',
    'Quantity': 'common.quantity',
    'Total': 'common.total',
    'Subtotal': 'common.subtotal',
    'Status': 'common.status',
    'Date': 'common.date',
    'Time': 'common.time',

    // Navigation
    'Dashboard': 'nav.dashboard',
    'Inventory': 'nav.inventory',
    'Orders': 'nav.orders',
    'Sales': 'nav.sales',
    'Customers': 'nav.customers',
    'Members': 'nav.members',
    'Logistics': 'nav.logistics',
    'Staff': 'nav.staff',
    'Reports': 'nav.reports',
    'Settings': 'nav.settings',
    'Profile': 'nav.profile',
    'Logout': 'nav.logout',
    'Notifications': 'nav.notifications',

    // Auth
    'Login': 'auth.login',
    'Log in': 'auth.login',
    'Register': 'auth.register',
    'Sign up': 'auth.register',
    'Forgot Password': 'auth.forgot_password',
    'Forgot password?': 'auth.forgot_password',
    'Reset Password': 'auth.reset_password',
    'Remember me': 'auth.remember_me',
    'Password': 'auth.password',
    'Confirm Password': 'auth.confirm_password',
    'Current Password': 'auth.current_password',
    'New Password': 'auth.new_password',

    // Messages
    'Success!': 'common.success',
    'Error!': 'common.error',
    'Warning!': 'common.warning',
    'Information': 'common.info',
    'No data available': 'common.no_data',
    'Are you sure you want to delete this item?': 'common.confirm_delete',

    // Common phrases
    'Yes': 'common.yes',
    'No': 'common.no',
    'All': 'common.all',
    'None': 'common.none',
    'Actions': 'common.actions',
    'Select': 'common.select',
    'Clear': 'common.clear',
};

/**
 * Automatically translates common text based on current locale
 * Falls back to original text if no translation found
 */
export function autoTranslate(text: string, locale: string = 'en'): string {
    // If already in English or no mapping exists, return original
    if (locale === 'en' || !textMappings[text]) {
        return text;
    }

    const translationKey = textMappings[text];
    if (translationKey) {
        return translate(translationKey, locale);
    }

    return text;
}

/**
 * Higher-order function that wraps text content with auto-translation
 * Usage: const translatedText = withAutoTranslation("Save", locale);
 */
export function withAutoTranslation(text: string, locale?: string): string {
    return autoTranslate(text, locale);
}

/**
 * React component wrapper that automatically translates children text
 * Note: This is a placeholder for future enhancement
 */
export function AutoTranslateWrapper({
    children,
    locale
}: {
    children: any;
    locale?: string;
}): any {
    // This would need more complex implementation to traverse and translate text nodes
    // For now, it's a placeholder for future enhancement
    return children;
}

/**
 * Utility to check if text should be auto-translated
 */
export function shouldAutoTranslate(text: string): boolean {
    return textMappings.hasOwnProperty(text);
}

/**
 * Get all available auto-translation mappings
 */
export function getAutoTranslationMappings(): Record<string, string> {
    return { ...textMappings };
}