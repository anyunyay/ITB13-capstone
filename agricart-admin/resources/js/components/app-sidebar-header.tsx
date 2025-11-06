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
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-1 sm:gap-2 border-b border-sidebar-border/50 px-2 sm:px-4 lg:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1 flex-shrink-0" />
                <div className="min-w-0 flex-1 overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            {/* Notification bell for admin/staff */}
            {isAdminOrStaff && (
                <div className="flex items-center flex-shrink-0">
                    <NotificationBell 
                        notifications={notifications}
                        userType={auth.user?.type || 'admin'}
                    />
                </div>
            )}
        </header>
    );
}
