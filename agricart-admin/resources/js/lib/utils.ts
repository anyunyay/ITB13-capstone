import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Generates breadcrumbs based on the current page URL and props
export function generateBreadcrumbs(page: any): BreadcrumbItem[] {
    const url = page.url || '';
    const params = page.props || {};
    const crumbs: BreadcrumbItem[] = [];

    // Inventory
    if (url.startsWith('/admin/inventory')) {
        crumbs.push({ title: 'Inventory', href: '/admin/inventory' });

        // Archive page
        if (url === '/admin/inventory/archive') {
            crumbs.push({ title: 'Archived Products', href: '' });
            return crumbs;
        }

        // Removed Stock page
        if (url === '/admin/inventory/removed-stock') {
            crumbs.push({ title: 'Removed Stock', href: '' });
            return crumbs;
        }

        // Add Product
        if (url === '/admin/inventory/create') {
            crumbs.push({ title: 'Add Product', href: '' });
            return crumbs;
        }

        // Product detail/edit
        if (params.product) {
            crumbs.push({
                title: params.product.name || `Product #${params.product.id}`,
                href: '', // Not clickable
            });

            // Add Stock
            if (url.endsWith('/add-stock')) {
                crumbs.push({
                    title: 'Add Stock',
                    href: '',
                });
            }

            // Edit Stock
            if (url.includes('/edit-stock') && params.stock) {
                crumbs.push({
                    title: `Edit Stock #${params.stock.id}`,
                    href: '',
                });
            }
        }
        return crumbs;
    }

    // Membership
    if (url.startsWith('/admin/membership')) {
        crumbs.push({ title: 'Membership', href: '/admin/membership' });

        // Add Member
        if (url === '/admin/membership/add') {
            crumbs.push({ title: 'Add Member', href: '' });
            return crumbs;
        }

        // Membership Report
        if (url === '/admin/membership/report') {
            crumbs.push({ title: 'Report', href: '' });
            return crumbs;
        }

        // Member detail/edit
        if (params.member) {
            crumbs.push({
                title: params.member.name || `Member #${params.member.id}`,
                href: '',
            });
            if (url.endsWith('/edit')) {
                crumbs.push({
                    title: 'Edit',
                    href: '',
                });
            }
        }
        return crumbs;
    }

    // Logistics
    if (url.startsWith('/admin/logistics')) {
        crumbs.push({ title: 'Logistics', href: '/admin/logistics' });

        // Add Logistic
        if (url === '/admin/logistics/add') {
            crumbs.push({ title: 'Add Logistic', href: '' });
            return crumbs;
        }

        // Logistics Report
        if (url === '/admin/logistics/report') {
            crumbs.push({ title: 'Report', href: '' });
            return crumbs;
        }

        // Logistic detail/edit
        if (params.logistic) {
            crumbs.push({
                title: params.logistic.name || `Logistic #${params.logistic.id}`,
                href: '',
            });
            if (url.endsWith('/edit')) {
                crumbs.push({
                    title: 'Edit',
                    href: '',
                });
            }
        }
        return crumbs;
    }

    // Sales
    if (url.startsWith('/admin/sales')) {
        crumbs.push({ title: 'Sales', href: '/admin/sales' });

        // Member Sales
        if (url === '/admin/sales/member-sales') {
            crumbs.push({ title: 'Member Sales', href: '' });
            return crumbs;
        }

        // Sales Report
        if (url === '/admin/sales/report') {
            crumbs.push({ title: 'Report', href: '' });
            return crumbs;
        }

        return crumbs;
    }

    // Orders
    if (url.startsWith('/admin/orders')) {
        crumbs.push({ title: 'Order Management', href: '/admin/orders' });

        // Order Report
        if (url === '/admin/orders/report') {
            crumbs.push({ title: 'Report', href: '' });
            return crumbs;
        }

        // Order detail/edit
        if (params.order) {
            crumbs.push({
                title: `Order #${params.order.id}`,
                href: '',
            });

            // Receipt Preview
            if (url.endsWith('/receipt-preview')) {
                crumbs.push({
                    title: 'Receipt Preview',
                    href: '',
                });
            }
        }

        return crumbs;
    }

    // Staff
    if (url.startsWith('/admin/staff')) {
        crumbs.push({ title: 'Staff', href: '/admin/staff' });

        // Add Staff
        if (url === '/admin/staff/add') {
            crumbs.push({ title: 'Add Staff', href: '' });
            return crumbs;
        }

        // Staff Report
        if (url === '/admin/staff/report') {
            crumbs.push({ title: 'Report', href: '' });
            return crumbs;
        }

        // Staff detail/edit
        if (params.staff) {
            crumbs.push({
                title: params.staff.name || `Staff #${params.staff.id}`,
                href: '',
            });
            if (url.endsWith('/edit')) {
                crumbs.push({
                    title: 'Edit',
                    href: '',
                });
            }
        }

        return crumbs;
    }

    // Settings
    if (url.startsWith('/settings')) {
        crumbs.push({ title: 'Settings', href: '/settings/profile' });
        if (url === '/settings/profile') {
            crumbs.push({ title: 'Profile', href: '' });
        }
        if (url === '/settings/password') {
            crumbs.push({ title: 'Password', href: '' });
        }
        if (url === '/settings/appearance') {
            crumbs.push({ title: 'Appearance', href: '' });
        }
        return crumbs;
    }

    // Admin Dashboard (standalone)
    if (url === '/admin/dashboard') {
        crumbs.push({ title: 'Dashboard', href: '/admin/dashboard' });
        return crumbs;
    }

    // Customer Dashboard (standalone)
    if (url === '/dashboard') {
        crumbs.push({ title: 'Customer Dashboard', href: '/dashboard' });
        return crumbs;
    }

    // Fallback: If no crumbs, use segments
    if (crumbs.length === 0) {
        const segments = url.split('/').filter(Boolean);
        // Filter out 'admin' segment to remove "Admin /" prefix from breadcrumbs
        const filteredSegments = segments.filter((segment: string) => segment !== 'admin');
        if (filteredSegments.length) {
            crumbs.push({
                title: filteredSegments.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' / '),
                href: url,
            });
        }
    }
    return crumbs;
}

