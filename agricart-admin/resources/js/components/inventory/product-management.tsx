import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Plus, Archive, Edit, Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Product } from '@/types/inventory';
import { SafeImage } from '@/lib/image-utils';

interface ProductManagementProps {
    products: Product[];
    pagination?: PaginationData;
    processing: boolean;
    handleArchive: (id: number, name: string) => void;
    handleDelete: (id: number, name: string) => void;
    handleRestore: (id: number, name: string) => void;
    onDataChange?: (queryParams: Record<string, any>) => void;
    showArchived?: boolean;
    setShowArchived?: (show: boolean) => void;
    archivingProduct?: number | null;
    restoringProduct?: number | null;
}

export const ProductManagement = ({
    products,
    pagination,
    processing,
    handleArchive,
    handleDelete,
    handleRestore,
    onDataChange,
    showArchived = false,
    setShowArchived,
    archivingProduct,
    restoringProduct
}: ProductManagementProps) => {
    // Format currency
    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `₱${amount.toFixed(2)}`;
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'w-20'
        },
        {
            key: 'image',
            label: 'Image',
            sortable: false,
            className: 'w-20'
        },
        {
            key: 'name',
            label: 'Product Name',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'produce_type',
            label: 'Category',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'price_kilo',
            label: 'Price/Kilo',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'price_pc',
            label: 'Price/Piece',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'price_tali',
            label: 'Price/Tali',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'stock_status',
            label: 'Stock',
            sortable: false,
            className: 'w-24'
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'w-40'
        }
    ];

    // Render table row
    const renderProductRow = (product: Product, index: number) => (
        <TableRow
            key={product.id}
            className="transition-colors duration-150 hover:bg-muted/50"
        >
            <TableCell className="text-sm text-muted-foreground">
                {product.id}
            </TableCell>
            <TableCell>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {product.image ? (
                        <SafeImage
                            src={`/${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            fallback={
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                            }
                        />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm font-medium">
                <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm">
                {product.produce_type ? (
                    <Badge variant="outline" className="text-xs">
                        {product.produce_type}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatCurrency(product.price_kilo)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatCurrency(product.price_pc)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatCurrency(product.price_tali)}
            </TableCell>
            <TableCell>
                <Badge 
                    variant={product.has_stock ? "default" : "secondary"}
                    className="text-xs"
                >
                    {product.has_stock ? 'In Stock' : 'No Stock'}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(product.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    {product.archived_at ? (
                        // Archived product actions
                        <>
                            <PermissionGate permission="unarchive products">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleRestore(product.id, product.name)}
                                    disabled={processing || restoringProduct === product.id}
                                    className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Restore
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="delete archived products">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(product.id, product.name)}
                                    disabled={processing}
                                    className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </PermissionGate>
                        </>
                    ) : (
                        // Active product actions
                        <>
                            <PermissionGate permission="edit products">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                >
                                    <Link href={route('inventory.edit', product.id)}>
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="archive products">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleArchive(product.id, product.name)}
                                    disabled={processing || archivingProduct === product.id}
                                    className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </Button>
                            </PermissionGate>
                        </>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );

    // Filter component for showing/hiding archived products
    const filterComponent = setShowArchived ? (
        <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
        >
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
    ) : null;

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Product Inventory</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Manage your product catalog and inventory
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="create products">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('inventory.create')}>
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Unified Table */}
            <UnifiedTable
                data={products}
                columns={columns}
                pagination={pagination}
                onDataChange={onDataChange}
                renderRow={renderProductRow}
                emptyMessage="No products found"
                searchPlaceholder="Search products by name or category..."
                showSearch={true}
                showFilters={!!setShowArchived}
                filterComponent={filterComponent}
                loading={processing}
                tableStateOptions={{
                    defaultSort: {
                        column: 'name',
                        direction: 'asc'
                    },
                    maxPerPage: 10,
                    persistInUrl: true,
                    routeName: 'inventory.index'
                }}
            />
        </div>
    );
};