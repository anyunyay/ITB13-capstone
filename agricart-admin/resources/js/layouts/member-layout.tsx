import { MemberHeader } from '@/components/member-header';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface MemberLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function MemberLayout({ children, breadcrumbs = [] }: PropsWithChildren<MemberLayoutProps>) {
    return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <main className="flex-1 space-y-4 pt-6">
                {children}
            </main>
        </div>
    );
}
