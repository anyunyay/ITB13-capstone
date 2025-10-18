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

function ProductCard({ product, onRequireLogin, onStockUpdate }: { 
  product: Product; 
  onRequireLogin: () => void;
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
}) {
  return (
    <StandardProductCard 
      product={product}
      onRequireLogin={onRequireLogin}
      onStockUpdate={onStockUpdate}
                variant="default" 
      showAddToCart={true}
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
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id}
              product={product} 
              onRequireLogin={onRequireLogin}
              onStockUpdate={onStockUpdate}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-6xl mx-auto" opts={{ align: 'center', loop: true }}>
      <CarouselContent className="-ml-2">
        {products.map(product => (
          <CarouselItem
            key={product.id}
            className="pl-2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex justify-center"
          >
            <ProductCard 
              product={product} 
              onRequireLogin={onRequireLogin}
              onStockUpdate={onStockUpdate}
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
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

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

  const renderCarousel = (type: string, title: string, viewMode: 'carousel' | 'grid', toggleFunction: () => void) => (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6 text-center">Available {title}</h1>
      <ProductCarousel 
        products={products.filter(product => product.produce_type === type)}
        onRequireLogin={handleRequireLogin}
        onStockUpdate={handleStockUpdate}
        viewMode={viewMode === 'carousel' ? 'grid' : 'list'}
      />
      
      {/* View All Toggle Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={toggleFunction}
          variant="outline"
          className="px-8 py-3 text-base font-semibold border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
        >
          {viewMode === 'carousel' ? `View All ${title}` : `Back to ${title}`}
        </Button>
      </div>
    </div>
  );

  return (
    <AppHeaderLayout>
      <Head title="Produce" />
      <div className="flex flex-col items-center justify-center min-h-[90vh] gap-12 px-4 mt-32">
        {renderCarousel('fruit', 'Fruits', fruitsViewMode, toggleFruitsViewMode)}
        {renderCarousel('vegetable', 'Vegetables', vegetablesViewMode, toggleVegetablesViewMode)}

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

      {/* Footer */}
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
    </AppHeaderLayout>
  );
}