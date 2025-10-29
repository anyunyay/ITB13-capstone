import { useTranslation } from '@/hooks/useTranslation';

/**
 * Utility functions to help migrate existing pages to use translations
 */

/**
 * Common text patterns that should be translated
 */
export const commonTextPatterns = {
    // Page titles
    'Dashboard': 'dashboard.title',
    'Inventory': 'inventory.title',
    'Orders': 'orders.title',
    'Sales': 'sales.title',
    'Customers': 'customers.title',
    'Members': 'members.title',
    'Logistics': 'logistics.title',
    'Reports': 'reports.title',
    'Settings': 'settings.title',
    
    // Common actions
    'Add': 'common.add',
    'Edit': 'common.edit',
    'Delete': 'common.delete',
    'Save': 'common.save',
    'Cancel': 'common.cancel',
    'Submit': 'common.submit',
    'Export': 'common.export',
    'Import': 'common.import',
    'Search': 'common.search',
    'Filter': 'common.filter',
    'View': 'common.view',
    'Close': 'common.close',
    
    // Status values
    'Active': 'common.active',
    'Inactive': 'common.inactive',
    'Pending': 'common.pending',
    'Approved': 'common.approved',
    'Rejected': 'common.rejected',
    'Completed': 'common.completed',
    'Cancelled': 'common.cancelled',
    'Processing': 'common.processing',
    'Delivered': 'common.delivered',
    
    // Form fields
    'Name': 'common.name',
    'Email': 'common.email',
    'Phone': 'common.phone',
    'Address': 'common.address',
    'Price': 'common.price',
    'Quantity': 'common.quantity',
    'Total': 'common.total',
    'Status': 'common.status',
    'Date': 'common.date',
    
    // Messages
    'Loading...': 'common.loading',
    'No data available': 'common.no_data',
    'Success!': 'common.success',
    'Error!': 'common.error',
};

/**
 * Hook to get translation mappings for common text
 */
export function useTextMigration() {
    const { t, auto } = useTranslation();
    
    return {
        // Get translated text by key or auto-translate
        getText: (text: string): string => {
            const key = commonTextPatterns[text as keyof typeof commonTextPatterns];
            return key ? t(key, text) : auto(text);
        },
        
        // Get translation key for text
        getKey: (text: string): string | null => {
            return commonTextPatterns[text as keyof typeof commonTextPatterns] || null;
        },
        
        // Check if text should be translated
        shouldTranslate: (text: string): boolean => {
            return text in commonTextPatterns;
        }
    };
}

/**
 * Migration helper for page titles
 */
export function migratePageTitle(title: string): { titleKey?: string; title?: string } {
    const key = commonTextPatterns[title as keyof typeof commonTextPatterns];
    return key ? { titleKey: key } : { title };
}

/**
 * Migration helper for button text
 */
export function migrateButtonText(text: string) {
    const { getText } = useTextMigration();
    return getText(text);
}

/**
 * Migration helper for table columns
 */
export function migrateTableColumns(columns: Array<{ header: string; [key: string]: any }>) {
    return columns.map(column => {
        const key = commonTextPatterns[column.header as keyof typeof commonTextPatterns];
        return {
            ...column,
            labelKey: key || undefined,
            header: key ? undefined : column.header
        };
    });
}

/**
 * Migration helper for form fields
 */
export function migrateFormFields(fields: Array<{ label: string; [key: string]: any }>) {
    return fields.map(field => {
        const key = commonTextPatterns[field.label as keyof typeof commonTextPatterns];
        return {
            ...field,
            labelKey: key || undefined,
            label: key ? undefined : field.label
        };
    });
}

/**
 * Migration helper for navigation items
 */
export function migrateNavigationItems(items: Array<{ label: string; [key: string]: any }>) {
    return items.map(item => {
        const key = commonTextPatterns[item.label as keyof typeof commonTextPatterns];
        return {
            ...item,
            labelKey: key || undefined,
            label: key ? undefined : item.label
        };
    });
}

/**
 * Batch migration utility for common page elements
 */
export function migratePage(pageConfig: {
    title?: string;
    buttons?: Array<{ text: string; [key: string]: any }>;
    columns?: Array<{ header: string; [key: string]: any }>;
    fields?: Array<{ label: string; [key: string]: any }>;
    navigation?: Array<{ label: string; [key: string]: any }>;
}) {
    return {
        title: pageConfig.title ? migratePageTitle(pageConfig.title) : undefined,
        buttons: pageConfig.buttons ? pageConfig.buttons.map(btn => ({
            ...btn,
            textKey: commonTextPatterns[btn.text as keyof typeof commonTextPatterns] || undefined,
            text: commonTextPatterns[btn.text as keyof typeof commonTextPatterns] ? undefined : btn.text
        })) : undefined,
        columns: pageConfig.columns ? migrateTableColumns(pageConfig.columns) : undefined,
        fields: pageConfig.fields ? migrateFormFields(pageConfig.fields) : undefined,
        navigation: pageConfig.navigation ? migrateNavigationItems(pageConfig.navigation) : undefined
    };
}

/**
 * Generate migration report for a page
 */
export function generateMigrationReport(pageElements: string[]): {
    translatable: string[];
    nonTranslatable: string[];
    suggestions: Array<{ text: string; key: string }>;
} {
    const translatable: string[] = [];
    const nonTranslatable: string[] = [];
    const suggestions: Array<{ text: string; key: string }> = [];
    
    pageElements.forEach(text => {
        const key = commonTextPatterns[text as keyof typeof commonTextPatterns];
        if (key) {
            translatable.push(text);
            suggestions.push({ text, key });
        } else {
            nonTranslatable.push(text);
        }
    });
    
    return { translatable, nonTranslatable, suggestions };
}