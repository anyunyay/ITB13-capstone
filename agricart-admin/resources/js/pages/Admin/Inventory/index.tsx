import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Warehouse } from 'lucide-react';
import animations from './animations.module.css';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { PermissionGuard } from '@/components/common/permission-guard';
import { DashboardHeader } from '@/components/inventory/dashboard-header';
import { ProductManagement } from '@/components/inventory/product-management';
import { StockManagement } from '@/components/inventory/stock-management';
import { RemoveStockModal } from '@/components/inventory/remove-stock-modal';
import { ArchiveProductModal } from '@/components/inventory/archive-product-modal';
import { RestoreProductModal } from '@/components/inventory/restore-product-modal';
import { DeleteProductModal } from '@/components/inventory/delete-product-modal';
import { AddStockModal } from '@/components/inventory/add-stock-modal';
import { EditStockModal } from '@/components/inventory/edit-stock-modal';
import { Product, Stock, RemovedStock, SoldStock } from '@/types/inventory';
import { useTranslation } from '@/hooks/use-translation';

interface Member {
    id: number;
    name: string;
}

interface PageProps extends SharedData {
    products: Product[];
    archivedProducts: Product[];
    stocks: Stock[];
    removedStocks: RemovedStock[];
    soldStocks: SoldStock[];
    auditTrails: any[]; // Keeping for backward compatibility
    stockTrails: any[]; // Keeping for backward compatibility
    categories: string[];
    members: Member[];
    availableCategories: string[];
    errors: {
        archive?: string;
        delete?: string;
    };
}

