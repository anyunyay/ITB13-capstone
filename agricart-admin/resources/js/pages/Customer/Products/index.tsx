import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import type { SharedData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemLockOverlay } from '@/components/system-lock-overlay';
import ProductCarousel from '../Home/produce';

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
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const { products: initialProducts = [] } = usePage<PageProps & SharedData>().props;
  const [products, setProducts] = useState(initialProducts);

  const handleRequireLogin = () => setShowLoginConfirm(true);

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
      <Head title="Products - Fresh Produce" />
      <SystemLockOverlay />
      <div className="min-h-[90vh] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Fresh Produce from Local Cooperatives
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our wide selection of fresh fruits and vegetables, 
              sourced directly from trusted farmer cooperatives in your area.
            </p>
          </div>
          
          <ProductCarousel 
            products={products}
            onRequireLogin={handleRequireLogin}
            onStockUpdate={handleStockUpdate}
          />
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
    </AppHeaderLayout>
  );
}
