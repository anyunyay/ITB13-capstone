import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { GlobalUrgentPopup } from '@/components/GlobalUrgentPopup';
import { GlobalUrgentFlash } from '@/components/GlobalUrgentFlash';
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
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* Flash notification appears after header, before content */}
                <GlobalUrgentFlash urgentOrders={urgentOrders} />
                {children}
            </AppContent>
            {/* Global Urgent Popup for Admin/Staff */}
            <GlobalUrgentPopup urgentOrders={urgentOrders} />
        </AppShell>
    );
}
