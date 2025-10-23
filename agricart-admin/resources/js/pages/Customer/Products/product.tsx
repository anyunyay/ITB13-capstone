import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
import { debounce } from '@/lib/debounce';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBasket, Package } from 'lucide-react';
import StockManager from '@/lib/stock-manager';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    image_url?: string; // Added for Inertia.js imageUrl accessor
    produce_type: string;
    stock_by_category: Record<string, number>;
}

interface PageProps {
  flash: {
    message?: string;
  };
  product: Product;
  [key: string]: unknown;
}

function ProductCard({ product }: { product: Product }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
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

  const categories = Object.keys(availableStock).filter(cat => availableStock[cat] > 0);
  const isKilo = selectedCategory === 'Kilo';
  const maxQty = availableStock[selectedCategory] ?? 0;

  // Create debounced version of add to cart function
  const debouncedAddToCart = debounce((e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple clicks
    if (isAddingToCart) {
      return;
    }

    if (!auth?.user) {
      router.visit('/login');
      return;
    }

    if (!selectedCategory) {
      setMessage('Please select a category.');
      return;
    }

    const sendQty = isKilo ? Number(Number(selectedQuantity).toFixed(2)) : selectedQuantity;

    // Set adding state immediately to prevent multiple clicks
    setIsAddingToCart(true);

    // Add to shared stock manager
    stockManager.addToCart(product.id, selectedCategory, sendQty);
    setAvailableStock(stockManager.getAvailableStockByCategory(product.id));

    router.post('/customer/cart/store', {
      product_id: product.id,
      category: selectedCategory,
      quantity: sendQty,
    }, {
      onSuccess: () => {
        setMessage('Added to cart!');
        // Reset form fields
        setSelectedCategory('');
        setSelectedQuantity(1);
        // Refresh available stock display
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        router.reload({ only: ['cart'] });
        setTimeout(() => {
          setMessage(null);
          setIsAddingToCart(false);
        }, 3000);
      },
      onError: () => {
        // Remove from shared stock manager on error
        stockManager.removeFromCart(product.id, selectedCategory, sendQty);
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        setMessage('Failed to add to cart.');
        setTimeout(() => {
          setMessage(null);
          setIsAddingToCart(false);
        }, 3000);
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

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const totalStock = Object.values(availableStock).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Product Image */}
        <div className="space-y-4">
          {product.image_url && (
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/products/default-product.jpg';
                }}
              />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">{product.produce_type}</Badge>
              {totalStock > 0 ? (
                <Badge className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-card-foreground">{product.name}</h1>
            <div className="mt-2 space-y-1">
              {product.price_kilo && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Kilo: ₱{formatPrice(product.price_kilo)}
                </p>
              )}
              {product.price_pc && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Piece: ₱{formatPrice(product.price_pc)}
                </p>
              )}
              {product.price_tali && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Tali: ₱{formatPrice(product.price_tali)}
                </p>
              )}
              {!product.price_kilo && !product.price_pc && !product.price_tali && (
                <p className="text-lg font-semibold text-muted-foreground">
                  No prices set
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Information */}
          {Object.keys(availableStock).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Available Stock</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(availableStock).map(([category, quantity]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground capitalize">{category}</span>
                      <Badge variant="outline">{quantity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add to Cart</h3>
            
            {/* Category Selection */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Category</label>
                <div className="flex gap-2 flex-wrap">
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
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isKilo) {
                        const newQty = Math.max(0.25, selectedQuantity - 0.25);
                        setSelectedQuantity(Number(newQty.toFixed(2)));
                      } else {
                        const newQty = Math.max(1, selectedQuantity - 1);
                        setSelectedQuantity(newQty);
                      }
                    }}
                    disabled={
                      isKilo ? selectedQuantity <= 0.25 : selectedQuantity <= 1
                    }
                    className="px-2"
                  >
                    {isKilo ? '-0.25' : '-1'}
                  </Button>
                  <input
                    type="number"
                    min={isKilo ? 0.25 : 1}
                    step={isKilo ? 0.01 : 1}
                    max={maxQty}
                    value={selectedQuantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isKilo) {
                        // For Kilo, allow free typing - rounding happens on blur
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue >= 0.25 && numValue <= maxQty) {
                          setSelectedQuantity(numValue);
                        } else if (value === '') {
                          setSelectedQuantity(0.25);
                        }
                      } else {
                        // For PC and Tali, only allow integers
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
                          setSelectedQuantity(numValue);
                        } else if (value === '') {
                          setSelectedQuantity(1);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (isKilo) {
                        // Round to nearest quarter when user finishes typing
                        const numValue = parseFloat(e.target.value);
                        if (!isNaN(numValue) && numValue >= 0.25 && numValue <= maxQty) {
                          const rounded = Math.round(numValue * 4) / 4;
                          setSelectedQuantity(Number(rounded.toFixed(2)));
                        } else if (e.target.value === '') {
                          setSelectedQuantity(0.25);
                        }
                      }
                    }}
                    className="w-full border rounded p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isKilo) {
                        const newQty = Math.min(maxQty, selectedQuantity + 0.25);
                        setSelectedQuantity(Number(newQty.toFixed(2)));
                      } else {
                        const newQty = Math.min(maxQty, selectedQuantity + 1);
                        setSelectedQuantity(newQty);
                      }
                    }}
                    disabled={selectedQuantity >= maxQty}
                    className="px-2"
                  >
                    {isKilo ? '+0.25' : '+1'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
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

            {/* Add to Cart Button */}
            <Button
              className="w-full flex items-center space-x-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={
                processing ||
                isAddingToCart ||
                !selectedCategory ||
                selectedQuantity < (isKilo ? 0.25 : 1) ||
                selectedQuantity > maxQty ||
                totalStock === 0
              }
            >
              <ShoppingBasket className="h-5 w-5" />
              <span>
                {processing || isAddingToCart ? 'Adding...' : 
                 totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </Button>
            
            {message && (
              <div className={`text-center text-sm p-3 rounded ${
                message.includes('Added') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ProductPage() {
  const { product } = usePage<PageProps & SharedData>().props;

  const handleBack = () => {
    router.visit('/customer/produce');
  };

  return (
    <AppHeaderLayout>
      <Head title={product.name} />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Produce</span>
          </Button>
        </div>

        <ProductCard product={product} />
      </div>
    </AppHeaderLayout>
  );
} 