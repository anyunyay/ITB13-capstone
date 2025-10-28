import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow } from "./table";
import { SortableTableHead, ColumnDefinition } from "./sortable-table-head";
import { SortableTableErrorBoundary } from "./sortable-table-error-boundary";
import { useSortWithErrorHandling, SortOptions } from "@/hooks/use-sort-with-error-handling";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import "./sortable-table.css";

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Enhanced sort metadata for better state management
    sort_metadata?: {
        current_sort_column?: string;
        current_sort_direction?: 'asc' | 'desc';
        is_sorted?: boolean;
        sort_state_persisted?: boolean;
    };
    // Links with sort parameters preserved
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

interface EnhancedSortableTableProps extends React.ComponentProps<typeof Table> {
    data: any[];
    columns: ColumnDefinition[];
    sortable?: boolean;
    pagination?: PaginationData;
    onSort: (column: string, direction: 'asc' | 'desc' | null) => Promise<void>;
    onPageChange?: (page: number) => void;
    renderRow: (item: any, index: number) => React.ReactNode;
    emptyMessage?: string;
    sortOptions?: SortOptions;
    showNetworkStatus?: boolean;
}

export function EnhancedSortableTable({
    data,
    columns,
    sortable = true,
    pagination,
    onSort,
    onPageChange,
    renderRow,
    emptyMessage = "No data available",
    sortOptions = {},
    showNetworkStatus = true,
    className,
    children,
    ...props
}: EnhancedSortableTableProps) {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    
    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const {
        sortState,
        loading,
        error,
        handleSort,
        retry,
        clearError
    } = useSortWithErrorHandling(onSort, {
        maxRetries: 3,
        retryDelay: 1000,
        debounceMs: 300,
        ...sortOptions
    });

    const handleSortClick = React.useCallback(async (column: string) => {
        if (!isOnline) {
            return;
        }
        
        clearError();
        await handleSort(column);
    }, [handleSort, clearError, isOnline]);

    const renderErrorState = () => {
        if (!error) return null;

        return (
            <div className="p-4 space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Sort Error</AlertTitle>
                    <AlertDescription>
                        {error.message}
                        {!isOnline && (
                            <span className="block mt-2 text-sm">
                                You appear to be offline. Please check your connection.
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
                
                {error.retryable && (
                    <div className="flex gap-2">
                        <Button 
                            onClick={retry}
                            variant="outline"
                            size="sm"
                            disabled={loading || !isOnline}
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            {loading ? 'Retrying...' : 'Retry'}
                        </Button>
                        
                        <Button 
                            onClick={clearError}
                            variant="ghost"
                            size="sm"
                        >
                            Dismiss
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderNetworkStatus = () => {
        if (!showNetworkStatus || isOnline) return null;

        return (
            <div className="p-2 bg-destructive/10 border-l-4 border-destructive">
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <WifiOff className="h-4 w-4" />
                    <span>You're offline. Sort functionality is disabled.</span>
                </div>
            </div>
        );
    };

    const renderLoadingOverlay = () => {
        if (!loading) return null;

        return (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg shadow-lg border">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20"></div>
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent absolute inset-0"></div>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                        Sorting data...
                    </span>
                    <div className="text-xs text-muted-foreground/70">
                        This may take a moment
                    </div>
                </div>
            </div>
        );
    };

    return (
        <SortableTableErrorBoundary>
            <div className="relative space-y-2">
                {renderNetworkStatus()}
                {renderErrorState()}
                
                <div className="relative">
                    {renderLoadingOverlay()}
                    
                    <div className="table-container overflow-x-auto">
                        <Table className={cn(
                            "w-full min-w-full", 
                            loading && "sort-loading",
                            !isOnline && "opacity-60 pointer-events-none",
                            className
                        )} {...props}>
                            <TableHeader className="sortable-table-header">
                                <TableRow>
                                    {columns.map((column) => (
                                        <SortableTableHead
                                            key={column.key}
                                            column={column}
                                            currentSort={{
                                                column: sortState.column || '',
                                                direction: sortState.direction
                                            }}
                                            onSort={sortable ? handleSortClick : () => {}}
                                        />
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <td 
                                            colSpan={columns.length} 
                                            className="text-center py-12 text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="text-4xl opacity-20">📊</div>
                                                <span className="font-medium">{emptyMessage}</span>
                                                {!isOnline && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                                                        <WifiOff className="h-4 w-4" />
                                                        <span>Offline mode</span>
                                                    </div>
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
                    
                    {children}
                </div>
            </div>
        </SortableTableErrorBoundary>
    );
}