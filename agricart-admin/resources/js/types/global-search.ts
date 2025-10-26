export interface FilterOption {
    value: string;
    label: string;
    icon?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'toggle';
    options?: FilterOption[];
    placeholder?: string;
    defaultValue?: string | string[] | boolean;
    multiple?: boolean;
}

export interface SearchConfig {
    placeholder: string;
    searchFields: string[];
    filters: FilterConfig[];
    resultsCount?: boolean;
    clearable?: boolean;
}

export interface GlobalSearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    config: SearchConfig;
    onFiltersChange?: (filters: Record<string, any>) => void;
    onClearSearch?: () => void;
    resultsCount?: number;
    totalCount?: number;
    className?: string;
    // Header configuration for toggleable search
    headerConfig?: {
        title: string;
        description: string;
        icon: React.ReactNode;
        showToggleButton?: boolean;
        additionalButtons?: React.ReactNode;
    };
}

export interface FilterState {
    [key: string]: any;
}
