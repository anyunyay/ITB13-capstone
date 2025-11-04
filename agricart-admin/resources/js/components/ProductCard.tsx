import React, { useState, useEffect } from 'react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToCartModal } from '@/components/AddToCartModal';
import { route } from 'ziggy-js';
import { debounce } from '@/lib/debounce';
import StockManager from '@/lib/stock-manager';
import type { SharedData } from '@/types';

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

interface ProductCardProps {
  product: Product;
  onRequireLogin?: () => void;
  onStockUpdate?: (productId: number, category: string, quantity: number) => void;
  variant?: 'default' | 'compact' | 'minimal';
  showAddToCart?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  onRequireLogin, 
  onStockUpdate,
  variant = 'default',
  showAddToCart = true,
  className = ''
}: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  
  const { auth } = usePage<{ auth: any } & SharedData>().props;
  const stockManager = StockManager.getInstance();

  // Initialize stock data when component mounts
  useEffect(() => {
    if (product.stock_by_category) {
      // Always refresh stock data to ensure accuracy
      stockManager.refreshStockData(product.id, product.stock_by_category);
      setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
    }
  }, [product.id, product.stock_by_category, stockManager]);

  // Subscribe to stock updates for this product
  useEffect(() => {
    const unsubscribe = stockManager.subscribe((productId, category) => {
      if (productId === product.id) {
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [product.id, stockManager]);

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Compact variant for search results
  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center space-x-2 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer border-b last:border-b-0 transition-colors duration-200 ${className}`}
        onClick={() => router.visit(`/customer/product/${product.id}`)}
      >
        {product.image_url || product.image ? (
          <img
            src={product.image_url || product.image}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/storage/fallback-photo.png';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">No Image</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-green-600 dark:text-green-400 truncate">{product.name}</div>
          <div className="text-xs text-green-600 dark:text-green-400 truncate capitalize">{product.produce_type}</div>
          <div className="text-sm font-bold text-green-600 dark:text-green-400">
            {product.price_kilo && <div>Kilo: ₱{formatPrice(product.price_kilo)}</div>}
            {product.price_pc && <div>Pc: ₱{formatPrice(product.price_pc)}</div>}
            {product.price_tali && <div>Tali: ₱{formatPrice(product.price_tali)}</div>}
            {!product.price_kilo && !product.price_pc && !product.price_tali && <div>No prices set</div>}
          </div>
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
          {Object.keys(product.stock_by_category || {}).length > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
    );
  }

  // Minimal variant for home page carousel
  if (variant === 'minimal') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg group ${className}`}>
        {/* Image Section */}
        <div className="relative overflow-hidden">
          {product.image_url || product.image ? (
            <img 
              src={product.image_url || product.image} 
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/storage/fallback-photo.png';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 capitalize">
              {product.produce_type}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg text-green-600 dark:text-green-400 truncate flex-1">{product.name}</h3>
            <div className="text-green-600 dark:text-green-400 font-bold whitespace-nowrap flex-shrink-0">
              {product.price_kilo && `₱${formatPrice(product.price_kilo)}/kg`}
              {product.price_pc && `₱${formatPrice(product.price_pc)}/pc`}
              {product.price_tali && `₱${formatPrice(product.price_tali)}/tali`}
              {!product.price_kilo && !product.price_pc && !product.price_tali && 'Price N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full featured card
  return (
    <Card className={`w-full p-0 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-300 dark:hover:border-green-600 group ${className}`}>
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-xl">
        {product.image_url || product.image ? (
          <img 
            src={product.image_url || product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/storage/fallback-photo.png';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">No Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 capitalize">
            {product.produce_type}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Title */}
        <div>
          <h3 className="text-lg font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors leading-tight">
            <Link 
              href={`/customer/product/${product.id}`}
              className="hover:underline cursor-pointer"
            >
              {product.name}
            </Link>
          </h3>
        </div>
        
        {/* Price Section */}
        <div className="space-y-1">
          {product.price_kilo && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-sm text-green-600 dark:text-green-400">Per Kilo:</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_kilo)}</span>
            </div>
          )}
          {product.price_pc && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-sm text-green-600 dark:text-green-400">Per Piece:</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_pc)}</span>
            </div>
          )}
          {product.price_tali && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-sm text-green-600 dark:text-green-400">Per Tali:</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_tali)}</span>
            </div>
          )}
          {!product.price_kilo && !product.price_pc && !product.price_tali && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium py-0.5">No prices set</div>
          )}
        </div>
        
        {/* Description */}
        <div className="pt-1">
          <p className="text-sm text-green-600 dark:text-green-400 break-words line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        
        {/* Add to Cart Button */}
        {showAddToCart && (
          <div className="pt-1">
            <Button 
              variant="default" 
              onClick={() => setModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Modern Add to Cart Modal */}
      <AddToCartModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRequireLogin={onRequireLogin}
        onStockUpdate={onStockUpdate}
      />
    </Card>
  );
}
