import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Edit, Eye, EyeOff, Trash2, ShoppingCart, History, Search, Filter } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from './pagination-controls';
import { Stock, RemovedStock, SoldStock } from '@/types/inventory';
import { useState } from 'react';
import styles from '../../pages/Admin/Inventory/inventory.module.css';

interface StockManagementProps {
    stocks: Stock[];
    removedStocks: RemovedStock[];
    soldStocks: SoldStock[];
    auditTrails: any[]; // Keeping for backward compatibility
    stockTrails: any[]; // Keeping for backward compatibility
    stockCurrentPage: number;
    setStockCurrentPage: (page: number) => void;
    stockItemsPerPage: number;
    processing: boolean;
    handleRemovePerishedStock: (stock: Stock) => void;
    getFilteredStocks: (status: string) => Stock[];
    getPaginatedStocks: (stocks: Stock[], page: number, itemsPerPage: number) => Stock[];
    stockSearchTerm: string;
    setStockSearchTerm: (term: string) => void;
    showStockSearch: boolean;
    setShowStockSearch: (show: boolean) => void;
    selectedStockCategory: string;
    setSelectedStockCategory: (category: string) => void;
    stockSortBy: string;
    setStockSortBy: (sort: string) => void;
}

export const StockManagement = ({
    stocks,
    removedStocks,
    soldStocks,
    auditTrails,
    stockTrails,
    stockCurrentPage,
    setStockCurrentPage,
    stockItemsPerPage,
    processing,
    handleRemovePerishedStock,
    getFilteredStocks,
    getPaginatedStocks,
    stockSearchTerm,
    setStockSearchTerm,
    showStockSearch,
    setShowStockSearch,
    selectedStockCategory,
    setSelectedStockCategory,
    stockSortBy,
    setStockSortBy
}: StockManagementProps) => {
    const [currentView, setCurrentView] = useState<'stocks' | 'trail' | 'sold'>('stocks');

    const renderUnifiedTable = (data: any[], dataType: 'stocks' | 'trail' | 'sold', title: string) => {
        const paginatedData = getPaginatedStocks(data, stockCurrentPage, stockItemsPerPage);
        const totalPages = Math.ceil(data.length / stockItemsPerPage);

        const getTableHeaders = () => {
            if (dataType === 'trail') {
                return (
                    <TableRow>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Date</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Product</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Quantity</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Category</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Member</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Action</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Total Amount</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Notes</TableHead>
                    </TableRow>
                );
            }
            // For sold stocks view
            if (dataType === 'sold') {
                return (
                    <TableRow>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Stock ID</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Product Name</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Quantity Sold</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Assigned To</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Total Amount</TableHead>
                    </TableRow>
                );
            }
            
            // For regular stocks view
            return (
                <TableRow>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Stock ID</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Product Name</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Quantity</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Category</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Assigned To</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Status</TableHead>
                    {dataType === 'stocks' && <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Actions</TableHead>}
                </TableRow>
            );
        };

        const renderTableRow = (item: any, index: number) => {
            if (dataType === 'trail') {
                return (
                    <TableRow key={item.id} className="border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md">
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="text-sm">
                                {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleTimeString()}
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-medium">{item.product}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-semibold">
                                {item.category === 'Kilo'
                                    ? `${item.quantity} kg`
                                    : item.category
                                    ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                    : item.quantity
                                }
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            {item.member}
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <Badge 
                                variant={item.type === 'removed' || item.type === 'reversal' ? "destructive" : "default"}
                                className={item.type === 'removed' || item.type === 'reversal' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}
                            >
                                {item.action}
                            </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-semibold">
                                ₱{(item.totalAmount || 0).toFixed(2)}
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="max-w-xs truncate" title={item.notes}>
                                {item.notes}
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }

            // For sold stocks view
            if (dataType === 'sold') {
                // Calculate total amount for sold stock
                let totalAmount = 0;
                if (item.product) {
                    let price = 0;
                    if (item.category === 'Kilo') {
                        price = item.product.price_kilo || 0;
                    } else if (item.category === 'Pc') {
                        price = item.product.price_pc || 0;
                    } else if (item.category === 'Tali') {
                        price = item.product.price_tali || 0;
                    }
                    totalAmount = (item.sold_quantity || 0) * price;
                }
                
                return (
                    <TableRow key={item.id} className="border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md">
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <Badge variant="outline">#{item.id}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-medium">{item.product?.name || '-'}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-semibold">
                                {item.category === 'Kilo'
                                    ? `${item.sold_quantity || 0} kg sold`
                                    : item.category
                                    ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} sold`
                                    : `${item.sold_quantity || 0} sold`
                                }
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            {item.member?.name || 'Unassigned'}
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="font-semibold">
                                ₱{totalAmount.toFixed(2)}
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }
            
            // For regular stocks
            return (
                <TableRow key={item.id} className="border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md">
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        <Badge variant="outline">#{item.id}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        <div className="font-medium">{item.product?.name || '-'}</div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        <div className="font-semibold">
                            {dataType === 'stocks' && item.quantity === 0 ? (
                                <div>
                                    {item.category === 'Kilo'
                                        ? `${item.sold_quantity || 0} kg sold`
                                        : item.category
                                        ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} sold`
                                        : `${item.sold_quantity || 0} sold`
                                    }
                                </div>
                            ) : (
                                <div>
                                    {item.category === 'Kilo'
                                        ? `${item.quantity} kg`
                                        : item.category
                                        ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                        : item.quantity
                                    }
                                </div>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        <Badge variant="secondary">{item.category || '-'}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        {item.member?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                        <Badge 
                            variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                            className={
                                item.quantity > 10 
                                    ? "bg-primary/10 text-primary" 
                                    : item.quantity > 0 
                                        ? "bg-secondary/10 text-secondary" 
                                        : "bg-destructive/10 text-destructive"
                            }
                        >
                            {item.quantity > 10 ? 'Available' : 
                             item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </Badge>
                    </TableCell>
                    {dataType === 'stocks' && (
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top">
                            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto">
                                <PermissionGate permission="edit stocks">
                                    <Button asChild size="sm" className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap">
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
                                        className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap"
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
        // Use stock trails data
        return stockTrails.map(trail => {
            // Get quantity change from stock trail
            const oldQuantity = trail.old_quantity || 0;
            const newQuantity = trail.new_quantity || 0;
            const quantityChange = Math.abs(oldQuantity - newQuantity);
            
            // Calculate price based on action type
            let price = 0;
            if (trail.product) {
                if (trail.category === 'Kilo') {
                    price = trail.product.price_kilo || 0;
                } else if (trail.category === 'Pc') {
                    price = trail.product.price_pc || 0;
                } else if (trail.category === 'Tali') {
                    price = trail.product.price_tali || 0;
                }
            }
            
            // Calculate total amount for the stock trail
            let totalAmount = 0;
            if (trail.action_type === 'sale') {
                // For sales, calculate based on quantity sold
                totalAmount = quantityChange * price;
            } else if (trail.action_type === 'created' || trail.action_type === 'updated') {
                // For stock additions, calculate based on new quantity
                totalAmount = newQuantity * price;
            } else if (trail.action_type === 'removed') {
                // For removals, calculate based on the removed quantity
                totalAmount = quantityChange * price;
            }
            
            return {
                id: trail.id,
                type: trail.action_type,
                product: trail.product?.name || 'Unknown Product',
                quantity: quantityChange,
                category: trail.category || 'N/A',
                member: trail.member?.name || trail.performedByUser?.name || 'Unknown',
                date: trail.created_at,
                notes: trail.notes || `Action: ${trail.action_type}`,
                action: getActionLabel(trail.action_type),
                oldQuantity: trail.old_quantity,
                newQuantity: trail.new_quantity,
                actionType: trail.action_type,
                totalAmount: totalAmount
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getActionLabel = (actionType: string) => {
        const labels: { [key: string]: string } = {
            'created': 'Added',
            'updated': 'Updated',
            'removed': 'Removed',
            'restored': 'Restored',
            'sale': 'Sale',
            'reversal': 'Reversal'
        };
        return labels[actionType] || actionType.charAt(0).toUpperCase() + actionType.slice(1);
    };


    return (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
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
                <div className="flex gap-3 flex-wrap items-center">
                    <Button
                        variant={showStockSearch ? "default" : "outline"}
                        onClick={() => {
                            if (showStockSearch) {
                                setStockSearchTerm('');
                            }
                            setShowStockSearch(!showStockSearch);
                        }}
                        size="sm"
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        {showStockSearch ? 'Hide Search' : 'Search'}
                    </Button>
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
                            Sold History
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Stock Search Bar */}
            <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${
                showStockSearch ? styles.expanded : styles.collapsed
            }`}>
                <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                        <Input
                            type="text"
                            placeholder="Search stocks by product name, type, category, or stock ID..."
                            value={stockSearchTerm}
                            onChange={(e) => setStockSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                        />
                        {stockSearchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStockSearchTerm('')}
                                className="absolute right-2 p-1 min-w-auto h-6 w-6 rounded-full bg-muted text-muted-foreground border-none hover:bg-destructive hover:text-destructive-foreground"
                            >
                                ×
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <Select value={selectedStockCategory} onValueChange={setSelectedStockCategory}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Kilo">Kilo</SelectItem>
                                <SelectItem value="Pc">Piece</SelectItem>
                                <SelectItem value="Tali">Tali</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={stockSortBy} onValueChange={setStockSortBy}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id">Stock ID</SelectItem>
                                <SelectItem value="quantity">Quantity (High to Low)</SelectItem>
                                <SelectItem value="product">Product Name</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        {stockSearchTerm || selectedStockCategory !== 'all' 
                            ? 'Filtered results' 
                            : 'Ready to search stocks'}
                    </span>
                    {(stockSearchTerm || selectedStockCategory !== 'all') && (
                        <button
                            onClick={() => {
                                setStockSearchTerm('');
                                setSelectedStockCategory('all');
                                setStockSortBy('id');
                            }}
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                            type="button"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div>
                {currentView === 'stocks' ? (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="all">Current Stocks</TabsTrigger>
                            <TabsTrigger value="available">Available</TabsTrigger>
                            <TabsTrigger value="low">Low Stock</TabsTrigger>
                            <TabsTrigger value="out">Sold Out</TabsTrigger>
                            <TabsTrigger value="sold">Sold Items</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="all">
                            {renderUnifiedTable(getFilteredStocks('all'), 'stocks', 'Current Stocks')}
                        </TabsContent>
                        
                        <TabsContent value="available">
                            {renderUnifiedTable(getFilteredStocks('available'), 'stocks', 'Available Stocks')}
                        </TabsContent>
                        
                        <TabsContent value="low">
                            {renderUnifiedTable(getFilteredStocks('low'), 'stocks', 'Low Stock Items')}
                        </TabsContent>
                        
                        <TabsContent value="out">
                            {renderUnifiedTable(getFilteredStocks('out'), 'stocks', 'Sold Out Items')}
                        </TabsContent>
                        
                        <TabsContent value="sold">
                            {renderUnifiedTable(soldStocks, 'sold', 'Sold Items')}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div>
                        {currentView === 'trail' && renderUnifiedTable(getCombinedTrailData(), 'trail', 'Stock Trail')}
                        {currentView === 'sold' && renderUnifiedTable(soldStocks, 'sold', 'Sold History')}
                    </div>
                )}
            </div>
        </div>
    );
};