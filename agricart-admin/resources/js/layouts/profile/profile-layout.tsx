import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface ProfileLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function ProfileLayout({ children, breadcrumbs = [], title }: PropsWithChildren<ProfileLayoutProps>) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    
    // Check if user has Logistic or Member role
    const shouldShowMainPageButton = user?.type === 'logistic' || user?.type === 'member';

    const handleMainPageClick = () => {
        // Navigate to the appropriate dashboard based on user type
        if (user?.type === 'logistic') {
            router.visit(route('logistic.dashboard'));
        } else if (user?.type === 'member') {
            router.visit(route('member.dashboard'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="relative z-10 pt-8 pb-6" style={{ isolation: 'isolate' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <nav className="flex items-center space-x-2 text-sm mb-6 mt-4">
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
                        <div className="mb-8 mt-20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
                                            {title}
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Manage your account settings and preferences
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Back to Main Page Button - Only visible for Logistic and Member roles */}
                                {shouldShowMainPageButton && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMainPageClick}
                                        className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Back to Main Page
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Profile Content */}
                    <div className="space-y-4 mt-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
