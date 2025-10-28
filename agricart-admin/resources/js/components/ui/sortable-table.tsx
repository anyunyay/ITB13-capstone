import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow } from "./table";
import { SortableTableHead, ColumnDefinition } from "./sortable-table-head";
import { useSort, SortState } from "@/hooks/use-sort";
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

interface SortableTableProps extends React.ComponentProps<typeof Table> {
    data: any[];
    columns: ColumnDefinition[];
    sortable?: boolean;
    pagination?: PaginationData;
    onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
    onPageChange?: (page: number) => void;
    loading?: boolean;
    initialSort?: SortState;
    renderRow: (item: any, index: number) => React.ReactNode;
    emptyMessage?: string;
}

export function SortableTable({
    data,
    columns,
    sortable = true,
    pagination,
    onSort,
    onPageChange,
    loading = false,
    initialSort,
    renderRow,
    emptyMessage = "No data available",
    className,
    children,
    ...props
}: SortableTableProps) {
    const { sortState, handleSort, getSortDirection } = useSort(initialSort);

    const handleSortClick = (column: string) => {
        handleSort(column);
        const newDirection = getSortDirection(column);
        onSort?.(column, newDirection);
    };

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg shadow-lg border">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20"></div>
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent absolute inset-0"></div>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">Sorting data...</span>
                    </div>
                </div>
            )}
            
            <div className="table-container overflow-x-auto">
                <Table className={cn("w-full min-w-full", loading && "sort-loading", className)} {...props}>
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
    );
}

// Export the column definition type for convenience
export type { ColumnDefinition } from "./sortable-table-head";