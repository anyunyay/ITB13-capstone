import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import StockManager from '@/lib/stock-manager';
import { debounce } from '@/lib/debounce';
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
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | string>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { auth } = usePage<PageProps & SharedData>().props;
  const stockManager = StockManager.getInstance();

  const { data, setData, post, processing, errors } = useForm({
    product_id: product.id,
    category: '',
    quantity: 1,
  });

  // Initialize stock data when component mounts (only once per product)
  useEffect(() => {
    if (product.stock_by_category) {
      // Only initialize if not already done for this product
      const originalStock = stockManager.getOriginalStockByCategory(product.id);
      if (Object.keys(originalStock).length === 0) {
        stockManager.refreshStockData(product.id, product.stock_by_category);
      }
      setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
    }
  }, [product.id, product.stock_by_category, stockManager]);

  const categories = Object.keys(availableStock).filter(cat => availableStock[cat] > 0);
  const isKilo = selectedCategory === 'Kilo';
  const maxQty = availableStock[selectedCategory] ?? 0;

  const openDialog = () => {
    setOpen(true);
    setSelectedCategory('');
    setSelectedQuantity(1);
    setMessage(null);
  };

  // Create debounced version of add to cart function
  const debouncedAddToCart = debounce((e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple clicks
    if (isAddingToCart) {
      return;
    }

    if (!auth?.user) {
      onRequireLogin();
      setOpen(false);
      return;
    }

    if (!selectedCategory) {
      setMessage('Please select a category.');
      return;
    }
    // Normalize quantity to number
    const rawQty = typeof selectedQuantity === 'number'
      ? selectedQuantity
      : selectedQuantity === ''
      ? 1
      : parseFloat(selectedQuantity);
    const sendQty = isKilo ? Number(rawQty.toFixed(2)) : Math.floor(rawQty);

    // Set adding state immediately to prevent multiple clicks
    setIsAddingToCart(true);

    // Add to shared stock manager
    stockManager.addToCart(product.id, selectedCategory, sendQty);
    setAvailableStock(stockManager.getAvailableStockByCategory(product.id));

    router.post(route('cart.store'), {
      product_id: product.id,
      category: selectedCategory,
      quantity: sendQty,
    }, {
      onSuccess: () => {
        setMessage('Added to cart!');
        // Update the stock on frontend
        onStockUpdate(product.id, selectedCategory, sendQty);
        // Refresh available stock display
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        router.reload({ only: ['cart'] });
        setTimeout(() => {
          setOpen(false);
          setIsAddingToCart(false);
        }, 800);
      },
      onError: () => {
        // Remove from shared stock manager on error
        stockManager.removeFromCart(product.id, selectedCategory, sendQty);
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        setMessage('Failed to add to cart.');
        setIsAddingToCart(false);
      },
      preserveScroll: true,
    });
  }, 300); // 300ms debounce delay

  const handleAddToCart = (e: React.FormEvent) => {
    // Immediate check for multiple clicks
    if (isAddingToCart) {
      return;
    }
    
    // Call debounced function
    debouncedAddToCart(e);
  };

  return (
    <Card className="w-70 max-w-sm p-0">
      <div>
        {product.image_url || product.image ? (
          <img 
            src={product.image_url || product.image} 
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/products/default-product.jpg';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>
      <CardHeader className="px-6">
        <CardTitle>
          <Link 
            href={`/customer/product/${product.id}`}
            className="hover:text-blue-600 hover:underline cursor-pointer"
          >
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription>
          <div className="text-sm">
            {product.price_kilo && <div>Kilo: ₱{Number(product.price_kilo).toFixed(2)}</div>}
            {product.price_pc && <div>Pc: ₱{Number(product.price_pc).toFixed(2)}</div>}
            {product.price_tali && <div>Tali: ₱{Number(product.price_tali).toFixed(2)}</div>}
            {!product.price_kilo && !product.price_pc && !product.price_tali && <div>No prices set</div>}
          </div>
        </CardDescription>
        <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
        <CardAction>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={openDialog}>Add to Cart</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogTitle className="text-sm text-gray-500">{product.produce_type}</DialogTitle>
                <DialogDescription>{product.description}</DialogDescription>

                {/* For Displaying Stock */}
                {Object.keys(availableStock).length > 0 ? (
                  <div className="mt-2 text-sm text-gray-700">
                    <strong>Available Stock:</strong>
                    <ul className="ml-2 list-disc">
                      {Object.entries(availableStock).map(
                        ([category, quantity]) => (
                          <li key={category}>
                            {category === 'Kilo'
                              ? quantity.toFixed(2)
                              : quantity}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-700">
                    <strong>Available Stock:</strong>
                    <div className="text-red-500 font-medium">NO STOCK AVAILABLE</div>
                  </div>
                )}

                {/* Category Selection */}
                {categories.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Select Category</label>
                    <div className="flex gap-2">
                      {categories.map(category => (
                        <Button
                          key={category}
                          type="button"
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          className={selectedCategory === category ? 'border-2 border-blue-500' : ''}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedQuantity(1);
                          }}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Input */}
                {selectedCategory && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentQty =
                            typeof selectedQuantity === 'number'
                              ? selectedQuantity
                              : selectedQuantity === ''
                              ? 1
                              : parseFloat(selectedQuantity);
                          if (isKilo) {
                            const newQty = Math.max(1, currentQty - 0.25);
                            setSelectedQuantity(Number(newQty.toFixed(2)));
                          } else {
                            const newQty = Math.max(1, Math.floor(currentQty) - 1);
                            setSelectedQuantity(newQty);
                          }
                        }}
                        disabled={Number((selectedQuantity as any) || 0) <= 1}
                        className="px-2"
                      >
                        {isKilo ? '- 0.25' : '-'}
                      </Button>
                      <input
                        type="number"
                        min={1}
                        step={isKilo ? 0.25 : 1}
                        max={maxQty}
                        value={selectedQuantity}
                        onChange={(e) => {
                          const value = e.target.value;
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
                            // For PC and Tali, only allow integers
                            const isIntegerString = /^\d+$/.test(value);
                            if (isIntegerString) {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
                                setSelectedQuantity(numValue);
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            setSelectedQuantity(1);
                            return;
                          }
                          if (isKilo) {
                            const numValue = parseFloat(e.target.value);
                            if (!isNaN(numValue)) {
                              const clamped = Math.max(1, Math.min(maxQty, numValue));
                              const roundedQuarter = Math.round(clamped * 4) / 4;
                              setSelectedQuantity(Number(roundedQuarter.toFixed(2)));
                            }
                          }
                        }}
                        className="w-full border rounded p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentQty =
                            typeof selectedQuantity === 'number'
                              ? selectedQuantity
                              : selectedQuantity === ''
                              ? 1
                              : parseFloat(selectedQuantity);
                          if (isKilo) {
                            const newQty = Math.min(maxQty, currentQty + 0.25);
                            setSelectedQuantity(Number(newQty.toFixed(2)));
                          } else {
                            const base = Math.max(1, Math.floor(currentQty));
                            const newQty = Math.min(maxQty, base + 1);
                            setSelectedQuantity(newQty);
                          }
                        }}
                        disabled={Number((selectedQuantity as any) || 0) >= maxQty}
                        className="px-2"
                      >
                        {isKilo ? '+ 0.25' : '+'}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Max: {isKilo ? maxQty.toFixed(2) : maxQty}
                    </div>
                    {errors.quantity && (
                      <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>
                    )}
                    {errors.category && (
                      <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                    )}
                    {errors.product_id && (
                      <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={
                      processing ||
                      isAddingToCart ||
                      !selectedCategory ||
                      Number((selectedQuantity as any) || 0) < 1 ||
                      Number((selectedQuantity as any) || 0) > maxQty
                    }
                  >
                    {processing || isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  {message && (
                    <div className="mt-2 text-center text-sm text-green-600">{message}</div>
                  )}
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent className="px-6">
        <p className="text-md break-words">{product.description}</p>
      </CardContent>
      <CardFooter className="flex-col gap-2" />
    </Card>
  );
}

interface ProductCarouselProps {
  products: Product[];
  onRequireLogin: () => void;
  onStockUpdate: (productId: number, category: string, quantity: number) => void;
}

export default function ProductCarousel({ products, onRequireLogin, onStockUpdate }: ProductCarouselProps) {
  const renderCarousel = (type: string, title: string) => (
    <>
      <h1 className="text-2xl font-bold">Available {title}</h1>
      <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: 'center', loop: true }}>
        <CarouselContent className="-ml-1">
          {products
            .filter(product => product.produce_type === type)
            .map(product => (
              <CarouselItem
                key={product.id}
                className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center"
              >
                <ProductCard 
                  product={product} 
                  onRequireLogin={onRequireLogin}
                  onStockUpdate={onStockUpdate}
                />
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-12 px-4">
      {renderCarousel('fruit', 'Fruits')}
      {renderCarousel('vegetable', 'Vegetables')}
    </div>
  );
}