/**
 * Utility function to mask email addresses for security
 * Shows first few characters and domain only for non-admin/staff users
 * 
 * @param email - The email address to mask
 * @returns Masked email address (e.g., "ta***@gmail.com")
 */
export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    } else if (localPart.length <= 5) {
        return `${localPart[0]}***@${domain}`;
    } else {
        return `${localPart[0]}${localPart[1]}***@${domain}`;
    }
};

/**
 * Utility function to get display email based on user role
 * Shows full email for admin/staff users, masked email for others
 * 
 * @param email - The email address to display
 * @param userType - The type of user viewing the email
 * @returns Display email (full or masked based on user role)
 */
export const getDisplayEmail = (email: string, userType?: string): string => {
    const isAdminOrStaff = userType === 'admin' || userType === 'staff';
    return isAdminOrStaff ? (email || '') : maskEmail(email || '');
};

/**
 * Utility function to generate role-based profile routes
 * Returns appropriate route paths based on user type
 * 
 * @param userType - The type of user (admin, staff, customer, logistic, member)
 * @returns Object containing profile route paths for the user type
 */
export const getProfileRoutes = (userType: string) => {
    const baseRoute = userType === 'customer' ? '/customer' : 
                     userType === 'admin' || userType === 'staff' ? '/admin' :
                     userType === 'logistic' ? '/logistic' :
                     userType === 'member' ? '/member' : '/customer';
    
    return {
        profile: `${baseRoute}/profile`,
        profileInfo: `${baseRoute}/profile/info`,
        password: `${baseRoute}/profile/password`,
        appearance: `${baseRoute}/profile/appearance`,
        help: `${baseRoute}/profile/help`,
        logout: `${baseRoute}/profile/logout`,
        logoutPage: `${baseRoute}/profile/logout`,
        addresses: `${baseRoute}/profile/addresses`,
        systemLogs: userType === 'admin' || userType === 'staff' ? '/admin/system-logs' : null,
    };
};

/**
 * Utility function to check if a user has access to specific features
 * 
 * @param userType - The type of user
 * @param feature - The feature to check access for
 * @returns Boolean indicating if user has access
 */
export const hasFeatureAccess = (userType: string, feature: string): boolean => {
    const accessMap: Record<string, string[]> = {
        'system_logs': ['admin', 'staff'],
        'address_management': ['customer'],
        'help_center': ['customer', 'admin', 'staff', 'logistic', 'member'],
        'password_change': ['admin', 'staff', 'customer', 'logistic', 'member'],
        'appearance_settings': ['admin', 'staff', 'customer', 'logistic', 'member'],
        'logout': ['admin', 'staff', 'customer', 'logistic', 'member'],
    };
    
    return accessMap[feature]?.includes(userType) ?? false;
};
