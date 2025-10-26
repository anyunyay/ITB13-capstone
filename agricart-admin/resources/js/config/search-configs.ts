import { SearchConfig } from '@/types/global-search';

// Member Management Search Configuration
export const memberSearchConfig: SearchConfig = {
    placeholder: "Search members by name, ID, email, or contact...",
    searchFields: ['name', 'email', 'id', 'contact_number'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending Verification' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'type',
            label: 'Member Type',
            type: 'select',
            options: [
                { value: 'regular', label: 'Regular' },
                { value: 'premium', label: 'Premium' },
                { value: 'vip', label: 'VIP' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'showDeactivated',
            label: 'Show Deactivated',
            type: 'toggle',
            defaultValue: false
        }
    ]
};

// Logistics Management Search Configuration
export const logisticsSearchConfig: SearchConfig = {
    placeholder: "Search logistics by ID, name, email, or contact...",
    searchFields: ['name', 'email', 'id', 'contact_number'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending Approval' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'showDeactivated',
            label: 'Show Deactivated',
            type: 'toggle',
            defaultValue: false
        }
    ]
};

// Inventory Management Search Configuration
export const inventorySearchConfig: SearchConfig = {
    placeholder: "Search products by name, description, or type...",
    searchFields: ['name', 'description', 'produce_type'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'herbs', label: 'Herbs' },
                { value: 'grains', label: 'Grains' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'sortBy',
            label: 'Sort By',
            type: 'select',
            options: [
                { value: 'name', label: 'Name' },
                { value: 'type', label: 'Type' },
                { value: 'price', label: 'Price' },
                { value: 'created_at', label: 'Date Added' }
            ],
            defaultValue: 'name'
        },
        {
            key: 'showArchived',
            label: 'Show Archived',
            type: 'toggle',
            defaultValue: false
        }
    ]
};

// Orders Management Search Configuration
export const ordersSearchConfig: SearchConfig = {
    placeholder: "Search orders by customer name, email, or order ID...",
    searchFields: ['customer.name', 'customer.email', 'id'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'status',
            label: 'Order Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'delayed', label: 'Delayed' },
                { value: 'cancelled', label: 'Cancelled' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'deliveryStatus',
            label: 'Delivery Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'out_for_delivery', label: 'Out for Delivery' },
                { value: 'delivered', label: 'Delivered' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            placeholder: 'Select date range'
        }
    ]
};

// Staff Management Search Configuration
export const staffSearchConfig: SearchConfig = {
    placeholder: "Search staff by name, email, or role...",
    searchFields: ['name', 'email', 'role'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'role',
            label: 'Role',
            type: 'select',
            options: [
                { value: 'admin', label: 'Administrator' },
                { value: 'manager', label: 'Manager' },
                { value: 'staff', label: 'Staff' },
                { value: 'viewer', label: 'Viewer' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ],
            defaultValue: 'all'
        }
    ]
};

// Sales Report Search Configuration
export const salesReportSearchConfig: SearchConfig = {
    placeholder: "Search sales by member, product, or transaction ID...",
    searchFields: ['member.name', 'product.name', 'transaction_id'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'memberType',
            label: 'Member Type',
            type: 'multiselect',
            options: [
                { value: 'regular', label: 'Regular' },
                { value: 'premium', label: 'Premium' },
                { value: 'vip', label: 'VIP' }
            ],
            defaultValue: []
        },
        {
            key: 'productType',
            label: 'Product Type',
            type: 'multiselect',
            options: [
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'herbs', label: 'Herbs' },
                { value: 'grains', label: 'Grains' }
            ],
            defaultValue: []
        },
        {
            key: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            placeholder: 'Select date range'
        }
    ]
};

// Audit Trail Search Configuration
export const auditTrailSearchConfig: SearchConfig = {
    placeholder: "Search audit trail by user, action, or description...",
    searchFields: ['user.name', 'action', 'description'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'action',
            label: 'Action Type',
            type: 'multiselect',
            options: [
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' }
            ],
            defaultValue: []
        },
        {
            key: 'userType',
            label: 'User Type',
            type: 'select',
            options: [
                { value: 'admin', label: 'Administrator' },
                { value: 'staff', label: 'Staff' },
                { value: 'member', label: 'Member' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            placeholder: 'Select date range'
        }
    ]
};

// Generic/Default Search Configuration
export const defaultSearchConfig: SearchConfig = {
    placeholder: "Search...",
    searchFields: ['name', 'description'],
    resultsCount: true,
    clearable: true,
    filters: []
};

// Configuration mapping for easy access
export const searchConfigs = {
    members: memberSearchConfig,
    logistics: logisticsSearchConfig,
    inventory: inventorySearchConfig,
    orders: ordersSearchConfig,
    staff: staffSearchConfig,
    sales: salesReportSearchConfig,
    audit: auditTrailSearchConfig,
    default: defaultSearchConfig
} as const;

export type SearchConfigKey = keyof typeof searchConfigs;
