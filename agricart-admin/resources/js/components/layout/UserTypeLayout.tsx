import React from 'react';
import { usePage } from '@inertiajs/react';
import { TranslatedNavigation } from '@/components/navigation/TranslatedNavigation';
import { getCategorizedTranslations, getCommonTranslations, UserType } from '@/lib/translationCategories';
import { useTranslation } from '@/hooks/useTranslation';

interface UserTypeLayoutProps {
    children: React.ReactNode;
    showNavigation?: boolean;
    showHeader?: boolean;
}

/**
 * Layout component that automatically applies user-type specific translations
 * This should be used within individual pages, not as an app wrapper
 */
export function UserTypeLayout({ 
    children, 
    showNavigation = true, 
    showHeader = true 
}: UserTypeLayoutProps) {
    // Safely get user type with fallback
    let userType: UserType = 'customer';
    let locale = 'en';
    
    try {
        const { auth } = usePage<{ auth: { user?: { type: string } } }>().props;
        userType = (auth?.user?.type as UserType) || 'customer';
        const { locale: currentLocale } = useTranslation();
        locale = currentLocale;
    } catch (error) {
        console.warn('Could not get user type from Inertia, using defaults:', error);
    }

    // Get user-specific translations
    const userTranslations = getCategorizedTranslations(userType, 'dashboard');
    const commonTranslations = getCommonTranslations();

    // Provide translation context to all child components
    React.useEffect(() => {
        // Store user type and translations in window for global access
        (window as any).currentUserType = userType;
        (window as any).userTranslations = userTranslations;
        (window as any).commonTranslations = commonTranslations;
        (window as any).currentLocale = locale;
    }, [userType, userTranslations, commonTranslations, locale]);

    return (
        <div className="min-h-screen bg-background" data-user-type={userType} data-locale={locale}>
            {showHeader && (
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold">
                                {userTranslations.dashboard?.title?.() || 'Dashboard'}
                            </h1>
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
                
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

/**
 * Hook to get current user type and translations
 */
export function useUserTypeTranslations() {
    const { auth } = usePage<{ auth: { user?: { type: string } } }>().props;
    const userType = (auth?.user?.type as UserType) || 'customer';
    
    return {
        userType,
        translations: getCategorizedTranslations(userType, 'dashboard'),
        common: getCommonTranslations(),
        navigation: getCategorizedTranslations(userType, 'dashboard').navigation || {}
    };
}

/**
 * Higher-order component that provides user-type specific translations
 */
export function withUserTypeTranslations<P extends object>(
    Component: React.ComponentType<P>
) {
    return function UserTypeTranslatedComponent(props: P) {
        const userTypeData = useUserTypeTranslations();
        
        return (
            <Component 
                {...props} 
                userType={userTypeData.userType}
                translations={userTypeData.translations}
                common={userTypeData.common}
                navigation={userTypeData.navigation}
            />
        );
    };
}