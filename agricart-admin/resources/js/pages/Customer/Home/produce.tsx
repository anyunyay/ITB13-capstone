import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
import { debounce } from '@/lib/debounce';
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
import SimpleFooter from '@/components/SimpleFooter';

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
      <CarouselPrevious className="bg-card/80 hover:bg-card border-border text-foreground hover:text-green-600 dark:hover:text-green-400" />
      <CarouselNext className="bg-card/80 hover:bg-card border-border text-foreground hover:text-green-600 dark:hover:text-green-400" />
    </Carousel>
  );
}

export default function CustomerHome() {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [fruitsViewMode, setFruitsViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [vegetablesViewMode, setVegetablesViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [produceViewMode, setProduceViewMode] = useState<'carousel' | 'grid'>('carousel');
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

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
    setFruitsViewMode(prevMode => prevMode === 'carousel' ? 'grid' : 'carousel');
  };

  const toggleVegetablesViewMode = () => {
    setVegetablesViewMode(prevMode => prevMode === 'carousel' ? 'grid' : 'carousel');
  };

  const toggleProduceViewMode = () => {
    setProduceViewMode(prevMode => prevMode === 'carousel' ? 'grid' : 'carousel');
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
          <h2 className="text-6xl font-bold text-green-600 dark:text-green-400 text-center">{title}</h2>
          <Button
            onClick={toggleFunction}
            variant={viewMode === 'carousel' ? 'outline' : 'default'}
            className={`absolute right-0 hidden sm:block px-6 py-2 text-lg font-semibold transition-all duration-300 rounded-lg shadow-md hover:shadow-lg border-0 bg-transparent hover:bg-transparent hover:text-green-500 ${
              viewMode === 'carousel' 
                ? 'text-green-600' 
                : 'text-green-700'
            }`}
          >
            {viewMode === 'carousel' ? 'View All' : 'View Less'}
          </Button>
        </div>
        
        {/* Mobile View All Button */}
        <div className="flex justify-center mb-4 sm:hidden">
          <Button
            onClick={toggleFunction}
            variant={viewMode === 'carousel' ? 'outline' : 'default'}
            className={`px-6 py-2 text-sm font-semibold transition-all duration-300 rounded-lg shadow-md hover:shadow-lg border-0 bg-transparent hover:bg-transparent hover:text-green-500 ${
              viewMode === 'carousel' 
                ? 'text-green-600' 
                : 'text-green-700'
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
      
      {/* Hero Section with Farm Image */}
      <section className="relative w-full overflow-hidden">
        <AspectRatio ratio={25/9}>
          <div className="w-full h-full">
            {/* Background image with gradient overlay */}
            <div className="w-full h-full relative">
              <div className="w-full h-full bg-gradient-to-b from-neutral-100 via-oklch-300 to-oklch-400">
                <img 
                  src="/images/frontpage/pexels-pixabay-265216.jpg" 
                  alt="Farm landscape" 
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
              {/* Text overlay - no gradient applied */}
              <div className="absolute inset-0 flex items-end justify-start text-white z-30 pl-30 pb-50">
                <div className="text-left">
                  <h2 className="text-6xl font-light">Grown Here,</h2>
                  <h1 className="text-9xl font-bold text-green-600">For You.</h1>
                </div>
              </div>
              <div className="absolute left-10 right-10 bottom-10 flex gap-8 z-40">
                {shouldShowSeparateSections ? (
                  <>
                    <Button size="lg" className="group relative border-0 rounded-none bg-transparent text-white text-3xl font-light w-full hover:bg-transparent hover:text-white pb-6" onClick={() => document.getElementById('fruits-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      VIEW FRUITS
                      <div className="absolute bottom-0 left-0 w-full h-2 rounded bg-white transition-colors group-hover:bg-green-600"></div>
                    </Button>
                    <Button variant="outline" size="lg" className="group relative border-0 rounded-none bg-transparent text-white text-3xl font-light w-full hover:bg-transparent hover:text-white pb-6" onClick={() => document.getElementById('vegetables-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      VIEW VEGETABLES
                      <div className="absolute bottom-0 left-0 w-full h-2 rounded bg-white transition-colors group-hover:bg-green-600"></div>
                    </Button>
                  </>
                ) : (
                  <Button size="lg" className="group relative border-0 rounded-none bg-transparent text-white text-3xl font-light w-full hover:bg-transparent hover:text-white pb-6" onClick={() => document.getElementById('fresh-produce-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    VIEW All PRODUCE
                    <div className="absolute bottom-0 left-0 w-full h-2 rounded bg-white transition-colors group-hover:bg-green-600"></div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </AspectRatio>
      </section>

      <div id="produce-sections" className="flex flex-col items-center justify-center gap-12 px-4 py-16">
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

      {/* Spacer between content and footer */}
      <div className="h-16"></div>

      {/* Simple Footer */}
      <SimpleFooter companyName="SMMC Cooperative" />
    </AppHeaderLayout>
  );
}