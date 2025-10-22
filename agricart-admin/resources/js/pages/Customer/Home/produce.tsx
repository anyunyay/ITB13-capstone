import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
import { debounce } from '@/lib/debounce';
import { useScrollRestoration, usePageState } from '@/hooks/useScrollRestoration';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard as StandardProductCard } from '@/components/ProductCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { route } from 'ziggy-js';
import StockManager from '@/lib/stock-manager';
import Footer from '@/components/Footer';

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

function ProductCard({ product, onRequireLogin, onStockUpdate, className }: { 
  product: Product; 
  onRequireLogin: () => void;
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
  className?: string;
}) {
  return (
    <StandardProductCard 
      product={product}
      onRequireLogin={onRequireLogin}
      onStockUpdate={onStockUpdate}
      variant="default" 
      showAddToCart={true}
      className={className}
    />
  );
}

interface ProductCarouselProps {
  products: Product[];
  onRequireLogin: () => void;
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
  viewMode?: 'grid' | 'list';
}

export function ProductCarousel({ 
  products, 
  onRequireLogin, 
  onStockUpdate,
  viewMode = 'grid'
}: ProductCarouselProps) {
  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="-ml-2 flex flex-wrap">
          {products.map(product => (
            <div
              key={product.id}
              className="pl-2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex justify-center mb-6 w-full sm:w-auto"
            >
              <ProductCard 
                product={product} 
                onRequireLogin={onRequireLogin}
                onStockUpdate={onStockUpdate}
                className="w-full max-w-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-7xl mx-auto" opts={{ align: 'center', loop: true }}>
      <CarouselContent className="-ml-2">
        {products.map(product => (
          <CarouselItem
            key={product.id}
            className="pl-2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex justify-center mb-6"
          >
            <ProductCard 
              product={product} 
              onRequireLogin={onRequireLogin}
              onStockUpdate={onStockUpdate}
              className="w-full max-w-none"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-transparent text-primary hover:bg-primary hover:text-white border-transparent hover:border-primary transition-all duration-300 ease-in-out" />
      <CarouselNext className="bg-transparent text-primary hover:bg-primary hover:text-white border-transparent hover:border-primary transition-all duration-300 ease-in-out" />
    </Carousel>
  );
}

export default function CustomerHome() {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

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

  // Get active fruit products (with available stock)
  const activeFruits = products.filter(product => 
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
  }, [initialProducts]);

  // Refresh stock data when page loads to ensure accuracy
  useEffect(() => {
    const stockManager = StockManager.getInstance();
    stockManager.refreshAllStockData(initialProducts);
  }, [initialProducts]);

  const handleRequireLogin = () => setShowLoginConfirm(true);

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
    const filteredProducts = products.filter(product => {
      const hasStock = hasAvailableStock(product);
      if (type === null) {
        // Show all produce types (fruit and vegetable)
        return hasStock;
      }
      return product.produce_type === type && hasStock;
    });

    // Don't render if no products with stock
    if (filteredProducts.length === 0) {
      return null;
    }

    return (
      <div id={sectionId} className="w-full max-w-7xl mx-auto">
        {/* Section Header with Centered Title and View All Button */}
        <div className="flex justify-center items-center mb-6 relative">
          <h2 className="text-6xl font-semibold text-primary text-center">{title}</h2>
          <Button
            onClick={toggleFunction}
            variant="ghost"
            className={`absolute right-0 hidden sm:block px-6 py-2 text-lg font-semibold transition-all duration-300 bg-transparent hover:bg-transparent text-primary hover:text-primary/80 border-0 shadow-none ${
              viewMode === 'carousel' 
                ? 'text-primary' 
                : 'text-primary'
            }`}
          >
            {viewMode === 'carousel' ? 'View All' : 'View Less'}
          </Button>
        </div>
        
        {/* Mobile View All Button */}
        <div className="flex justify-center mb-4 sm:hidden">
          <Button
            onClick={toggleFunction}
            variant="ghost"
            className={`px-6 py-2 text-sm font-semibold transition-all duration-300 rounded-lg border-0 bg-transparent hover:bg-transparent text-primary hover:text-primary/80 shadow-none ${
              viewMode === 'carousel' 
                ? 'text-primary' 
                : 'text-primary'
            }`}
          >
            {viewMode === 'carousel' ? 'View All' : 'View Less'}
          </Button>
        </div>
        
        <ProductCarousel 
          products={filteredProducts}
          onRequireLogin={handleRequireLogin}
          onStockUpdate={handleStockUpdate}
          viewMode={viewMode === 'carousel' ? 'grid' : 'list'}
        />
      </div>
    );
  };

  return (
    <AppHeaderLayout>
      <Head title="Produce" />

      <div id="produce-sections" className="flex flex-col items-center justify-center gap-12 px-4 py-16 mt-10 bg-background">
        {shouldShowSeparateSections ? (
          <>
            {renderCarousel('fruit', 'Fruits', fruitsViewMode, toggleFruitsViewMode, 'fruits-section')}
            {renderCarousel('vegetable', 'Vegetables', vegetablesViewMode, toggleVegetablesViewMode, 'vegetables-section')}
          </>
        ) : (
          renderCarousel(null, 'Fresh Produce', produceViewMode, toggleProduceViewMode, 'fresh-produce-section')
        )}

        {/* Login Confirmation Dialog */}
        <Dialog open={showLoginConfirm} onOpenChange={setShowLoginConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You must be logged in to add products to your cart.
              </DialogDescription>
              <div className="flex gap-4 mt-4">
                <Button className="w-full" onClick={() => router.visit('/login')}>Go to Login</Button>
                <Button variant="secondary" className="w-full" onClick={() => setShowLoginConfirm(false)}>Cancel</Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
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