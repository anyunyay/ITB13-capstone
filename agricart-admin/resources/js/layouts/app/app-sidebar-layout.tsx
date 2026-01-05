import { AppContent } from '@/components/shared/layout/app-content';
import { AppShell } from '@/components/shared/layout/app-shell';
import { AppSidebar } from '@/components/shared/layout/app-sidebar';
import { AdminHeader } from '@/components/shared/layout/admin-header';
import { UrgentOrderPopup } from '@/components/common/modals/urgent-order-popup';
import { UrgentFlash } from '@/components/common/feedback/urgent-flash';
import { GlobalSessionMonitor } from '@/components/shared/auth/SessionMonitorWrapper';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const page = usePage<SharedData & { urgentOrders?: Array<any> }>();
    const { urgentOrders = [] } = page.props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AdminHeader breadcrumbs={breadcrumbs} />
                {/* Flash notification appears after header, before content */}
                <UrgentFlash urgentOrders={urgentOrders} />
                {children}
            </AppContent>
            {/* Urgent Order Popup for Admin/Staff */}
            <UrgentOrderPopup urgentOrders={urgentOrders} />
            {/* Session Monitor */}
            <GlobalSessionMonitor />
        </AppShell>
    );
}
