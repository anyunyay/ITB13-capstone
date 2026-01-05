import { useState, useCallback, useMemo } from 'react';
import { SearchConfig, FilterState } from '@/types/global-search';

interface UseGlobalSearchOptions {
    config: SearchConfig;
    onSearch?: (searchTerm: string, filters: FilterState) => void;
    onFiltersChange?: (filters: FilterState) => void;
    debounceMs?: number;
}

export const useGlobalSearch = ({
    config,
    onSearch,
    onFiltersChange,
    debounceMs = 300
}: UseGlobalSearchOptions) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [filters, setFilters] = useState<FilterState>(() => {
        const initialFilters: FilterState = {};
        config.filters.forEach(filter => {
            if (filter.defaultValue !== undefined) {
                initialFilters[filter.key] = filter.defaultValue;
            }
        });
        return initialFilters;
    });

    // Debounced search effect
    const debouncedSearch = useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (term: string, currentFilters: FilterState) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (onSearch) {
                    onSearch(term, currentFilters);
                }
            }, debounceMs);
        };
    }, [onSearch, debounceMs]);

    // Handle search term changes
    const handleSearchTermChange = useCallback((term: string) => {
        setSearchTerm(term);
        debouncedSearch(term, filters);
    }, [debouncedSearch, filters]);

    // Handle filter changes
    const handleFiltersChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
        debouncedSearch(searchTerm, newFilters);
    }, [searchTerm, onFiltersChange, debouncedSearch]);

    // Clear all search and filters
    const clearSearch = useCallback(() => {
        setSearchTerm('');
        const clearedFilters: FilterState = {};
        config.filters.forEach(filter => {
            if (filter.defaultValue !== undefined) {
                clearedFilters[filter.key] = filter.defaultValue;
            }
        });
        setFilters(clearedFilters);
        
        if (onSearch) {
            onSearch('', clearedFilters);
        }
        if (onFiltersChange) {
            onFiltersChange(clearedFilters);
        }
    }, [config.filters, onSearch, onFiltersChange]);

    // Toggle search visibility
    const toggleSearch = useCallback(() => {
        if (showSearch) {
            clearSearch();
        }
        setShowSearch(!showSearch);
    }, [showSearch, clearSearch]);

    // Check if there are active filters
    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'boolean') {
                return value !== false;
            }
            return value !== '' && value !== 'all' && value !== null && value !== undefined;
        });
    }, [filters]);

    // Check if search is active
    const isSearchActive = useMemo(() => {
        return searchTerm.trim().length > 0 || hasActiveFilters;
    }, [searchTerm, hasActiveFilters]);

    return {
        searchTerm,
        setSearchTerm: handleSearchTermChange,
        showSearch,
        setShowSearch: toggleSearch,
        filters,
        setFilters: handleFiltersChange,
        clearSearch,
        hasActiveFilters,
        isSearchActive
    };
};
