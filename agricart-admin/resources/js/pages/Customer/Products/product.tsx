import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedData } from '@/types';
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

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.user) {
      router.visit('/login');
      return;
    }

    if (!selectedCategory) {
      setMessage('Please select a category.');
      return;
    }

    const sendQty = isKilo ? Number(Number(selectedQuantity).toFixed(2)) : selectedQuantity;

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
        // Refresh available stock display
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        router.reload({ only: ['cart'] });
        setTimeout(() => setMessage(null), 3000);
      },
      onError: () => {
        // Remove from shared stock manager on error
        stockManager.removeFromCart(product.id, selectedCategory, sendQty);
        setAvailableStock(stockManager.getAvailableStockByCategory(product.id));
        setMessage('Failed to add to cart.');
        setTimeout(() => setMessage(null), 3000);
      },
      preserveScroll: true,
    });
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
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 space-y-1">
              {product.price_kilo && (
                <p className="text-lg font-semibold text-green-600">
                  Kilo: ₱{formatPrice(product.price_kilo)}
                </p>
              )}
              {product.price_pc && (
                <p className="text-lg font-semibold text-green-600">
                  Piece: ₱{formatPrice(product.price_pc)}
                </p>
              )}
              {product.price_tali && (
                <p className="text-lg font-semibold text-green-600">
                  Tali: ₱{formatPrice(product.price_tali)}
                </p>
              )}
              {!product.price_kilo && !product.price_pc && !product.price_tali && (
                <p className="text-lg font-semibold text-gray-500">
                  No prices set
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
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
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
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
                    className="w-full border rounded p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    readOnly
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

            {/* Add to Cart Button */}
            <Button
              className="w-full flex items-center space-x-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={
                processing ||
                !selectedCategory ||
                selectedQuantity < (isKilo ? 0.25 : 1) ||
                selectedQuantity > maxQty ||
                totalStock === 0
              }
            >
              <ShoppingBasket className="h-5 w-5" />
              <span>
                {processing ? 'Adding...' : 
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
    router.visit('/');
  };

  return (
    <AppHeaderLayout>
      <Head title={product.name} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        <ProductCard product={product} />
      </div>
    </AppHeaderLayout>
  );
} 