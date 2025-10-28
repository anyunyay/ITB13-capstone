import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';

export interface TableState {
    currentPage: number;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    search: string;
    filters: Record<string, any>;
    perPage: number;
}

export interface TableStateOptions {
    defaultSort?: {
        column: string;
        direction: 'asc' | 'desc';
    };
    maxPerPage?: number;
    persistInUrl?: boolean;
    routeName?: string;
}

export function useTableState(
    initialState: Partial<TableState> = {},
    options: TableStateOptions = {}
) {
    const {
        defaultSort,
        maxPerPage = 10,
        persistInUrl = true,
        routeName
    } = options;

    // Debounce timer refs
    const searchDebounceRef = useRef<NodeJS.Timeout>();
    const filterDebounceRef = useRef<NodeJS.Timeout>();

    // Initialize state from URL parameters or defaults
    const getInitialState = (): TableState => {
        if (typeof window === 'undefined') {
            return {
                currentPage: 1,
                sortBy: defaultSort?.column || null,
                sortOrder: defaultSort?.direction || null,
                search: '',
                filters: {},
                perPage: Math.min(initialState.perPage || 10, maxPerPage),
                ...initialState
            };
        }

        const urlParams = new URLSearchParams(window.location.search);
        return {
            currentPage: parseInt(urlParams.get('page') || '1', 10),
            sortBy: urlParams.get('sort_by') || defaultSort?.column || null,
            sortOrder: (urlParams.get('sort_order') as 'asc' | 'desc') || defaultSort?.direction || null,
            search: urlParams.get('search') || '',
            filters: {},
            perPage: Math.min(parseInt(urlParams.get('per_page') || '10', 10), maxPerPage),
            ...initialState
        };
    };

    const [state, setState] = useState<TableState>(getInitialState);
    const [loading, setLoading] = useState(false);

    // Update URL parameters when state changes
    const updateUrl = useCallback((newState: TableState) => {
        if (!persistInUrl || typeof window === 'undefined') return;

        const params = new URLSearchParams();
        
        if (newState.currentPage > 1) {
            params.set('page', newState.currentPage.toString());
        }
        
        if (newState.sortBy) {
            params.set('sort_by', newState.sortBy);
        }
        
        if (newState.sortOrder) {
            params.set('sort_order', newState.sortOrder);
        }
        
        if (newState.search) {
            params.set('search', newState.search);
        }
        
        if (newState.perPage !== 10) {
            params.set('per_page', newState.perPage.toString());
        }

        // Add filter parameters
        Object.entries(newState.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, value.toString());
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        
        // Use Inertia router for navigation if routeName is provided
        if (routeName) {
            router.get(newUrl, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        } else {
            window.history.replaceState({}, '', newUrl);
        }
    }, [persistInUrl, routeName]);

    // Handle sort changes with automatic page reset
    const handleSort = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
        const newState = {
            ...state,
            sortBy: column,
            sortOrder: direction,
            currentPage: 1 // Reset to page 1 when sorting changes
        };
        
        setState(newState);
        setLoading(true);
        
        if (persistInUrl) {
            updateUrl(newState);
        }
    }, [state, persistInUrl, updateUrl]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        const newState = {
            ...state,
            currentPage: page
        };
        
        setState(newState);
        setLoading(true);
        
        if (persistInUrl) {
            updateUrl(newState);
        }
    }, [state, persistInUrl, updateUrl]);

    // Handle search changes with page reset and debouncing
    const handleSearch = useCallback((searchTerm: string) => {
        // Clear existing debounce timer
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        // Update state immediately for UI responsiveness
        const newState = {
            ...state,
            search: searchTerm,
            currentPage: 1 // Reset to page 1 when search changes
        };
        setState(newState);

        // Debounce the actual API call/URL update
        searchDebounceRef.current = setTimeout(() => {
            setLoading(true);
            if (persistInUrl) {
                updateUrl(newState);
            }
        }, 300); // 300ms debounce delay
    }, [state, persistInUrl, updateUrl]);

    // Handle filter changes with page reset and debouncing
    const handleFilterChange = useCallback((filterKey: string, filterValue: any) => {
        // Clear existing debounce timer
        if (filterDebounceRef.current) {
            clearTimeout(filterDebounceRef.current);
        }

        // Update state immediately for UI responsiveness
        const newState = {
            ...state,
            filters: {
                ...state.filters,
                [filterKey]: filterValue
            },
            currentPage: 1 // Reset to page 1 when filters change
        };
        setState(newState);

        // Debounce the actual API call/URL update
        filterDebounceRef.current = setTimeout(() => {
            setLoading(true);
            if (persistInUrl) {
                updateUrl(newState);
            }
        }, 150); // 150ms debounce delay for filters (shorter than search)
    }, [state, persistInUrl, updateUrl]);

    // Handle per page changes with page reset
    const handlePerPageChange = useCallback((perPage: number) => {
        const effectivePerPage = Math.min(perPage, maxPerPage);
        const newState = {
            ...state,
            perPage: effectivePerPage,
            currentPage: 1 // Reset to page 1 when per page changes
        };
        
        setState(newState);
        setLoading(true);
        
        if (persistInUrl) {
            updateUrl(newState);
        }
    }, [state, maxPerPage, persistInUrl, updateUrl]);

    // Reset all state to defaults
    const resetState = useCallback(() => {
        const defaultState = {
            currentPage: 1,
            sortBy: defaultSort?.column || null,
            sortOrder: defaultSort?.direction || null,
            search: '',
            filters: {},
            perPage: Math.min(10, maxPerPage)
        };
        
        setState(defaultState);
        setLoading(true);
        
        if (persistInUrl) {
            updateUrl(defaultState);
        }
    }, [defaultSort, maxPerPage, persistInUrl, updateUrl]);

    // Set loading to false after state updates
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, [state]);

    // Cleanup debounce timers on unmount
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            if (filterDebounceRef.current) {
                clearTimeout(filterDebounceRef.current);
            }
        };
    }, []);

    // Generate query parameters for API requests
    const getQueryParams = useCallback(() => {
        const params: Record<string, any> = {
            page: state.currentPage,
            per_page: state.perPage
        };

        if (state.sortBy) {
            params.sort_by = state.sortBy;
        }

        if (state.sortOrder) {
            params.sort_order = state.sortOrder;
        }

        if (state.search) {
            params.search = state.search;
        }

        // Add filter parameters
        Object.entries(state.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params[key] = value;
            }
        });

        return params;
    }, [state]);

    return {
        // State
        state,
        loading,
        
        // Actions
        handleSort,
        handlePageChange,
        handleSearch,
        handleFilterChange,
        handlePerPageChange,
        resetState,
        
        // Utilities
        getQueryParams,
        
        // Computed values
        hasActiveSort: state.sortBy !== null,
        hasActiveFilters: Object.keys(state.filters).some(key => 
            state.filters[key] !== null && 
            state.filters[key] !== undefined && 
            state.filters[key] !== ''
        ),
        hasActiveSearch: state.search !== '',
    };
}