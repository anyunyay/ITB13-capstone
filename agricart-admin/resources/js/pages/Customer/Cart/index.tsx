import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

interface CartItem {
  product_id: number;
  name: string;
  sell_category_id: number;
  sell_category: string;
  quantity: number;
}

export default function CartPage() {
  const page = usePage<Partial<SharedData> & { cart?: Record<string, CartItem>; checkoutMessage?: string }>();
  const auth = page?.props?.auth;
  const initialCart = page?.props?.cart || {};
  const [cart, setCart] = useState<Record<string, CartItem>>(initialCart);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(page?.props?.checkoutMessage || null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.user) {
      router.visit('/login'); // Optionally, show a flash message or alert instead
    }
  }, [auth]);

  // Update cart state if Inertia sends new props
  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  // Update checkout message if Inertia sends new props
  useEffect(() => {
    setCheckoutMessage(page?.props?.checkoutMessage || null);
  }, [page?.props?.checkoutMessage]);

  const removeItem = (product_id: number, sell_category_id: number) => {
    router.post(
      '/customer/cart/remove',
      { product_id, sell_category_id },
      {
        preserveScroll: true,
        onSuccess: (page) => {
          // Optionally, update cart state from new props
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
        },
      }
    );
  };

  const handleCheckout = () => {
    router.post(
      '/customer/cart/checkout',
      {},
      {
        preserveScroll: true,
        onSuccess: (page) => {
          // Optionally, update cart and message from new props
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
          if (page.props.checkoutMessage) setCheckoutMessage(page.props.checkoutMessage as string);
        },
      }
    );
  };

  const cartItems = Object.values(cart);

  return (
    <AppHeaderLayout>
      <Head title="Cart" />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product_id + '-' + item.sell_category_id} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">Type: {item.sell_category}</div>
                  <div className="text-sm">Qty: {item.quantity}</div>
                </div>
                <Button variant="destructive" onClick={() => removeItem(item.product_id, item.sell_category_id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button onClick={handleCheckout} disabled={cartItems.length === 0}>
            Checkout
          </Button>
          {checkoutMessage && <div className="mt-2 text-red-500">{checkoutMessage}</div>}
        </div>
      </div>
    </AppHeaderLayout>
  );
} 