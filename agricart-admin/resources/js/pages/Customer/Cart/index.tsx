import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [tempQuantities, setTempQuantities] = useState<Record<number, number>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});
  const [rawInputValues, setRawInputValues] = useState<Record<number, string>>({});
  const [editingItems, setEditingItems] = useState<Set<number>>(new Set());
  const [cartTotal, setCartTotal] = useState<number>(page?.props?.cartTotal || 0);

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
    const rawInput: Record<number, string> = {};
    
    Object.values(initialCart).forEach(item => {
      // Only set if not currently being edited
      if (!editingItems.has(item.item_id)) {
        // Format quantity based on category using helper function
        const formattedQuantity = formatQuantityForDisplay(item.quantity, item.category);
        
        tempQty[item.item_id] = item.quantity;
        rawInput[item.item_id] = formattedQuantity;
      }
    });
    
    // Merge with existing values instead of replacing
    setTempQuantities(prev => ({ ...prev, ...tempQty }));
    setRawInputValues(prev => ({ ...prev, ...rawInput }));

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

    const oldQuantity = itemToUpdate.quantity;
    
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

  const handleQuantityChange = (cartItem: number, value: string, category: string, availableStock: number | string) => {
    // Only allow changes if item is in edit mode
    if (!editingItems.has(cartItem)) {
      return;
    }

    // Update raw input value immediately
    setRawInputValues(prev => ({ ...prev, [cartItem]: value }));

    if (value === '' || value === null || value === undefined) {
      setTempQuantities(prev => ({ ...prev, [cartItem]: 0 }));
      setQuantityErrors(prev => ({ ...prev, [cartItem]: '' }));
      return;
    }

    let numericValue: number;

    if (category === 'Kilo') {
      numericValue = parseFloat(value) || 0;
    } else {
      // Remove dots and commas for non-kilo items and ensure integer
      const cleanValue = value.replace(/\./g, '').replace(/,/g, '');
      numericValue = parseInt(cleanValue) || 0;
      
      // If user tried to enter a decimal, show an error
      if (value.includes('.') || value.includes(',')) {
        setQuantityErrors(prev => ({ 
          ...prev, 
          [cartItem]: `${category} quantities must be whole numbers` 
        }));
        return;
      }
    }

    const numAvailableStock = typeof availableStock === 'number' ? availableStock : parseFloat(String(availableStock)) || 0;

    // Cap the value at available stock
    if (numericValue > numAvailableStock) {
      numericValue = numAvailableStock;
      // Don't auto-update the input value to avoid confusion
    }

    // Update temp quantities
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
      const currentQuantity = currentItem.quantity;
      
      // Format quantity based on category using helper function
      const formattedQuantity = formatQuantityForDisplay(currentQuantity, currentItem.category);
      
      // Set both raw input and temp quantities
      setRawInputValues(prev => ({ 
        ...prev, 
        [cartItem]: formattedQuantity
      }));
      setTempQuantities(prev => ({ 
        ...prev, 
        [cartItem]: currentQuantity
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
    
    // Reset to current cart values instead of clearing
    const currentItem = cart[cartItem];
    if (currentItem) {
      // Format quantity based on category using helper function
      const formattedQuantity = formatQuantityForDisplay(currentItem.quantity, currentItem.category);
      
      setRawInputValues(prev => ({
        ...prev,
        [cartItem]: formattedQuantity
      }));
      setTempQuantities(prev => ({
        ...prev,
        [cartItem]: currentItem.quantity
      }));
    } else {
      // Clear if item no longer exists
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
      // For kilo items, keep as decimal
      return numQuantity;
    } else {
      // For Tali, Pc, and other items, convert to integer
      return Math.floor(numQuantity);
    }
  };

  const getInputValue = (item: CartItem) => {
    // If in edit mode, show raw input value
    if (editingItems.has(item.item_id)) {
      const rawValue = rawInputValues[item.item_id];
      if (rawValue !== undefined) {
        return rawValue;
      }
      // Fallback to current cart quantity if no raw input
      return formatQuantityForDisplay(item.quantity, item.category);
    }
    
    // Show the actual cart quantity (not editable)
    const currentValue = item.quantity;
    
    if (currentValue === 0 || currentValue === null || currentValue === undefined) return '';
    
    // Use helper function for consistent formatting
    return formatQuantityForDisplay(currentValue, item.category);
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
                    Php{item.total_price.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`quantity-${item.item_id}`} className="text-sm font-medium">
                      Qty:
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={item.category === 'Kilo' ? "0.01" : "1"}
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
                    </div>
                    {editingItems.has(item.item_id) ? (
                      <>
                        <Button
                          variant="default"
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
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {updatingItems.has(item.item_id) ? 'Updating...' : 'Confirm Update'}
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
        
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">Cart Total:</span>
              <span className="text-lg font-bold text-green-600">Php{cartTotal.toFixed(2)}</span>
            </div>
            
            {/* Minimum Order Requirement */}
            <div className={`text-sm ${meetsMinimumOrder ? 'text-green-600' : 'text-orange-600'}`}>
              {meetsMinimumOrder ? (
                <span>✓ Minimum order requirement met (Php{minimumOrder})</span>
              ) : (
                <span>⚠ Minimum order requirement: Php{minimumOrder} (add Php{(minimumOrder - cartTotal).toFixed(2)} more)</span>
              )}
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
    </AppHeaderLayout>
  );
} 