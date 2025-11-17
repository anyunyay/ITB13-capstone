import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { ProductCarousel } from '../Home/produce';
import StockManager from '@/lib/stock-manager';
import SimpleFooter from '@/components/shared/layout/SimpleFooter';
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
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

  // Refresh stock data when page loads to ensure accuracy
  useEffect(() => {
    const stockManager = StockManager.getInstance();
    stockManager.refreshAllStockData(initialProducts);
  }, [initialProducts]);

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
      <div className="min-h-[90vh] py-4 sm:py-6 lg:py-7 xl:py-8 mt-16 sm:mt-18 lg:mt-19 xl:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 xl:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-11 xl:mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-primary mb-3 sm:mb-4">
              {t('customer.fresh_produce_from_cooperatives')}
            </h1>
            <p className="text-base md:text-xl lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover our wide selection of fresh fruits and vegetables, 
              sourced directly from trusted farmer cooperatives in your area.
            </p>
          </div>
          
          <ProductCarousel 
            products={products}
            onStockUpdate={handleStockUpdate}
            onImageClick={() => {}}
            viewMode={viewMode === 'carousel' ? 'grid' : 'list'}
          />
          
          {/* View All Toggle Button */}
          <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 px-4">
            <Button
              onClick={toggleViewMode}
              variant="outline"
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-base lg:text-base xl:text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-md hover:shadow-lg w-full sm:w-auto max-w-xs"
            >
              {viewMode === 'carousel' ? t('ui.view_all_products') : t('ui.back_to_carousel')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <SimpleFooter companyName="SMMC Cooperative" />
    </AppHeaderLayout>
  );
}
