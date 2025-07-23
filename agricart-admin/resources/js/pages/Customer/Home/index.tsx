import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import type { SharedData } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay'; // Use Autoplay for carousel if needed
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

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  produce_type: string; // 'fruit' or 'vegetable'
  stock_by_category?: Record<string, number>;
}

interface PageProps {
  flash: {
    message?: string;
  };
  products: Product[];
  [key: string]: unknown;
}

function ProductCard({ product, onRequireLogin }: { product: Product; onRequireLogin: () => void }) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { auth } = usePage<PageProps & SharedData>().props;

  const categories = product.stock_by_category ? Object.keys(product.stock_by_category) : [];
  const isKilo = selectedCategory === 'Kilo';
  const maxQty = product.stock_by_category && selectedCategory ? product.stock_by_category[selectedCategory] : 1;

  const openDialog = () => {
    setOpen(true);
    setSelectedCategory(categories[0] || '');
    setSelectedQuantity(1);
    setMessage(null);
  };

  const handleAddToCart = async () => {
    if (!auth?.user) {
      onRequireLogin();
      setOpen(false);
      return;
    }
    if (!selectedCategory) return;
    setLoading(true);
    setMessage(null);
    try {
      const sendQty = isKilo ? Number(Number(selectedQuantity).toFixed(2)) : selectedQuantity;
      const res = await fetch('/customer/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          category: selectedCategory,
          quantity: sendQty,
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? 'Added to cart!' : data.message || 'Failed to add to cart.');
    } catch {
      setMessage('Failed to add to cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-70 max-w-sm">
      <div>
        <img src={product.image} alt={product.name} />
      </div>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>₱{product.price}</CardDescription>
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
                <DialogDescription>
                  {product.description}
                </DialogDescription>
                {product.stock_by_category && (
                  <div className="mt-2 text-sm text-gray-700">
                    <strong>Available Stock:</strong>
                    <ul className="ml-2 list-disc">
                      {(Object.entries(product.stock_by_category) as [string, number][]).map(
                        ([category, quantity]) => (
                          <li key={category}>
                            {category}: {category === 'Kilo' ? (typeof quantity === 'number' ? quantity.toFixed(2) : '0.00') : quantity}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Select Category</label>
                    <div className="flex gap-2">
                      {categories.map(cat => (
                        <Button
                          key={cat}
                          type="button"
                          variant={selectedCategory === cat ? 'default' : 'outline'}
                          className={selectedCategory === cat ? 'border-2 border-blue-500' : ''}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedQuantity(1);
                          }}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCategory && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      min={isKilo ? 0.01 : 1}
                      step={isKilo ? 0.01 : 1}
                      max={maxQty}
                      value={selectedQuantity}
                      onChange={e => {
                        let val = isKilo ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
                        if (isNaN(val) || val < (isKilo ? 0.01 : 1)) val = isKilo ? 0.01 : 1;
                        if (val > maxQty) val = maxQty;
                        setSelectedQuantity(isKilo ? Number(val.toFixed(2)) : val);
                      }}
                      className="w-full border rounded p-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">Max: {isKilo ? (typeof maxQty === 'number' ? maxQty.toFixed(2) : '0.00') : maxQty}</div>
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={loading || !selectedCategory || selectedQuantity < (isKilo ? 0.01 : 1) || selectedQuantity > maxQty}
                  >
                    {loading ? 'Adding...' : 'Add to Cart'}
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
      <CardContent>
        <p className="text-md break-words">{product.description}</p>
      </CardContent>
      <CardFooter className="flex-col gap-2" />
    </Card>
  );
}

export default function CustomerHome() {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const { products = [] } = usePage<PageProps & SharedData>().props;

  const handleRequireLogin = () => setShowLoginConfirm(true);

  const renderCarousel = (type: string, title: string) => (
    <>
      <h1 className="text-2xl font-bold">Available {title}</h1>
      <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: 'center', loop: true }}>
        <CarouselContent className="-ml-1">
          {products.filter(product => product.produce_type === type).map(product => (
            <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center">
              <ProductCard product={product} onRequireLogin={handleRequireLogin} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );

  return (
    <AppHeaderLayout>
      <Head title="Home" />
      <div className="flex flex-col items-center justify-center min-h-[90vh] gap-12 px-4">
        {renderCarousel('fruit', 'Fruits')}
        {renderCarousel('vegetable', 'Vegetables')}
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
