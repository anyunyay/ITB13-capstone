import { usePage } from '@inertiajs/react';
import { __ } from '@/lib/i18n';

/**
 * Global translation hook that provides translation functions
 * and current language context throughout the application
 */
export function useGlobalTranslation() {
    const { currentLanguage } = usePage<{ currentLanguage?: string }>().props;
    const locale = currentLanguage || 'en';

    // Translation function that uses current locale
    const t = (key: string, fallback?: string): string => {
        return __(key, locale) || fallback || key;
    };

    // Common translation shortcuts for frequently used terms
    const common = {
        // Actions
        save: () => t('common.save', 'Save'),
        cancel: () => t('common.cancel', 'Cancel'),
        delete: () => t('common.delete', 'Delete'),
        edit: () => t('common.edit', 'Edit'),
        add: () => t('common.add', 'Add'),
        submit: () => t('common.submit', 'Submit'),
        reset: () => t('common.reset', 'Reset'),
        search: () => t('common.search', 'Search'),
        filter: () => t('common.filter', 'Filter'),
        export: () => t('common.export', 'Export'),
        view: () => t('common.view', 'View'),
        close: () => t('common.close', 'Close'),
        confirm: () => t('common.confirm', 'Confirm'),
        back: () => t('common.back', 'Back'),
        next: () => t('common.next', 'Next'),
        
        // Status
        active: () => t('common.active', 'Active'),
        inactive: () => t('common.inactive', 'Inactive'),
        pending: () => t('common.pending', 'Pending'),
        approved: () => t('common.approved', 'Approved'),
        rejected: () => t('common.rejected', 'Rejected'),
        completed: () => t('common.completed', 'Completed'),
        cancelled: () => t('common.cancelled', 'Cancelled'),
        processing: () => t('common.processing', 'Processing'),
        delivered: () => t('common.delivered', 'Delivered'),
        
        // Fields
        name: () => t('common.name', 'Name'),
        email: () => t('common.email', 'Email'),
        phone: () => t('common.phone', 'Phone'),
        address: () => t('common.address', 'Address'),
        price: () => t('common.price', 'Price'),
        quantity: () => t('common.quantity', 'Quantity'),
        total: () => t('common.total', 'Total'),
        status: () => t('common.status', 'Status'),
        date: () => t('common.date', 'Date'),
        
        // Messages
        loading: () => t('common.loading', 'Loading...'),
        noData: () => t('common.no_data', 'No data available'),
        success: () => t('common.success', 'Success!'),
        error: () => t('common.error', 'Error!'),
        confirmDelete: () => t('common.confirm_delete', 'Are you sure you want to delete this item?'),
    };

    // Navigation translations
    const nav = {
        dashboard: () => t('nav.dashboard', 'Dashboard'),
        inventory: () => t('nav.inventory', 'Inventory'),
        orders: () => t('nav.orders', 'Orders'),
        sales: () => t('nav.sales', 'Sales'),
        customers: () => t('nav.customers', 'Customers'),
        members: () => t('nav.members', 'Members'),
        logistics: () => t('nav.logistics', 'Logistics'),
        staff: () => t('nav.staff', 'Staff'),
        reports: () => t('nav.reports', 'Reports'),
        settings: () => t('nav.settings', 'Settings'),
        profile: () => t('nav.profile', 'Profile'),
        logout: () => t('nav.logout', 'Logout'),
        notifications: () => t('nav.notifications', 'Notifications'),
    };

    // Auth translations
    const auth = {
        login: () => t('auth.login', 'Login'),
        register: () => t('auth.register', 'Register'),
        forgotPassword: () => t('auth.forgot_password', 'Forgot Password'),
        resetPassword: () => t('auth.reset_password', 'Reset Password'),
        rememberMe: () => t('auth.remember_me', 'Remember me'),
        password: () => t('auth.password', 'Password'),
        confirmPassword: () => t('auth.confirm_password', 'Confirm Password'),
        currentPassword: () => t('auth.current_password', 'Current Password'),
        newPassword: () => t('auth.new_password', 'New Password'),
    };

    return {
        t,
        locale,
        common,
        nav,
        auth,
        isEnglish: locale === 'en',
        isTagalog: locale === 'fil',
    };
}