import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslatedNavigation } from '@/components/navigation/TranslatedNavigation';
import { UserType } from '@/lib/translationCategories';

interface SafeTranslatedLayoutProps {
    children: React.ReactNode;
    userType?: UserType;
    showNavigation?: boolean;
    showHeader?: boolean;
    title?: string;
    titleKey?: string;
}

/**
 * Safe translated layout that can be used within pages
 * Does not depend on Inertia being initialized at app level
 */
export function SafeTranslatedLayout({ 
    children, 
    userType = 'customer',
    showNavigation = true, 
    showHeader = true,
    title,
    titleKey
}: SafeTranslatedLayoutProps) {
    const { t, locale } = useTranslation();

    const translatedTitle = titleKey ? t(titleKey, title) : title;

    return (
        <div className="min-h-screen bg-background" data-user-type={userType} data-locale={locale}>
            {showHeader && (
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                        <div className="flex items-center gap-4">
                            {translatedTitle && (
                                <h1 className="text-lg font-semibold">
                                    {translatedTitle}
                                </h1>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* User type indicator */}
                            <span className="text-sm text-muted-foreground capitalize">
                                {userType}
                            </span>
                            
                            {/* Language indicator */}
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                                {locale.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </header>
            )}
            
            <div className="flex">
                {showNavigation && (
                    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-h-[calc(100vh-3.5rem)]">
                        <div className="p-4">
                            <TranslatedNavigation userType={userType} />
                        </div>
                    </aside>
                )}
                
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

/**
 * Hook to safely get user type from Inertia props
 */
export function useSafeUserType(): UserType {
    try {
        // Try to import usePage dynamically to avoid initialization issues
        const { usePage } = require('@inertiajs/react');
        const { auth } = usePage().props;
        return (auth?.user?.type as UserType) || 'customer';
    } catch (error) {
        console.warn('Could not get user type from Inertia, using default:', error);
        return 'customer';
    }
}

/**
 * Safe wrapper component that can be used in any page
 */
export function withSafeTranslation<P extends object>(
    Component: React.ComponentType<P>
) {
    return function SafeTranslatedComponent(props: P) {
        const userType = useSafeUserType();
        
        return (
            <SafeTranslatedLayout userType={userType}>
                <Component {...props} />
            </SafeTranslatedLayout>
        );
    };
}