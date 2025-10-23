import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Edit, Archive, Trash2, Package, DollarSign, Tag, Eye } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Product } from '@/types/inventory';
import styles from '../../pages/Admin/Inventory/inventory.module.css';

interface ProductTableProps {
    products: Product[];
    processing: boolean;
    handleArchive: (id: number, name: string) => void;
    handleDelete: (id: number, name: string) => void;
    handleRestore: (id: number, name: string) => void;
    archivingProduct: number | null;
    restoringProduct: number | null;
}

export const ProductTable = ({
    products,
    processing,
    handleArchive,
    handleDelete,
    handleRestore,
    archivingProduct,
    restoringProduct
}: ProductTableProps) => {
    const getStatusBadge = (archived_at: string | null) => {
        if (archived_at) {
            return <Badge variant="destructive" className={styles.statusArchived}>Archived</Badge>;
        }
        return <Badge variant="default" className={styles.statusActive}>Active</Badge>;
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">
                    No products match your current filters.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table className="w-full border-collapse text-sm">
                <TableHeader className={styles.inventoryTableHeader}>
                    <TableRow>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product
                            </div>
                        </TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Category
                            </div>
                        </TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Prices
                            </div>
                        </TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Status</TableHead>
                        <TableHead className="px-4 py-3 lg:px-3 md:px-2 sm:px-1 text-left text-xs lg:text-xs md:text-xs sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow 
                            key={product.id} 
                            className={`border-b border-border transition-all duration-150 ease-in-out bg-card hover:bg-muted/20 hover:-translate-y-px hover:shadow-md ${product.archived_at ? styles.archivedRow : ''}`}
                        >
                            <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top ${styles.inventoryTableCell}`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 lg:w-12 lg:h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            src={product.image_url || product.image} 
                                            alt={product.name}
                                            className="w-12 h-12 lg:w-12 lg:h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-lg object-cover border border-border"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/products/default-product.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-foreground truncate">{product.name}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-2">{product.description}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top ${styles.inventoryTableCell}`}>
                                <Badge variant="secondary" className="text-xs">
                                    {product.produce_type}
                                </Badge>
                            </TableCell>
                            <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top ${styles.inventoryTableCell}`}>
                                <div className="space-y-1">
                                    {product.price_kilo && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Kilo: </span>
                                            <span className="font-medium">₱{product.price_kilo}</span>
                                        </div>
                                    )}
                                    {product.price_pc && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Piece: </span>
                                            <span className="font-medium">₱{product.price_pc}</span>
                                        </div>
                                    )}
                                    {product.price_tali && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Tali: </span>
                                            <span className="font-medium">₱{product.price_tali}</span>
                                        </div>
                                    )}
                                    {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                        <span className="text-sm text-muted-foreground">No prices set</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top ${styles.inventoryTableCell}`}>
                                {getStatusBadge(product.archived_at)}
                            </TableCell>
                            <TableCell className={`px-4 py-4 lg:px-3 lg:py-3 md:px-2 md:py-3 sm:px-1 sm:py-2 text-sm lg:text-sm md:text-sm sm:text-xs text-foreground align-top ${styles.inventoryTableCell}`}>
                                <div className="flex items-center gap-1 flex-nowrap overflow-x-auto">
                                    {!product.archived_at && (
                                        <PermissionGate permission="create stocks">
                                            <Button asChild variant="outline" size="sm" className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap">
                                                <Link href={route('inventory.addStock', product.id)}>
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Stock
                                                </Link>
                                            </Button>
                                        </PermissionGate>
                                    )}
                                    
                                    {!product.archived_at && (
                                        <PermissionGate permission="edit products">
                                            <Button asChild variant="outline" size="sm" className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap">
                                                <Link href={route('inventory.edit', product.id)}>
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </PermissionGate>
                                    )}
                                    
                                    {!product.archived_at ? (
                                        <PermissionGate permission="archive products">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap"
                                                disabled={processing || archivingProduct === product.id}
                                                onClick={() => handleArchive(product.id, product.name)}
                                            >
                                                <Archive className="h-3 w-3 mr-1" />
                                                {archivingProduct === product.id ? 'Archiving...' : 'Archive'}
                                            </Button>
                                        </PermissionGate>
                                    ) : (
                                        <PermissionGate permission="unarchive products">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap"
                                                disabled={processing || restoringProduct === product.id}
                                                onClick={() => handleRestore(product.id, product.name)}
                                            >
                                                <Archive className="h-3 w-3 mr-1" />
                                                {restoringProduct === product.id ? 'Restoring...' : 'Restore'}
                                            </Button>
                                        </PermissionGate>
                                    )}
                                    
                                    <PermissionGate permission={product.archived_at ? "delete archived products" : "delete products"}>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            className="text-xs px-2 py-1 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm whitespace-nowrap"
                                            disabled={processing}
                                            onClick={() => handleDelete(product.id, product.name)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </PermissionGate>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
