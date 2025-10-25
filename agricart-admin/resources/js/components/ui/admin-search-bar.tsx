import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import styles from './admin-search-bar.module.css';

interface AdminSearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    placeholder?: string;
    resultsCount?: number;
    totalCount?: number;
    onClearSearch?: () => void;
}

export const AdminSearchBar = ({
    searchTerm,
    setSearchTerm,
    showSearch,
    setShowSearch,
    placeholder = "Search...",
    resultsCount,
    totalCount,
    onClearSearch
}: AdminSearchBarProps) => {
    // Handle search toggle
    const handleSearchToggle = () => {
        if (showSearch) {
            // Clear search when hiding
            setSearchTerm('');
        }
        setShowSearch(!showSearch);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        if (onClearSearch) {
            onClearSearch();
        }
    };

    return (
        <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${
            showSearch ? styles.expanded : styles.collapsed
        }`}>
            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    />
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">
                    {resultsCount !== undefined && totalCount !== undefined 
                        ? `Showing ${resultsCount} of ${totalCount} records`
                        : searchTerm 
                            ? `Searching for "${searchTerm}"`
                            : 'Ready to search'
                    }
                </span>
                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-primary no-underline transition-colors duration-200 hover:text-primary/80"
                    >
                        Clear search
                    </button>
                )}
            </div>
        </div>
    );
};
