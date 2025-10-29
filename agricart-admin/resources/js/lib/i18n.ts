import { usePage } from '@inertiajs/react';

// Global translation interface
interface Translations {
    [key: string]: {
        [locale: string]: string;
    };
}

// Comprehensive translations for the entire application
const translations: Translations = {
    // Common/General
    'common.loading': {
        en: 'Loading...',
        fil: 'Naglo-load...'
    },
    'common.save': {
        en: 'Save',
        fil: 'I-save'
    },
    'common.cancel': {
        en: 'Cancel',
        fil: 'Kanselahin'
    },
    'common.delete': {
        en: 'Delete',
        fil: 'Tanggalin'
    },
    'common.edit': {
        en: 'Edit',
        fil: 'I-edit'
    },
    'common.add': {
        en: 'Add',
        fil: 'Magdagdag'
    },
    'common.search': {
        en: 'Search',
        fil: 'Maghanap'
    },
    'common.filter': {
        en: 'Filter',
        fil: 'I-filter'
    },
    'common.export': {
        en: 'Export',
        fil: 'I-export'
    },
    'common.import': {
        en: 'Import',
        fil: 'I-import'
    },
    'common.view': {
        en: 'View',
        fil: 'Tingnan'
    },
    'common.close': {
        en: 'Close',
        fil: 'Isara'
    },
    'common.confirm': {
        en: 'Confirm',
        fil: 'Kumpirmahin'
    },
    'common.yes': {
        en: 'Yes',
        fil: 'Oo'
    },
    'common.no': {
        en: 'No',
        fil: 'Hindi'
    },
    'common.back': {
        en: 'Back',
        fil: 'Bumalik'
    },
    'common.next': {
        en: 'Next',
        fil: 'Susunod'
    },
    'common.previous': {
        en: 'Previous',
        fil: 'Nakaraan'
    },
    'common.submit': {
        en: 'Submit',
        fil: 'Ipasa'
    },
    'common.reset': {
        en: 'Reset',
        fil: 'I-reset'
    },
    'common.clear': {
        en: 'Clear',
        fil: 'Linisin'
    },
    'common.select': {
        en: 'Select',
        fil: 'Piliin'
    },
    'common.all': {
        en: 'All',
        fil: 'Lahat'
    },
    'common.none': {
        en: 'None',
        fil: 'Wala'
    },
    'common.actions': {
        en: 'Actions',
        fil: 'Mga Aksyon'
    },
    'common.status': {
        en: 'Status',
        fil: 'Katayuan'
    },
    'common.date': {
        en: 'Date',
        fil: 'Petsa'
    },
    'common.time': {
        en: 'Time',
        fil: 'Oras'
    },
    'common.name': {
        en: 'Name',
        fil: 'Pangalan'
    },
    'common.email': {
        en: 'Email',
        fil: 'Email'
    },
    'common.phone': {
        en: 'Phone',
        fil: 'Telepono'
    },
    'common.address': {
        en: 'Address',
        fil: 'Address'
    },
    'common.description': {
        en: 'Description',
        fil: 'Paglalarawan'
    },
    'common.price': {
        en: 'Price',
        fil: 'Presyo'
    },
    'common.quantity': {
        en: 'Quantity',
        fil: 'Dami'
    },
    'common.total': {
        en: 'Total',
        fil: 'Kabuuan'
    },
    'common.subtotal': {
        en: 'Subtotal',
        fil: 'Subtotal'
    },

    // Navigation
    'nav.dashboard': {
        en: 'Dashboard',
        fil: 'Dashboard'
    },
    'nav.inventory': {
        en: 'Inventory',
        fil: 'Imbentaryo'
    },
    'nav.orders': {
        en: 'Orders',
        fil: 'Mga Order'
    },
    'nav.sales': {
        en: 'Sales',
        fil: 'Mga Benta'
    },
    'nav.customers': {
        en: 'Customers',
        fil: 'Mga Customer'
    },
    'nav.members': {
        en: 'Members',
        fil: 'Mga Miyembro'
    },
    'nav.logistics': {
        en: 'Logistics',
        fil: 'Logistics'
    },
    'nav.staff': {
        en: 'Staff',
        fil: 'Staff'
    },
    'nav.reports': {
        en: 'Reports',
        fil: 'Mga Ulat'
    },
    'nav.settings': {
        en: 'Settings',
        fil: 'Mga Setting'
    },
    'nav.profile': {
        en: 'Profile',
        fil: 'Profile'
    },
    'nav.logout': {
        en: 'Logout',
        fil: 'Mag-logout'
    },
    'nav.notifications': {
        en: 'Notifications',
        fil: 'Mga Notification'
    },

    // Profile sections
    'profile.info': {
        en: 'Profile Information',
        fil: 'Impormasyon ng Profile'
    },
    'profile.password': {
        en: 'Password',
        fil: 'Password'
    },
    'profile.appearance': {
        en: 'Appearance',
        fil: 'Hitsura'
    },
    'profile.help': {
        en: 'Help',
        fil: 'Tulong'
    },
    'profile.logout': {
        en: 'Logout',
        fil: 'Mag-logout'
    },

    // Authentication
    'auth.login': {
        en: 'Login',
        fil: 'Mag-login'
    },
    'auth.register': {
        en: 'Register',
        fil: 'Mag-register'
    },
    'auth.forgot_password': {
        en: 'Forgot Password',
        fil: 'Nakalimutan ang Password'
    },
    'auth.reset_password': {
        en: 'Reset Password',
        fil: 'I-reset ang Password'
    },
    'auth.remember_me': {
        en: 'Remember me',
        fil: 'Tandaan ako'
    },
    'auth.password': {
        en: 'Password',
        fil: 'Password'
    },
    'auth.confirm_password': {
        en: 'Confirm Password',
        fil: 'Kumpirmahin ang Password'
    },
    'auth.current_password': {
        en: 'Current Password',
        fil: 'Kasalukuyang Password'
    },
    'auth.new_password': {
        en: 'New Password',
        fil: 'Bagong Password'
    },

    // Status messages
    'status.active': {
        en: 'Active',
        fil: 'Aktibo'
    },
    'status.inactive': {
        en: 'Inactive',
        fil: 'Hindi Aktibo'
    },
    'status.pending': {
        en: 'Pending',
        fil: 'Naghihintay'
    },
    'status.approved': {
        en: 'Approved',
        fil: 'Naaprubahan'
    },
    'status.rejected': {
        en: 'Rejected',
        fil: 'Tinanggihan'
    },
    'status.completed': {
        en: 'Completed',
        fil: 'Tapos na'
    },
    'status.cancelled': {
        en: 'Cancelled',
        fil: 'Nakansela'
    },
    'status.processing': {
        en: 'Processing',
        fil: 'Pinoproseso'
    },
    'status.delivered': {
        en: 'Delivered',
        fil: 'Naihatid na'
    },
    'status.out_for_delivery': {
        en: 'Out for Delivery',
        fil: 'Paparating na'
    },

    // Messages
    'message.success': {
        en: 'Success!',
        fil: 'Tagumpay!'
    },
    'message.error': {
        en: 'Error!',
        fil: 'May Mali!'
    },
    'message.warning': {
        en: 'Warning!',
        fil: 'Babala!'
    },
    'message.info': {
        en: 'Information',
        fil: 'Impormasyon'
    },
    'message.confirm_delete': {
        en: 'Are you sure you want to delete this item?',
        fil: 'Sigurado ka bang gusto mong tanggalin ang item na ito?'
    },
    'message.no_data': {
        en: 'No data available',
        fil: 'Walang available na data'
    },
    'message.loading': {
        en: 'Loading data...',
        fil: 'Naglo-load ng data...'
    },

    // Dashboard translations
    'dashboard.title': {
        en: 'Dashboard',
        fil: 'Dashboard'
    },
    'dashboard.welcome': {
        en: 'Welcome back',
        fil: 'Maligayang pagbabalik'
    },
    'dashboard.overview': {
        en: 'Overview',
        fil: 'Pangkalahatang Tingin'
    },
    'dashboard.statistics': {
        en: 'Statistics',
        fil: 'Mga Estadistika'
    },
    'dashboard.recent_activity': {
        en: 'Recent Activity',
        fil: 'Kamakailang Aktibidad'
    },
    'dashboard.total_orders': {
        en: 'Total Orders',
        fil: 'Kabuuang Mga Order'
    },
    'dashboard.total_sales': {
        en: 'Total Sales',
        fil: 'Kabuuang Benta'
    },
    'dashboard.pending_orders': {
        en: 'Pending Orders',
        fil: 'Naghihintay na Order'
    },
    'dashboard.low_stock_items': {
        en: 'Low Stock Items',
        fil: 'Mababang Stock'
    },

    // Inventory translations
    'inventory.title': {
        en: 'Inventory Management',
        fil: 'Pamamahala ng Imbentaryo'
    },
    'inventory.products': {
        en: 'Products',
        fil: 'Mga Produkto'
    },
    'inventory.add_product': {
        en: 'Add Product',
        fil: 'Magdagdag ng Produkto'
    },
    'inventory.edit_product': {
        en: 'Edit Product',
        fil: 'I-edit ang Produkto'
    },
    'inventory.product_name': {
        en: 'Product Name',
        fil: 'Pangalan ng Produkto'
    },
    'inventory.category': {
        en: 'Category',
        fil: 'Kategorya'
    },
    'inventory.stock_quantity': {
        en: 'Stock Quantity',
        fil: 'Dami ng Stock'
    },
    'inventory.in_stock': {
        en: 'In Stock',
        fil: 'May Stock'
    },
    'inventory.out_of_stock': {
        en: 'Out of Stock',
        fil: 'Walang Stock'
    },
    'inventory.low_stock': {
        en: 'Low Stock',
        fil: 'Mababang Stock'
    },

    // Orders translations
    'orders.title': {
        en: 'Order Management',
        fil: 'Pamamahala ng Order'
    },
    'orders.orders': {
        en: 'Orders',
        fil: 'Mga Order'
    },
    'orders.order_details': {
        en: 'Order Details',
        fil: 'Detalye ng Order'
    },
    'orders.customer': {
        en: 'Customer',
        fil: 'Customer'
    },
    'orders.order_date': {
        en: 'Order Date',
        fil: 'Petsa ng Order'
    },
    'orders.total_amount': {
        en: 'Total Amount',
        fil: 'Kabuuang Halaga'
    },
    'orders.approve_order': {
        en: 'Approve Order',
        fil: 'Aprubahan ang Order'
    },
    'orders.reject_order': {
        en: 'Reject Order',
        fil: 'Tanggihan ang Order'
    },

    // Forms translations
    'forms.required_field': {
        en: 'This field is required',
        fil: 'Kinakailangan ang field na ito'
    },
    'forms.invalid_email': {
        en: 'Please enter a valid email address',
        fil: 'Maglagay ng wastong email address'
    },
    'forms.save_changes': {
        en: 'Save Changes',
        fil: 'I-save ang mga Pagbabago'
    },
    'forms.discard_changes': {
        en: 'Discard Changes',
        fil: 'Itapon ang mga Pagbabago'
    },
    'forms.upload_file': {
        en: 'Upload File',
        fil: 'Mag-upload ng File'
    },
    'forms.choose_file': {
        en: 'Choose File',
        fil: 'Pumili ng File'
    },

    // Appearance translations (existing)
    'appearance.title': {
        en: 'Appearance Settings',
        fil: 'Mga Setting ng Hitsura'
    },
    'appearance.theme_preferences': {
        en: 'Theme Preferences',
        fil: 'Mga Kagustuhan sa Theme'
    },
    'appearance.theme_description': {
        en: 'Choose how you want the application to look. Your preference will be saved and applied across all devices.',
        fil: 'Piliin kung paano mo gustong makita ang aplikasyon. Ang inyong kagustuhan ay ma-save at mailalapat sa lahat ng device.'
    },
    'appearance.language_preferences': {
        en: 'Language Preferences',
        fil: 'Mga Kagustuhan sa Wika'
    },
    'appearance.language_description': {
        en: 'Choose your preferred language. This will change the interface language across the application.',
        fil: 'Piliin ang inyong gustong wika. Ito ay magbabago sa wika ng interface sa buong aplikasyon.'
    },
    'appearance.current_language': {
        en: 'Current language',
        fil: 'Kasalukuyang wika'
    },
    'appearance.english': {
        en: 'English',
        fil: 'Ingles'
    },
    'appearance.tagalog': {
        en: 'Tagalog',
        fil: 'Tagalog'
    },
    'appearance.language_updated': {
        en: 'Language preference updated successfully!',
        fil: 'Matagumpay na na-update ang kagustuhan sa wika!'
    },
    'appearance.language_update_failed': {
        en: 'Failed to update language preference. Please try again.',
        fil: 'Hindi na-update ang kagustuhan sa wika. Subukan ulit.'
    },
};

