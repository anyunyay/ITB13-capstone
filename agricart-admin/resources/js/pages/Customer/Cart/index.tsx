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
  const page = usePage<Partial<SharedData>>();
  const auth = page?.props?.auth;
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.user) {
      router.visit('/login'); // Change this, instead of using router redirect make it show as flash message or alert
    } else {
      fetch('/customer/cart')
        .then((res) => res.json())
        .then((data) => {
          setCart(data.cart || {});
        });
    }
  }, [auth]);

  const removeItem = (product_id: number, sell_category_id: number) => {
    const key = product_id + '-' + sell_category_id;
    fetch('/customer/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, sell_category_id }),
    })
      .then((res) => res.json())
      .then((data) => setCart(data.cart));
  };

  const handleCheckout = () => {
    fetch('/customer/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setCheckoutMessage(data.error);
        else setCheckoutMessage(data.message);
        setCart({});
      });
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