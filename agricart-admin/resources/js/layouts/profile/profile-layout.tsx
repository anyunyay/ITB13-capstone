import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface ProfileLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function ProfileLayout({ children, breadcrumbs = [], title }: PropsWithChildren<ProfileLayoutProps>) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative z-10 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <nav className="flex items-center space-x-2 text-sm mb-6">
                            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-sm">
                                <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <a 
                                            href={breadcrumb.href} 
                                            className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            {breadcrumb.title}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </nav>
                    )}
                    
                    {/* Page Title */}
                    {title && (
                        <div className="mb-8">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2 h-10 bg-green-500 rounded-full shadow-lg"></div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
                                        {title}
                                    </h1>
                                    <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                                        Manage your account settings and preferences
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Profile Content */}
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
