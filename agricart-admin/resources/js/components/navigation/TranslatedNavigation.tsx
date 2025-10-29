import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    TrendingUp, 
    Users, 
    UserCheck, 
    Truck, 
    Settings, 
    FileText,
    Bell
} from 'lucide-react';

interface NavigationItem {
    key: string;
    labelKey: string;
    href: string;
    icon: React.ComponentType<any>;
    roles?: string[];
}

interface TranslatedNavigationProps {
    userType?: string;
    className?: string;
}

/**
 * Navigation component with full translation support
 * Automatically translates menu items based on current language
 */
export function TranslatedNavigation({ userType, className }: TranslatedNavigationProps) {
    const { t, nav } = useTranslation();
    const { url } = usePage();

    // Define navigation items with translation keys
    const navigationItems: NavigationItem[] = [
        {
            key: 'dashboard',
            labelKey: 'nav.dashboard',
            href: getDashboardRoute(userType),
            icon: LayoutDashboard,
            roles: ['admin', 'staff', 'customer', 'member', 'logistic']
        },
        {
            key: 'inventory',
            labelKey: 'nav.inventory',
            href: '/admin/inventory',
            icon: Package,
            roles: ['admin', 'staff']
        },
        {
            key: 'orders',
            labelKey: 'nav.orders',
            href: '/admin/orders',
            icon: ShoppingCart,
            roles: ['admin', 'staff', 'logistic']
        },
        {
            key: 'sales',
            labelKey: 'nav.sales',
            href: '/admin/sales',
            icon: TrendingUp,
            roles: ['admin', 'staff']
        },
        {
            key: 'customers',
            labelKey: 'nav.customers',
            href: '/admin/customers',
            icon: Users,
            roles: ['admin', 'staff']
        },
        {
            key: 'members',
            labelKey: 'nav.members',
            href: '/admin/membership',
            icon: UserCheck,
            roles: ['admin', 'staff']
        },
        {
            key: 'logistics',
            labelKey: 'nav.logistics',
            href: '/admin/logistics',
            icon: Truck,
            roles: ['admin', 'staff']
        },
        {
            key: 'reports',
            labelKey: 'nav.reports',
            href: '/admin/reports',
            icon: FileText,
            roles: ['admin', 'staff', 'member', 'logistic']
        },
        {
            key: 'notifications',
            labelKey: 'nav.notifications',
            href: getNotificationsRoute(userType),
            icon: Bell,
            roles: ['admin', 'staff', 'customer', 'member', 'logistic']
        },
        {
            key: 'settings',
            labelKey: 'nav.settings',
            href: getSettingsRoute(userType),
            icon: Settings,
            roles: ['admin', 'staff', 'customer', 'member', 'logistic']
        }
    ];

    // Filter items based on user role
    const filteredItems = navigationItems.filter(item => 
        !item.roles || !userType || item.roles.includes(userType)
    );

    return (
        <nav className={cn('space-y-2', className)}>
            {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = url.startsWith(item.href);
                
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {t(item.labelKey)}
                    </Link>
                );
            })}
        </nav>
    );
}

// Helper functions to get routes based on user type
function getDashboardRoute(userType?: string): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return '/admin/dashboard';
        case 'member':
            return '/member/dashboard';
        case 'logistic':
            return '/logistic/dashboard';
        case 'customer':
        default:
            return '/';
    }
}

function getNotificationsRoute(userType?: string): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return '/admin/notifications';
        case 'member':
            return '/member/notifications';
        case 'logistic':
            return '/logistic/notifications';
        case 'customer':
        default:
            return '/customer/notifications';
    }
}

function getSettingsRoute(userType?: string): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return '/admin/profile/appearance';
        case 'member':
            return '/member/profile/appearance';
        case 'logistic':
            return '/logistic/profile/appearance';
        case 'customer':
        default:
            return '/customer/profile/appearance';
    }
}