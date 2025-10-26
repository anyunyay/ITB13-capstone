import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Calendar, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalSearchBarProps, FilterState } from '@/types/global-search';
import styles from './global-search-bar.module.css';

export const GlobalSearchBar = ({
    searchTerm,
    setSearchTerm,
    showSearch,
    setShowSearch,
    config,
    onFiltersChange,
    onClearSearch,
    resultsCount,
    totalCount,
    className,
    headerConfig
}: GlobalSearchBarProps) => {
    const [filters, setFilters] = useState<FilterState>(() => {
        const initialFilters: FilterState = {};
        config.filters.forEach(filter => {
            if (filter.defaultValue !== undefined) {
                initialFilters[filter.key] = filter.defaultValue;
            }
        });
        return initialFilters;
    });

    const [showFilters, setShowFilters] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

    // Check if there are active filters
    useEffect(() => {
        const hasFilters = Object.values(filters).some(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'boolean') {
                return value !== false;
            }
            return value !== '' && value !== 'all' && value !== null && value !== undefined;
        });
        setHasActiveFilters(hasFilters);
    }, [filters]);

    // Notify parent of filter changes
    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange(filters);
        }
    }, [filters, onFiltersChange]);

    const handleSearchToggle = useCallback(() => {
        if (showSearch) {
            setSearchTerm('');
            setFilters({});
        }
        setShowSearch(!showSearch);
    }, [showSearch, setSearchTerm]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setFilters({});
        if (onClearSearch) {
            onClearSearch();
        }
    }, [setSearchTerm, onClearSearch]);

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        const clearedFilters: FilterState = {};
        config.filters.forEach(filter => {
            if (filter.defaultValue !== undefined) {
                clearedFilters[filter.key] = filter.defaultValue;
            }
        });
        setFilters(clearedFilters);
    }, [config.filters]);

    const renderFilter = (filterConfig: any) => {
        const { key, label, type, options = [], placeholder, multiple = false } = filterConfig;
        const value = filters[key];

        switch (type) {
            case 'select':
                return (
                    <div key={key} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">{label}</label>
                        <Select
                            value={value || 'all'}
                            onValueChange={(newValue) => handleFilterChange(key, newValue)}
                        >
                            <SelectTrigger className="min-w-[150px] bg-background border-border rounded-lg py-2 text-sm">
                                <SelectValue placeholder={placeholder || `Select ${label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All {label}</SelectItem>
                                {options.map((option: any) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'multiselect':
                return (
                    <div key={key} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">{label}</label>
                        <Select
                            value={Array.isArray(value) ? value[0] : 'all'}
                            onValueChange={(newValue) => {
                                if (newValue === 'all') {
                                    handleFilterChange(key, []);
                                } else {
                                    const currentValues = Array.isArray(value) ? value : [];
                                    if (currentValues.includes(newValue)) {
                                        handleFilterChange(key, currentValues.filter(v => v !== newValue));
                                    } else {
                                        handleFilterChange(key, [...currentValues, newValue]);
                                    }
                                }
                            }}
                        >
                            <SelectTrigger className="min-w-[150px] bg-background border-border rounded-lg py-2 text-sm">
                                <SelectValue placeholder={placeholder || `Select ${label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All {label}</SelectItem>
                                {options.map((option: any) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {Array.isArray(value) && value.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {value.map((val: string) => {
                                    const option = options.find((opt: any) => opt.value === val);
                                    return (
                                        <Badge key={val} variant="secondary" className="text-xs">
                                            {option?.label || val}
                                            <button
                                                onClick={() => handleFilterChange(key, value.filter((v: string) => v !== val))}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'toggle':
                return (
                    <div key={key} className="flex items-center gap-3">
                        <label className="text-sm font-medium text-foreground">{label}</label>
                        <Button
                            variant={value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange(key, !value)}
                            className="flex items-center gap-2"
                        >
                            {value ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            {value ? 'On' : 'Off'}
                        </Button>
                    </div>
                );

            case 'date':
                return (
                    <div key={key} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">{label}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={value || ''}
                                onChange={(e) => handleFilterChange(key, e.target.value)}
                                className="pl-10 bg-background border-border rounded-lg py-2 text-sm"
                                placeholder={placeholder}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cn("bg-card rounded-xl shadow-sm", className)}>
            {/* Header Section with Toggle Button */}
            {headerConfig && (
                <div className="flex flex-col gap-3 p-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center">
                            {headerConfig.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{headerConfig.title}</h2>
                            <p className="text-sm text-muted-foreground m-0">{headerConfig.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {headerConfig.showToggleButton !== false && (
                            <Button
                                variant={showSearch ? "default" : "outline"}
                                onClick={handleSearchToggle}
                                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                {showSearch ? 'Hide Search' : 'Search'}
                            </Button>
                        )}
                        {headerConfig.additionalButtons}
                    </div>
                </div>
            )}

            {/* Search Container */}
            <div className={cn(
                styles.searchContainer,
                showSearch ? styles.expanded : styles.collapsed
            )}>
                {/* Search Input Section */}
                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder={config.placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    {config.filters.length > 0 && (
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {Object.values(filters).filter(v => 
                                        Array.isArray(v) ? v.length > 0 : v !== '' && v !== 'all' && v !== false
                                    ).length}
                                </Badge>
                            )}
                        </Button>
                    )}
                </div>

                {/* Filters Section */}
                {showFilters && config.filters.length > 0 && (
                    <div className="border-t border-border pt-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {config.filters.map(renderFilter)}
                        </div>
                        {hasActiveFilters && (
                            <div className="flex justify-end mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Summary */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        {resultsCount !== undefined && totalCount !== undefined 
                            ? `Showing ${resultsCount} of ${totalCount} records`
                            : searchTerm 
                                ? `Searching for "${searchTerm}"`
                                : 'Ready to search'
                        }
                    </span>
                    {(searchTerm || hasActiveFilters) && config.clearable !== false && (
                        <button
                            onClick={handleClearSearch}
                            className="text-sm text-primary no-underline transition-colors duration-200 hover:text-primary/80"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
