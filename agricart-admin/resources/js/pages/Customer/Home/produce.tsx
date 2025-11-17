import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import type { SharedData } from '@/types';
import { useScrollRestoration, usePageState } from '@/hooks/useScrollRestoration';
import { useTranslation } from '@/hooks/use-translation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard as StandardProductCard } from '@/components/customer/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/customer/products/ImageLightbox';
import StockManager from '@/lib/stock-manager';
import Footer from '@/components/shared/layout/Footer';
import { ProduceSearchBar } from '@/components/customer/products/ProduceSearchBar';

interface Product {
  id: number;
  name: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  description: string;
  image: string;
  image_url?: string; // Added for Inertia.js imageUrl accessor
  produce_type: string; // 'fruit' or 'vegetable'
  stock_by_category?: Record<string, number>;
}

interface PageProps {
  flash: {
    message?: string;
  };
  products: Product[];
  [key: string]: unknown;
}

function ProductCard({ product, onStockUpdate, onImageClick, className }: {
  product: Product;
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
  onImageClick: (imageUrl: string, productName: string) => void;
  className?: string;
}) {
  return (
    <StandardProductCard
      product={product}
      onStockUpdate={onStockUpdate}
      onImageClick={onImageClick}
      variant="default"
      showAddToCart={true}
      className={className}
    />
  );
}

interface ProductCarouselProps {
  products: Product[];
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
  onImageClick: (imageUrl: string, productName: string) => void;
  viewMode?: 'grid' | 'list';
}

