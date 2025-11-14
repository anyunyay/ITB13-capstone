import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

// Base column definition
export interface BaseTableColumn<T = any> {
    key: string;
    label: string;
    icon?: LucideIcon;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    render?: (item: T, index: number) => ReactNode;
    align?: 'left' | 'center' | 'right';
    maxWidth?: string;
    hideOnMobile?: boolean;
}

// Base table props
export interface BaseTableProps<T = any> {
    data: T[];
    columns: BaseTableColumn<T>[];
    keyExtractor: (item: T) => string | number;
    
    // Sorting
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (field: string) => void;
    
    // Row styling
    getRowClassName?: (item: T, index: number) => string;
    onRowClick?: (item: T, index: number) => void;
    
    // Empty state
    emptyState?: ReactNode;
    
    // Mobile card renderer
    renderMobileCard?: (item: T, index: number) => ReactNode;
    
    // Table styling
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    
    // Responsive behavior
    hideMobileCards?: boolean;
}

export function BaseTable<T = any>({
    data,
    columns,
    keyExtractor,
    sortBy,
    sortOrder = 'desc',
    onSort,
    getRowClassName,
    onRowClick,
    emptyState,
    renderMobileCard,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    hideMobileCards = false,
}: BaseTableProps<T>) {
    
    const getSortIcon = (field: string) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
        return sortOrder === 'asc' ? 
            <ArrowUp className="h-4 w-4 ml-1" /> : 
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    const handleSort = (field: string) => {
        if (onSort) {
            onSort(field);
        }
    };

    // Default empty state
    const defaultEmptyState = (
        <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
        </div>
    );

    // If no data, show empty state
    if (data.length === 0) {
        return emptyState || defaultEmptyState;
    }

    return (
        <>
            {/* Mobile Card View - Hidden on md and up */}
            {!hideMobileCards && renderMobileCard && (
                <div className="md:hidden space-y-3">
                    {data.map((item, index) => (
                        <div key={keyExtractor(item)}>
                            {renderMobileCard(item, index)}
                        </div>
                    ))}
                </div>
            )}

            {/* Desktop Table View - Hidden on mobile if mobile cards are enabled */}
            <div className={`${!hideMobileCards && renderMobileCard ? 'hidden md:block' : ''} rounded-md border`}>
                <Table className={`w-full border-collapse text-sm ${className}`}>
                    <TableHeader className={`bg-muted/50 border-b-2 ${headerClassName}`}>
                        <TableRow>
                            {columns.map((column) => {
                                const Icon = column.icon;
                                const alignClass = 
                                    column.align === 'left' ? 'text-left' :
                                    column.align === 'right' ? 'text-right' :
                                    'text-center';

                                return (
                                    <TableHead 
                                        key={column.key}
                                        className={`p-3 ${alignClass} text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b ${column.headerClassName || ''} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                                    >
                                        {column.sortable ? (
                                            <button 
                                                onClick={() => handleSort(column.key)}
                                                className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                                            >
                                                {Icon && <Icon className="h-4 w-4" />}
                                                {column.label}
                                                {getSortIcon(column.key)}
                                            </button>
                                        ) : (
                                            <div className={`flex items-center gap-2 ${column.align === 'center' ? 'mx-auto justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                                                {Icon && <Icon className="h-4 w-4" />}
                                                {column.label}
                                            </div>
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody className={bodyClassName}>
                        {data.map((item, index) => {
                            const rowClassName = getRowClassName ? getRowClassName(item, index) : '';
                            const isClickable = !!onRowClick;

                            return (
                                <TableRow 
                                    key={keyExtractor(item)}
                                    className={`border-b transition-all hover:bg-muted/20 ${rowClassName} ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(item, index)}
                                >
                                    {columns.map((column) => {
                                        const alignClass = 
                                            column.align === 'left' ? 'justify-start text-left' :
                                            column.align === 'right' ? 'justify-end text-right' :
                                            'justify-center text-center';

                                        return (
                                            <TableCell 
                                                key={column.key}
                                                className={`p-3 align-top border-b ${column.cellClassName || ''} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                                            >
                                                <div className={`flex ${alignClass} min-h-[40px] py-2 w-full`}>
                                                    <div 
                                                        className={`w-full ${column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center'}`}
                                                        style={column.maxWidth ? { maxWidth: column.maxWidth } : undefined}
                                                    >
                                                        {column.render ? column.render(item, index) : null}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
