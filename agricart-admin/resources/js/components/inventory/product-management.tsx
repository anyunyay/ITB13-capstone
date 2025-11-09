import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Plus, Archive, Edit, Trash2, Search, Filter } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { PaginationControls } from './pagination-controls';
import { ViewToggle } from './view-toggle';
import { ProductTable } from './product-table';
import { Product } from '@/types/inventory';
import { useState } from 'react';
import styles from '../../pages/Admin/Inventory/inventory.module.css';
import { useTranslation } from '@/hooks/use-translation';

interface ProductManagementProps {
    products: Product[];
    categories: string[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    filteredAndSortedProducts: Product[];
    paginatedProducts: Product[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalProducts: number;
    itemsPerPage: number;
    processing: boolean;
    handleArchive: (id: number, name: string) => void;
    handleDelete: (id: number, name: string) => void;
    handleRestore: (id: number, name: string) => void;
    showArchived: boolean;
    setShowArchived: (show: boolean) => void;
    archivingProduct: number | null;
    restoringProduct: number | null;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    currentView: 'cards' | 'table';
    setCurrentView: (view: 'cards' | 'table') => void;
}

export const ProductManagement = ({
    products,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedProducts,
    paginatedProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    totalProducts,
    itemsPerPage,
    processing,
    handleArchive,
    handleDelete,
    handleRestore,
    showArchived,
    setShowArchived,
    archivingProduct,
    restoringProduct,
    showSearch,
    setShowSearch,
    currentView,
    setCurrentView
}: ProductManagementProps) => {
    const t = useTranslation();

    // Helper function to check if a product is being processed
    const isProductProcessing = (productId: number) => {
        return archivingProduct === productId || restoringProduct === productId;
    };

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
                    <div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm text-center p-4">
                        <div>
                            <Package class="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div class="font-medium">${productName}</div>
                            <div class="text-xs mt-1">${t('admin.image_not_available')}</div>
                        </div>
                    </div>
                `;
            }
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="mb-4 pb-3 border-b border-border">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg flex items-center justify-center flex-shrink-0" />
                        <div>
                            <h2 className="text-xl font-semibold text-foreground m-0 mb-1 leading-tight">
                                {showArchived ? t('admin.archived_products') : t('admin.product_management')}
                            </h2>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                {showArchived
                                    ? t('admin.view_and_manage_archived_products')
                                    : t('admin.manage_your_product_catalog')
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                        <Button
                            variant={showSearch ? "default" : "outline"}
                            onClick={() => {
                                if (showSearch) {
                                    setSearchTerm('');
                                }
                                setShowSearch(!showSearch);
                            }}
                            size="sm"
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            {showSearch ? t('ui.hide_search') : t('ui.search')}
                        </Button>
                        <PermissionGate permission="view archive">
                            <Button
                                variant={showArchived ? "default" : "outline"}
                                size="sm"
                                className="bg-background text-foreground border border-border hover:bg-muted hover:border-primary"
                                onClick={() => setShowArchived(!showArchived)}
                            >
                                <Archive className="h-4 w-4" />
                                {showArchived ? t('admin.active_products') : t('admin.archived_products')}
                            </Button>
                        </PermissionGate>
                        <ViewToggle
                            currentView={currentView}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>
            </div>

            {/* Compact Search and Filter Controls */}
            <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${showSearch ? styles.expanded : styles.collapsed
                }`}>
                <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                        <Input
                            type="text"
                            placeholder={t('admin.search_products')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 p-1 min-w-auto h-6 w-6 rounded-full bg-muted text-muted-foreground border-none hover:bg-destructive hover:text-destructive-foreground"
                            >
                                ×
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder={t('admin.all_categories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.all_categories')}</SelectItem>
                                {categories?.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                            const [field, order] = value.split('-');
                            setSortBy(field);
                            setSortOrder(order as 'asc' | 'desc');
                        }}>
                            <SelectTrigger className="min-w-[160px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                <SelectValue placeholder={t('admin.sort_by')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name-asc">{t('admin.sort_name_asc')}</SelectItem>
                                <SelectItem value="name-desc">{t('admin.sort_name_desc')}</SelectItem>
                                <SelectItem value="type-asc">{t('admin.sort_category_asc')}</SelectItem>
                                <SelectItem value="type-desc">{t('admin.sort_category_desc')}</SelectItem>
                                <SelectItem value="price-asc">{t('admin.sort_price_asc')}</SelectItem>
                                <SelectItem value="price-desc">{t('admin.sort_price_desc')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        {filteredAndSortedProducts?.length || 0} {t('admin.of')} {products?.length || 0} {t('admin.products')}
                    </span>
                </div>
            </div>

            <div>
                {totalProducts === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm || selectedCategory !== 'all' ? t('admin.no_products_match_criteria') : t('admin.no_products_found')}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedCategory !== 'all'
                                ? t('admin.try_adjusting_search_filters')
                                : t('admin.get_started_creating_product')
                            }
                        </p>
                        {!searchTerm && selectedCategory === 'all' && (
                            <PermissionGate permission="create products">
                                <Button asChild className="mt-4">
                                    <Link href={route('inventory.create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('admin.create_product')}
                                    </Link>
                                </Button>
                            </PermissionGate>
                        )}
                    </div>
                ) : (
                    <>
                        {currentView === 'cards' ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
                                {paginatedProducts?.map((product) => (
                                    <Card key={product.id} className={`bg-card border border-border rounded-lg shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-full box-border hover:shadow-md hover:-translate-y-0.5 ${product.archived_at ? 'opacity-70 bg-[color-mix(in_srgb,var(--card)_90%,var(--muted)_10%)] border-[color-mix(in_srgb,var(--border)_80%,var(--muted)_20%)]' : ''}`}>
                                        <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
                                            <img
                                                src={product.image_url || `/storage/products/${product.image}` || '/storage/fallback-photo.png'}
                                                alt={product.name}
                                                onError={(e) => handleImageError(e, product.name)}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                            <div className="absolute top-2.5 right-2.5 z-10">
                                                <Badge variant="secondary" className="inline-block px-2.5 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-full shadow-sm backdrop-blur-sm">
                                                    {product.produce_type}
                                                </Badge>
                                                {product.archived_at && (
                                                    <Badge variant="destructive" className="ml-2 text-xs px-2 py-1">
                                                        {t('admin.archived')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <CardHeader className="p-5 flex flex-col gap-4 flex-1 justify-between box-border overflow-hidden">
                                            <div className="flex flex-col gap-3 flex-1">
                                                <CardTitle className="text-lg font-semibold text-card-foreground leading-tight m-0 min-h-[2.75rem] line-clamp-2">{product.name}</CardTitle>
                                                <CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-snug m-0 min-h-[3.5rem] text-ellipsis overflow-hidden">
                                                    {product.description}
                                                </CardDescription>
                                            </div>

                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex flex-col gap-2 w-full">
                                                    {product.price_kilo && (
                                                        <div className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center">{t('admin.label_kilo')}</span>
                                                            <span className="text-sm font-bold text-card-foreground flex items-center text-right">₱{product.price_kilo}</span>
                                                        </div>
                                                    )}
                                                    {product.price_pc && (
                                                        <div className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center">{t('admin.label_piece')}</span>
                                                            <span className="text-sm font-bold text-card-foreground flex items-center text-right">₱{product.price_pc}</span>
                                                        </div>
                                                    )}
                                                    {product.price_tali && (
                                                        <div className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center">{t('admin.label_tali')}</span>
                                                            <span className="text-sm font-bold text-card-foreground flex items-center text-right">₱{product.price_tali}</span>
                                                        </div>
                                                    )}
                                                    {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                                        <div className="text-sm text-muted-foreground text-center py-3 bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] rounded-lg border border-dashed border-border min-h-[2.625rem] flex items-center justify-center">{t('admin.no_prices_set')}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardFooter className="flex flex-col gap-3 p-5 pt-0 flex-shrink-0 w-full box-border overflow-hidden">
                                            {!product.archived_at && (
                                                <PermissionGate permission="create stocks">
                                                    <Button asChild disabled={processing} className="w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm min-h-[2.875rem] hover:-translate-y-0.5 hover:shadow-lg">
                                                        <Link href={route('inventory.addStock', product.id)}>
                                                            <Plus className="h-4 w-4" />
                                                            {t('admin.add_stock')}
                                                        </Link>
                                                    </Button>
                                                </PermissionGate>
                                            )}

                                            <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                                                {!product.archived_at && (
                                                    <PermissionGate permission="edit products">
                                                        <Button asChild disabled={processing} className="py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 min-h-[2.625rem] w-full box-border overflow-hidden text-ellipsis whitespace-nowrap hover:-translate-y-0.5 hover:shadow-sm">
                                                            <Link href={route('inventory.edit', product.id)}>
                                                                <Edit className="h-4 w-4 flex-shrink-0" />
                                                                {t('ui.edit')}
                                                            </Link>
                                                        </Button>
                                                    </PermissionGate>
                                                )}

                                                {!product.archived_at ? (
                                                    <PermissionGate permission="archive products">
                                                        {product.has_stock ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="w-full block">
                                                                        <Button
                                                                            disabled={true}
                                                                            variant="outline"
                                                                            className="py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 min-h-[2.625rem] w-full box-border overflow-hidden text-ellipsis whitespace-nowrap opacity-60 cursor-not-allowed"
                                                                        >
                                                                            <Archive className="h-4 w-4 flex-shrink-0" />
                                                                            {t('admin.archive_product')}
                                                                        </Button>
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    <p>{t('admin.cannot_archive_product_has_stock')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Button
                                                                disabled={processing || archivingProduct === product.id}
                                                                onClick={() => handleArchive(product.id, product.name)}
                                                                variant="outline"
                                                                className="py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 min-h-[2.625rem] w-full box-border overflow-hidden text-ellipsis whitespace-nowrap hover:-translate-y-0.5 hover:shadow-sm"
                                                            >
                                                                <Archive className="h-4 w-4 flex-shrink-0" />
                                                                {archivingProduct === product.id ? t('admin.archiving') : t('admin.archive_product')}
                                                            </Button>
                                                        )}
                                                    </PermissionGate>
                                                ) : (
                                                    <PermissionGate permission="unarchive products">
                                                        <Button
                                                            disabled={processing || restoringProduct === product.id}
                                                            onClick={() => handleRestore(product.id, product.name)}
                                                            variant="outline"
                                                            className="py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 min-h-[2.625rem] w-full box-border overflow-hidden text-ellipsis whitespace-nowrap hover:-translate-y-0.5 hover:shadow-sm"
                                                        >
                                                            <Archive className="h-4 w-4 flex-shrink-0" />
                                                            {restoringProduct === product.id ? t('admin.restoring') : t('admin.restore_product')}
                                                        </Button>
                                                    </PermissionGate>
                                                )}

                                                <PermissionGate permission={product.archived_at ? "delete archived products" : "delete products"}>
                                                    <Button
                                                        disabled={processing}
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        variant="destructive"
                                                        className="py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 min-h-[2.625rem] w-full box-border overflow-hidden text-ellipsis whitespace-nowrap hover:-translate-y-0.5 hover:shadow-sm"
                                                    >
                                                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                                                        {t('ui.delete')}
                                                    </Button>
                                                </PermissionGate>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <ProductTable
                                products={paginatedProducts}
                                processing={processing}
                                handleArchive={handleArchive}
                                handleDelete={handleDelete}
                                handleRestore={handleRestore}
                                archivingProduct={archivingProduct}
                                restoringProduct={restoringProduct}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                setSortBy={setSortBy}
                                setSortOrder={setSortOrder}
                            />
                        )}

                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalProducts}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