// Hook to get current language from Inertia props
export function useCurrentLanguage(): string {
    try {
        const { currentLanguage } = usePage<{ currentLanguage?: string }>().props;
        return currentLanguage || 'en';
    } catch {
        return 'en';
    }
}

// Main translation function
export function __(key: string, locale?: string): string {
    // If no locale provided, try to get from Inertia props or default to 'en'
    let currentLocale = locale;
    
    if (!currentLocale) {
        try {
            const { currentLanguage } = usePage<{ currentLanguage?: string }>().props;
            currentLocale = currentLanguage || 'en';
        } catch {
            currentLocale = 'en';
        }
    }

    // Get translation
    const translation = translations[key];
    if (!translation) {
        console.warn(`Translation key "${key}" not found`);
        return key;
    }

    return translation[currentLocale] || translation['en'] || key;
}

// Translation function that doesn't use hooks (for use outside components)
export function translate(key: string, locale: string = 'en'): string {
    const translation = translations[key];
    if (!translation) {
        console.warn(`Translation key "${key}" not found`);
        return key;
    }

    return translation[locale] || translation['en'] || key;
}

// Function to add new translations dynamically
export function addTranslations(newTranslations: Translations): void {
    Object.assign(translations, newTranslations);
}

// Function to get all available locales
export function getAvailableLocales(): string[] {
    return ['en', 'fil'];
}

// Function to check if a locale is supported
export function isLocaleSupported(locale: string): boolean {
    return getAvailableLocales().includes(locale);
}