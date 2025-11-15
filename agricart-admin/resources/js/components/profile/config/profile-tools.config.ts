import { 
    Database, 
    MapPin, 
    Key, 
    Palette, 
    HelpCircle, 
    LogOut 
} from 'lucide-react';
import { ProfileTool } from '../ProfileToolsCard';
import { getProfileRoutes, hasFeatureAccess } from '@/lib/utils';

/**
 * Configuration for profile tools based on user type
 * This makes it easy to add new tools or modify existing ones
 */
export const getProfileTools = (userType: string, t: (key: string) => string): ProfileTool[] => {
    const routes = getProfileRoutes(userType);
    const tools: ProfileTool[] = [];

    // System Logs - Admin/Staff only
    if (hasFeatureAccess(userType, 'system_logs') && routes.systemLogs) {
        tools.push({
            id: 'system_logs',
            icon: Database,
            label: t('ui.system_logs'),
            description: t('ui.view_analyze_system_logs'),
            route: routes.systemLogs,
            iconColor: 'text-primary',
        });
    }

    // Address Management - Customer only
    if (hasFeatureAccess(userType, 'address_management')) {
        tools.push({
            id: 'address_management',
            icon: MapPin,
            label: t('ui.address_management'),
            description: t('ui.manage_delivery_addresses'),
            route: routes.addresses,
            iconColor: 'text-primary',
        });
    }

    // Password Change - All users
    if (hasFeatureAccess(userType, 'password_change')) {
        tools.push({
            id: 'password_change',
            icon: Key,
            label: t('ui.change_password'),
            description: t('ui.update_password_security'),
            route: routes.password,
            iconColor: 'text-primary',
        });
    }

    // Appearance Settings - All users
    if (hasFeatureAccess(userType, 'appearance_settings')) {
        tools.push({
            id: 'appearance_settings',
            icon: Palette,
            label: t('ui.appearance'),
            description: t('ui.customize_interface_theme'),
            route: routes.appearance,
            iconColor: 'text-primary',
        });
    }

    // Help & Support - All users
    if (hasFeatureAccess(userType, 'help_center')) {
        tools.push({
            id: 'help_center',
            icon: HelpCircle,
            label: t('ui.help_and_support'),
            description: t('ui.get_help_documentation'),
            route: routes.help,
            iconColor: 'text-primary',
        });
    }

    // Logout - All users
    if (hasFeatureAccess(userType, 'logout')) {
        tools.push({
            id: 'logout',
            icon: LogOut,
            label: t('ui.logout'),
            description: t('ui.sign_out_securely'),
            route: routes.logoutPage,
            variant: 'destructive',
            iconColor: 'text-destructive',
            hoverColor: 'hover:bg-destructive/5 hover:border-destructive/20',
        });
    }

    return tools;
};
