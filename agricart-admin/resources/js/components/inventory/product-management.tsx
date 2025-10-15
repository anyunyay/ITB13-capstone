import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Plus, Archive, Edit, Trash2, Search, Filter } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { useSystemLock } from '@/hooks/use-system-lock';
import { PaginationControls } from './pagination-controls';
import { Product } from '@/types/inventory';
import styles from '../../pages/Admin/Inventory/inventory.module.css';

interface ProductManagementProps {
    products: Product[];
    categories: string[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
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
    restoringProduct
}: ProductManagementProps) => {
    const { shouldDisableButtons } = useSystemLock();
    
    // Helper function to check if a product is being processed
    const isProductProcessing = (productId: number) => {
        return archivingProduct === productId || restoringProduct === productId;
    };

    return (
        <div className={styles.productManagementSection}>
            <div className={styles.optimizedHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.titleGroup}>
                        <Package className={styles.compactIcon} />
                        <div>
                            <h2 className={styles.compactTitle}>
                                {showArchived ? 'Archived Products' : 'Product Management'}
                            </h2>
                            <p className={styles.compactSubtitle}>
                                {showArchived 
                                    ? 'View and manage archived products'
                                    : 'Manage your product catalog, inventory, and stock levels'
                                }
                            </p>
                        </div>
                    </div>
                    <div className={styles.compactActions}>
                        <PermissionGate permission="create products">
                            <Button asChild size="sm" className={styles.primaryAction}>
                                <Link href={route('inventory.create')}>
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </Link>
                            </Button>
                        </PermissionGate>
                        <PermissionGate permission="view archive">
                            <Button 
                                variant={showArchived ? "default" : "outline"} 
                                size="sm" 
                                className={styles.secondaryAction}
                                onClick={() => setShowArchived(!showArchived)}
                            >
                                <Archive className="h-4 w-4" />
                                {showArchived ? 'Active Products' : 'Archived Products'}
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            </div>

            {/* Compact Search and Filter Controls */}
            <div className={styles.compactSearchFilter}>
                <div className={styles.searchRow}>
                    <div className={styles.searchInputContainer}>
                        <Search className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                className={styles.clearButton}
                            >
                                ×
                            </Button>
                        )}
                    </div>
                    <div className={styles.filterRow}>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className={styles.compactSelect}>
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className={styles.compactSelect}>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="type">Category</SelectItem>
                                <SelectItem value="price">Price (Low to High)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        {filteredAndSortedProducts?.length || 0} of {products?.length || 0} products
                    </span>
                </div>
            </div>

            <div className={styles.sectionContent}>
                {totalProducts === 0 ? (
                    <div className={styles.emptyState}>
                        <Package className={styles.emptyStateIcon} />
                        <h3 className={styles.emptyStateTitle}>
                            {searchTerm || selectedCategory !== 'all' ? 'No products match your criteria' : 'No products found'}
                        </h3>
                        <p className={styles.emptyStateDescription}>
                            {searchTerm || selectedCategory !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by creating your first product.'
                            }
                        </p>
                        {!searchTerm && selectedCategory === 'all' && (
                            <PermissionGate permission="create products">
                                <Button asChild className={styles.emptyStateAction}>
                                    <Link href={route('inventory.create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Product
                                    </Link>
                                </Button>
                            </PermissionGate>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={styles.productGrid}>
                            {paginatedProducts?.map((product) => (
                                <Card key={product.id} className={`${styles.productCard} ${product.archived_at ? styles.archivedCard : ''}`}>
                                    <div className={styles.productImageContainer}>
                                        <img 
                                            src={product.image_url || product.image} 
                                            alt={product.name}
                                            className={styles.productImage}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/products/default-product.jpg';
                                            }}
                                        />
                                        <div className={styles.productTypeBadge}>
                                            <Badge variant="secondary" className={styles.productType}>
                                                {product.produce_type}
                                            </Badge>
                                            {product.archived_at && (
                                                <Badge variant="destructive" className={styles.archivedBadge}>
                                                    Archived
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <CardHeader className={styles.productCardContent}>
                                        <div className={styles.productInfo}>
                                            <CardTitle className={styles.productTitle}>{product.name}</CardTitle>
                                            <CardDescription className={styles.productDescription}>
                                                {product.description}
                                            </CardDescription>
                                        </div>
                                        
                                        <div className={styles.productBottom}>
                                            <div className={styles.productPrices}>
                                                {product.price_kilo && (
                                                    <div className={styles.priceItem}>
                                                        <span className={styles.priceLabel}>Kilo:</span> 
                                                        <span className={styles.priceValue}>₱{product.price_kilo}</span>
                                                    </div>
                                                )}
                                                {product.price_pc && (
                                                    <div className={styles.priceItem}>
                                                        <span className={styles.priceLabel}>Piece:</span> 
                                                        <span className={styles.priceValue}>₱{product.price_pc}</span>
                                                    </div>
                                                )}
                                                {product.price_tali && (
                                                    <div className={styles.priceItem}>
                                                        <span className={styles.priceLabel}>Tali:</span> 
                                                        <span className={styles.priceValue}>₱{product.price_tali}</span>
                                                    </div>
                                                )}
                                                {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                                    <div className={styles.noPriceMessage}>No prices set</div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardFooter className={styles.productActions}>
                                        {!product.archived_at && (
                                            <PermissionGate permission="create stocks">
                                                <Button asChild disabled={processing} className={styles.primaryActionButton}>
                                                    <Link href={route('inventory.addStock', product.id)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Stock
                                                    </Link>
                                                </Button>
                                            </PermissionGate>
                                        )}
                                        
                                        <div className={styles.productActionRow}>
                                            {!product.archived_at && (
                                                <PermissionGate permission="edit products">
                                                    {shouldDisableButtons ? (
                                                        <Button disabled={processing || shouldDisableButtons} className={styles.secondaryActionButton}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                    ) : (
                                                        <Button asChild disabled={processing} className={styles.secondaryActionButton}>
                                                            <Link href={route('inventory.edit', product.id)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </PermissionGate>
                                            )}
                                            
                                            {!product.archived_at ? (
                                                <PermissionGate permission="archive products">
                                                    <Button 
                                                        disabled={processing || shouldDisableButtons || archivingProduct === product.id} 
                                                        onClick={() => handleArchive(product.id, product.name)}
                                                        variant="outline"
                                                        className={styles.secondaryActionButton}
                                                    >
                                                        <Archive className="h-4 w-4 mr-2" />
                                                        {archivingProduct === product.id ? 'Archiving...' : 'Archive'}
                                                    </Button>
                                                </PermissionGate>
                                            ) : (
                                                <PermissionGate permission="unarchive products">
                                                    <Button 
                                                        disabled={processing || shouldDisableButtons || restoringProduct === product.id} 
                                                        onClick={() => handleRestore(product.id, product.name)}
                                                        variant="outline"
                                                        className={styles.secondaryActionButton}
                                                    >
                                                        <Archive className="h-4 w-4 mr-2" />
                                                        {restoringProduct === product.id ? 'Restoring...' : 'Restore'}
                                                    </Button>
                                                </PermissionGate>
                                            )}
                                            
                                            <PermissionGate permission={product.archived_at ? "delete archived products" : "delete products"}>
                                                <Button 
                                                    disabled={processing || shouldDisableButtons} 
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    variant="destructive"
                                                    className={styles.secondaryActionButton}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {product.archived_at ? 'Delete' : 'Delete'}
                                                </Button>
                                            </PermissionGate>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

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
