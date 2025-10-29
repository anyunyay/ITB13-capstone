import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { SafeTranslatedLayout, useSafeUserType } from '@/components/layout/SafeTranslatedLayout';
import { getCategorizedTranslations, getCommonTranslations, UserType } from '@/lib/translationCategories';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';
import { Badge } from '@/components/ui/badge';

/**
 * Example showing how to apply the categorized translation system to an existing page
 * This demonstrates the step-by-step process of migrating a page to use translations
 */

// STEP 1: Original page without translations
function OriginalPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">150</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱85,000</div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">Add New</button>
                <button className="px-4 py-2 border rounded">Export Data</button>
            </div>
        </div>
    );
}

// STEP 2: Add basic translation hooks
function BasicTranslatedPage() {
    const { t } = useTranslation();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t('nav.dashboard', 'Dashboard')}</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.total_orders', 'Total Orders')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">150</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.active_users', 'Active Users')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.revenue', 'Revenue')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱85,000</div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex gap-2">
                <SmartButton>Add New</SmartButton>
                <SmartButton variant="outline">Export Data</SmartButton>
            </div>
        </div>
    );
}

// STEP 3: Add user-type specific translations
function UserTypeAwarePage() {
    const userType = useSafeUserType();
    const { t } = useTranslation();
    const translations = getCategorizedTranslations(userType, 'dashboard');
    const common = getCommonTranslations();

    return (
        <SafeTranslatedLayout
            userType={userType}
            titleKey="dashboard.title"
            title="Dashboard"
        >
            <Head title={translations.dashboard?.title?.() || 'Dashboard'} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {translations.dashboard?.title?.() || t('nav.dashboard', 'Dashboard')}
                    </h1>
                    <Badge variant="outline">{userType.toUpperCase()}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {getStatsForUserType(userType, translations, common).map((stat, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-sm text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-2">
                    {getActionsForUserType(userType, common).map((action, index) => (
                        <SmartButton
                            key={index}
                            variant={action.variant}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </SmartButton>
                    ))}
                </div>

                {/* User-specific content */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {getUserSpecificTitle(userType, translations)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {getUserSpecificDescription(userType, translations)}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </SafeTranslatedLayout>
    );
}

// STEP 4: Complete categorized translation implementation
export function CompleteTranslatedPage() {
    const userType = useSafeUserType();
    const { t, locale } = useTranslation();
    const translations = getCategorizedTranslations(userType, 'dashboard');
    const common = getCommonTranslations();

    // Show language change indicator
    React.useEffect(() => {
        console.log(`🌐 Page rendered with locale: ${locale}, user type: ${userType}`);
    }, [locale, userType]);

    return (
        <SafeTranslatedLayout
            userType={userType}
            titleKey={getPageTitleKey(userType)}
            showNavigation={true}
            showHeader={true}
        >
            <Head title={translations.dashboard?.title?.() || 'Dashboard'} />

            <div className="space-y-6">
                {/* Page Header with Language Indicator */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {translations.dashboard?.title?.() || 'Dashboard'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            System Overview for {userType}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{userType}</Badge>
                        <Badge variant="outline">{locale.toUpperCase()}</Badge>
                        <Badge variant="default">
                            {locale === 'en' ? 'English' : 'Tagalog'}
                        </Badge>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {getStatsForUserType(userType, translations, common).map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {getActionsForUserType(userType, common).map((action, index) => (
                        <SmartButton
                            key={index}
                            variant={action.variant}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </SmartButton>
                    ))}
                </div>

                {/* User-Type Specific Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {getUserSpecificTitle(userType, translations)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {getUserSpecificDescription(userType, translations)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>{common.fields.status()}:</strong> {common.status.active()}</p>
                            <p><strong>User Type:</strong> {userType}</p>
                            <p><strong>Language:</strong> {locale === 'en' ? 'English' : 'Tagalog'}</p>
                            <p><strong>Translations:</strong> {Object.keys(translations).length} categories</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SafeTranslatedLayout>
    );
}

// Helper functions for user-type specific content
function getPageTitleKey(userType: UserType): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return 'admin.dashboard_title';
        case 'customer':
            return 'customer.home_title';
        case 'member':
            return 'member.dashboard_title';
        case 'logistic':
            return 'logistic.dashboard_title';
        default:
            return 'dashboard.title';
    }
}

function getStatsForUserType(userType: UserType, translations: any, common: any) {
    switch (userType) {
        case 'admin':
        case 'staff':
            return [
                { title: common.fields.name(), value: '150', description: 'Total system users' },
                { title: translations.orders?.title?.() || 'Orders', value: '1,250', description: 'Orders processed' },
                { title: translations.inventory?.title?.() || 'Products', value: '85', description: 'Products available' },
                { title: common.status.active(), value: '98%', description: 'System uptime' },
            ];
        case 'customer':
            return [
                { title: 'Available Products', value: '85', description: 'Fresh products' },
                { title: 'Categories', value: '12', description: 'Product categories' },
                { title: 'Cart Items', value: '3', description: 'Items in cart' },
            ];
        case 'member':
            return [
                { title: 'Total Earnings', value: '₱4,025', description: 'This month' },
                { title: 'Available Stock', value: '30', description: 'Items for sale' },
                { title: 'Sold Items', value: '75', description: 'Items sold' },
            ];
        case 'logistic':
            return [
                { title: 'Assigned Orders', value: '12', description: 'Orders to deliver' },
                { title: 'Completed', value: '8', description: 'Delivered today' },
                { title: 'In Transit', value: '3', description: 'Currently delivering' },
            ];
        default:
            return [];
    }
}

function getActionsForUserType(userType: UserType, common: any) {
    switch (userType) {
        case 'admin':
        case 'staff':
            return [
                { label: common.actions.add(), variant: 'default' as const, onClick: () => console.log('Add user') },
                { label: common.actions.export(), variant: 'outline' as const, onClick: () => console.log('Export') },
                { label: 'System Settings', variant: 'secondary' as const, onClick: () => console.log('Settings') },
            ];
        case 'customer':
            return [
                { label: 'Browse Products', variant: 'default' as const, onClick: () => console.log('Browse') },
                { label: 'View Cart', variant: 'outline' as const, onClick: () => console.log('Cart') },
            ];
        case 'member':
            return [
                { label: 'View Earnings', variant: 'default' as const, onClick: () => console.log('Earnings') },
                { label: common.actions.export(), variant: 'outline' as const, onClick: () => console.log('Export') },
            ];
        case 'logistic':
            return [
                { label: 'View Routes', variant: 'default' as const, onClick: () => console.log('Routes') },
                { label: 'Update Status', variant: 'outline' as const, onClick: () => console.log('Status') },
            ];
        default:
            return [];
    }
}

function getUserSpecificTitle(userType: UserType, translations: any): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return translations.dashboard?.systemHealth?.() || 'System Health';
        case 'customer':
            return 'Featured Products';
        case 'member':
            return translations.dashboard?.earnings?.() || 'Earnings Overview';
        case 'logistic':
            return translations.dashboard?.assignedOrders?.() || 'Assigned Deliveries';
        default:
            return 'Information';
    }
}

function getUserSpecificDescription(userType: UserType, translations: any): string {
    switch (userType) {
        case 'admin':
        case 'staff':
            return 'Monitor system performance and user activity across all modules.';
        case 'customer':
            return 'Discover fresh, high-quality produce delivered directly to your doorstep.';
        case 'member':
            return 'Track your sales performance and earnings from product contributions.';
        case 'logistic':
            return 'Manage your delivery routes and track order completion status.';
        default:
            return 'Welcome to the system.';
    }
}