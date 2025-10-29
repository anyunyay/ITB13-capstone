/**
 * Translation categorization system based on user type and page location
 * This provides organized access to translations for different parts of the application
 */

import { __ } from '@/lib/i18n';
import { useTranslation } from '@/hooks/useTranslation';

export type UserType = 'admin' | 'staff' | 'customer' | 'member' | 'logistic';
export type PageCategory = 'dashboard' | 'inventory' | 'orders' | 'profile' | 'auth' | 'common';

/**
 * Get translations for a specific user type and page category
 */
export function getCategorizedTranslations(userType: UserType, category: PageCategory) {
    const { t } = useTranslation();
    
    const translations = {
        admin: {
            dashboard: {
                title: () => t('admin.dashboard_title', 'Admin Dashboard'),
                welcome: () => t('admin.dashboard_welcome', 'Welcome back, Administrator'),
                overview: () => t('admin.dashboard_overview', 'System Overview'),
                stats: () => t('admin.dashboard_stats', 'System Statistics'),
                recentActivity: () => t('admin.dashboard_recent_activity', 'Recent System Activity'),
                quickActions: () => t('admin.dashboard_quick_actions', 'Quick Administrative Actions'),
                systemHealth: () => t('admin.dashboard_system_health', 'System Health'),
                userActivity: () => t('admin.dashboard_user_activity', 'User Activity Summary'),
            },
            inventory: {
                title: () => t('inventory.title', 'Inventory Management'),
                products: () => t('inventory.products', 'Products'),
                addProduct: () => t('inventory.add_product', 'Add Product'),
                editProduct: () => t('inventory.edit_product', 'Edit Product'),
                stockManagement: () => t('inventory.stock_management', 'Stock Management'),
                categories: () => t('inventory.categories', 'Categories'),
            },
            orders: {
                title: () => t('orders.title', 'Order Management'),
                orders: () => t('orders.orders', 'Orders'),
                orderDetails: () => t('orders.order_details', 'Order Details'),
                approveOrder: () => t('orders.approve_order', 'Approve Order'),
                rejectOrder: () => t('orders.reject_order', 'Reject Order'),
                assignLogistic: () => t('orders.assign_logistic', 'Assign Logistic'),
            },
            navigation: {
                dashboard: () => t('admin.nav_dashboard', 'Dashboard'),
                inventory: () => t('admin.nav_inventory', 'Inventory Management'),
                orders: () => t('admin.nav_orders', 'Order Management'),
                sales: () => t('admin.nav_sales', 'Sales Analytics'),
                customers: () => t('admin.nav_customers', 'Customer Management'),
                members: () => t('admin.nav_members', 'Member Management'),
                logistics: () => t('admin.nav_logistics', 'Logistics Management'),
                staff: () => t('admin.nav_staff', 'Staff Management'),
                reports: () => t('admin.nav_reports', 'Reports & Analytics'),
                systemLogs: () => t('admin.nav_system_logs', 'System Logs'),
                settings: () => t('admin.nav_settings', 'System Settings'),
            }
        },
        
        customer: {
            dashboard: {
                title: () => t('customer.home_title', 'Welcome to AgriCart'),
                subtitle: () => t('customer.home_subtitle', 'Fresh produce delivered to your doorstep'),
                browseProducts: () => t('customer.home_browse_products', 'Browse Products'),
                featuredProducts: () => t('customer.home_featured_products', 'Featured Products'),
                categories: () => t('customer.home_categories', 'Product Categories'),
            },
            orders: {
                title: () => t('customer.orders_title', 'My Orders'),
                history: () => t('customer.orders_history', 'Order History'),
                track: () => t('customer.orders_track', 'Track Order'),
                cancel: () => t('customer.orders_cancel', 'Cancel Order'),
                reorder: () => t('customer.orders_reorder', 'Reorder'),
                viewReceipt: () => t('customer.orders_view_receipt', 'View Receipt'),
            },
            cart: {
                title: () => t('customer.cart_title', 'Shopping Cart'),
                empty: () => t('customer.cart_empty', 'Your cart is empty'),
                checkout: () => t('customer.cart_checkout', 'Proceed to Checkout'),
                continueShopping: () => t('customer.cart_continue_shopping', 'Continue Shopping'),
                removeItem: () => t('customer.cart_remove_item', 'Remove Item'),
            },
            navigation: {
                home: () => t('customer.nav_home', 'Home'),
                products: () => t('customer.nav_products', 'Products'),
                cart: () => t('customer.nav_cart', 'Shopping Cart'),
                orders: () => t('customer.nav_orders', 'My Orders'),
                profile: () => t('customer.nav_profile', 'My Profile'),
                addresses: () => t('customer.nav_addresses', 'My Addresses'),
                notifications: () => t('customer.nav_notifications', 'Notifications'),
                help: () => t('customer.nav_help', 'Help & Support'),
            }
        },
        
        member: {
            dashboard: {
                title: () => t('member.dashboard_title', 'Member Dashboard'),
                welcome: () => t('member.dashboard_welcome', 'Welcome back, Member'),
                overview: () => t('member.dashboard_overview', 'Member Overview'),
                earnings: () => t('member.dashboard_earnings', 'Earnings Summary'),
                stockStatus: () => t('member.dashboard_stock_status', 'Stock Status'),
                recentSales: () => t('member.dashboard_recent_sales', 'Recent Sales'),
            },
            stocks: {
                title: () => t('member.stocks_title', 'Stock Management'),
                available: () => t('member.stocks_available', 'Available Stocks'),
                sold: () => t('member.stocks_sold', 'Sold Stocks'),
                totalValue: () => t('member.stocks_total_value', 'Total Stock Value'),
                quantity: () => t('member.stocks_quantity', 'Quantity Available'),
                expiryDate: () => t('member.stocks_expiry_date', 'Expiry Date'),
            },
            earnings: {
                title: () => t('member.earnings_title', 'Earnings Summary'),
                total: () => t('member.earnings_total', 'Total Earnings'),
                thisMonth: () => t('member.earnings_this_month', 'This Month'),
                lastMonth: () => t('member.earnings_last_month', 'Last Month'),
                commissionRate: () => t('member.earnings_commission_rate', 'Commission Rate'),
            },
            navigation: {
                dashboard: () => t('member.nav_dashboard', 'Dashboard'),
                availableStocks: () => t('member.nav_available_stocks', 'Available Stocks'),
                allStocks: () => t('member.nav_all_stocks', 'All Stocks'),
                soldStocks: () => t('member.nav_sold_stocks', 'Sold Stocks'),
                transactions: () => t('member.nav_transactions', 'Transactions'),
                earnings: () => t('member.nav_earnings', 'Earnings'),
                revenueReport: () => t('member.nav_revenue_report', 'Revenue Report'),
            }
        },
        
        logistic: {
            dashboard: {
                title: () => t('logistic.dashboard_title', 'Logistics Dashboard'),
                welcome: () => t('logistic.dashboard_welcome', 'Welcome back, Logistics Personnel'),
                overview: () => t('logistic.dashboard_overview', 'Delivery Overview'),
                assignedOrders: () => t('logistic.dashboard_assigned_orders', 'Assigned Orders'),
                deliveryStats: () => t('logistic.dashboard_delivery_stats', 'Delivery Statistics'),
                performance: () => t('logistic.dashboard_performance', 'Delivery Performance'),
            },
            orders: {
                title: () => t('logistic.orders_title', 'Delivery Orders'),
                assigned: () => t('logistic.orders_assigned', 'Assigned Orders'),
                pending: () => t('logistic.orders_pending', 'Pending Deliveries'),
                inTransit: () => t('logistic.orders_in_transit', 'In Transit'),
                delivered: () => t('logistic.orders_delivered', 'Delivered Orders'),
                failed: () => t('logistic.orders_failed', 'Failed Deliveries'),
            },
            actions: {
                markPickedUp: () => t('logistic.action_mark_picked_up', 'Mark as Picked Up'),
                startDelivery: () => t('logistic.action_start_delivery', 'Start Delivery'),
                markDelivered: () => t('logistic.action_mark_delivered', 'Mark as Delivered'),
                reportIssue: () => t('logistic.action_report_issue', 'Report Delivery Issue'),
                contactCustomer: () => t('logistic.action_contact_customer', 'Contact Customer'),
            },
            navigation: {
                dashboard: () => t('logistic.nav_dashboard', 'Dashboard'),
                assignedOrders: () => t('logistic.nav_assigned_orders', 'Assigned Orders'),
                deliveryHistory: () => t('logistic.nav_delivery_history', 'Delivery History'),
                routePlanning: () => t('logistic.nav_route_planning', 'Route Planning'),
                deliveryReports: () => t('logistic.nav_delivery_reports', 'Delivery Reports'),
            }
        },
        
        staff: {
            // Staff uses same translations as admin but with limited access
            dashboard: {
                title: () => t('admin.dashboard_title', 'Staff Dashboard'),
                welcome: () => t('admin.dashboard_welcome', 'Welcome back, Staff Member'),
                overview: () => t('admin.dashboard_overview', 'System Overview'),
            },
            navigation: {
                dashboard: () => t('admin.nav_dashboard', 'Dashboard'),
                inventory: () => t('admin.nav_inventory', 'Inventory Management'),
                orders: () => t('admin.nav_orders', 'Order Management'),
                sales: () => t('admin.nav_sales', 'Sales Analytics'),
                customers: () => t('admin.nav_customers', 'Customer Management'),
                members: () => t('admin.nav_members', 'Member Management'),
            }
        }
    };
    
    return translations[userType] || translations.customer;
}

