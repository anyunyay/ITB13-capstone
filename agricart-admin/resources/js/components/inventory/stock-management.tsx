import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Edit, Eye, EyeOff, Trash2, ShoppingCart, History, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { PaginationControls } from './pagination-controls';
import { Stock, RemovedStock, SoldStock } from '@/types/inventory';
import { useState } from 'react';
import styles from '../../pages/Admin/Inventory/inventory.module.css';
import { useTranslation } from '@/hooks/use-translation';

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
    handleEditStock: (stock: Stock) => void;
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
    stockSortOrder: 'asc' | 'desc';
    setStockSortOrder: (order: 'asc' | 'desc') => void;
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
    handleEditStock,
    getFilteredStocks,
    getPaginatedStocks,
    stockSearchTerm,
    setStockSearchTerm,
    showStockSearch,
    setShowStockSearch,
    selectedStockCategory,
    setSelectedStockCategory,
    stockSortBy,
    setStockSortBy,
    stockSortOrder,
    setStockSortOrder
}: StockManagementProps) => {
    const t = useTranslation();
    const [currentView, setCurrentView] = useState<'stocks' | 'trail' | 'sold'>('stocks');
    const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');

    const handleStockSort = (field: string) => {
        if (stockSortBy === field) {
            setStockSortOrder(stockSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setStockSortBy(field);
            setStockSortOrder('asc');
        }
        setStockCurrentPage(1); // Reset to first page when sorting changes
    };

    const getStockSortIcon = (field: string) => {
        if (stockSortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1" />;
        }
        return stockSortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1" /> :
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    const renderUnifiedTable = (data: any[], dataType: 'stocks' | 'trail' | 'sold', title: string) => {
        const paginatedData = getPaginatedStocks(data, stockCurrentPage, stockItemsPerPage);
        const totalPages = Math.ceil(data.length / stockItemsPerPage);

        const getTableHeaders = () => {
            if (dataType === 'trail') {
                return (
                    <TableRow>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.date')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.stock_id')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.product')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.quantity')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.total_amount')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.action')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.member')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.performed_by')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.notes')}</TableHead>
                    </TableRow>
                );
            }
            // For sold stocks view
            if (dataType === 'sold') {
                return (
                    <TableRow>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.stock_id')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.product_name')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.quantity_sold')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.sold_date')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.assigned_to')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.performed_by')}</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.total_amount')}</TableHead>
                    </TableRow>
                );
            }

            // For regular stocks view
            return (
                <TableRow>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                        <button onClick={() => handleStockSort('id')} className="flex items-center hover:text-foreground transition-colors mx-auto">
                            {t('admin.stock_id')}
                            {getStockSortIcon('id')}
                        </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                        <button onClick={() => handleStockSort('product')} className="flex items-center hover:text-foreground transition-colors mx-auto">
                            {t('admin.product_name')}
                            {getStockSortIcon('product')}
                        </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                        <button onClick={() => handleStockSort('quantity')} className="flex items-center hover:text-foreground transition-colors mx-auto">
                            {t('admin.quantity')}
                            {getStockSortIcon('quantity')}
                        </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                        <button onClick={() => handleStockSort('category')} className="flex items-center hover:text-foreground transition-colors mx-auto">
                            {t('admin.category')}
                            {getStockSortIcon('category')}
                        </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.assigned_to')}</TableHead>
                    <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                        <button onClick={() => handleStockSort('status')} className="flex items-center hover:text-foreground transition-colors mx-auto">
                            {t('admin.status')}
                            {getStockSortIcon('status')}
                        </button>
                    </TableHead>
                    {dataType === 'stocks' && <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.actions')}</TableHead>}
                </TableRow>
            );
        };

        const renderTableRow = (item: any, index: number) => {
            if (dataType === 'trail') {
                return (
                    <TableRow key={item.id} className="border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md">
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-center">
                                    <div className="text-sm">
                                        {new Date(item.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(item.date).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-center flex justify-center">
                                    <Badge variant="outline">#{item.stockId || 'N/A'}</Badge>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[180px] text-left">
                                    <div className="font-medium">{item.product}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-right">
                                    <div className="font-semibold">
                                        {item.category === 'Kilo'
                                            ? `${item.quantity} kg`
                                            : item.category
                                                ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                                : item.quantity
                                        }
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-right">
                                    <div className="font-semibold">
                                        {item.totalAmount === null ? 'N/A' : `₱${item.totalAmount.toFixed(2)}`}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-center flex justify-center">
                                    <Badge
                                        variant={item.type === 'removed' || item.type === 'reversal' ? "destructive" : "default"}
                                        className={item.type === 'removed' || item.type === 'reversal' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}
                                    >
                                        {item.action}
                                    </Badge>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[150px] text-left">
                                    {item.member}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[150px] text-left">
                                    <div className="font-medium text-sm">{item.performedBy || t('admin.system')}</div>
                                    {item.performedByType && (
                                        <div className="text-xs text-muted-foreground capitalize">{item.performedByType}</div>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[200px] text-left">
                                    <div className="truncate" title={item.notes}>
                                        {item.notes}
                                    </div>
                                </div>
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
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-center flex justify-center">
                                    <Badge variant="outline">#{item.id}</Badge>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[180px] text-left">
                                    <div className="font-medium">{item.product?.name || '-'}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-right">
                                    <div className="font-semibold">
                                        {item.category === 'Kilo'
                                            ? `${item.sold_quantity || 0} ${t('admin.kg_sold')}`
                                            : item.category
                                                ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} ${t('admin.sold_label')}`
                                                : `${item.sold_quantity || 0} ${t('admin.sold_label')}`
                                        }
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-center">
                                    <div className="text-sm">
                                        {item.sold_at ? new Date(item.sold_at).toLocaleDateString() : '-'}
                                    </div>
                                    {item.sold_at && (
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(item.sold_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[150px] text-left">
                                    {item.member?.name || t('admin.unassigned')}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[150px] text-left">
                                    <div className="font-medium text-sm">{item.performedBy || t('admin.system')}</div>
                                    {item.performedByType && (
                                        <div className="text-xs text-muted-foreground capitalize">{item.performedByType}</div>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[120px] text-right">
                                    <div className="font-semibold">
                                        ₱{totalAmount.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }

            // For regular stocks
            return (
                <TableRow key={item.id} className="border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md">
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[120px] text-center flex justify-center">
                                <Badge variant="outline">#{item.id}</Badge>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[180px] text-left">
                                <div className="font-medium">{item.product?.name || '-'}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[120px] text-right">
                                <div className="font-semibold">
                                    {dataType === 'stocks' && item.quantity === 0 ? (
                                        <div>
                                            {item.category === 'Kilo'
                                                ? `${item.sold_quantity || 0} ${t('admin.kg_sold')}`
                                                : item.category
                                                    ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} ${t('admin.sold_label')}`
                                                    : `${item.sold_quantity || 0} ${t('admin.sold_label')}`
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
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[120px] text-center flex justify-center">
                                <Badge variant="secondary">{item.category || '-'}</Badge>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[150px] text-left">
                                {item.member?.name || t('admin.unassigned')}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                            <div className="w-full max-w-[120px] text-center flex justify-center">
                                <Badge
                                    variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                                    className={
                                        item.quantity > 10
                                            ? "bg-primary/10 text-primary"
                                            : item.quantity > 0
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-red-100 text-red-800"
                                    }
                                >
                                    {item.quantity > 10 ? t('admin.available') :
                                        item.quantity > 0 ? t('admin.low_stock') : t('admin.out_of_stock')}
                                </Badge>
                            </div>
                        </div>
                    </TableCell>
                    {dataType === 'stocks' && (
                        <TableCell className="px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2">
                            <div className="flex justify-center min-h-[40px] py-2 w-full">
                                <div className="w-full max-w-[180px] text-center">
                                    <div className="flex items-center gap-1 flex-nowrap overflow-x-auto justify-center">
                                        <PermissionGate permission="edit stocks">
                                            <Button 
                                                size="sm" 
                                                className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                                onClick={() => handleEditStock(item)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                {t('ui.edit')}
                                            </Button>
                                        </PermissionGate>
                                        <PermissionGate permission="delete stocks">
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleRemovePerishedStock(item)}
                                                size="sm"
                                                variant="destructive"
                                                className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                {t('admin.remove')}
                                            </Button>
                                        </PermissionGate>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    )}
                </TableRow>
            );
        };

        const renderMobileCard = (item: any, index: number) => {
            if (dataType === 'trail') {
                return (
                    <div key={item.id} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</div>
                                <Badge variant="outline" className="mb-2">#{item.stockId || 'N/A'}</Badge>
                                <div className="font-semibold text-foreground">{item.product}</div>
                            </div>
                            <Badge
                                variant={item.type === 'removed' || item.type === 'reversal' ? "destructive" : "default"}
                                className={item.type === 'removed' || item.type === 'reversal' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}
                            >
                                {item.action}
                            </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.quantity')}:</span>
                                <span className="font-semibold">
                                    {item.category === 'Kilo'
                                        ? `${item.quantity} kg`
                                        : item.category
                                            ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                            : item.quantity
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.total_amount')}:</span>
                                <span className="font-semibold">
                                    {item.totalAmount === null ? 'N/A' : `₱${item.totalAmount.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.member')}:</span>
                                <span>{item.member}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.performed_by')}:</span>
                                <div className="text-right">
                                    <div className="font-medium">{item.performedBy || t('admin.system')}</div>
                                    {item.performedByType && (
                                        <div className="text-xs text-muted-foreground capitalize">{item.performedByType}</div>
                                    )}
                                </div>
                            </div>
                            {item.notes && (
                                <div className="pt-2 border-t border-border">
                                    <span className="text-xs text-muted-foreground">{item.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            if (dataType === 'sold') {
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
                    <div key={item.id} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline" className="mb-2">#{item.id}</Badge>
                                <div className="font-semibold text-foreground">{item.product?.name || '-'}</div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.quantity_sold')}:</span>
                                <span className="font-semibold">
                                    {item.category === 'Kilo'
                                        ? `${item.sold_quantity || 0} ${t('admin.kg_sold')}`
                                        : item.category
                                            ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} ${t('admin.sold_label')}`
                                            : `${item.sold_quantity || 0} ${t('admin.sold_label')}`
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.sold_date')}:</span>
                                <span className="font-medium">
                                    {item.sold_at ? new Date(item.sold_at).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.assigned_to')}:</span>
                                <span>{item.member?.name || t('admin.unassigned')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.performed_by')}:</span>
                                <div className="text-right">
                                    <div className="font-medium">{item.performedBy || t('admin.system')}</div>
                                    {item.performedByType && (
                                        <div className="text-xs text-muted-foreground capitalize">{item.performedByType}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin.total_amount')}:</span>
                                <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                );
            }

            // For regular stocks
            return (
                <div key={item.id} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2">#{item.id}</Badge>
                            <div className="font-semibold text-foreground">{item.product?.name || '-'}</div>
                            <Badge variant="secondary" className="text-xs mt-1">{item.category || '-'}</Badge>
                        </div>
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
                            {item.quantity > 10 ? t('admin.available') :
                                item.quantity > 0 ? t('admin.low_stock') : t('admin.out_of_stock')}
                        </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.quantity')}:</span>
                            <span className="font-semibold">
                                {dataType === 'stocks' && item.quantity === 0 ? (
                                    <span>
                                        {item.category === 'Kilo'
                                            ? `${item.sold_quantity || 0} ${t('admin.kg_sold')}`
                                            : item.category
                                                ? `${Math.floor(item.sold_quantity || 0)} ${item.category.toLowerCase()} ${t('admin.sold_label')}`
                                                : `${item.sold_quantity || 0} ${t('admin.sold_label')}`
                                        }
                                    </span>
                                ) : (
                                    <span>
                                        {item.category === 'Kilo'
                                            ? `${item.quantity} kg`
                                            : item.category
                                                ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                                                : item.quantity
                                        }
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.assigned_to')}:</span>
                            <span>{item.member?.name || t('admin.unassigned')}</span>
                        </div>
                    </div>
                    {dataType === 'stocks' && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                            <PermissionGate permission="edit stocks">
                                <Button 
                                    size="sm" 
                                    className="text-xs flex-1"
                                    onClick={() => handleEditStock(item)}
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    {t('ui.edit')}
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="delete stocks">
                                <Button
                                    disabled={processing}
                                    onClick={() => handleRemovePerishedStock(item)}
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </PermissionGate>
                        </div>
                    )}
                </div>
            );
        };

        return data.length > 0 ? (
            <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 mb-4">
                    {paginatedData?.map((item, index) => renderMobileCard(item, index))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
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
                    {dataType === 'trail' ? t('admin.no_stock_trail_data_available') :
                        dataType === 'sold' ? t('admin.no_sold_stocks_available') :
                            t('admin.no_stocks_available')}
                </h3>
                <p className="text-muted-foreground">
                    {dataType === 'trail' ? t('admin.stock_changes_appear_here') :
                        dataType === 'sold' ? t('admin.sold_stock_items_appear_here') :
                            t('admin.add_stock_to_products_see_here')}
                </p>
            </div>
        );
    };

    const getTransformedSoldStocks = () => {
        return soldStocks.map((stock: any) => ({
            ...stock,
            performedBy: stock.performed_by_user?.name || null,
            performedByType: stock.performed_by_type || stock.performed_by_user?.type || null
        }));
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
            let totalAmount: number | null = 0;
            if (trail.action_type === 'sale') {
                // For sales, calculate based on quantity sold
                totalAmount = quantityChange * price;
            } else if (trail.action_type === 'created' || trail.action_type === 'updated') {
                // For stock additions, calculate based on new quantity
                totalAmount = newQuantity * price;
            } else if (trail.action_type === 'removed') {
                // For removals, calculate based on the removed quantity
                totalAmount = quantityChange * price;
            } else if (trail.action_type === 'completed') {
                // For completed/sold out items, show N/A instead of amount
                totalAmount = null;
            }

            return {
                id: trail.id,
                stockId: trail.stock_id,
                type: trail.action_type,
                product: trail.product?.name || 'Unknown Product',
                quantity: quantityChange,
                category: trail.category || 'N/A',
                member: trail.member?.name || trail.performed_by_user?.name || 'Unknown',
                date: trail.created_at,
                notes: trail.notes || `Action: ${trail.action_type}`,
                action: getActionLabel(trail.action_type),
                oldQuantity: trail.old_quantity,
                newQuantity: trail.new_quantity,
                actionType: trail.action_type,
                totalAmount: totalAmount,
                performedBy: trail.performed_by_user?.name || null,
                performedByType: trail.performed_by_type || trail.performed_by_user?.type || null
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getActionLabel = (actionType: string) => {
        const labels: { [key: string]: string } = {
            'created': t('admin.action_added'),
            'updated': t('admin.action_updated'),
            'removed': t('admin.action_removed'),
            'restored': t('admin.action_restored'),
            'sale': t('admin.action_sale'),
            'reversal': t('admin.action_reversal'),
            'completed': t('admin.sold_out') // Changed from 'Completed' to 'Sold Out'
        };
        return labels[actionType] || actionType.charAt(0).toUpperCase() + actionType.slice(1);
    };


    return (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            {/* Header Section */}
            <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-border">
                {/* First Row: Title and Search Button */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.stock_management')}</h2>
                            <p className="text-sm text-muted-foreground m-0">
                                {t('admin.monitor_stock_levels')}
                            </p>
                        </div>
                    </div>
                    <div className="flex md:hidden">
                        <Button
                            variant={showStockSearch ? "default" : "outline"}
                            onClick={() => {
                                if (showStockSearch) {
                                    setStockSearchTerm('');
                                }
                                setShowStockSearch(!showStockSearch);
                            }}
                            size="sm"
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md w-full"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            {showStockSearch ? t('ui.hide_search') : t('ui.search')}
                        </Button>
                    </div>
                </div>

                {/* Second Row: Action Buttons (Mobile) / All Buttons (Desktop) */}
                <div className="flex gap-2 flex-wrap items-center md:justify-end">
                    {/* Search button - Desktop only */}
                    <div className="hidden md:block">
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
                            {showStockSearch ? t('ui.hide_search') : t('ui.search')}
                        </Button>
                    </div>

                    <Button
                        disabled={processing}
                        variant={currentView === 'stocks' ? "default" : "outline"}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex-1 md:flex-none text-xs sm:text-sm"
                        size="sm"
                        onClick={() => {
                            setCurrentView('stocks');
                            setStockCurrentPage(1);
                        }}
                    >
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {t('admin.current_stocks')}
                    </Button>
                    <PermissionGate permission="view stock trail">
                        <Button
                            disabled={processing}
                            variant={currentView === 'trail' ? "default" : "outline"}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex-1 md:flex-none text-xs sm:text-sm"
                            size="sm"
                            onClick={() => {
                                setCurrentView('trail');
                                setStockCurrentPage(1);
                            }}
                        >
                            <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t('admin.stock_trail')}
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="view sold stock">
                        <Button
                            disabled={processing}
                            variant={currentView === 'sold' ? "default" : "outline"}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex-1 md:flex-none text-xs sm:text-sm"
                            size="sm"
                            onClick={() => {
                                setCurrentView('sold');
                                setStockCurrentPage(1);
                            }}
                        >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t('admin.sold_history')}
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Stock Search Bar */}
            <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${showStockSearch ? styles.expanded : styles.collapsed
                }`}>
                <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                        <Input
                            type="text"
                            placeholder={t('admin.search_stocks_by_product_name')}
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
                    <div className="flex gap-3 flex-shrink-0 flex-wrap">
                        <Select value={selectedStockStatus} onValueChange={(value) => {
                            setSelectedStockStatus(value);
                            setStockCurrentPage(1);
                        }}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder={t('admin.all_status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.all_status')}</SelectItem>
                                <SelectItem value="available">{t('admin.available')}</SelectItem>
                                <SelectItem value="low">{t('admin.low_stock')}</SelectItem>
                                {/* "Out of Stock" removed - zero-quantity stocks are now in Stock Trail */}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStockCategory} onValueChange={setSelectedStockCategory}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder={t('admin.all_categories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.all_categories')}</SelectItem>
                                <SelectItem value="Kilo">Kilo</SelectItem>
                                <SelectItem value="Pc">{t('admin.category_pc')}</SelectItem>
                                <SelectItem value="Tali">Tali</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={`${stockSortBy}-${stockSortOrder}`} onValueChange={(value) => {
                            const [field, order] = value.split('-');
                            setStockSortBy(field);
                            setStockSortOrder(order as 'asc' | 'desc');
                        }}>
                            <SelectTrigger className="min-w-[160px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <SelectValue placeholder={t('admin.sort_by')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id-asc">{t('admin.sort_stock_id_asc')}</SelectItem>
                                <SelectItem value="id-desc">{t('admin.sort_stock_id_desc')}</SelectItem>
                                <SelectItem value="quantity-asc">{t('admin.sort_quantity_asc')}</SelectItem>
                                <SelectItem value="quantity-desc">{t('admin.sort_quantity_desc')}</SelectItem>
                                <SelectItem value="product-asc">{t('admin.sort_product_asc')}</SelectItem>
                                <SelectItem value="product-desc">{t('admin.sort_product_desc')}</SelectItem>
                                <SelectItem value="category-asc">{t('admin.sort_category_asc')}</SelectItem>
                                <SelectItem value="category-desc">{t('admin.sort_category_desc')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        {stockSearchTerm || selectedStockCategory !== 'all' || selectedStockStatus !== 'all'
                            ? t('admin.filtered_results')
                            : t('admin.ready_to_search_stocks')}
                    </span>
                    {(stockSearchTerm || selectedStockCategory !== 'all' || selectedStockStatus !== 'all') && (
                        <button
                            onClick={() => {
                                setStockSearchTerm('');
                                setSelectedStockCategory('all');
                                setSelectedStockStatus('all');
                                setStockSortBy('id');
                            }}
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                            type="button"
                        >
                            {t('admin.clear_filters')}
                        </button>
                    )}
                </div>
            </div>

            <div>
                {currentView === 'stocks' ? (
                    renderUnifiedTable(getFilteredStocks(selectedStockStatus), 'stocks', t('admin.current_stocks'))
                ) : (
                    <div>
                        {currentView === 'trail' && renderUnifiedTable(getCombinedTrailData(), 'trail', t('admin.stock_trail'))}
                        {currentView === 'sold' && renderUnifiedTable(getTransformedSoldStocks(), 'sold', t('admin.sold_history'))}
                    </div>
                )}
            </div>
        </div>
    );
};