import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SmartButton } from '@/components/ui/smart-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TableColumn {
    key: string;
    labelKey: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
}

interface TableAction {
    key: string;
    labelKey: string;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    onClick: (row: any) => void;
    condition?: (row: any) => boolean;
}

interface TranslatedTableProps {
    columns: TableColumn[];
    data: any[];
    actions?: TableAction[];
    loading?: boolean;
    emptyMessage?: string;
    emptyMessageKey?: string;
    className?: string;
}

/**
 * Table component with full translation support
 * Automatically translates headers, actions, and status values
 */
export function TranslatedTable({
    columns,
    data,
    actions = [],
    loading = false,
    emptyMessage,
    emptyMessageKey = 'common.no_data',
    className
}: TranslatedTableProps) {
    const { t, auto } = useTranslation();

    const translatedEmptyMessage = emptyMessage || t(emptyMessageKey, 'No data available');

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">{t('common.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">{translatedEmptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="text-left p-4 font-medium text-muted-foreground"
                            >
                                {t(column.labelKey)}
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="text-left p-4 font-medium text-muted-foreground">
                                {t('common.actions', 'Actions')}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                            {columns.map((column) => (
                                <td key={column.key} className="p-4">
                                    {column.render ? (
                                        column.render(row[column.key], row)
                                    ) : (
                                        <span>{renderCellValue(row[column.key], auto)}</span>
                                    )}
                                </td>
                            ))}
                            {actions.length > 0 && (
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {actions
                                            .filter(action => !action.condition || action.condition(row))
                                            .map((action) => (
                                                <SmartButton
                                                    key={action.key}
                                                    variant={action.variant || 'outline'}
                                                    size="sm"
                                                    onClick={() => action.onClick(row)}
                                                >
                                                    {t(action.labelKey)}
                                                </SmartButton>
                                            ))}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Render cell value with automatic translation for common values
 */
function renderCellValue(value: any, auto: (text: string) => string): React.ReactNode {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'boolean') {
        return value ? auto('Yes') : auto('No');
    }

    if (typeof value === 'string') {
        // Auto-translate common status values
        const commonStatuses = [
            'Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 
            'Completed', 'Cancelled', 'Processing', 'Delivered', 
            'In Stock', 'Out of Stock', 'Low Stock'
        ];
        
        if (commonStatuses.includes(value)) {
            return <Badge variant="outline">{auto(value)}</Badge>;
        }
        
        return auto(value);
    }

    if (typeof value === 'number') {
        // Format numbers appropriately
        if (value % 1 === 0) {
            return value.toLocaleString();
        } else {
            return value.toFixed(2);
        }
    }

    return String(value);
}