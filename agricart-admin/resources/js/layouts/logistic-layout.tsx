import { LogisticHeader } from '@/components/logistic-header';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface LogisticLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function LogisticLayout({ children, breadcrumbs = [] }: PropsWithChildren<LogisticLayoutProps>) {
    return (
        <div className="min-h-screen bg-gray-900">
            <LogisticHeader />
            <main className="flex-1 space-y-4 p-4 pt-6">
                {children}
            </main>
        </div>
    );
}