export function ProductCarousel({
  products,
  onStockUpdate,
  onImageClick,
  viewMode = 'grid'
}: ProductCarouselProps) {
  const isSingleProduct = products.length === 1;

  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className={`flex flex-wrap gap-2 ${isSingleProduct ? 'justify-center' : 'justify-center md:grid md:grid-cols-3 lg:grid-cols-4 md:justify-items-stretch'}`}>
          {products.map(product => (
            <div
              key={product.id}
              className={`flex justify-center ${isSingleProduct ? 'w-full max-w-[280px] sm:max-w-[320px]' : 'w-full max-w-[180px] sm:max-w-[200px] md:max-w-none'}`}
            >
              <ProductCard
                product={product}
                onStockUpdate={onStockUpdate}
                onImageClick={onImageClick}
                className="w-full max-w-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full max-w-7xl mx-auto relative px-2 sm:px-0"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
      opts={{ align: 'center', loop: isSingleProduct ? false : true }}
    >
      <CarouselContent
        className={`-ml-2 flex items-center ${isSingleProduct ? 'justify-center' : ''}`}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        {products.map(product => (
          <CarouselItem
            key={product.id}
            className={`pl-2 ${isSingleProduct ? 'basis-auto' : 'basis-1/2 md:basis-1/3 lg:basis-1/4'} flex justify-center items-start mb-6`}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className={`flex justify-center ${isSingleProduct ? 'w-[280px] sm:w-[320px]' : 'w-full max-w-[180px] sm:max-w-none'}`}>
              <ProductCard
                product={product}
                onStockUpdate={onStockUpdate}
                onImageClick={onImageClick}
                className="w-full max-w-none"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Navigation buttons - hidden when single product */}
      {!isSingleProduct && (
        <>
          <CarouselPrevious className="left-1 sm:left-2 lg:-left-16 bg-white dark:bg-gray-800 text-primary hover:bg-primary hover:text-white border-2 border-primary hover:border-primary transition-all duration-300 ease-in-out shadow-lg z-10" />
          <CarouselNext className="right-1 sm:right-2 lg:-right-16 bg-white dark:bg-gray-800 text-primary hover:bg-primary hover:text-white border-2 border-primary hover:border-primary transition-all duration-300 ease-in-out shadow-lg z-10" />
        </>
      )}
    </Carousel>
  );
}

export default function CustomerHome() {
  const t = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize scroll restoration
  useScrollRestoration('produce-page');

  // Define initial view modes
  const initialViewModes = {
    fruits: 'carousel' as 'carousel' | 'grid',
    vegetables: 'carousel' as 'carousel' | 'grid',
    produce: 'carousel' as 'carousel' | 'grid'
  };

  // Load saved page state
  const { savePageState, loadPageState } = usePageState('produce-page', initialViewModes);
  const savedState = loadPageState();

  const [fruitsViewMode, setFruitsViewMode] = useState<'carousel' | 'grid'>(
    savedState?.fruits || 'carousel'
  );
  const [vegetablesViewMode, setVegetablesViewMode] = useState<'carousel' | 'grid'>(
    savedState?.vegetables || 'carousel'
  );
  const [produceViewMode, setProduceViewMode] = useState<'carousel' | 'grid'>(
    savedState?.produce || 'carousel'
  );

  // Helper function to check if a product has available stock
  const hasAvailableStock = (product: Product): boolean => {
    if (!product.stock_by_category) return false;
    return Object.values(product.stock_by_category).some(quantity => quantity > 0);
  };

  // Get active fruit products (with available stock) from filtered results
  const activeFruits = filteredProducts.filter(product =>
    product.produce_type === 'fruit' && hasAvailableStock(product)
  );

  // Determine layout based on active fruit count
  const shouldShowSeparateSections = activeFruits.length >= 3;

  // Reset view modes when switching between layouts to avoid inconsistencies
  useEffect(() => {
    if (!shouldShowSeparateSections) {
      // When switching to merged view, ensure we're in carousel mode for better UX
      setProduceViewMode('carousel');
    }
  }, [shouldShowSeparateSections]);

  // Update products state when initialProducts change
  useEffect(() => {
    setProducts(initialProducts);
    // Only reset filtered products if there's no active search
    if (!searchQuery.trim()) {
      setFilteredProducts(initialProducts);
    } else {
      // Re-apply search filter with new products
      const filtered = initialProducts.filter(product => {
        const searchTerm = searchQuery.toLowerCase();
        const name = (product.name || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const produceType = (product.produce_type || '').toLowerCase();

        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          produceType.includes(searchTerm)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [initialProducts, searchQuery]);

  // Filter products based on search query - memoized to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Trim the query to handle whitespace-only searches
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setFilteredProducts(initialProducts);
      return;
    }

    const searchTerm = trimmedQuery.toLowerCase();
    const filtered = initialProducts.filter(product => {
      // Safely handle potentially null/undefined values
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const produceType = (product.produce_type || '').toLowerCase();

      return (
        name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        produceType.includes(searchTerm)
      );
    });

    setFilteredProducts(filtered);
  }, [initialProducts]);

  // Refresh stock data when page loads to ensure accuracy
  useEffect(() => {
    const stockManager = StockManager.getInstance();
    stockManager.refreshAllStockData(initialProducts);
  }, [initialProducts]);

  const handleImageClick = (imageUrl: string, productName: string) => {
    setLightboxImage({ src: imageUrl, alt: productName });
    setLightboxOpen(true);
  };

  const toggleFruitsViewMode = () => {
    setFruitsViewMode(prevMode => {
      const newMode = prevMode === 'carousel' ? 'grid' : 'carousel';
      // Save state after update
      setTimeout(() => {
        savePageState({
          fruits: newMode,
          vegetables: vegetablesViewMode,
          produce: produceViewMode
        });
      }, 0);
      return newMode;
    });
  };

  const toggleVegetablesViewMode = () => {
    setVegetablesViewMode(prevMode => {
      const newMode = prevMode === 'carousel' ? 'grid' : 'carousel';
      // Save state after update
      setTimeout(() => {
        savePageState({
          fruits: fruitsViewMode,
          vegetables: newMode,
          produce: produceViewMode
        });
      }, 0);
      return newMode;
    });
  };

  const toggleProduceViewMode = () => {
    setProduceViewMode(prevMode => {
      const newMode = prevMode === 'carousel' ? 'grid' : 'carousel';
      // Save state after update
      setTimeout(() => {
        savePageState({
          fruits: fruitsViewMode,
          vegetables: vegetablesViewMode,
          produce: newMode
        });
      }, 0);
      return newMode;
    });
  };

  const handleStockUpdate = (productId: number, category: string, quantity: number) => {
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId && product.stock_by_category) {
          const currentStock = product.stock_by_category[category] || 0;
          const newStock = Math.max(0, currentStock - quantity);

          return {
            ...product,
            stock_by_category: {
              ...product.stock_by_category,
              [category]: newStock
            }
          };
        }
        return product;
      })
    );
  };

  const renderCarousel = (type: string | null, title: string, viewMode: 'carousel' | 'grid', toggleFunction: () => void, sectionId?: string) => {
    // Filter products based on type and available stock
    const typeFilteredProducts = filteredProducts.filter(product => {
      const hasStock = hasAvailableStock(product);
      if (type === null) {
        // Show all produce types (fruit and vegetable)
        return hasStock;
      }
      return product.produce_type === type && hasStock;
    });

    // Don't render if no products with stock
    if (typeFilteredProducts.length === 0) {
      return null;
    }

    const isSingleProduct = typeFilteredProducts.length === 1;

    return (
      <div id={sectionId} className="w-full max-w-7xl mx-auto">
        {/* Section Header - Mobile: Centered Title */}
        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center mb-3 sm:mb-6 sm:relative">
          <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-semibold text-primary text-center mb-2 sm:mb-0">{title}</h2>

          {/* Desktop View All Button - Top Right - Hidden when single product */}
          {!isSingleProduct && (
            <Button
              onClick={toggleFunction}
              variant="ghost"
              className={`hidden sm:block sm:absolute sm:right-0 px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 text-sm sm:text-base md:text-base lg:text-base xl:text-lg font-semibold transition-all duration-300 bg-transparent hover:bg-transparent text-primary hover:text-primary/80 border-0 shadow-none whitespace-nowrap ${viewMode === 'carousel'
                ? 'text-primary'
                : 'text-primary'
                }`}
            >
              {viewMode === 'carousel' ? t('customer.view_all') : t('customer.view_less')}
            </Button>
          )}
        </div>

        {/* Mobile View All Button - Below Title, Right Side - Hidden when single product */}
        {!isSingleProduct && (
          <div className="flex justify-end mb-2 sm:hidden px-2">
            <Button
              onClick={toggleFunction}
              variant="ghost"
              className={`px-3 py-1 text-sm font-semibold transition-all duration-300 rounded-lg border-0 bg-transparent hover:bg-transparent text-primary hover:text-primary/80 shadow-none whitespace-nowrap ${viewMode === 'carousel'
                ? 'text-primary'
                : 'text-primary'
                }`}
            >
              {viewMode === 'carousel' ? t('customer.view_all') : t('customer.view_less')}
            </Button>
          </div>
        )}

        <ProductCarousel
          products={typeFilteredProducts}
          onStockUpdate={handleStockUpdate}
          onImageClick={handleImageClick}
          viewMode={viewMode === 'carousel' ? 'grid' : 'list'}
        />
      </div>
    );
  };

  return (
    <AppHeaderLayout>
      <Head title="Produce" />

      <div id="produce-sections" className="flex flex-col items-center justify-center gap-2 px-2 sm:px-4 py-12 sm:py-16 mt-10 bg-background">
        {/* Search Bar */}
        <div className="w-full max-w-7xl px-2 mt-10 mb-10 sm:px-0">
          <ProduceSearchBar onSearch={handleSearch} />
        </div>
        {/* No Results Message */}
        {searchQuery && filteredProducts.length === 0 && (
          <div className="w-full max-w-5xl mx-auto text-center py-8 sm:py-16 px-4">
            <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 border-2 border-green-200 dark:border-green-700">
              <div className="text-5xl sm:text-8xl mb-4 sm:mb-6">🔍</div>
              <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('customer.no_products_found')}
              </h2>
              <p className="text-base md:text-xl lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-400 mb-4 sm:mb-8 max-w-md mx-auto">
                {t('customer.no_products_matching')} <span className="font-semibold text-green-600">"{searchQuery}"</span>
              </p>
            </div>
          </div>
        )}

        {/* Product Sections */}
        {!searchQuery || filteredProducts.length > 0 ? (
          shouldShowSeparateSections ? (
            <>
              {renderCarousel('fruit', t('customer.fruits'), fruitsViewMode, toggleFruitsViewMode, 'fruits-section')}
              {renderCarousel('vegetable', t('customer.vegetables'), vegetablesViewMode, toggleVegetablesViewMode, 'vegetables-section')}
            </>
          ) : (
            renderCarousel(null, t('customer.fresh_produce'), produceViewMode, toggleProduceViewMode, 'fresh-produce-section')
          )
        ) : null}

        {/* Image Lightbox */}
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>

      {/* Footer */}
      <div className="relative z-20 w-full">
        <Footer
          companyName="SMMC Cooperative"
          facebookUrl="https://facebook.com/smmccooperative"
          emailAddress="contact@smmccooperative.com"
          physicalAddress="Cabuyao, Laguna, Philippines"
          navigationLinks={[
            { title: "Privacy Policy", href: "/privacy" },
            { title: "Terms of Service", href: "/terms" }
          ]}
        />
      </div>
    </AppHeaderLayout>
  );
}