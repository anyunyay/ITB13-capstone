import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow } from "./table";
import { SortableTableHead, ColumnDefinition } from "./sortable-table-head";
import { PaginationControls } from "../inventory/pagination-controls";
import { useTableState, TableStateOptions } from "@/hooks/use-table-state";
import { Button } from "./button";
import { Search, X, Filter } from "lucide-react";
import { Input } from "./input";

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    sort_metadata?: {
        current_sort_column?: string;
        current_sort_direction?: 'asc' | 'desc';
        is_sorted?: boolean;
        sort_state_persisted?: boolean;
    };
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

interface UnifiedTableProps extends React.ComponentProps<typeof Table> {
    data: any[];
    columns: ColumnDefinition[];
    pagination?: PaginationData;
    onDataChange?: (queryParams: Record<string, any>) => void;
    renderRow: (item: any, index: number) => React.ReactNode;
    emptyMessage?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    filterComponent?: React.ReactNode;
    tableStateOptions?: TableStateOptions;
    loading?: boolean;
}

export function UnifiedTable({
    data,
    columns,
    pagination,
    onDataChange,
    renderRow,
    emptyMessage = "No data available",
    searchPlaceholder = "Search...",
    showSearch = true,
    showFilters = false,
    filterComponent,
    tableStateOptions = {},
    loading = false,
    className,
    children,
    ...props
}: UnifiedTableProps) {
    const {
        state,
        loading: stateLoading,
        handleSort,
        handlePageChange,
        handleSearch,
        handleFilterChange,
        resetState,
        getQueryParams,
        hasActiveSort,
        hasActiveFilters,
        hasActiveSearch
    } = useTableState({
        currentPage: pagination?.current_page || 1,
        sortBy: pagination?.sort_by || null,
        sortOrder: pagination?.sort_order || null,
        perPage: pagination?.per_page || 10
    }, {
        maxPerPage: 10, // Enforce 10 rows per page limit
        ...tableStateOptions
    });

    const isLoading = loading || stateLoading;

    // Notify parent component when query parameters change
    React.useEffect(() => {
        if (onDataChange) {
            onDataChange(getQueryParams());
        }
    }, [getQueryParams, onDataChange]);

    const handleSortClick = (column: string) => {
        let newDirection: 'asc' | 'desc' | null = 'asc';
        
        if (state.sortBy === column) {
            if (state.sortOrder === 'asc') {
                newDirection = 'desc';
            } else if (state.sortOrder === 'desc') {
                newDirection = null;
            }
        }
        
        handleSort(column, newDirection);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const searchTerm = formData.get('search') as string;
        handleSearch(searchTerm);
    };

    const clearSearch = () => {
        handleSearch('');
    };

    const clearAllFilters = () => {
        resetState();
    };

    const hasActiveState = hasActiveSort || hasActiveFilters || hasActiveSearch;

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            {(showSearch || showFilters) && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {showSearch && (
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                name="search"
                                placeholder={searchPlaceholder}
                                defaultValue={state.search}
                                className="pl-10 pr-10 text-sm sm:text-base min-h-[44px]"
                            />
                            {hasActiveSearch && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </form>
                    )}

                    <div className="flex items-center gap-2">
                        {showFilters && filterComponent}
                        
                        {hasActiveState && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="flex items-center gap-2"
                            >
                                <X className="h-3 w-3" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 bg-card rounded-lg shadow-lg border">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-primary/20"></div>
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-primary border-t-transparent absolute inset-0"></div>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Loading data...</span>
                        </div>
                    </div>
                )}
                
                <div className="table-container overflow-x-auto rounded-lg border border-border">
                    <Table className={cn("w-full min-w-full", isLoading && "opacity-50", className)} {...props}>
                        <TableHeader className="sortable-table-header">
                            <TableRow>
                                {columns.map((column) => (
                                    <SortableTableHead
                                        key={column.key}
                                        column={column}
                                        currentSort={{
                                            column: state.sortBy || '',
                                            direction: state.sortOrder
                                        }}
                                        onSort={column.sortable !== false ? handleSortClick : () => {}}
                                    />
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <td 
                                        colSpan={columns.length} 
                                        className="text-center py-8 sm:py-12 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center space-y-2 px-4">
                                            <div className="text-2xl sm:text-4xl opacity-20">📊</div>
                                            <span className="font-medium text-sm sm:text-base">{emptyMessage}</span>
                                            {hasActiveState && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearAllFilters}
                                                    className="mt-2 text-xs sm:text-sm"
                                                >
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </TableRow>
                            ) : (
                                data.map((item, index) => renderRow(item, index))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <PaginationControls
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={handlePageChange}
                    itemsPerPage={pagination.per_page}
                    totalItems={pagination.total}
                    sortBy={state.sortBy || undefined}
                    sortOrder={state.sortOrder || undefined}
                    maxItemsPerPage={10}
                />
            )}
            
            {children}
        </div>
    );
}

// Export the column definition type for convenience
export type { ColumnDefinition } from "./sortable-table-head";