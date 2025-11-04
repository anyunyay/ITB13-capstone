import React, { useState, useEffect } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { route } from 'ziggy-js';
import { debounce } from '@/lib/debounce';
import StockManager from '@/lib/stock-manager';
import { Minus, Plus, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
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

interface AddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onRequireLogin?: () => void;
  onStockUpdate?: (productId: number, category: string, quantity: number) => void;
}

export function AddToCartModal({ 
  product, 
  isOpen, 
  onClose, 
  onRequireLogin, 
  onStockUpdate 
}: AddToCartModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | string>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { auth } = usePage<{ auth: any } & SharedData>().props;
  const stockManager = StockManager.getInstance();

  const { data, setData, post, processing, errors } = useForm({
    product_id: product.id,
    category: '',
    quantity: 1,
  });

  // Initialize stock data when modal opens
  useEffect(() => {
    if (isOpen && product.stock_by_category) {
      const originalStock = stockManager.getOriginalStockByCategory(product.id);
      if (Object.keys(originalStock).length === 0) {
        stockManager.refreshStockData(product.id, product.stock_by_category);
      }
      setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
      setSelectedCategory('');
      setSelectedQuantity(1);
      setMessage(null);
      setMessageType(null);
    }
  }, [isOpen, product.id, product.stock_by_category, stockManager]);

  const categories = Object.keys(availableStock).filter(cat => availableStock[cat] > 0);
  const isKilo = selectedCategory === 'Kilo';
  const maxQty = availableStock[selectedCategory] ?? 0;

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const getPriceForCategory = (category: string) => {
    switch (category) {
      case 'Kilo':
        return product.price_kilo;
      case 'PC':
        return product.price_pc;
      case 'Tali':
        return product.price_tali;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Kilo':
        return 'Per Kilo';
      case 'PC':
        return 'Per Piece';
      case 'Tali':
        return 'Per Tali';
      default:
        return category;
    }
  };

  // Debounced add to cart function
  const debouncedAddToCart = debounce((e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingToCart) return;

    if (!auth?.user) {
      onRequireLogin?.();
      onClose();
      return;
    }

    if (!selectedCategory) {
      setMessage('Please select a category.');
      setMessageType('error');
      return;
    }

    const rawQty = typeof selectedQuantity === 'number'
      ? selectedQuantity
      : selectedQuantity === ''
      ? 1
      : parseFloat(selectedQuantity);
    const sendQty = isKilo ? Number(rawQty.toFixed(2)) : Math.floor(rawQty);

    setIsAddingToCart(true);
    setMessage(null);
    setMessageType(null);

    stockManager.addToCart(product.id, selectedCategory, sendQty);
    setAvailableStock(stockManager.getAvailableStockByCategory(product.id));

    router.post(route('cart.store'), {
      product_id: product.id,
      category: selectedCategory,
      quantity: sendQty,
    }, {
      onSuccess: () => {
        setMessage('Successfully added to cart!');
        setMessageType('success');
        onStockUpdate?.(product.id, selectedCategory, sendQty);
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        router.reload({ only: ['cart'] });
        setTimeout(() => {
          onClose();
          setIsAddingToCart(false);
        }, 1500);
      },
      onError: () => {
        stockManager.removeFromCart(product.id, selectedCategory, sendQty);
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        setMessage('Failed to add to cart. Please try again.');
        setMessageType('error');
        setIsAddingToCart(false);
      },
      preserveScroll: true,
    });
  }, 300);

  const handleAddToCart = (e: React.FormEvent) => {
    if (isAddingToCart) return;
    debouncedAddToCart(e);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQty = Math.max(1, Math.min(maxQty, newQuantity));
    if (isKilo) {
      const roundedQuarter = Math.round(clampedQty * 4) / 4;
      setSelectedQuantity(Number(roundedQuarter.toFixed(2)));
    } else {
      setSelectedQuantity(Math.floor(clampedQty));
    }
  };

  const handleQuantityInput = (value: string) => {
    if (value === '') {
      setSelectedQuantity('');
      return;
    }
    
    if (isKilo) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
        setSelectedQuantity(numValue);
      }
    } else {
      const isIntegerString = /^\d+$/.test(value);
      if (isIntegerString) {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
          setSelectedQuantity(numValue);
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 modal-scrollbar">
        <DialogHeader className="space-y-4">
          {/* Product Header */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-green-100 dark:bg-green-900/30">
                {product.image_url || product.image ? (
                  <img 
                    src={product.image_url || product.image} 
                    alt={product.name}
                    onError={(e) => { e.currentTarget.src = '/storage/fallback-photo.png'; }}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/storage/fallback-photo.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {product.name}
                  </DialogTitle>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 capitalize"
                  >
                    {product.produce_type}
                  </Badge>
                </div>
              </div>
              
              <DialogDescription className="text-green-600 dark:text-green-400 text-base leading-relaxed">
                {product.description}
              </DialogDescription>
            </div>
          </div>

          {/* Category and Price Row */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 dark:text-green-400">Available Prices:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {product.price_kilo && (
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-600 dark:text-green-400">Per Kilo</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_kilo)}</div>
                </div>
              )}
              {product.price_pc && (
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-600 dark:text-green-400">Per Piece</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_pc)}</div>
                </div>
              )}
              {product.price_tali && (
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-600 dark:text-green-400">Per Tali</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₱{formatPrice(product.price_tali)}</div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-green-200 dark:bg-green-700" />

          {/* Stock Information and Total Price Row */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Available Stock
            </h4>
            
            {Object.keys(availableStock).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(availableStock).map(([category, quantity]) => (
                  <div 
                    key={category}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedCategory === category
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedQuantity(1);
                      setMessage(null);
                      setMessageType(null);
                    }}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        {getCategoryLabel(category)}
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {category === 'Kilo' ? quantity.toFixed(2) : quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">No stock available</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selection and Total Price */}
          {selectedCategory && (
            <div className="space-y-4">
              {/* Quantity Selection Row */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Select Quantity</h4>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      typeof selectedQuantity === 'number' ? selectedQuantity - (isKilo ? 0.25 : 1) : 1
                    )}
                    disabled={Number((selectedQuantity as any) || 0) <= 1}
                    className="w-10 h-10 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      step={isKilo ? 0.25 : 1}
                      max={maxQty}
                      value={selectedQuantity}
                      onChange={(e) => handleQuantityInput(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setSelectedQuantity(1);
                          return;
                        }
                        const numValue = parseFloat(e.target.value);
                        if (!isNaN(numValue)) {
                          handleQuantityChange(numValue);
                        }
                      }}
                      className="w-20 text-center text-xl font-bold border-2 border-green-600 dark:border-green-500 rounded-lg p-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Max: {isKilo ? maxQty.toFixed(2) : maxQty}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      typeof selectedQuantity === 'number' ? selectedQuantity + (isKilo ? 0.25 : 1) : 1
                    )}
                    disabled={Number((selectedQuantity as any) || 0) >= maxQty}
                    className="w-10 h-10 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
            </div>
          )}

          {/* Error Messages */}
          {errors.quantity && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.quantity}</span>
            </div>
          )}
          {errors.category && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.category}</span>
            </div>
          )}
          {errors.product_id && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.product_id}</span>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={
                processing ||
                isAddingToCart ||
                !selectedCategory ||
                Number((selectedQuantity as any) || 0) < 1 ||
                Number((selectedQuantity as any) || 0) > maxQty ||
                Object.keys(availableStock).length === 0
              }
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {processing || isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding to Cart...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </div>
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
