import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { NotificationBell } from '@/components/NotificationBell';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData & { notifications?: Array<any> }>();
    const { auth, notifications = [] } = page.props;
    
    // Check if user is admin or staff
    const isAdminOrStaff = auth.user?.type === 'admin' || auth.user?.type === 'staff';
    
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {/* Notification bell for admin/staff */}
            {isAdminOrStaff && (
                <div className="flex items-center">
                    <NotificationBell 
                        notifications={notifications}
                        userType={auth.user?.type || 'admin'}
                    />
                </div>
            )}
        </header>
    );
}
