import * as React from "react";
import { cn } from "@/lib/utils";
import { TableHead } from "./table";
import { SortIcon } from "./sort-icon";

export interface ColumnDefinition {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
}

interface SortableTableHeadProps extends React.ComponentProps<typeof TableHead> {
    column: ColumnDefinition;
    currentSort?: {
        column: string;
        direction: 'asc' | 'desc' | null;
    };
    onSort: (column: string) => void;
}

export function SortableTableHead({ 
    column, 
    currentSort, 
    onSort, 
    className, 
    children,
    ...props 
}: SortableTableHeadProps) {
    const isActive = currentSort?.column === column.key;
    const direction = isActive ? currentSort?.direction : null;
    
    const handleClick = () => {
        if (column.sortable !== false) {
            onSort(column.key);
        }
    };

    const getSortIcon = () => {
        if (column.sortable === false) return null;
        
        return (
            <SortIcon 
                direction={direction} 
                className="ml-2" 
                size="md"
            />
        );
    };

    if (column.sortable === false) {
        return (
            <TableHead className={cn(column.className, className)} {...props}>
                {children || column.label}
            </TableHead>
        );
    }

    return (
        <TableHead 
            className={cn(
                "sortable-header group cursor-pointer select-none transition-all duration-200 ease-in-out",
                "hover:bg-muted/50 active:bg-muted/70",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/30",
                isActive && "bg-muted/30 text-primary",
                column.className,
                className
            )}
            onClick={handleClick}
            tabIndex={0}
            role="button"
            aria-label={`Sort by ${column.label}`}
            aria-sort={
                direction === 'asc' ? 'ascending' : 
                direction === 'desc' ? 'descending' : 
                'none'
            }
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            {...props}
        >
            <div className="flex items-center justify-between transition-all duration-200 gap-2">
                <span className={cn(
                    "sortable-header-text transition-colors duration-200",
                    isActive && "font-medium"
                )}>
                    {children || column.label}
                </span>
                <div className="sort-icon flex-shrink-0">
                    {getSortIcon()}
                </div>
            </div>
        </TableHead>
    );
}