/**
 * Hook to get categorized translations for current user
 */
export function useCategorizedTranslations(userType: UserType, category: PageCategory) {
    return getCategorizedTranslations(userType, category);
}

/**
 * Get common translations that apply to all user types
 */
export function getCommonTranslations() {
    const { t } = useTranslation();
    
    return {
        actions: {
            save: () => t('common.save', 'Save'),
            cancel: () => t('common.cancel', 'Cancel'),
            delete: () => t('common.delete', 'Delete'),
            edit: () => t('common.edit', 'Edit'),
            add: () => t('common.add', 'Add'),
            submit: () => t('common.submit', 'Submit'),
            reset: () => t('common.reset', 'Reset'),
            search: () => t('common.search', 'Search'),
            filter: () => t('common.filter', 'Filter'),
            export: () => t('common.export', 'Export'),
            import: () => t('common.import', 'Import'),
            view: () => t('common.view', 'View'),
            close: () => t('common.close', 'Close'),
            confirm: () => t('common.confirm', 'Confirm'),
            back: () => t('common.back', 'Back'),
            next: () => t('common.next', 'Next'),
        },
        status: {
            active: () => t('common.active', 'Active'),
            inactive: () => t('common.inactive', 'Inactive'),
            pending: () => t('common.pending', 'Pending'),
            approved: () => t('common.approved', 'Approved'),
            rejected: () => t('common.rejected', 'Rejected'),
            completed: () => t('common.completed', 'Completed'),
            cancelled: () => t('common.cancelled', 'Cancelled'),
            processing: () => t('common.processing', 'Processing'),
            delivered: () => t('common.delivered', 'Delivered'),
        },
        fields: {
            name: () => t('common.name', 'Name'),
            email: () => t('common.email', 'Email'),
            phone: () => t('common.phone', 'Phone'),
            address: () => t('common.address', 'Address'),
            price: () => t('common.price', 'Price'),
            quantity: () => t('common.quantity', 'Quantity'),
            total: () => t('common.total', 'Total'),
            status: () => t('common.status', 'Status'),
            date: () => t('common.date', 'Date'),
            time: () => t('common.time', 'Time'),
        },
        messages: {
            loading: () => t('common.loading', 'Loading...'),
            noData: () => t('common.no_data', 'No data available'),
            success: () => t('common.success', 'Success!'),
            error: () => t('common.error', 'Error!'),
            warning: () => t('common.warning', 'Warning!'),
            confirmDelete: () => t('common.confirm_delete', 'Are you sure you want to delete this item?'),
        },
        profile: {
            info: () => t('profile.info', 'Profile Information'),
            password: () => t('profile.password', 'Password'),
            appearance: () => t('profile.appearance', 'Appearance'),
            help: () => t('profile.help', 'Help'),
            logout: () => t('profile.logout', 'Logout'),
        }
    };
}

/**
 * Get navigation translations for specific user type
 */
export function getNavigationTranslations(userType: UserType) {
    const categorized = getCategorizedTranslations(userType, 'dashboard');
    return categorized.navigation || {};
}

/**
 * Get page-specific translations
 */
export function getPageTranslations(userType: UserType, pageName: string) {
    const categorized = getCategorizedTranslations(userType, 'dashboard');
    return categorized[pageName as keyof typeof categorized] || {};
}