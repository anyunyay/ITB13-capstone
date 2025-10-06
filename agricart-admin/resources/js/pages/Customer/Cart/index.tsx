import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

import type { SharedData } from '@/types';
import StockManager from '@/lib/stock-manager';

interface CartItem {
  item_id: number;
  product_id: number;
  name: string;
  category: string;
  quantity: number;
  available_stock: number | string;
  total_price: number;
}

export default function CartPage() {
  const page = usePage<Partial<SharedData> & { cart?: Record<string, CartItem>; checkoutMessage?: string; cartTotal?: number }>();
  const auth = page?.props?.auth;
  const initialCart = page?.props?.cart || {};
  const [cart, setCart] = useState<Record<string, CartItem>>(initialCart);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(page?.props?.checkoutMessage || null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [tempQuantities, setTempQuantities] = useState<Record<number, number | string>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});

  const [editingItems, setEditingItems] = useState<Set<number>>(new Set());
  const [cartTotal, setCartTotal] = useState<number>(page?.props?.cartTotal || 0);
  // Removed confirm dialog; updates happen instantly on change/blur

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.user) {
      router.visit('/login');
    }
  }, [auth]);

  // Update cart state if Inertia sends new props
  useEffect(() => {
    // Only update if the cart data actually changed
    const hasCartChanged = JSON.stringify(initialCart) !== JSON.stringify(cart);
    const hasTotalChanged = page?.props?.cartTotal !== cartTotal;
    
    if (hasCartChanged) {
      setCart(initialCart);
    }
    
    if (hasTotalChanged) {
      setCartTotal(page?.props?.cartTotal || 0);
    }
    
    // Only initialize temp quantities if they don't exist yet
    // This prevents overwriting user input during updates
    const tempQty: Record<number, number> = {};
    
    Object.values(initialCart).forEach(item => {
      // Only set if not currently being edited
      if (!editingItems.has(item.item_id)) {
        // Ensure proper formatting based on category
        const baseQty = Number(item.quantity) || 0;
        const formattedQuantity = item.category === 'Kilo' 
          ? Number((Math.max(1, baseQty) * 4).toFixed(0)) / 4
          : Math.floor(Math.max(1, baseQty));
        tempQty[item.item_id] = formattedQuantity;
      }
    });
    
    // Merge with existing values instead of replacing
    setTempQuantities(prev => ({ ...prev, ...tempQty }));

    // Sync stock manager with backend cart data
    const stockManager = StockManager.getInstance();
    const cartItems = Object.values(initialCart).map(item => ({
      product_id: item.product_id,
      category: item.category,
      quantity: item.quantity
    }));
    stockManager.syncWithBackendCart(cartItems);
  }, [initialCart, page?.props?.cartTotal, editingItems, cart, cartTotal]);

  // Update checkout message if Inertia sends new props
  useEffect(() => {
    setCheckoutMessage(page?.props?.checkoutMessage || null);
  }, [page?.props?.checkoutMessage]);

  const removeItem = (cartItem: number) => {
    // Find the item to get its details for stock manager
    const itemToRemove = Object.values(cart).find(item => item.item_id === cartItem);
    
    router.delete(
      `/customer/cart/remove/${cartItem}`,
      {
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
          if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);
          
          // Update stock manager when item is removed
          if (itemToRemove) {
            const stockManager = StockManager.getInstance();
            stockManager.removeItemFromCart(itemToRemove.product_id, itemToRemove.category);
          }
        },
      }
    );
  };

  const updateItemQuantity = (cartItem: number, newQuantity: number) => {
    // Validate quantity
    if (newQuantity <= 0 || newQuantity === null || newQuantity === undefined || isNaN(newQuantity)) {
      removeItem(cartItem);
      return;
    }

    // Find the item to get its details for stock manager
    const itemToUpdate = Object.values(cart).find(item => item.item_id === cartItem);
    if (!itemToUpdate) {
      console.error('Item not found in cart:', cartItem);
      return;
    }

    const oldQuantity = Number(itemToUpdate.quantity) || 0;
    
    // Format quantity for storage based on category
    const formattedQuantity = formatQuantityForStorage(newQuantity, itemToUpdate.category);
    
    // Validate against available stock
    const availableStock = typeof itemToUpdate.available_stock === 'number' 
      ? itemToUpdate.available_stock 
      : parseFloat(String(itemToUpdate.available_stock)) || 0;
    
    if (formattedQuantity > availableStock) {
      setQuantityErrors(prev => ({ 
        ...prev, 
        [cartItem]: `Maximum available: ${formatQuantityDisplay(availableStock, itemToUpdate.category)} ${itemToUpdate.category}` 
      }));
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartItem));
    
    router.put(
      `/customer/cart/update/${cartItem}`,
      { quantity: formattedQuantity },
      {
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.cart) setCart(page.props.cart as Record<string, CartItem>);
          if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);
          setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(cartItem);
            return newSet;
          });
          
          // Update stock manager when quantity changes
          if (itemToUpdate) {
            const stockManager = StockManager.getInstance();
            const quantityDifference = formattedQuantity - oldQuantity;
            if (quantityDifference > 0) {
              // Quantity increased
              stockManager.addToCart(itemToUpdate.product_id, itemToUpdate.category, quantityDifference);
            } else if (quantityDifference < 0) {
              // Quantity decreased
              stockManager.removeFromCart(itemToUpdate.product_id, itemToUpdate.category, Math.abs(quantityDifference));
            }
          }
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



  const enterEditMode = (cartItem: number) => {
    setEditingItems(prev => new Set(prev).add(cartItem));
    
    // Initialize with current cart quantity
    const currentItem = cart[cartItem];
    if (currentItem) {
      const currentQuantity = Number(currentItem.quantity) || 0;
      
      // Set temp quantities to current cart quantity, ensuring proper formatting
      const formattedQuantity = currentItem.category === 'Kilo' 
        ? Number((Math.max(1, currentQuantity) * 4).toFixed(0)) / 4
        : Math.floor(Math.max(1, currentQuantity));
      
      setTempQuantities(prev => ({ 
        ...prev, 
        [cartItem]: formattedQuantity
      }));
      
      // Clear any existing errors
      setQuantityErrors(prev => ({ ...prev, [cartItem]: '' }));
    }
  };

  const exitEditMode = (cartItem: number) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(cartItem);
      return newSet;
    });
    
    // Reset to current cart values
    const currentItem = cart[cartItem];
    if (currentItem) {
      // Ensure proper formatting when resetting
      const baseQty = Number(currentItem.quantity) || 0;
      const formattedQuantity = currentItem.category === 'Kilo' 
        ? Number((Math.max(1, baseQty) * 4).toFixed(0)) / 4
        : Math.floor(Math.max(1, baseQty));
      
      setTempQuantities(prev => ({
        ...prev,
        [cartItem]: formattedQuantity
      }));
    } else {
      // Clear if item no longer exists
      setTempQuantities(prev => {
        const newTemp = { ...prev };
        delete newTemp[cartItem];
        return newTemp;
      });
    }
    
    // Clear errors
    setQuantityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cartItem];
      return newErrors;
    });
  };

  const formatQuantityDisplay = (quantity: number | string | undefined, category: string) => {
    // Ensure quantity is a number
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;
    
    if (category === 'Kilo') {
      return numQuantity.toFixed(2);
    } else {
      return Math.floor(numQuantity).toString();
    }
  };

  // Helper function to ensure quantities are properly formatted for display
  const formatQuantityForDisplay = (quantity: number | string | undefined, category: string) => {
    // Ensure quantity is a number
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;
    
    if (category === 'Kilo') {
      // For kilo items, show 2 decimal places
      return numQuantity.toFixed(2);
    } else {
      // For Tali, Pc, and other items, show as integer
      return Math.floor(numQuantity).toString();
    }
  };

  // Helper function to ensure quantities are properly formatted for storage
  const formatQuantityForStorage = (quantity: number | string | undefined, category: string) => {
    // Ensure quantity is a number
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;
    
    if (category === 'Kilo') {
      // For kilo items, clamp to min 1 and round to nearest quarter
      const clamped = Math.max(1, numQuantity);
      return Math.round(clamped * 4) / 4;
    } else {
      // For Tali, Pc, and other items, convert to integer
      return Math.floor(numQuantity);
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
          if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);
          
          // Clear stock manager when checkout is successful
          const stockManager = StockManager.getInstance();
          stockManager.clearCart();
        },
      }
    );
  };

  const cartItems = Object.values(cart);
  const minimumOrder = 75;
  const meetsMinimumOrder = cartTotal >= minimumOrder;

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
                  <div className="text-sm font-medium text-green-600">
                    Php{(Number(item.total_price) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`quantity-${item.item_id}`} className="text-sm font-medium">
                      Qty:
                    </label>
                    <div className="flex items-center space-x-2">
                      {editingItems.has(item.item_id) ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQty = typeof tempQuantities[item.item_id] === 'number'
                                ? (tempQuantities[item.item_id] as number)
                                : tempQuantities[item.item_id] === ''
                                ? 1
                                : Number(tempQuantities[item.item_id] || item.quantity) || 0;
                              if (item.category === 'Kilo') {
                                const newQty = Math.max(1, currentQty - 0.25);
                                const roundedQuarter = Math.round(newQty * 4) / 4;
                                const next = Number(roundedQuarter.toFixed(2));
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: next }));
                              } else {
                                const newQty = Math.max(1, Math.floor(currentQty - 1));
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: newQty }));
                              }
                            }}
                            disabled={
                              (Number((tempQuantities[item.item_id] as any) || item.quantity) || 0) <= 1
                            }
                            className="px-2 dark:border-gray-600 dark:text-gray-200"
                          >
                            {item.category === 'Kilo' ? '-0.25' : '-'}
                          </Button>
                          <input
                            type="number"
                            min={1}
                            step={item.category === 'Kilo' ? 0.25 : 1}
                            max={typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0}
                            value={tempQuantities[item.item_id] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: '' }));
                                return;
                              }
                              if (item.category === 'Kilo') {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && numValue >= 1) {
                                  setTempQuantities(prev => ({ ...prev, [item.item_id]: numValue }));
                                }
                              } else {
                                const isIntegerString = /^\d+$/.test(value);
                                if (isIntegerString) {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue) && numValue >= 1) {
                                    setTempQuantities(prev => ({ ...prev, [item.item_id]: numValue }));
                                  }
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: 1 }));
                                return;
                              }
                              if (item.category === 'Kilo') {
                                const numValue = parseFloat(e.target.value);
                                if (!isNaN(numValue)) {
                                  const clamped = Math.max(1, numValue);
                                  const availableStock = typeof item.available_stock === 'number' 
                                    ? item.available_stock 
                                    : parseFloat(String(item.available_stock)) || 0;
                                  const capped = Math.min(availableStock, clamped);
                                  const roundedQuarter = Math.round(capped * 4) / 4;
                                  const next = Number(roundedQuarter.toFixed(2));
                                  setTempQuantities(prev => ({ ...prev, [item.item_id]: next }));
                                  if (next > availableStock) {
                                    setQuantityErrors(prev => ({ ...prev, [item.item_id]: `Maximum available: ${formatQuantityDisplay(availableStock, item.category)} ${item.category}` }));
                                  } else {
                                    setQuantityErrors(prev => ({ ...prev, [item.item_id]: '' }));
                                  }
                                }
                              } else {
                                const numValue = parseInt(e.target.value);
                                if (!isNaN(numValue)) {
                                  const availableStock = typeof item.available_stock === 'number' 
                                    ? item.available_stock 
                                    : parseFloat(String(item.available_stock)) || 0;
                                  const next = Math.min(availableStock, Math.max(1, Math.floor(numValue)));
                                  setTempQuantities(prev => ({ ...prev, [item.item_id]: next }));
                                  if (next > availableStock) {
                                    setQuantityErrors(prev => ({ ...prev, [item.item_id]: `Maximum available: ${formatQuantityDisplay(availableStock, item.category)} ${item.category}` }));
                                  } else {
                                    setQuantityErrors(prev => ({ ...prev, [item.item_id]: '' }));
                                  }
                                }
                              }
                            }}
                            className="w-24 text-center border rounded p-2 border-blue-200 bg-blue-50 text-blue-700 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQty = typeof tempQuantities[item.item_id] === 'number'
                                ? (tempQuantities[item.item_id] as number)
                                : tempQuantities[item.item_id] === ''
                                ? 1
                                : Number(tempQuantities[item.item_id] || item.quantity) || 0;
                              const availableStock = typeof item.available_stock === 'number' 
                                ? item.available_stock 
                                : parseFloat(String(item.available_stock)) || 0;
                              if (item.category === 'Kilo') {
                                const incremented = currentQty + 0.25;
                                const clamped = Math.min(availableStock, Math.max(1, incremented));
                                const roundedQuarter = Math.round(clamped * 4) / 4;
                                const next = Number(roundedQuarter.toFixed(2));
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: next }));
                                if (next >= availableStock) {
                                  setQuantityErrors(prev => ({ ...prev, [item.item_id]: `Maximum available: ${formatQuantityDisplay(availableStock, item.category)} ${item.category}` }));
                                } else {
                                  setQuantityErrors(prev => ({ ...prev, [item.item_id]: '' }));
                                }
                              } else {
                                const newQty = Math.min(availableStock, Math.floor(currentQty + 1));
                                setTempQuantities(prev => ({ ...prev, [item.item_id]: newQty }));
                                if (newQty >= availableStock) {
                                  setQuantityErrors(prev => ({ ...prev, [item.item_id]: `Maximum available: ${formatQuantityDisplay(availableStock, item.category)} ${item.category}` }));
                                } else {
                                  setQuantityErrors(prev => ({ ...prev, [item.item_id]: '' }));
                                }
                              }
                            }}
                            disabled={
                              (Number((tempQuantities[item.item_id] as any) || item.quantity) || 0) >= 
                              (typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0)
                            }
                            className="px-2 dark:border-gray-600 dark:text-gray-200"
                          >
                            {item.category === 'Kilo' ? '+0.25' : '+'}
                          </Button>
                          <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            Available: {formatQuantityDisplay(typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0, item.category)} {item.category}
                          </div>
                        </>
                      ) : (
                        <div className="w-20 text-center border rounded p-2 bg-blue-50 border-blue-200 text-blue-700 font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          {formatQuantityDisplay(item.quantity, item.category)}
                        </div>
                      )}
                    </div>
                    {editingItems.has(item.item_id) ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            // Save normalized value on Done
                            const currentQty = typeof tempQuantities[item.item_id] === 'number'
                              ? (tempQuantities[item.item_id] as number)
                              : tempQuantities[item.item_id] === ''
                              ? 1
                              : Number(tempQuantities[item.item_id] || item.quantity) || 0;
                            const availableStock = typeof item.available_stock === 'number' 
                              ? item.available_stock 
                              : parseFloat(String(item.available_stock)) || 0;
                            let normalized: number;
                            if (item.category === 'Kilo') {
                              normalized = Math.max(1, currentQty);
                              normalized = Math.min(availableStock, normalized);
                              normalized = Math.round(normalized * 4) / 4;
                              normalized = Number(normalized.toFixed(2));
                            } else {
                              normalized = Math.max(1, Math.floor(currentQty));
                              normalized = Math.min(availableStock, normalized);
                            }
                            setTempQuantities(prev => ({ ...prev, [item.item_id]: normalized }));
                            updateItemQuantity(item.item_id, normalized);
                            exitEditMode(item.item_id);
                          }}
                          disabled={updatingItems.has(item.item_id) || !!quantityErrors[item.item_id]}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exitEditMode(item.item_id)}
                          disabled={updatingItems.has(item.item_id)}
                          className="border-gray-400 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => enterEditMode(item.item_id)}
                        disabled={updatingItems.has(item.item_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  <div className="text-red-500 text-sm mt-1 dark:text-red-400">
                    {quantityErrors[item.item_id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-green-600">Cart Total:</span>
              <span className="text-lg font-bold text-green-600">Php{(Number(cartTotal) || 0).toFixed(2)}</span>
            </div>
            
            {/* Minimum Order Requirement */}
            <div className={`text-sm ${meetsMinimumOrder ? 'text-green-600' : 'text-orange-600'}`}>
              {meetsMinimumOrder ? (
                <span>✓ Minimum order requirement met (Php{minimumOrder})</span>
              ) : (
                <span>⚠ Minimum order requirement: Php{minimumOrder} (add Php{(minimumOrder - (Number(cartTotal) || 0)).toFixed(2)} more)</span>
              )}
            </div>
            
            {/* Approval Note */}
            <div className="text-sm text-blue-600 mt-2">
              <span>Note: This order requires approval. Please expect a confirmation call regarding your order.</span>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            onClick={handleCheckout} 
            disabled={cartItems.length === 0 || editingItems.size > 0 || !meetsMinimumOrder}
            className={!meetsMinimumOrder ? 'opacity-50 cursor-not-allowed' : ''}
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
          {!meetsMinimumOrder && cartItems.length > 0 && (
            <div className="mt-2 text-orange-600 text-sm">
              Please add more items to meet the minimum order requirement of Php{minimumOrder}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog removed; updates are instant */}
    </AppHeaderLayout>
  );
} 