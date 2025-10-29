import React from 'react';
import { usePage } from '@inertiajs/react';
import { TranslatedPage, commonPageActions } from '@/components/pages/TranslatedPage';
import { TranslatedTable } from '@/components/tables/TranslatedTable';
import { getCategorizedTranslations, getCommonTranslations, UserType } from '@/lib/translationCategories';
import { useUserTypeTranslations } from '@/components/layout/UserTypeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example showing how to use categorized translations based on user type
 * This demonstrates the complete system working together
 */
export function CategorizedTranslationExample() {
    const { auth } = usePage<{ auth: { user?: { type: string } } }>().props;
    const userType = (auth?.user?.type as UserType) || 'customer';
    const { translations, common, navigation } = useUserTypeTranslations();

    // Get user-specific translations
    const dashboardTranslations = translations.dashboard || {};
    const orderTranslations = translations.orders || {};
    const inventoryTranslations = translations.inventory || {};

    // Sample data that would come from props in real application
    const sampleData = getSampleDataForUserType(userType);

    // Configure page based on user type
    const pageConfig = getPageConfigForUserType(userType, {
        dashboard: dashboardTranslations,
        orders: orderTranslations,
        inventory: inventoryTranslations,
        common,
        navigation
    });

    return (
        <TranslatedPage
            titleKey={pageConfig.titleKey}
            title={pageConfig.title}
            breadcrumbs={pageConfig.breadcrumbs}
            actions={pageConfig.actions}
        >
            {/* User Type Indicator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        {common.messages.info()} - Current User Type: {userType.toUpperCase()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page demonstrates categorized translations based on user type.
                        Each user type sees different content and navigation options.
                    </p>
                </CardContent>
            </Card>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {pageConfig.stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
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

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{pageConfig.tableTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TranslatedTable
                        columns={pageConfig.tableColumns}
                        data={sampleData}
                        actions={pageConfig.tableActions}
                        emptyMessageKey={pageConfig.emptyMessageKey}
                    />
                </CardContent>
            </Card>

            {/* Navigation Example */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Available Navigation Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(navigation).map(([key, getLabel]) => (
                            <div key={key} className="p-3 border rounded-lg text-center">
                                <div className="font-medium">{getLabel()}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {key}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TranslatedPage>
    );
}

/**
 * Get sample data based on user type
 */
function getSampleDataForUserType(userType: UserType) {
    switch (userType) {
        case 'admin':
        case 'staff':
            return [
                { id: 1, name: 'System Users', count: 150, status: 'Active', type: 'Management' },
                { id: 2, name: 'Total Orders', count: 1250, status: 'Processing', type: 'Orders' },
                { id: 3, name: 'Inventory Items', count: 85, status: 'In Stock', type: 'Products' },
            ];
        
        case 'customer':
            return [
                { id: 1, name: 'Tomatoes', price: 50.00, status: 'In Stock', category: 'Vegetables' },
                { id: 2, name: 'Carrots', price: 30.00, status: 'Low Stock', category: 'Vegetables' },
                { id: 3, name: 'Lettuce', price: 25.00, status: 'Out of Stock', category: 'Vegetables' },
            ];
        
        case 'member':
            return [
                { id: 1, product: 'Tomatoes', quantity: 50, earnings: 2500.00, status: 'Sold' },
                { id: 2, product: 'Carrots', quantity: 30, earnings: 900.00, status: 'Available' },
                { id: 3, product: 'Lettuce', quantity: 25, earnings: 625.00, status: 'Sold' },
            ];
        
        case 'logistic':
            return [
                { id: 1, order: 'ORD-001', customer: 'John Doe', status: 'In Transit', priority: 'High' },
                { id: 2, order: 'ORD-002', customer: 'Jane Smith', status: 'Delivered', priority: 'Normal' },
                { id: 3, order: 'ORD-003', customer: 'Bob Johnson', status: 'Pending', priority: 'Urgent' },
            ];
        
        default:
            return [];
    }
}

/**
 * Get page configuration based on user type
 */
function getPageConfigForUserType(userType: UserType, translations: any) {
    const { dashboard, orders, inventory, common, navigation } = translations;

    switch (userType) {
        case 'admin':
        case 'staff':
            return {
                titleKey: 'admin.dashboard_title',
                title: dashboard.title?.() || 'Admin Dashboard',
                breadcrumbs: [
                    { labelKey: 'nav.dashboard' }
                ],
                actions: [
                    commonPageActions.add(() => console.log('Add user')),
                    commonPageActions.export(() => console.log('Export data')),
                ],
                stats: [
                    { 
                        label: common.fields.name(), 
                        value: '150', 
                        description: 'Total system users' 
                    },
                    { 
                        label: orders?.title?.() || 'Orders', 
                        value: '1,250', 
                        description: 'Total orders processed' 
                    },
                    { 
                        label: inventory?.title?.() || 'Products', 
                        value: '85', 
                        description: 'Products in inventory' 
                    },
                    { 
                        label: common.status.active(), 
                        value: '98%', 
                        description: 'System uptime' 
                    },
                ],
                tableTitle: 'System Overview',
                tableColumns: [
                    { key: 'name', labelKey: 'common.name' },
                    { key: 'count', labelKey: 'common.quantity' },
                    { key: 'status', labelKey: 'common.status' },
                    { key: 'type', labelKey: 'common.category' },
                ],
                tableActions: [
                    { key: 'view', labelKey: 'common.view', variant: 'outline' as const, onClick: () => {} },
                    { key: 'edit', labelKey: 'common.edit', variant: 'outline' as const, onClick: () => {} },
                ],
                emptyMessageKey: 'common.no_data'
            };

        case 'customer':
            return {
                titleKey: 'customer.home_title',
                title: 'Welcome to AgriCart',
                breadcrumbs: [
                    { labelKey: 'customer.nav_home' }
                ],
                actions: [
                    commonPageActions.search(() => console.log('Search products')),
                    commonPageActions.filter(() => console.log('Filter products')),
                ],
                stats: [
                    { 
                        label: 'Available Products', 
                        value: '85', 
                        description: 'Fresh products available' 
                    },
                    { 
                        label: 'Categories', 
                        value: '12', 
                        description: 'Product categories' 
                    },
                    { 
                        label: 'Cart Items', 
                        value: '3', 
                        description: 'Items in your cart' 
                    },
                    { 
                        label: 'Orders', 
                        value: '5', 
                        description: 'Your total orders' 
                    },
                ],
                tableTitle: 'Available Products',
                tableColumns: [
                    { key: 'name', labelKey: 'common.name' },
                    { key: 'price', labelKey: 'common.price' },
                    { key: 'status', labelKey: 'common.status' },
                    { key: 'category', labelKey: 'inventory.category' },
                ],
                tableActions: [
                    { key: 'add_to_cart', labelKey: 'customer.products_add_to_cart', variant: 'default' as const, onClick: () => {} },
                    { key: 'view', labelKey: 'customer.products_view_details', variant: 'outline' as const, onClick: () => {} },
                ],
                emptyMessageKey: 'customer.products_no_products'
            };

        case 'member':
            return {
                titleKey: 'member.dashboard_title',
                title: dashboard.title?.() || 'Member Dashboard',
                breadcrumbs: [
                    { labelKey: 'member.nav_dashboard' }
                ],
                actions: [
                    commonPageActions.export(() => console.log('Export earnings')),
                ],
                stats: [
                    { 
                        label: 'Total Earnings', 
                        value: '₱4,025', 
                        description: 'This month earnings' 
                    },
                    { 
                        label: 'Available Stock', 
                        value: '30', 
                        description: 'Items available for sale' 
                    },
                    { 
                        label: 'Sold Items', 
                        value: '75', 
                        description: 'Items sold this month' 
                    },
                    { 
                        label: 'Commission Rate', 
                        value: '15%', 
                        description: 'Current commission rate' 
                    },
                ],
                tableTitle: 'Stock Overview',
                tableColumns: [
                    { key: 'product', labelKey: 'common.name' },
                    { key: 'quantity', labelKey: 'common.quantity' },
                    { key: 'earnings', labelKey: 'member.earnings_total' },
                    { key: 'status', labelKey: 'common.status' },
                ],
                tableActions: [
                    { key: 'view', labelKey: 'common.view', variant: 'outline' as const, onClick: () => {} },
                ],
                emptyMessageKey: 'member.no_stocks'
            };

        case 'logistic':
            return {
                titleKey: 'logistic.dashboard_title',
                title: dashboard.title?.() || 'Logistics Dashboard',
                breadcrumbs: [
                    { labelKey: 'logistic.nav_dashboard' }
                ],
                actions: [
                    commonPageActions.export(() => console.log('Export delivery report')),
                ],
                stats: [
                    { 
                        label: 'Assigned Orders', 
                        value: '12', 
                        description: 'Orders assigned to you' 
                    },
                    { 
                        label: 'Completed Today', 
                        value: '8', 
                        description: 'Deliveries completed today' 
                    },
                    { 
                        label: 'In Transit', 
                        value: '3', 
                        description: 'Currently delivering' 
                    },
                    { 
                        label: 'Success Rate', 
                        value: '96%', 
                        description: 'Delivery success rate' 
                    },
                ],
                tableTitle: 'Delivery Orders',
                tableColumns: [
                    { key: 'order', labelKey: 'orders.order_number' },
                    { key: 'customer', labelKey: 'orders.customer' },
                    { key: 'status', labelKey: 'logistic.status_pending' },
                    { key: 'priority', labelKey: 'logistic.orders_priority' },
                ],
                tableActions: [
                    { key: 'update_status', labelKey: 'logistic.action_update_status', variant: 'default' as const, onClick: () => {} },
                    { key: 'view_route', labelKey: 'logistic.action_view_route', variant: 'outline' as const, onClick: () => {} },
                ],
                emptyMessageKey: 'logistic.no_orders'
            };

        default:
            return {
                titleKey: 'common.dashboard',
                title: 'Dashboard',
                breadcrumbs: [],
                actions: [],
                stats: [],
                tableTitle: 'Data',
                tableColumns: [],
                tableActions: [],
                emptyMessageKey: 'common.no_data'
            };
    }
}