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

        // Stock Trail page
        if (url === '/admin/inventory/stock-trail') {
            crumbs.push({ title: 'Stock Trail', href: '' });
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
        if (segments.length) {
            crumbs.push({
                title: segments.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' / '),
                href: url,
            });
        }
    }
    return crumbs;
}
