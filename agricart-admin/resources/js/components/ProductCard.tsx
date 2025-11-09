import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToCartModal } from '@/components/AddToCartModal';
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
  onStockUpdate?: (productId: number, category: string, quantity: number) => void;
  variant?: 'default' | 'compact' | 'minimal';
  showAddToCart?: boolean;
  className?: string;
  onImageClick?: (imageUrl: string, productName: string) => void;
}

export function ProductCard({ 
  product, 
  onStockUpdate,
  variant = 'default',
  showAddToCart = true,
  className = '',
  onImageClick
}: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  
  const { auth } = usePage<{ auth: any } & SharedData>().props;
  const stockManager = StockManager.getInstance();

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(product.image_url || product.image || '/storage/fallback-photo.png', product.name);
    }
  };

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
    const unsubscribe = stockManager.subscribe((productId) => {
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
        className={`flex items-center space-x-2 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 border-b last:border-b-0 transition-colors duration-200 ${className}`}
      >
        <img
          src={product.image_url || product.image || '/storage/fallback-photo.png'}
          alt={product.name}
          className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleImageClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/storage/fallback-photo.png';
          }}
        />
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
          <img 
            src={product.image_url || product.image || '/storage/fallback-photo.png'} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={handleImageClick}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/storage/fallback-photo.png';
            }}
          />
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
    <Card 
      className={`w-full p-0 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:border-green-300 dark:hover:border-green-600 group ${className}`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      {/* Image Section */}
      <div 
        className="relative overflow-hidden rounded-t-lg sm:rounded-t-xl cursor-pointer"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        onClick={handleImageClick}
      >
        <img 
          src={product.image_url || product.image || '/storage/fallback-photo.png'} 
          alt={product.name}
          className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/storage/fallback-photo.png';
          }}
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 capitalize">
            {product.produce_type}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-2 sm:p-3 lg:p-4 space-y-1.5 sm:space-y-2 lg:space-y-3">
        {/* Product Title */}
        <div>
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-green-600 dark:text-green-400 transition-colors leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>
        
        {/* Price Section */}
        <div className="space-y-0.5 sm:space-y-1">
          {product.price_kilo && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">Per Kilo:</span>
              <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_kilo)}</span>
            </div>
          )}
          {product.price_pc && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">Per Piece:</span>
              <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_pc)}</span>
            </div>
          )}
          {product.price_tali && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">Per Tali:</span>
              <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_tali)}</span>
            </div>
          )}
          {!product.price_kilo && !product.price_pc && !product.price_tali && (
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium py-0.5">No prices set</div>
          )}
        </div>
        
        {/* Description */}
        <div className="pt-0.5 sm:pt-1">
          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 break-words line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        
        {/* Add to Cart Button */}
        {showAddToCart && (
          <div className="pt-0.5 sm:pt-1">
            <Button 
              variant="default" 
              onClick={() => setModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm lg:text-base transition-colors duration-200 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg"
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
        onStockUpdate={onStockUpdate}
      />
    </Card>
  );
}
