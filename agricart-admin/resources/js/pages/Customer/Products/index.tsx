import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductCarousel } from '../Home/produce';
import StockManager from '@/lib/stock-manager';
import SimpleFooter from '@/components/SimpleFooter';
import { useTranslation } from '@/hooks/use-translation';

interface Product {
  id: number;
  name: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  description: string;
  image: string;
  image_url?: string;
  produce_type: string;
  stock_by_category?: Record<string, number>;
}

interface PageProps {
  flash: {
    message?: string;
  };
  products: Product[];
  [key: string]: unknown;
}

export default function CustomerProducts() {
  const t = useTranslation();
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

  // Refresh stock data when page loads to ensure accuracy
  useEffect(() => {
    const stockManager = StockManager.getInstance();
    stockManager.refreshAllStockData(initialProducts);
  }, [initialProducts]);

  const handleRequireLogin = () => setShowLoginConfirm(true);

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'carousel' ? 'grid' : 'carousel');
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

  return (
    <AppHeaderLayout>
      <Head title={t('customer.products_fresh_produce')} />
      <div className="min-h-[90vh] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('customer.fresh_produce_from_cooperatives')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our wide selection of fresh fruits and vegetables, 
              sourced directly from trusted farmer cooperatives in your area.
            </p>
          </div>
          
          <ProductCarousel 
            products={products}
            onRequireLogin={handleRequireLogin}
            onStockUpdate={handleStockUpdate}
            viewMode={viewMode === 'carousel' ? 'grid' : 'list'}
          />
          
          {/* View All Toggle Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={toggleViewMode}
              variant="outline"
              className="px-8 py-3 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
            >
              {viewMode === 'carousel' ? 'View All Products' : 'Back to Carousel'}
            </Button>
          </div>
        </div>

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
      
      {/* Simple Footer */}
      <SimpleFooter companyName="SMMC Cooperative" />
    </AppHeaderLayout>
  );
}
