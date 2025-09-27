import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { RefreshProvider } from '@/contexts/RefreshContext';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const page = usePage<SharedData>();
    const isOpen = page.props.sidebarOpen;
    const notifications = page.props.notifications || [];

    const refreshProvider = (
        <RefreshProvider 
            initialNotifications={notifications}
            options={{
                notificationInterval: 10000, // Check for notifications every 10 seconds
                autoRefreshOnNewNotifications: true, // Automatically refresh page when new notifications are detected
                generalRefreshInterval: 120000, // General refresh every 2 minutes
                enableGeneralRefresh: true, // Enable general auto-refresh
                refreshOnFocus: true, // Refresh when window gains focus
                refreshOnVisibilityChange: true, // Refresh when page becomes visible
                preserveState: true,
                preserveScroll: true,
                only: ['notifications'], // Only refresh notifications data
            }}
        >
            {children}
        </RefreshProvider>
    );

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{refreshProvider}</div>;
    }

    return <SidebarProvider defaultOpen={isOpen}>{refreshProvider}</SidebarProvider>;
}
