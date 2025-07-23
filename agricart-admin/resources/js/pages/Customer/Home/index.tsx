import AppHeaderLayout from '@/layouts/app/app-header-layout';
import Heading from '@/components/heading';
import { UserInfo } from '@/components/user-info';
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

interface Stock {
  id: number;
  product_id: number;
  quantity: number;
  member_id: number;
  product: Product;
  category: 'Kilo' | 'Pc' | 'Tali';
}

interface PageProps {
  flash: {
    message?: string;
  };
  products: Product[];
  stocks: Stock[];
  [key: string]: unknown;
}

export default function CustomerHome() {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const { auth, products = [] } = usePage<PageProps & SharedData>().props;

  // Redirect to login if not authenticated
  const handleAddToCart = () => {
    if (auth?.user) {
      router.visit('/customer/profile'); // Will change this to add to cart logic later
    } else {
      setShowLoginConfirm(true);
    }
  };

  const handleLoginConfirm = () => {
    router.visit('/login');
  };

  // Render product dialog for adding to cart
  const renderProductDialog = (product: Product) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add to Cart</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogTitle className="text-sm text-gray-500">{product.produce_type}</DialogTitle>
          <DialogDescription>
            <div>
              <p>{product.description}</p>
              {product.stock_by_category && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Available Stock:</strong>
                  <ul className="ml-2 list-disc">
                    {(Object.entries(product.stock_by_category) as [string, number][]).map(
                      ([category, quantity]) => (
                        <li key={category}>
                          {category}: {quantity}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppHeaderLayout>
      <Head title="Home" />
      <div className="flex flex-col items-center justify-center min-h-[90vh] gap-12 px-4">
        <h1 className="text-2xl font-bold">Available Fruits</h1>
        <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: 'center', loop: true }}>
          <CarouselContent className="-ml-1">
            {products.filter(product => product.produce_type === 'fruit').map(product => (
              <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center">
                <Card className="w-70 max-w-sm">
                  <div>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>₱{product.price}</CardDescription>
                    <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                    <CardAction>
                      {renderProductDialog(product)}
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="text-md break-words">{product.description}</p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2" />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <h1 className="text-2xl font-bold">Available Vegetables</h1>
        <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: 'center', loop: true }}>
          <CarouselContent className="-ml-1">
            {products.filter(p => p.produce_type === 'vegetable').map(product => (
              <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center">
                <Card className="w-70 max-w-sm">
                  <div>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>₱{product.price}</CardDescription>
                    <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                    <CardAction>
                      {renderProductDialog(product)}
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="text-md break-words">{product.description}</p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2" />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Login Confirmation Dialog */}
        <Dialog open={showLoginConfirm} onOpenChange={setShowLoginConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You must be logged in to add products to your cart.
              </DialogDescription>
              <div className="flex gap-4 mt-4">
                <Button
                  className="w-full"
                  onClick={handleLoginConfirm}
                >
                  Go to Login
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowLoginConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </AppHeaderLayout>
  );
}
