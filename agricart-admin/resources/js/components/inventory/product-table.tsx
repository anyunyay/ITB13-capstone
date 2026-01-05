import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Edit, Archive, Trash2, Package, DollarSign, Tag, ArrowUpDown, ArrowUp, ArrowDown, ArchiveRestore } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Product } from '@/types/inventory';
import styles from '../../pages/Admin/Inventory/inventory.module.css';
import { useTranslation } from '@/hooks/use-translation';

interface ProductTableProps {
    products: Product[];
    processing: boolean;
    handleArchive: (id: number, name: string) => void;
    handleDelete: (id: number, name: string) => void;
    handleRestore: (id: number, name: string) => void;
    handleAddStock: (id: number, name: string) => void;
    archivingProduct: number | null;
    restoringProduct: number | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    setSortBy: (sort: string) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    showArchived: boolean;
}

export const ProductTable = ({
    products,
    processing,
    handleArchive,
    handleDelete,
    handleRestore,
    handleAddStock,
    archivingProduct,
    restoringProduct,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    showArchived
}: ProductTableProps) => {
    const t = useTranslation();

    // Helper function to handle image error with cascading fallback
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, productName: string) => {
        const target = e.target as HTMLImageElement;
        const fallbackPath = '/storage/fallback-photo.png';

        // If current src is not the fallback, try fallback first
        if (target.src !== window.location.origin + fallbackPath) {
            target.src = fallbackPath;
        } else {
            // If fallback also failed, hide image and show alt text
            target.style.display = 'none';
            const container = target.parentElement;
            if (container) {
                container.innerHTML = `
                    <div class="w-12 h-12 lg:w-12 lg:h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-lg border border-border flex items-center justify-center bg-muted text-muted-foreground">
                        <div class="text-center">
                            <div class="text-xs font-medium truncate">${productName.substring(0, 8)}</div>
                            <div class="text-xs opacity-75">${t('admin.no_image')}</div>
                        </div>
                    </div>
                `;
            }
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4" /> :
            <ArrowDown className="h-4 w-4" />;
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_products_found')}</h3>
                <p className="text-muted-foreground">
                    {t('admin.no_products_match_filters')}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card View - Hidden on md and up */}
            <div className="md:hidden space-y-3">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`bg-card border border-border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md ${product.archived_at ? 'opacity-70 bg-muted/20' : ''}`}
                    >
                        <div className="flex gap-3 mb-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={product.image_url || `/storage/products/${product.image}` || '/storage/fallback-photo.png'}
                                    alt={product.name}
                                    onError={(e) => handleImageError(e, product.name)}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <Badge variant="secondary" className="text-xs mb-2">
                                    {product.produce_type}
                                </Badge>
                                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                                {showArchived && product.archived_at && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 bg-muted/30 px-2 py-1.5 rounded-md">
                                        <Archive className="h-3 w-3 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">{t('admin.archived_on')}: </span>
                                            <span className="text-foreground">
                                                {new Date(product.archived_at).toLocaleDateString()} {new Date(product.archived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-3 pb-3 border-b border-border">
                            {product.price_kilo && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{t('admin.price_per_kilo')}:</span>
                                    <span className="font-medium">₱{product.price_kilo}</span>
                                </div>
                            )}
                            {product.price_pc && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{t('admin.price_per_piece')}:</span>
                                    <span className="font-medium">₱{product.price_pc}</span>
                                </div>
                            )}
                            {product.price_tali && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{t('admin.price_per_tali')}:</span>
                                    <span className="font-medium">₱{product.price_tali}</span>
                                </div>
                            )}
                            {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                <span className="text-xs text-muted-foreground">{t('admin.no_prices_set')}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {!product.archived_at && (
                                <PermissionGate permission="create stocks">
                                    <Button 
                                        variant="default" 
                                        size="sm" 
                                        className="text-xs flex-1"
                                        onClick={() => handleAddStock(product.id, product.name)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {t('admin.add_stock')}
                                    </Button>
                                </PermissionGate>
                            )}

                            {!product.archived_at && (
                                <PermissionGate permission="edit products">
                                    <Button asChild variant="outline" size="sm" className="text-xs">
                                        <Link href={route('inventory.edit', product.id)}>
                                            <Edit className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </PermissionGate>
                            )}

                            {showArchived ? (
                                <PermissionGate permission="unarchive products">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        disabled={processing || restoringProduct === product.id}
                                        onClick={() => handleRestore(product.id, product.name)}
                                    >
                                        <ArchiveRestore className="h-3 w-3" />
                                    </Button>
                                </PermissionGate>
                            ) : (
                                <PermissionGate permission="archive products">
                                    {product.has_stock ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs opacity-60 cursor-not-allowed"
                                                        disabled={true}
                                                    >
                                                        <Archive className="h-3 w-3" />
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('admin.cannot_archive_product_has_stock')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={processing || archivingProduct === product.id}
                                            onClick={() => handleArchive(product.id, product.name)}
                                        >
                                            <Archive className="h-3 w-3" />
                                        </Button>
                                    )}
                                </PermissionGate>
                            )}

                            <PermissionGate permission={product.archived_at ? "delete archived products" : "delete products"}>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs"
                                    disabled={processing}
                                    onClick={() => handleDelete(product.id, product.name)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </PermissionGate>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table className="w-full border-collapse text-sm">
                    <TableHeader className={styles.inventoryTableHeader}>
                        <TableRow>
                            <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                                >
                                    <Package className="h-4 w-4" />
                                    {t('admin.product')}
                                    {getSortIcon('name')}
                                </button>
                            </TableHead>
                            <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('type')}
                                    className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                                >
                                    <Tag className="h-4 w-4" />
                                    {t('admin.category')}
                                    {getSortIcon('type')}
                                </button>
                            </TableHead>
                            <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('price')}
                                    className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    {t('admin.prices')}
                                    {getSortIcon('price')}
                                </button>
                            </TableHead>
                            {showArchived && (
                                <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('archived_at')}
                                        className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                                    >
                                        <Archive className="h-4 w-4" />
                                        {t('admin.archived_on')}
                                        {getSortIcon('archived_at')}
                                    </button>
                                </TableHead>
                            )}
                            <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-center text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">{t('admin.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                className={`border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md ${product.archived_at ? styles.archivedRow : ''}`}
                            >
                                <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 ${styles.inventoryTableCell}`}>
                                    <div className="flex justify-center min-h-[40px] py-2 w-full">
                                        <div className="w-full text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 lg:w-12 lg:h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={product.image_url || `/storage/products/${product.image}` || '/storage/fallback-photo.png'}
                                                        alt={product.name}
                                                        onError={(e) => handleImageError(e, product.name)}
                                                        className="w-12 h-12 lg:w-12 lg:h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-lg object-cover border border-border"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-foreground truncate">{product.name}</div>
                                                    <div className="text-sm text-muted-foreground line-clamp-2">{product.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 ${styles.inventoryTableCell}`}>
                                    <div className="flex justify-center min-h-[40px] py-2 w-full">
                                        <div className="w-full text-center flex justify-center">
                                            <Badge variant="secondary" className="text-xs">
                                                {product.produce_type}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 ${styles.inventoryTableCell}`}>
                                    <div className="flex justify-center min-h-[40px] py-2 w-full">
                                        <div className="w-full text-left">
                                            <div className="space-y-1">
                                                {product.price_kilo && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">{t('admin.price_per_kilo')}: </span>
                                                        <span className="float-right text-right font-medium">₱{product.price_kilo}</span>
                                                    </div>
                                                )}
                                                {product.price_pc && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">{t('admin.price_per_piece')}: </span>
                                                        <span className="float-right texttext-right font-medium">₱{product.price_pc}</span>
                                                    </div>
                                                )}
                                                {product.price_tali && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">{t('admin.price_per_tali')}: </span>
                                                        <span className="float-right texttext-right font-medium">₱{product.price_tali}</span>
                                                    </div>
                                                )}
                                                {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                                    <span className="text-sm text-muted-foreground">{t('admin.no_prices_set')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                {showArchived && (
                                    <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 ${styles.inventoryTableCell}`}>
                                        <div className="flex justify-center min-h-[40px] py-2 w-full">
                                            <div className="w-full text-center">
                                                {product.archived_at ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-foreground">
                                                            {new Date(product.archived_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(product.archived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 ${styles.inventoryTableCell}`}>
                                    <div className="flex justify-center min-h-[40px] py-2 w-full">
                                        <div className="w-full text-center">
                                            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto justify-center">
                                                {!product.archived_at && (
                                                    <PermissionGate permission="create stocks">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                                            onClick={() => handleAddStock(product.id, product.name)}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            {t('admin.add_stock')}
                                                        </Button>
                                                    </PermissionGate>
                                                )}

                                                {!product.archived_at && (
                                                    <PermissionGate permission="edit products">
                                                        <Button asChild variant="outline" size="sm" className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap">
                                                            <Link href={route('inventory.edit', product.id)}>
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                {t('ui.edit')}
                                                            </Link>
                                                        </Button>
                                                    </PermissionGate>
                                                )}

                                                {showArchived ? (
                                                    <PermissionGate permission="unarchive products">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                                            disabled={processing || restoringProduct === product.id}
                                                            onClick={() => handleRestore(product.id, product.name)}
                                                        >
                                                            <ArchiveRestore className="h-3 w-3 mr-1" />
                                                            {restoringProduct === product.id ? t('admin.restoring') : t('admin.restore')}
                                                        </Button>
                                                    </PermissionGate>
                                                ) : (
                                                    <PermissionGate permission="archive products">
                                                        {product.has_stock ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="inline-block">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-xs px-2 py-1 transition-all duration-200 ease-in-out whitespace-nowrap opacity-60 cursor-not-allowed"
                                                                            disabled={true}
                                                                        >
                                                                            <Archive className="h-3 w-3 mr-1" />
                                                                            {t('admin.archive_product')}
                                                                        </Button>
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('admin.cannot_archive_product_has_stock')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                                                disabled={processing || archivingProduct === product.id}
                                                                onClick={() => handleArchive(product.id, product.name)}
                                                            >
                                                                <Archive className="h-3 w-3 mr-1" />
                                                                {archivingProduct === product.id ? t('admin.archiving') : t('admin.archive_product')}
                                                            </Button>
                                                        )}
                                                    </PermissionGate>
                                                )}

                                                <PermissionGate permission={product.archived_at ? "delete archived products" : "delete products"}>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:opacity-90 whitespace-nowrap"
                                                        disabled={processing}
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        {t('ui.delete')}
                                                    </Button>
                                                </PermissionGate>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};
