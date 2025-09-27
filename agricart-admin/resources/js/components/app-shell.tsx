import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { RefreshProvider } from '@/contexts/RefreshContext';
import { useMemo } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const page = usePage<SharedData>();
    const isOpen = page.props.sidebarOpen;
    const notifications = page.props.notifications || [];

    // Memoize the options to prevent infinite loops
    const refreshOptions = useMemo(() => ({
        notificationInterval: 3000, // Check for notifications every 3 seconds
        autoRefreshOnNewNotifications: true, // Automatically refresh page when new notifications are detected
        generalRefreshInterval: 60000, // General refresh every 1 minute
        enableGeneralRefresh: true, // Enable general auto-refresh
        refreshOnFocus: true, // Refresh when window gains focus
        refreshOnVisibilityChange: true, // Refresh when page becomes visible
        preserveState: true,
        preserveScroll: true,
        only: ['notifications'], // Only refresh notifications data
    }), []);

    const refreshProvider = (
        <RefreshProvider 
            initialNotifications={notifications}
            options={refreshOptions}
        >
            {children}
        </RefreshProvider>
    );

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{refreshProvider}</div>;
    }

    return <SidebarProvider defaultOpen={isOpen}>{refreshProvider}</SidebarProvider>;
}
