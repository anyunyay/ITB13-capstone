import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { UrgentOrderPopup } from '@/components/urgent-order-popup';
import { UrgentFlash } from '@/components/urgent-flash';
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
                <UrgentFlash urgentOrders={urgentOrders} />
                {children}
            </AppContent>
            {/* Urgent Order Popup for Admin/Staff */}
            <UrgentOrderPopup urgentOrders={urgentOrders} />
        </AppShell>
    );
}
