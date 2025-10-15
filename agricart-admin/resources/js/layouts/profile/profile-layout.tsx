import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface ProfileLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function ProfileLayout({ children, breadcrumbs = [], title }: PropsWithChildren<ProfileLayoutProps>) {
    return (
        <div className="space-y-4 m-20">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((breadcrumb, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            {index > 0 && <span>/</span>}
                            <a 
                                href={breadcrumb.href} 
                                className="hover:text-foreground transition-colors"
                            >
                                {breadcrumb.title}
                            </a>
                        </div>
                    ))}
                </nav>
            )}
            
            {/* Page Title */}
            {title && (
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                </div>
            )}
            
            {/* Profile Content */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
