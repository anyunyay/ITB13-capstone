import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { AlertTriangle, Package, Warehouse } from 'lucide-react';
import animations from './animations.module.css';
import { PermissionGate } from '@/components/permission-gate';
import { FlashMessage } from '@/components/flash-message';
import { PermissionGuard } from '@/components/permission-guard';
import { DashboardHeader } from '@/components/inventory/dashboard-header';
import { ProductManagement } from '@/components/inventory/product-management';
import { StockManagement } from '@/components/inventory/stock-management';
import { RemoveStockModal } from '@/components/inventory/remove-stock-modal';
import { ArchiveProductModal } from '@/components/inventory/archive-product-modal';
import { RestoreProductModal } from '@/components/inventory/restore-product-modal';
import { DeleteProductModal } from '@/components/inventory/delete-product-modal';
import { Product, Stock, RemovedStock, SoldStock, AuditTrail } from '@/types/inventory';

interface PageProps extends SharedData {
    products: Product[];
    archivedProducts: Product[];
    stocks: Stock[];
    removedStocks: RemovedStock[];
    soldStocks: SoldStock[];
    auditTrails: AuditTrail[];
    categories: string[];
    errors: {
        archive?: string;
        delete?: string;
    };
}

export default function InventoryIndex() {
    const { products = [], archivedProducts = [], stocks = [], removedStocks = [], soldStocks = [], auditTrails = [], categories = [], errors = {} } = usePage<PageProps>().props;
    const { flash } = usePage<PageProps>().props;

    // Toggle state for switching between Product and Stock management
    const [activeTab, setActiveTab] = useState<'products' | 'stocks'>('products');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [showArchived, setShowArchived] = useState(false);

    // Reset pagination when switching views
    const toggleArchivedView = (show: boolean) => {
        setShowArchived(show);
        setCurrentPage(1); // Reset to first page when switching views
    };

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12); // 12 products per page for better focus
    const [stockCurrentPage, setStockCurrentPage] = useState(1);
    const [stockItemsPerPage, setStockItemsPerPage] = useState(10); // 10 stocks per page for better focus


    // Form for archive and delete operations
    const { data, setData, post, processing, reset } = useForm({
        reason: '',
        stock_id: 0,
        other_reason: '',
    });

    // Loading states for specific operations
    const [archivingProduct, setArchivingProduct] = useState<number | null>(null);
    const [restoringProduct, setRestoringProduct] = useState<number | null>(null);

    // Remove stock modal state
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    // Product modals state
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

    // Get the current product list based on view state
    const currentProducts = showArchived ? archivedProducts : products;

    // Filter and sort products
    const filteredAndSortedProducts = (currentProducts || [])
        .filter(product => {
            const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.produce_type?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.produce_type === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name?.localeCompare(b.name || '') || 0;
                case 'type':
                    return a.produce_type?.localeCompare(b.produce_type || '') || 0;
                case 'price':
                    const priceA = a.price_kilo || a.price_pc || a.price_tali || 0;
                    const priceB = b.price_kilo || b.price_pc || b.price_tali || 0;
                    return priceA - priceB;
                default:
                    return 0;
            }
        });

    // Pagination for products
    const totalProducts = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stock filtering and pagination functions
    const getFilteredStocks = (status: string) => {
        if (!stocks || !Array.isArray(stocks)) return [];
        return stocks.filter(stock => {
            if (status === 'all') return true;
            if (status === 'available') return stock.quantity > 10;
            if (status === 'low') return stock.quantity > 0 && stock.quantity <= 10;
            if (status === 'out') return stock.quantity === 0;
            // Legacy category filtering (for backward compatibility)
            if (status === 'Kilo') return stock.category === 'Kilo';
            if (status === 'Pc') return stock.category === 'Pc';
            if (status === 'Tali') return stock.category === 'Tali';
            return true;
        });
    };

    const getPaginatedStocks = (stocks: Stock[], page: number, itemsPerPage: number) => {
        const startIndex = (page - 1) * itemsPerPage;
        return stocks.slice(startIndex, startIndex + itemsPerPage);
    };

    // Archive product handler
    const handleArchive = (id: number, name: string) => {
        setSelectedProduct({ id, name });
        setArchiveModalOpen(true);
    };

    // Handle archive product submission
    const handleArchiveSubmit = () => {
        if (!selectedProduct) return;

        setArchivingProduct(selectedProduct.id);
        post(route('inventory.archive', selectedProduct.id), {
            onSuccess: () => {
                setArchivingProduct(null);
                setArchiveModalOpen(false);
                setSelectedProduct(null);
                // Switch to archived view to show the newly archived product
                setShowArchived(true);
                setCurrentPage(1);
                // The backend redirect will handle the data refresh and show success message
            },
            onError: () => {
                setArchivingProduct(null);
            }
        });
    };

    // Delete product handler
    const handleDelete = (id: number, name: string) => {
        setSelectedProduct({ id, name });
        setDeleteModalOpen(true);
    };

    // Handle delete product submission
    const handleDeleteSubmit = () => {
        if (!selectedProduct) return;

        router.delete(route('inventory.destroy', selectedProduct.id), {
            data: { reason: data.reason || 'Deleted by admin' },
            onSuccess: () => {
                reset();
                setDeleteModalOpen(false);
                setSelectedProduct(null);
            }
        });
    };

    // Restore archived product handler
    const handleRestore = (id: number, name: string) => {
        setSelectedProduct({ id, name });
        setRestoreModalOpen(true);
    };

    // Handle restore product submission
    const handleRestoreSubmit = () => {
        if (!selectedProduct) return;

        setRestoringProduct(selectedProduct.id);
        post(route('inventory.archived.restore', selectedProduct.id), {
            onSuccess: () => {
                setRestoringProduct(null);
                setRestoreModalOpen(false);
                setSelectedProduct(null);
                // Switch to active view to show the newly restored product
                setShowArchived(false);
                setCurrentPage(1);
                // The backend redirect will handle the data refresh and show success message
            },
            onError: () => {
                setRestoringProduct(null);
            }
        });
    };

    // Toggle stock visibility - removed as route does not exist
    // const handleToggleVisibility = (id: number) => {
    //     post(`/inventory/stocks/${id}/toggle-visibility`);
    // };

    // Remove perished stock handler
    const handleRemovePerishedStock = (stock: Stock) => {
        setSelectedStock(stock);
        setData({
            stock_id: stock.id,
            reason: '',
            other_reason: ''
        });
        setRemoveDialogOpen(true);
    };

    // Handle remove stock form submission
    const handleRemoveStockSubmit = () => {
        if (!selectedStock || !data.reason) {
            return;
        }

        // If "Other" is selected, require other_reason
        if (data.reason === 'Other' && !data.other_reason) {
            return;
        }

        const finalReason = data.reason === 'Other' ? data.other_reason : data.reason;

        setData({
            stock_id: selectedStock.id,
            reason: finalReason,
            other_reason: data.other_reason
        });

        post(route('inventory.storeRemovePerishedStock', selectedStock.product_id), {
            onSuccess: () => {
                reset();
                setRemoveDialogOpen(false);
                setSelectedStock(null);
                // Refresh the page to get updated data including audit trail
                router.reload({ only: ['stocks', 'removedStocks', 'auditTrails'] });
            }
        });
    };

    // Calculate stock statistics
    const stockStats = {
        totalProducts: products?.length || 0,
        totalStocks: stocks?.length || 0,
        availableStocks: stocks?.filter(stock => stock.quantity > 0).length || 0,
        lowStockItems: stocks?.filter(stock => stock.quantity > 0 && stock.quantity <= 10).length || 0,
        outOfStockItems: stocks?.filter(stock => stock.quantity === 0).length || 0,
    };

    return (
        <PermissionGuard
            permissions={['view inventory', 'create products', 'edit products', 'view archive', 'view stocks', 'create stocks', 'edit stocks', 'view sold stock', 'view stock trail']}
            pageTitle="Inventory Access Denied"
        >
            <AppLayout>
                <Head title="Inventory Management" />
                <div className="min-h-screen bg-background">
                    <div className="w-full px-4 py-4 flex flex-col gap-6 sm:px-6 lg:px-8">
                        <DashboardHeader stockStats={stockStats} />

                        {/* Flash Messages and Alerts */}
                        <div className="space-y-3">
                            <FlashMessage flash={flash} />
                            {errors.archive && (
                                <Alert className="border-destructive/50 bg-destructive/10">
                                    <AlertTriangle className='h-4 w-4 text-destructive' />
                                    <AlertTitle>Error!</AlertTitle>
                                    <AlertDescription>{errors.archive}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Toggle Tabs for Product and Stock Management */}
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'stocks')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="products" className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Product Management
                                </TabsTrigger>
                                <TabsTrigger value="stocks" className="flex items-center gap-2">
                                    <Warehouse className="h-4 w-4" />
                                    Stock Management
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="products" className={`mt-0 ${animations.tabSlideIn}`}>
                                <ProductManagement
                                    products={currentProducts}
                                    categories={categories}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    filteredAndSortedProducts={filteredAndSortedProducts}
                                    paginatedProducts={paginatedProducts}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    totalPages={totalPages}
                                    totalProducts={totalProducts}
                                    itemsPerPage={itemsPerPage}
                                    processing={processing}
                                    handleArchive={handleArchive}
                                    handleDelete={handleDelete}
                                    handleRestore={handleRestore}
                                    showArchived={showArchived}
                                    setShowArchived={toggleArchivedView}
                                    archivingProduct={archivingProduct || null}
                                    restoringProduct={restoringProduct || null}
                                />
                            </TabsContent>

                            <TabsContent value="stocks" className={`mt-0 ${animations.tabSlideIn}`}>
                                <StockManagement
                                    stocks={stocks}
                                    removedStocks={removedStocks}
                                    soldStocks={soldStocks}
                                    auditTrails={auditTrails}
                                    stockCurrentPage={stockCurrentPage}
                                    setStockCurrentPage={setStockCurrentPage}
                                    stockItemsPerPage={stockItemsPerPage}
                                    processing={processing}
                                    handleRemovePerishedStock={handleRemovePerishedStock}
                                    getFilteredStocks={getFilteredStocks}
                                    getPaginatedStocks={getPaginatedStocks}
                                />
                            </TabsContent>
                        </Tabs>

                        {/* Modals */}
                        <RemoveStockModal
                            isOpen={removeDialogOpen}
                            onClose={() => setRemoveDialogOpen(false)}
                            selectedStock={selectedStock}
                            reason={data.reason}
                            otherReason={data.other_reason}
                            onReasonChange={(reason) => setData('reason', reason)}
                            onOtherReasonChange={(otherReason) => setData('other_reason', otherReason)}
                            onSubmit={handleRemoveStockSubmit}
                            processing={processing}
                        />

                        <ArchiveProductModal
                            isOpen={archiveModalOpen}
                            onClose={() => setArchiveModalOpen(false)}
                            productName={selectedProduct?.name || ''}
                            reason={data.reason}
                            onReasonChange={(reason) => setData('reason', reason)}
                            onSubmit={handleArchiveSubmit}
                            processing={processing}
                        />

                        <RestoreProductModal
                            isOpen={restoreModalOpen}
                            onClose={() => setRestoreModalOpen(false)}
                            productName={selectedProduct?.name || ''}
                            onSubmit={handleRestoreSubmit}
                            processing={processing}
                        />

                        <DeleteProductModal
                            isOpen={deleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            productName={selectedProduct?.name || ''}
                            reason={data.reason}
                            onReasonChange={(reason) => setData('reason', reason)}
                            onSubmit={handleDeleteSubmit}
                            processing={processing}
                        />
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
