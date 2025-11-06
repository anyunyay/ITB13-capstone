import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, className, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset className={cn("overflow-x-hidden", className)} {...props}>{children}</SidebarInset>;
    }

    return (
        <main className={cn("flex h-full w-full flex-1 flex-col rounded-xl overflow-x-hidden", className)} {...props}>
            {children}
        </main>
    );
}
