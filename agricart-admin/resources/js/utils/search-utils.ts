import { FilterState } from '@/types/global-search';

export interface SearchableItem {
    [key: string]: any;
}

export interface SearchOptions {
    searchTerm: string;
    filters: FilterState;
    searchFields: string[];
    caseSensitive?: boolean;
}

/**
 * Filters an array of items based on search term and filters
 */
export const filterItems = <T extends SearchableItem>(
    items: T[],
    options: SearchOptions
): T[] => {
    const { searchTerm, filters, searchFields, caseSensitive = false } = options;
    
    return items.filter(item => {
        // Apply search term filter
        if (searchTerm.trim()) {
            const matchesSearch = searchFields.some(field => {
                const value = getNestedValue(item, field);
                if (value === null || value === undefined) return false;
                
                const searchValue = caseSensitive ? value.toString() : value.toString().toLowerCase();
                const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
                
                return searchValue.includes(term);
            });
            
            if (!matchesSearch) return false;
        }
        
        // Apply filters
        for (const [key, filterValue] of Object.entries(filters)) {
            if (filterValue === null || filterValue === undefined) continue;
            
            // Handle different filter types
            if (Array.isArray(filterValue)) {
                // Multiselect filter
                if (filterValue.length === 0) continue;
                
                const itemValue = getNestedValue(item, key);
                if (!filterValue.includes(itemValue)) return false;
            } else if (typeof filterValue === 'boolean') {
                // Toggle filter
                const itemValue = getNestedValue(item, key);
                if (Boolean(itemValue) !== filterValue) return false;
            } else if (filterValue !== 'all' && filterValue !== '') {
                // Select filter
                const itemValue = getNestedValue(item, key);
                if (itemValue !== filterValue) return false;
            }
        }
        
        return true;
    });
};

/**
 * Gets a nested value from an object using dot notation
 */
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
};

/**
 * Sorts items based on a field and direction
 */
export const sortItems = <T extends SearchableItem>(
    items: T[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
    return [...items].sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            const comparison = aValue - bValue;
            return sortOrder === 'asc' ? comparison : -comparison;
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
            const comparison = aValue.getTime() - bValue.getTime();
            return sortOrder === 'asc' ? comparison : -comparison;
        }
        
        // Convert to string for comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        const comparison = aStr.localeCompare(bStr);
        return sortOrder === 'asc' ? comparison : -comparison;
    });
};

/**
 * Paginates an array of items
 */
export const paginateItems = <T>(
    items: T[],
    page: number,
    itemsPerPage: number
): { items: T[]; totalPages: number; totalItems: number } => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
        items: items.slice(startIndex, endIndex),
        totalPages,
        totalItems
    };
};

/**
 * Combines filtering, sorting, and pagination
 */
export const processItems = <T extends SearchableItem>(
    items: T[],
    searchOptions: SearchOptions,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    page?: number,
    itemsPerPage?: number
): {
    filteredItems: T[];
    paginatedItems: T[];
    totalPages: number;
    totalItems: number;
} => {
    // Filter items
    const filteredItems = filterItems(items, searchOptions);
    
    // Sort items if sort options provided
    const sortedItems = sortBy && sortOrder 
        ? sortItems(filteredItems, sortBy, sortOrder)
        : filteredItems;
    
    // Paginate items if pagination options provided
    if (page !== undefined && itemsPerPage !== undefined) {
        const { items: paginatedItems, totalPages, totalItems } = paginateItems(
            sortedItems,
            page,
            itemsPerPage
        );
        
        return {
            filteredItems: sortedItems,
            paginatedItems,
            totalPages,
            totalItems
        };
    }
    
    return {
        filteredItems: sortedItems,
        paginatedItems: sortedItems,
        totalPages: 1,
        totalItems: sortedItems.length
    };
};

/**
 * Highlights search terms in text
 */
export const highlightSearchTerm = (
    text: string,
    searchTerm: string,
    caseSensitive: boolean = false
): string => {
    if (!searchTerm.trim()) return text;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, flags);
    
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
};

/**
 * Generates search suggestions based on search term and items
 */
export const generateSearchSuggestions = <T extends SearchableItem>(
    items: T[],
    searchTerm: string,
    searchFields: string[],
    maxSuggestions: number = 5
): string[] => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    const term = searchTerm.toLowerCase();
    
    for (const item of items) {
        for (const field of searchFields) {
            const value = getNestedValue(item, field);
            if (value && typeof value === 'string') {
                const words = value.toLowerCase().split(/\s+/);
                for (const word of words) {
                    if (word.startsWith(term) && word !== term) {
                        suggestions.add(word);
                        if (suggestions.size >= maxSuggestions) {
                            return Array.from(suggestions);
                        }
                    }
                }
            }
        }
    }
    
    return Array.from(suggestions);
};
