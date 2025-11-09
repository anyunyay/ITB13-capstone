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
import { useTranslation } from '@/hooks/use-translation';
import { LoginModal } from '@/components/LoginModal';

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
  onStockUpdate?: (productId: number, category: string, quantity: number) => void;
}

export function AddToCartModal({ 
  product, 
  isOpen, 
  onClose, 
  onStockUpdate 
}: AddToCartModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | string>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { auth } = usePage<{ auth: any } & SharedData>().props;
  const stockManager = StockManager.getInstance();
  const t = useTranslation();

  const { processing, errors } = useForm({
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
    // Reset login modal state when cart modal closes
    if (!isOpen) {
      setShowLoginModal(false);
    }
  }, [isOpen, product.id, product.stock_by_category, stockManager]);

  const isKilo = selectedCategory === 'Kilo';
  const maxQty = availableStock[selectedCategory] ?? 0;

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Debounced add to cart function
  const debouncedAddToCart = debounce((e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingToCart) return;

    if (!auth?.user) {
      onClose();
      // Small delay to ensure cart modal closes before login modal opens
      setTimeout(() => {
        setShowLoginModal(true);
      }, 100);
      return;
    }

    if (!selectedCategory) {
      setMessage(t('customer.please_select_category'));
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
        setMessage(t('customer.successfully_added_to_cart'));
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
        setMessage(t('customer.failed_to_add_to_cart'));
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] overflow-y-auto bg-card border-border modal-scrollbar p-4 md:p-6">
        <DialogHeader className="space-y-3 md:space-y-4">
          {/* Product Header */}
          <div className="flex flex-row gap-3 md:gap-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={product.image_url || product.image || '/storage/fallback-photo.png'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/storage/fallback-photo.png';
                  }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-2 flex flex-col items-start text-left sm:-ml-2 md:ml-0">
              <div>
                <Badge 
                  variant="secondary" 
                  className="capitalize text-xs md:text-sm lg:text-base font-medium"
                >
                  {product.produce_type}
                </Badge>
                <DialogTitle className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary mt-2 leading-tight">
                  {product.name}
                </DialogTitle>
              </div>
              
              <DialogDescription className="text-foreground text-base lg:text-xl leading-snug">
                {product.description}
              </DialogDescription>
            </div>
          </div>

          {/* Category and Price Row */}
          <div className="space-y-2 md:space-y-3">
            <h4 className="font-semibold flex items-center text-primary text-lg lg:text-xl">{t('customer.prices')}:</h4>
            <div className="grid grid-cols-3 gap-2">
              {product.price_kilo && (
                <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-muted rounded-lg border border-border">
                  <div className="text-base lg:text-xl text-muted-foreground">{t('customer.kilo')}</div>
                  <div className="text-base lg:text-xl font-bold text-primary">₱{formatPrice(product.price_kilo)}</div>
                </div>
              )}
              {product.price_pc && (
                <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-muted rounded-lg border border-border">
                  <div className="text-base lg:text-xl text-muted-foreground">{t('customer.piece')}</div>
                  <div className="text-base lg:text-xl font-bold text-primary">₱{formatPrice(product.price_pc)}</div>
                </div>
              )}
              {product.price_tali && (
                <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-muted rounded-lg border border-border">
                  <div className="text-base lg:text-xl text-muted-foreground">{t('customer.tali')}</div>
                  <div className="text-base lg:text-xl font-bold text-primary">₱{formatPrice(product.price_tali)}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Stock Information */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="font-semibold text-primary flex items-center gap-2 text-lg lg:text-xl">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
              {t('customer.stock')}
            </h3>
            
            {Object.keys(availableStock).length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(availableStock).map(([category, quantity]) => (
                  <div 
                    key={category}
                    className={`p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedCategory === category
                        ? 'border-primary bg-accent/10'
                        : 'border-border bg-card hover:border-accent'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedQuantity(1);
                      setMessage(null);
                      setMessageType(null);
                    }}
                  >
                    <div className="text-center">
                      <div className="text-base lg:text-xl font-medium text-muted-foreground">
                        {category}
                      </div>
                      <div className="text-base lg:text-xl font-bold text-primary">
                        {category === 'Kilo' ? quantity.toFixed(2) : quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-base md:text-xl lg:text-2xl font-medium">{t('customer.no_stock')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          {selectedCategory && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-primary text-lg lg:text-xl">{t('customer.quantity')}</h4>
                <div className="flex items-center gap-2 md:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      typeof selectedQuantity === 'number' ? selectedQuantity - (isKilo ? 0.25 : 1) : 1
                    )}
                    disabled={Number((selectedQuantity as any) || 0) <= 1}
                    className="w-10 h-10 p-0"
                  >
                    <Minus className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
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
                      className="w-20 text-center text-lg md:text-xl lg:text-2xl font-bold border-2 border-input rounded-lg p-2 bg-background text-primary focus:border-ring focus:ring-2 focus:ring-ring/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="text-sm lg:text-base text-muted-foreground">
                      {t('customer.max')}: {isKilo ? maxQty.toFixed(2) : maxQty}
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
                    className="w-10 h-10 p-0"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(errors.quantity || errors.category || errors.product_id) && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
              <span className="text-base md:text-xl lg:text-2xl">{errors.quantity || errors.category || errors.product_id}</span>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              messageType === 'success' 
                ? 'bg-accent/10 text-primary border-accent/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
              ) : (
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
              )}
              <span className="font-medium text-base md:text-xl lg:text-2xl">{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-base md:text-lg lg:text-lg py-3"
            >
              {t('customer.cancel')}
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
              className="flex-1 font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-base md:text-lg lg:text-lg"
            >
              {processing || isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t('customer.adding')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  <span>{t('customer.add_to_cart')}</span>
                </div>
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      description={t('customer.login_to_add_to_cart') || 'You must be logged in to add products to your cart.'}
    />
    </>
  );
}
