import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Edit, Trash2, ShoppingCart, History, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Stock, RemovedStock, SoldStock } from '@/types/inventory';

interface StockManagementProps {
    stocks: Stock[];
    removedStocks: RemovedStock[];
    soldStocks: SoldStock[];
    stockPagination?: PaginationData;
    removedPagination?: PaginationData;
    soldPagination?: PaginationData;
    processing: boolean;
    handleRemovePerishedStock: (stock: Stock) => void;
    onStockDataChange?: (queryParams: Record<string, any>) => void;
    onRemovedDataChange?: (queryParams: Record<string, any>) => void;
    onSoldDataChange?: (queryParams: Record<string, any>) => void;
}

export const StockManagement = ({
    stocks,
    removedStocks,
    soldStocks,
    stockPagination,
    removedPagination,
    soldPagination,
    processing,
    handleRemovePerishedStock,
    onStockDataChange,
    onRemovedDataChange,
    onSoldDataChange
}: StockManagementProps) => {
    // Format currency
    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `₱${amount.toFixed(2)}`;
    };

    // Active stocks columns
    const stockColumns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'Stock ID',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'member_name',
            label: 'Member',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'notes',
            label: 'Notes',
            sortable: false,
            className: 'min-w-[150px]'
        },
        {
            key: 'created_at',
            label: 'Added',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'w-32'
        }
    ];

    // Removed stocks columns
    const removedColumns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'Stock ID',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'member_name',
            label: 'Member',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'removal_reason',
            label: 'Reason',
            sortable: false,
            className: 'min-w-[120px]'
        },
        {
            key: 'removed_at',
            label: 'Removed',
            sortable: true,
            className: 'min-w-[100px]'
        }
    ];

    // Sold stocks columns
    const soldColumns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'Stock ID',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'member_name',
            label: 'Member',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'sold_quantity',
            label: 'Sold Qty',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'remaining_quantity',
            label: 'Remaining',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'updated_at',
            label: 'Last Sale',
            sortable: true,
            className: 'min-w-[100px]'
        }
    ];

    // Render active stock row
    const renderStockRow = (stock: Stock, index: number) => (
        <TableRow key={stock.id} className="transition-colors duration-150 hover:bg-muted/50">
            <TableCell className="text-sm text-muted-foreground">
                {stock.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {stock.product?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {stock.member?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm font-medium">
                <Badge variant="outline" className="text-xs">
                    {stock.quantity} {stock.category}
                </Badge>
            </TableCell>
            <TableCell className="text-sm">
                <Badge variant="secondary" className="text-xs">
                    {stock.category}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {stock.notes || 'No notes'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(stock.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <PermissionGate permission="edit stocks">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('stocks.edit', stock.id)}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="delete stocks">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePerishedStock(stock)}
                            disabled={processing}
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Trash2 className="h-4 w-4" />
                            Remove
                        </Button>
                    </PermissionGate>
                </div>
            </TableCell>
        </TableRow>
    );

    // Render removed stock row
    const renderRemovedRow = (stock: RemovedStock, index: number) => (
        <TableRow key={stock.id} className="transition-colors duration-150 hover:bg-muted/50">
            <TableCell className="text-sm text-muted-foreground">
                {stock.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {stock.product?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {stock.member?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm">
                <Badge variant="outline" className="text-xs">
                    {stock.quantity} {stock.category}
                </Badge>
            </TableCell>
            <TableCell className="text-sm">
                <Badge variant="destructive" className="text-xs">
                    {stock.removal_reason || 'Removed'}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {stock.removed_at ? new Date(stock.removed_at).toLocaleDateString() : 'N/A'}
            </TableCell>
        </TableRow>
    );

    // Render sold stock row
    const renderSoldRow = (stock: SoldStock, index: number) => (
        <TableRow key={stock.id} className="transition-colors duration-150 hover:bg-muted/50">
            <TableCell className="text-sm text-muted-foreground">
                {stock.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {stock.product?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {stock.member?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm">
                <Badge variant="default" className="text-xs">
                    {stock.sold_quantity} sold
                </Badge>
            </TableCell>
            <TableCell className="text-sm">
                <Badge variant="outline" className="text-xs">
                    {stock.quantity} left
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(stock.updated_at).toLocaleDateString()}
            </TableCell>
        </TableRow>
    );

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Stock Management</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Track and manage inventory stock levels
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="create stocks">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('stocks.create')}>
                                <Plus className="h-4 w-4" />
                                Add Stock
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Stock Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Active Stocks
                    </TabsTrigger>
                    <TabsTrigger value="sold" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Sold Stocks
                    </TabsTrigger>
                    <TabsTrigger value="removed" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Removed Stocks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                    <UnifiedTable
                        data={stocks}
                        columns={stockColumns}
                        pagination={stockPagination}
                        onDataChange={onStockDataChange}
                        renderRow={renderStockRow}
                        emptyMessage="No active stocks found"
                        searchPlaceholder="Search stocks by product or member..."
                        showSearch={true}
                        showFilters={false}
                        loading={processing}
                        tableStateOptions={{
                            defaultSort: {
                                column: 'created_at',
                                direction: 'desc'
                            },
                            maxPerPage: 10,
                            persistInUrl: true
                        }}
                    />
                </TabsContent>

                <TabsContent value="sold" className="mt-4">
                    <UnifiedTable
                        data={soldStocks}
                        columns={soldColumns}
                        pagination={soldPagination}
                        onDataChange={onSoldDataChange}
                        renderRow={renderSoldRow}
                        emptyMessage="No sold stocks found"
                        searchPlaceholder="Search sold stocks by product or member..."
                        showSearch={true}
                        showFilters={false}
                        loading={processing}
                        tableStateOptions={{
                            defaultSort: {
                                column: 'updated_at',
                                direction: 'desc'
                            },
                            maxPerPage: 10,
                            persistInUrl: true
                        }}
                    />
                </TabsContent>

                <TabsContent value="removed" className="mt-4">
                    <UnifiedTable
                        data={removedStocks}
                        columns={removedColumns}
                        pagination={removedPagination}
                        onDataChange={onRemovedDataChange}
                        renderRow={renderRemovedRow}
                        emptyMessage="No removed stocks found"
                        searchPlaceholder="Search removed stocks by product or member..."
                        showSearch={true}
                        showFilters={false}
                        loading={processing}
                        tableStateOptions={{
                            defaultSort: {
                                column: 'removed_at',
                                direction: 'desc'
                            },
                            maxPerPage: 10,
                            persistInUrl: true
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};