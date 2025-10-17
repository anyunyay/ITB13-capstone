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
import styles from '../../pages/Admin/Inventory/inventory.module.css';
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
                        <TableHead className={styles.stockTableHeaderCell}>Date</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Product</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Quantity</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Category</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Member</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Action</TableHead>
                        <TableHead className={styles.stockTableHeaderCell}>Notes</TableHead>
                    </TableRow>
                );
            }
            return (
                <TableRow>
                    <TableHead className={styles.stockTableHeaderCell}>Stock ID</TableHead>
                    <TableHead className={styles.stockTableHeaderCell}>Product Name</TableHead>
                    <TableHead className={styles.stockTableHeaderCell}>Quantity</TableHead>
                    <TableHead className={styles.stockTableHeaderCell}>Category</TableHead>
                    <TableHead className={styles.stockTableHeaderCell}>Assigned To</TableHead>
                    <TableHead className={styles.stockTableHeaderCell}>Status</TableHead>
                    {dataType === 'stocks' && <TableHead className={styles.stockTableHeaderCell}>Actions</TableHead>}
                </TableRow>
            );
        };

        const renderTableRow = (item: any, index: number) => {
            if (dataType === 'trail') {
                return (
                    <TableRow key={item.id} className={styles.stockTableRow}>
                        <TableCell className={styles.stockTableCell}>
                            <div className="text-sm">
                                {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleTimeString()}
                            </div>
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            <div className="font-medium">{item.product}</div>
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            <div className="font-semibold">
                                {item.category === 'Kilo'
                                    ? `${item.quantity} kg`
                                    : item.category
                                    ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                    : item.quantity
                                }
                            </div>
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            {item.member}
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            <Badge 
                                variant={item.type === 'removed' ? "destructive" : "default"}
                                className={item.type === 'removed' ? styles.statusOut : styles.statusAvailable}
                            >
                                {item.action}
                            </Badge>
                        </TableCell>
                        <TableCell className={styles.stockTableCell}>
                            <div className="max-w-xs truncate" title={item.notes}>
                                {item.notes}
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }

            // For stocks and sold stocks
            return (
                <TableRow key={item.id} className={styles.stockTableRow}>
                    <TableCell className={styles.stockTableCell}>
                        <Badge variant="outline">#{item.id}</Badge>
                    </TableCell>
                    <TableCell className={styles.stockTableCell}>
                        <div className="font-medium">{item.product?.name || '-'}</div>
                    </TableCell>
                    <TableCell className={styles.stockTableCell}>
                        <div className="font-semibold">
                            {item.category === 'Kilo'
                                ? `${item.quantity} kg`
                                : item.category
                                ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                : item.quantity
                            }
                        </div>
                    </TableCell>
                    <TableCell className={styles.stockTableCell}>
                        <Badge variant="secondary">{item.category || '-'}</Badge>
                    </TableCell>
                    <TableCell className={styles.stockTableCell}>
                        {item.member?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className={styles.stockTableCell}>
                        <Badge 
                            variant={dataType === 'sold' ? "default" : item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                            className={
                                dataType === 'sold' ? styles.statusAvailable :
                                item.quantity > 10 
                                    ? styles.statusAvailable 
                                    : item.quantity > 0 
                                        ? styles.statusLow 
                                        : styles.statusOut
                            }
                        >
                            {dataType === 'sold' ? 'Sold' : 
                             item.quantity > 10 ? 'Available' : 
                             item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </Badge>
                    </TableCell>
                    {dataType === 'stocks' && (
                        <TableCell className={styles.stockTableCell}>
                            <div className={styles.stockActionCell}>
                                <PermissionGate permission="edit stocks">
                                    <Button asChild size="sm" className={styles.stockActionButton}>
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
                                        className={styles.stockActionButton}
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
                    <Table className={styles.stockTable}>
                        <TableHeader className={styles.stockTableHeader}>
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
            <div className={styles.emptyState}>
                <Package className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>
                    {dataType === 'trail' ? 'No stock trail data available' :
                     dataType === 'sold' ? 'No sold stocks available' :
                     'No stocks available'}
                </h3>
                <p className={styles.emptyStateDescription}>
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
        <div className={styles.stockManagementSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Stock Management</h2>
                        <p className={styles.sectionSubtitle}>
                            Monitor stock levels, track inventory movements, and manage stock operations
                        </p>
                    </div>
                </div>
                <div className={styles.sectionActions}>
                    <Button 
                        disabled={processing} 
                        variant={currentView === 'stocks' ? "default" : "outline"} 
                        className={styles.sectionActionButton}
                        onClick={() => setCurrentView('stocks')}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Current Stocks
                    </Button>
                    <PermissionGate permission="view stock trail">
                        <Button 
                            disabled={processing} 
                            variant={currentView === 'trail' ? "default" : "outline"} 
                            className={styles.sectionActionButton}
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
                            className={styles.sectionActionButton}
                            onClick={() => setCurrentView('sold')}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Sold Items
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <div className={styles.sectionContent}>
                {currentView === 'stocks' ? (
                    <Tabs defaultValue="all" className={styles.stockTab}>
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