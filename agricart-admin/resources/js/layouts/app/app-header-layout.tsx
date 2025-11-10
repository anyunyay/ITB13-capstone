import { AppContent } from '@/components/shared/layout/app-content';
import { CustomerHeader } from '@/components/shared/layout/customer-header';
import { AppShell } from '@/components/shared/layout/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell>
            <CustomerHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
