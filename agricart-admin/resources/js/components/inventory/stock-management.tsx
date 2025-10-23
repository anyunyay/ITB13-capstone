import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Edit, Eye, EyeOff, Trash2, ShoppingCart, History } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from './pagination-controls';
import { Stock, RemovedStock, SoldStock, AuditTrail } from '@/types/inventory';
import { useState } from 'react';

interface StockManagementProps {
    stocks: Stock[];
    removedStocks: RemovedStock[];
    soldStocks: SoldStock[];
    auditTrails: AuditTrail[];
    stockCurrentPage: number;
    setStockCurrentPage: (page: number) => void;
    stockItemsPerPage: number;
    processing: boolean;
    handleRemovePerishedStock: (stock: Stock) => void;
    getFilteredStocks: (status: string) => Stock[];
    getPaginatedStocks: (stocks: Stock[], page: number, itemsPerPage: number) => Stock[];
}

export const StockManagement = ({
    stocks,
    removedStocks,
    soldStocks,
    auditTrails,
    stockCurrentPage,
    setStockCurrentPage,
    stockItemsPerPage,
    processing,
    handleRemovePerishedStock,
    getFilteredStocks,
    getPaginatedStocks
}: StockManagementProps) => {
    const [currentView, setCurrentView] = useState<'stocks' | 'trail' | 'sold'>('stocks');

    const renderUnifiedTable = (data: any[], dataType: 'stocks' | 'trail' | 'sold', title: string) => {
        const paginatedData = getPaginatedStocks(data, stockCurrentPage, stockItemsPerPage);
        const totalPages = Math.ceil(data.length / stockItemsPerPage);

        const getTableHeaders = () => {
            if (dataType === 'trail') {
                return (
                    <TableRow>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Date</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Product</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Quantity</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Category</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Member</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Action</TableHead>
                        <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Notes</TableHead>
                    </TableRow>
                );
            }
            return (
                <TableRow>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Stock ID</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Product Name</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Quantity</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Category</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Assigned To</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Status</TableHead>
                    {dataType === 'stocks' && <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Actions</TableHead>}
                </TableRow>
            );
        };

        const renderTableRow = (item: any, index: number) => {
            if (dataType === 'trail') {
                return (
                    <TableRow key={item.id} className="border-b border-border transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]">
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <div className="text-sm">
                                {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleTimeString()}
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <div className="font-medium">{item.product}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <div className="font-semibold">
                                {item.category === 'Kilo'
                                    ? `${item.quantity} kg`
                                    : item.category
                                    ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                    : item.quantity
                                }
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            {item.member}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <Badge 
                                variant={item.type === 'removed' ? "destructive" : "default"}
                                className={item.type === 'removed' ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}
                            >
                                {item.action}
                            </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <div className="max-w-xs truncate" title={item.notes}>
                                {item.notes}
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }

            // For stocks and sold stocks
            return (
                <TableRow key={item.id} className="border-b border-border transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]">
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        <Badge variant="outline">#{item.id}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        <div className="font-medium">{item.product?.name || '-'}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        <div className="font-semibold">
                            {item.category === 'Kilo'
                                ? `${item.quantity} kg`
                                : item.category
                                ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                : item.quantity
                            }
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        <Badge variant="secondary">{item.category || '-'}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        {item.member?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                        <Badge 
                            variant={dataType === 'sold' ? "default" : item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                            className={
                                dataType === 'sold' ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                                item.quantity > 10 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                                    : item.quantity > 0 
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" 
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }
                        >
                            {dataType === 'sold' ? 'Sold' : 
                             item.quantity > 10 ? 'Available' : 
                             item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </Badge>
                    </TableCell>
                    {dataType === 'stocks' && (
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                            <div className="flex gap-2">
                                <PermissionGate permission="edit stocks">
                                    <Button asChild size="sm" className="transition-all duration-200 hover:scale-105">
                                        <Link href={route('inventory.editStock', { product: item.product_id, stock: item.id })}>
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Link>
                                    </Button>
                                </PermissionGate>
                                <PermissionGate permission="delete stocks">
                                    <Button 
                                        disabled={processing} 
                                        onClick={() => handleRemovePerishedStock(item)} 
                                        size="sm"
                                        variant="destructive"
                                        className="transition-all duration-200 hover:scale-105"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Remove
                                    </Button>
                                </PermissionGate>
                            </div>
                        </TableCell>
                    )}
                </TableRow>
            );
        };

        return data.length > 0 ? (
            <>
                <div className="rounded-md border">
                    <Table className="w-full border-collapse">
                        <TableHeader className="bg-[color-mix(in_srgb,var(--muted)_50%,transparent)]">
                            {getTableHeaders()}
                        </TableHeader>
                        <TableBody>
                            {paginatedData?.map((item, index) => renderTableRow(item, index))}
                        </TableBody>
                    </Table>
                </div>
                
                <PaginationControls
                    currentPage={stockCurrentPage}
                    totalPages={totalPages}
                    onPageChange={setStockCurrentPage}
                    itemsPerPage={stockItemsPerPage}
                    totalItems={data.length}
                />
            </>
        ) : (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                    {dataType === 'trail' ? 'No stock trail data available' :
                     dataType === 'sold' ? 'No sold stocks available' :
                     'No stocks available'}
                </h3>
                <p className="text-muted-foreground">
                    {dataType === 'trail' ? 'Stock changes and removals will appear here once they occur.' :
                     dataType === 'sold' ? 'Sold stock items will appear here once sales are completed.' :
                     'Add stock to products to see them listed here.'}
                </p>
            </div>
        );
    };

    const getCombinedTrailData = () => {
        return [
            // Removed stocks
            ...removedStocks.map(stock => ({
                id: `removed-${stock.id}`,
                type: 'removed',
                product: stock.product?.name || 'Unknown Product',
                quantity: stock.quantity,
                category: stock.category,
                member: stock.member?.name || 'Unknown Member',
                date: stock.removed_at,
                notes: stock.notes || 'No notes',
                action: 'Removed'
            })),
            // Audit trail entries (only sales and other non-removal entries)
            ...auditTrails
                .filter(trail => trail.sale_id !== null) // Only show sales-related audit entries
                .map(trail => ({
                    id: `audit-${trail.id}`,
                    type: 'audit',
                    product: trail.product?.name || 'Unknown Product',
                    quantity: trail.quantity,
                    category: trail.category,
                    member: trail.stock?.member_id ? 'Member Stock' : 'System',
                    date: trail.created_at,
                    notes: trail.sale ? `Sale #${trail.sale.id}` : 'System Update',
                    action: trail.quantity > 0 ? 'Added' : 'Updated'
                }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };


    return (
        <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Stock Management</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Monitor stock levels, track inventory movements, and manage stock operations
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button 
                        disabled={processing} 
                        variant={currentView === 'stocks' ? "default" : "outline"} 
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        onClick={() => setCurrentView('stocks')}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Current Stocks
                    </Button>
                    <PermissionGate permission="view stock trail">
                        <Button 
                            disabled={processing} 
                            variant={currentView === 'trail' ? "default" : "outline"} 
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={() => setCurrentView('trail')}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Stock Trail
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="view sold stock">
                        <Button 
                            disabled={processing} 
                            variant={currentView === 'sold' ? "default" : "outline"} 
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={() => setCurrentView('sold')}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Sold Items
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <div>
                {currentView === 'stocks' ? (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All Stocks</TabsTrigger>
                            <TabsTrigger value="available">Available</TabsTrigger>
                            <TabsTrigger value="low">Low Stock</TabsTrigger>
                            <TabsTrigger value="out">Out of Stock</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="all">
                            {renderUnifiedTable(getFilteredStocks('all'), 'stocks', 'All Stocks')}
                        </TabsContent>
                        
                        <TabsContent value="available">
                            {renderUnifiedTable(getFilteredStocks('available'), 'stocks', 'Available Stocks')}
                        </TabsContent>
                        
                        <TabsContent value="low">
                            {renderUnifiedTable(getFilteredStocks('low'), 'stocks', 'Low Stock Items')}
                        </TabsContent>
                        
                        <TabsContent value="out">
                            {renderUnifiedTable(getFilteredStocks('out'), 'stocks', 'Out of Stock Items')}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div>
                        {currentView === 'trail' && renderUnifiedTable(getCombinedTrailData(), 'trail', 'Stock Trail')}
                        {currentView === 'sold' && renderUnifiedTable(soldStocks, 'sold', 'Sold Stocks')}
                    </div>
                )}
            </div>
        </div>
    );
};