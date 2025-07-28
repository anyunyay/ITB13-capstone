import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SharedData } from '@/types';

interface CartItem {
  item_id: number;
  product_id: number;
  name: string;
  category: string;
  quantity: number;
  available_stock: number | string;
}

export default function CartPage() {
  const page = usePage<Partial<SharedData> & { cart?: Record<string, CartItem>; checkoutMessage?: string }>();
  const auth = page?.props?.auth;
  const initialCart = page?.props?.cart || {};
  const [cart, setCart] = useState<Record<string, CartItem>>(initialCart);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(page?.props?.checkoutMessage || null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [tempQuantities, setTempQuantities] = useState<Record<number, number>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});
  const [rawInputValues, setRawInputValues] = useState<Record<number, string>>({});
  const [editingItems, setEditingItems] = useState<Set<number>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.user) {
      router.visit('/login');
    }
  }, [auth]);

  // Update cart state if Inertia sends new props
  useEffect(() => {
    setCart(initialCart);
    // Initialize temp quantities with current cart quantities
    const tempQty: Record<number, number> = {};
    const rawInput: Record<number, string> = {};
    Object.values(initialCart).forEach(item => {
      tempQty[item.item_id] = item.quantity;
      rawInput[item.item_id] = item.quantity.toString();
    });
    setTempQuantities(tempQty);
    setRawInputValues(rawInput);
  }, [initialCart]);

  // Update checkout message if Inertia sends new props
  useEffect(() => {
    setCheckoutMessage(page?.props?.checkoutMessage || null);
  }, [page?.props?.checkoutMessage]);

  const removeItem = (cartItem: number) => {
    router.delete(
      `/customer/cart/remove/${cartItem}`,
      {
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
        },
      }
    );
  };

  const updateItemQuantity = (cartItem: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItem);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartItem));
    
    router.put(
      `/customer/cart/update/${cartItem}`,
      { quantity: newQuantity },
      {
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
          setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(cartItem);
            return newSet;
          });
        },
        onError: () => {
          setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(cartItem);
            return newSet;
          });
        },
      }
    );
  };

  const handleQuantityChange = (cartItem: number, value: string, category: string, availableStock: number | string) => {
    // Only allow changes if item is in edit mode
    if (!editingItems.has(cartItem)) {
      return;
    }

    setRawInputValues(prev => ({ ...prev, [cartItem]: value }));

    if (value === '') {
      setTempQuantities(prev => ({ ...prev, [cartItem]: 0 }));
      setQuantityErrors(prev => ({ ...prev, [cartItem]: '' }));
      return;
    }

    let numericValue: number;

    if (category === 'Kilo') {
      numericValue = parseFloat(value) || 0;
    } else {
      // Remove dots and commas for non-kilo items
      const cleanValue = value.replace(/\./g, '').replace(/,/g, '');
      numericValue = parseInt(cleanValue) || 0;
    }

    const numAvailableStock = typeof availableStock === 'number' ? availableStock : parseFloat(availableStock) || 0;

    // Cap the value at available stock
    if (numericValue > numAvailableStock) {
      numericValue = numAvailableStock;
      setRawInputValues(prev => ({ ...prev, [cartItem]: numericValue.toString() }));
    }

    setTempQuantities(prev => ({ ...prev, [cartItem]: numericValue }));

    // Set error if exceeding available stock
    if (numericValue > numAvailableStock) {
      setQuantityErrors(prev => ({ 
        ...prev, 
        [cartItem]: `Maximum available: ${formatQuantityDisplay(numAvailableStock, category)} ${category}` 
      }));
    } else {
      setQuantityErrors(prev => ({ ...prev, [cartItem]: '' }));
    }
  };

  const enterEditMode = (cartItem: number) => {
    setEditingItems(prev => new Set(prev).add(cartItem));
    // Initialize with current cart quantity
    const currentItem = cart[cartItem];
    if (currentItem) {
      setRawInputValues(prev => ({ 
        ...prev, 
        [cartItem]: currentItem.quantity.toString() 
      }));
      setTempQuantities(prev => ({ 
        ...prev, 
        [cartItem]: currentItem.quantity 
      }));
    }
  };

  const exitEditMode = (cartItem: number) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(cartItem);
      return newSet;
    });
    // Clear raw input and temp quantities
    setRawInputValues(prev => {
      const newRaw = { ...prev };
      delete newRaw[cartItem];
      return newRaw;
    });
    setTempQuantities(prev => {
      const newTemp = { ...prev };
      delete newTemp[cartItem];
      return newTemp;
    });
    setQuantityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cartItem];
      return newErrors;
    });
  };

  const formatQuantityDisplay = (quantity: number, category: string) => {
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(quantity) || 0;
    
    if (category === 'Kilo') {
      return numQuantity.toFixed(2);
    } else {
      return Math.floor(numQuantity).toString();
    }
  };

  const getInputValue = (item: CartItem) => {
    // If in edit mode, show raw input value
    if (editingItems.has(item.item_id)) {
      return rawInputValues[item.item_id] || item.quantity.toString();
    }
    
    // Show the actual cart quantity (not editable)
    const currentValue = item.quantity;
    
    if (currentValue === 0) return '';
    
    if (item.category === 'Kilo') {
      // For kilo items, return the formatted value
      return formatQuantityDisplay(currentValue, item.category);
    } else {
      // For other items, return formatted integer
      return Math.floor(currentValue).toString();
    }
  };

  const handleCheckout = () => {
    router.post(
      '/customer/cart/checkout',
      {},
      {
        preserveScroll: true,
        onSuccess: (page) => {
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
              <div key={item.item_id} className="flex items-center justify-between border p-4 rounded">
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">Type: {item.category}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`quantity-${item.item_id}`} className="text-sm font-medium">
                      Qty:
                    </label>
                    <Input
                      type="number"
                      min="0.01"
                      max={typeof item.available_stock === 'number' ? item.available_stock : parseFloat(item.available_stock) || 0}
                      step={item.category === 'Kilo' ? "0.01" : "1"}
                      value={getInputValue(item)}
                      onChange={(e) => handleQuantityChange(item.item_id, e.target.value, item.category, item.available_stock)}
                      onKeyDown={(e) => {
                        if (item.category !== 'Kilo' && (e.key === '.' || e.key === ',')) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!editingItems.has(item.item_id)}
                      className={`w-20 ${(() => {
                        if (!editingItems.has(item.item_id)) return '';
                        const rawValue = rawInputValues[item.item_id];
                        if (rawValue !== undefined) {
                          const inputValue = item.category === 'Kilo' 
                            ? parseFloat(rawValue) || 0
                            : parseInt(rawValue.replace(/\./g, '').replace(/,/g, '')) || 0;
                          const availableStock = typeof item.available_stock === 'number' 
                            ? item.available_stock 
                            : parseFloat(item.available_stock) || 0;
                          return inputValue > availableStock ? 'border-red-500 bg-red-50' : '';
                        }
                        return '';
                      })()}`}
                    />
                    {editingItems.has(item.item_id) ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const rawValue = rawInputValues[item.item_id];
                            let newQuantity: number;
                            
                            if (rawValue !== undefined) {
                              // Use the raw input value
                              if (item.category === 'Kilo') {
                                newQuantity = parseFloat(rawValue) || 0;
                              } else {
                                const cleanValue = rawValue.replace(/\./g, '').replace(/,/g, '');
                                newQuantity = parseInt(cleanValue) || 0;
                              }
                            } else {
                              // Use current cart quantity if no raw input
                              newQuantity = item.quantity;
                            }
                            
                            updateItemQuantity(item.item_id, newQuantity);
                            exitEditMode(item.item_id);
                          }}
                          disabled={updatingItems.has(item.item_id) || !!quantityErrors[item.item_id]}
                        >
                          {updatingItems.has(item.item_id) ? 'Updating...' : 'Confirm Update'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exitEditMode(item.item_id)}
                          disabled={updatingItems.has(item.item_id)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enterEditMode(item.item_id)}
                        disabled={updatingItems.has(item.item_id)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeItem(item.item_id)}
                  >
                    Remove
                  </Button>
                </div>
                {quantityErrors[item.item_id] && (
                  <div className="text-red-500 text-sm mt-1">
                    {quantityErrors[item.item_id]}
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Available: {formatQuantityDisplay(typeof item.available_stock === 'number' ? item.available_stock : parseFloat(item.available_stock) || 0, item.category)} {item.category}
                </div>
                {editingItems.has(item.item_id)}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button 
            onClick={handleCheckout} 
            disabled={cartItems.length === 0 || editingItems.size > 0}
          >
            Checkout
          </Button>
          {checkoutMessage && (
            <div className={`mt-2 p-3 rounded ${
              checkoutMessage.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'text-red-500'
            }`}>
              {checkoutMessage}
            </div>
          )}
          {editingItems.size > 0 && (
            <div className="mt-2 text-blue-500 text-sm">
              Please complete or cancel all pending updates before checkout
            </div>
          )}
        </div>
      </div>
    </AppHeaderLayout>
  );
} 