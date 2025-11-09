import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface LogisticLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function LogisticLayout({ children, breadcrumbs = [] }: PropsWithChildren<LogisticLayoutProps>) {
    return (
        <div className="min-h-screen bg-gray-900 relative z-0" style={{ isolation: 'isolate' }}>
            <LogisticsHeader />
            <main className="flex-1 relative z-0" style={{ isolation: 'isolate' }}>
                {children}
            </main>
        </div>
    );
}