export default function InventoryIndex() {
    const t = useTranslation();
    const { products = [], archivedProducts = [], stocks = [], removedStocks = [], soldStocks = [], auditTrails = [], stockTrails = [], categories = [], members = [], availableCategories = [], errors = {} } = usePage<PageProps>().props;
    const { flash } = usePage<PageProps>().props;

    // Toggle state for switching between Product and Stock management
    const [activeTab, setActiveTab] = useState<'products' | 'stocks'>('products');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [productView, setProductView] = useState<'cards' | 'table'>('cards');
    const [stockCurrentPage, setStockCurrentPage] = useState(1);
    
    // Track window size for responsive items per page
    const [isMobile, setIsMobile] = useState(false);
    
    // Dynamic items per page based on view type and screen size
    const getItemsPerPage = () => {
        if (productView === 'cards') {
            return isMobile ? 4 : 8; // 4 on mobile, 8 on desktop
        }
        return isMobile ? 5 : 10; // Table view: 5 on mobile, 10 on desktop
    };
    const itemsPerPage = getItemsPerPage();
    
    // Dynamic stock items per page based on screen size
    const stockItemsPerPage = isMobile ? 5 : 10; // 5 on mobile, 10 on desktop

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showArchived, setShowArchived] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    
    // Stock search and filter state
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    const [showStockSearch, setShowStockSearch] = useState(false);
    const [selectedStockCategory, setSelectedStockCategory] = useState('all');
    const [stockSortBy, setStockSortBy] = useState('id');
    const [stockSortOrder, setStockSortOrder] = useState<'asc' | 'desc'>('asc');

    // Reset pagination when switching views
    const toggleArchivedView = (show: boolean) => {
        setShowArchived(show);
        setCurrentPage(1); // Reset to first page when switching views
    };

    // Reset stock pagination when search or filters change
    useEffect(() => {
        setStockCurrentPage(1);
    }, [stockSearchTerm, selectedStockCategory, stockSortBy, stockSortOrder, setStockCurrentPage]);

    // Reset product pagination when view changes (cards vs table)
    useEffect(() => {
        setCurrentPage(1);
    }, [productView]);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint
        };
        
        // Check on mount
        checkMobile();
        
        // Add resize listener
        window.addEventListener('resize', checkMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset to first page when switching between mobile and desktop
    useEffect(() => {
        setCurrentPage(1);
    }, [isMobile]);


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

    // Stock modals state
    const [addStockModalOpen, setAddStockModalOpen] = useState(false);
    const [editStockModalOpen, setEditStockModalOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<{ id: number; name: string } | null>(null);
    const [selectedStockForEdit, setSelectedStockForEdit] = useState<Stock | null>(null);
    const [stockProcessing, setStockProcessing] = useState(false);
    const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
    const [modalAvailableCategories, setModalAvailableCategories] = useState<string[]>([]);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Stock form data
    const [stockFormData, setStockFormData] = useState({
        member_id: '',
        quantity: '',
        category: '',
    });

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
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name?.localeCompare(b.name || '') || 0;
                    break;
                case 'type':
                    comparison = a.produce_type?.localeCompare(b.produce_type || '') || 0;
                    break;
                case 'price':
                    const priceA = a.price_kilo || a.price_pc || a.price_tali || 0;
                    const priceB = b.price_kilo || b.price_pc || b.price_tali || 0;
                    comparison = priceA - priceB;
                    break;
                default:
                    return 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
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
        
        const filtered = stocks.filter(stock => {
            // Search filter
            const matchesSearch = !stockSearchTerm || 
                stock.product?.name?.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                stock.product?.produce_type?.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                stock.category?.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                stock.id.toString().includes(stockSearchTerm);
            
            if (!matchesSearch) return false;
            
            // Category filter
            const matchesCategory = selectedStockCategory === 'all' || stock.category === selectedStockCategory;
            if (!matchesCategory) return false;
            
            // Status filter
            if (status === 'all') return stock.quantity > 0; // Exclude sold-out items from All Stocks view
            if (status === 'available') return stock.quantity > 10;
            if (status === 'low') return stock.quantity > 0 && stock.quantity <= 10;
            if (status === 'out') return stock.quantity === 0;
            // Legacy category filtering (for backward compatibility)
            if (status === 'Kilo') return stock.category === 'Kilo';
            if (status === 'Pc') return stock.category === 'Pc';
            if (status === 'Tali') return stock.category === 'Tali';
            return true;
        });
        
        // Sort filtered stocks
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch (stockSortBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                case 'product':
                    comparison = (a.product?.name || '').localeCompare(b.product?.name || '');
                    break;
                case 'category':
                    comparison = (a.category || '').localeCompare(b.category || '');
                    break;
                default:
                    return a.id - b.id;
            }
            return stockSortOrder === 'asc' ? comparison : -comparison;
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
            data: { reason: data.reason || t('admin.deleted_by_admin') },
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

    // Handle Add Stock
    const handleAddStock = (productId: number, productName: string) => {
        setSelectedProductForStock({ id: productId, name: productName });
        
        // Find the product to get available categories based on prices
        const product = products.find(p => p.id === productId);
        let productCategories = availableCategories || [];
        
        // Filter categories based on product's available prices
        if (product) {
            productCategories = [];
            if (product.price_kilo) productCategories.push('Kilo');
            if (product.price_pc) productCategories.push('Pc');
            if (product.price_tali) productCategories.push('Tali');
        }
        
        // Store filtered categories for the modal
        setModalAvailableCategories(productCategories);
        
        // Initialize with first available category or empty string
        const defaultCategory = productCategories && productCategories.length > 0 ? productCategories[0] : '';
        setStockFormData({
            member_id: '',
            quantity: '',
            category: defaultCategory,
        });
        setStockErrors({});
        setHasAttemptedSubmit(false);
        setAddStockModalOpen(true);
    };

    // Handle Add Stock Submit
    const handleAddStockSubmit = () => {
        if (!selectedProductForStock) return;

        // Mark that submission has been attempted
        setHasAttemptedSubmit(true);

        // Client-side validation
        const validationErrors: Record<string, string> = {};
        if (!stockFormData.member_id) {
            validationErrors.member_id = t('admin.member_required');
        }
        if (!stockFormData.category) {
            validationErrors.category = t('admin.category_required');
        }
        if (!stockFormData.quantity || parseFloat(stockFormData.quantity) <= 0) {
            validationErrors.quantity = t('admin.quantity_required');
        }

        if (Object.keys(validationErrors).length > 0) {
            setStockErrors(validationErrors);
            return;
        }

        setStockProcessing(true);
        setStockErrors({});

        router.post(route('inventory.storeStock', selectedProductForStock.id), stockFormData, {
            onSuccess: () => {
                setStockProcessing(false);
                setAddStockModalOpen(false);
                setSelectedProductForStock(null);
                setStockFormData({ member_id: '', quantity: '', category: '' });
                setStockErrors({});
                setHasAttemptedSubmit(false);
            },
            onError: (errors) => {
                setStockProcessing(false);
                setStockErrors(errors as Record<string, string>);
            },
        });
    };

    // Handle Edit Stock
    const handleEditStock = (stock: Stock) => {
        setSelectedStockForEdit(stock);
        
        // Find the full product from products array to get prices
        const product = products.find(p => p.id === stock.product_id);
        let productCategories = availableCategories || [];
        
        // Filter categories based on product's available prices
        if (product) {
            productCategories = [];
            if (product.price_kilo) productCategories.push('Kilo');
            if (product.price_pc) productCategories.push('Pc');
            if (product.price_tali) productCategories.push('Tali');
        }
        
        // Store filtered categories for the modal
        setModalAvailableCategories(productCategories);
        
        setStockFormData({
            member_id: stock.member_id ? String(stock.member_id) : '',
            quantity: stock.quantity.toString(),
            category: stock.category || '',
        });
        setStockErrors({});
        setHasAttemptedSubmit(false);
        setEditStockModalOpen(true);
    };

    // Handle Edit Stock Submit
    const handleEditStockSubmit = () => {
        if (!selectedStockForEdit) return;

        // Mark that submission has been attempted
        setHasAttemptedSubmit(true);

        // Client-side validation
        const validationErrors: Record<string, string> = {};
        if (!stockFormData.member_id) {
            validationErrors.member_id = t('admin.member_required');
        }
        if (!stockFormData.category) {
            validationErrors.category = t('admin.category_required');
        }
        if (!stockFormData.quantity || parseFloat(stockFormData.quantity) <= 0) {
            validationErrors.quantity = t('admin.quantity_required');
        }

        if (Object.keys(validationErrors).length > 0) {
            setStockErrors(validationErrors);
            return;
        }

        setStockProcessing(true);
        setStockErrors({});

        router.put(route('inventory.updateStock', { 
            product: selectedStockForEdit.product_id, 
            stock: selectedStockForEdit.id 
        }), stockFormData, {
            onSuccess: () => {
                setStockProcessing(false);
                setEditStockModalOpen(false);
                setSelectedStockForEdit(null);
                setStockFormData({ member_id: '', quantity: '', category: '' });
                setStockErrors({});
                setHasAttemptedSubmit(false);
            },
            onError: (errors) => {
                setStockProcessing(false);
                setStockErrors(errors as Record<string, string>);
            },
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
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.inventory_management')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8">
                        <DashboardHeader stockStats={stockStats} />

                        {/* Flash Messages and Alerts */}
                        <div className="space-y-3">
                            <FlashMessage flash={flash} />
                            {errors.archive && (
                                <Alert className="border-destructive/50 bg-destructive/10">
                                    <AlertTriangle className='h-4 w-4 text-destructive' />
                                    <AlertTitle>{t('admin.error')}</AlertTitle>
                                    <AlertDescription>{errors.archive}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Toggle Tabs for Product and Stock Management */}
                        <Tabs value={activeTab} onValueChange={(value) => {
                            setActiveTab(value as 'products' | 'stocks');
                            // Reset pagination when switching between main tabs
                            if (value === 'products') {
                                setCurrentPage(1);
                            } else if (value === 'stocks') {
                                setStockCurrentPage(1);
                            }
                        }} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-auto">
                                <TabsTrigger value="products" className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {t('admin.products_tab')}
                                </TabsTrigger>
                                <TabsTrigger value="stocks" className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Warehouse className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {t('admin.stocks_tab')}
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
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
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
                                    handleAddStock={handleAddStock}
                                    showArchived={showArchived}
                                    setShowArchived={toggleArchivedView}
                                    archivingProduct={archivingProduct || null}
                                    restoringProduct={restoringProduct || null}
                                    showSearch={showSearch}
                                    setShowSearch={setShowSearch}
                                    currentView={productView}
                                    setCurrentView={setProductView}
                                />
                            </TabsContent>

                            <TabsContent value="stocks" className={`mt-0 ${animations.tabSlideIn}`}>
                                <StockManagement
                                    stocks={stocks}
                                    removedStocks={removedStocks}
                                    soldStocks={soldStocks}
                                    auditTrails={auditTrails}
                                    stockTrails={stockTrails}
                                    stockCurrentPage={stockCurrentPage}
                                    setStockCurrentPage={setStockCurrentPage}
                                    stockItemsPerPage={stockItemsPerPage}
                                    processing={processing}
                                    handleRemovePerishedStock={handleRemovePerishedStock}
                                    handleEditStock={handleEditStock}
                                    getFilteredStocks={getFilteredStocks}
                                    getPaginatedStocks={getPaginatedStocks}
                                    stockSearchTerm={stockSearchTerm}
                                    setStockSearchTerm={setStockSearchTerm}
                                    showStockSearch={showStockSearch}
                                    setShowStockSearch={setShowStockSearch}
                                    selectedStockCategory={selectedStockCategory}
                                    setSelectedStockCategory={setSelectedStockCategory}
                                    stockSortBy={stockSortBy}
                                    setStockSortBy={setStockSortBy}
                                    stockSortOrder={stockSortOrder}
                                    setStockSortOrder={setStockSortOrder}
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

                        <AddStockModal
                            isOpen={addStockModalOpen}
                            onClose={() => {
                                setAddStockModalOpen(false);
                                setStockErrors({});
                                setHasAttemptedSubmit(false);
                            }}
                            productId={selectedProductForStock?.id || 0}
                            productName={selectedProductForStock?.name || ''}
                            members={members}
                            availableCategories={modalAvailableCategories}
                            memberId={stockFormData.member_id}
                            quantity={stockFormData.quantity}
                            category={stockFormData.category}
                            onMemberIdChange={(value) => {
                                setStockFormData({ ...stockFormData, member_id: value });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, member_id: '' });
                                }
                            }}
                            onQuantityChange={(value) => {
                                setStockFormData({ ...stockFormData, quantity: value });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, quantity: '' });
                                }
                            }}
                            onCategoryChange={(value) => {
                                setStockFormData({ ...stockFormData, category: value });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, category: '' });
                                }
                            }}
                            onSubmit={handleAddStockSubmit}
                            processing={stockProcessing}
                            errors={hasAttemptedSubmit ? stockErrors : {}}
                        />

                        <EditStockModal
                            isOpen={editStockModalOpen}
                            onClose={() => {
                                setEditStockModalOpen(false);
                                setStockErrors({});
                                setHasAttemptedSubmit(false);
                            }}
                            stock={selectedStockForEdit}
                            members={members}
                            availableCategories={modalAvailableCategories}
                            memberId={stockFormData.member_id}
                            quantity={stockFormData.quantity}
                            category={stockFormData.category}
                            onMemberIdChange={(value) => {
                                setStockFormData({ ...stockFormData, member_id: value });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, member_id: '' });
                                }
                            }}
                            onQuantityChange={(value) => {
                                setStockFormData({ ...stockFormData, quantity: value.toString() });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, quantity: '' });
                                }
                            }}
                            onCategoryChange={(value) => {
                                setStockFormData({ ...stockFormData, category: value });
                                if (hasAttemptedSubmit) {
                                    setStockErrors({ ...stockErrors, category: '' });
                                }
                            }}
                            onSubmit={handleEditStockSubmit}
                            processing={stockProcessing}
                            errors={hasAttemptedSubmit ? stockErrors : {}}
                        />
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
