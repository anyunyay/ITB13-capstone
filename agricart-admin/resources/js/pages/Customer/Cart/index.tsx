import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, AlertTriangle, Home, Building2, CheckCircle, Circle, ShoppingCart } from 'lucide-react';

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

interface Address {
  id: number | null; // Can be null for registration address
  street: string;
  barangay: string;
  city: string;
  province: string;
  is_active: boolean;
}

interface MainAddress {
  address: string;
  barangay: string;
  city: string;
  province: string;
}

export default function CartPage() {
  const page = usePage<Partial<SharedData> & { 
    cart?: Record<string, CartItem>; 
    checkoutMessage?: string; 
    cartTotal?: number;
    addresses?: Address[];
    activeAddress?: Address;
    flash?: {
      success?: string;
      error?: string;
    };
  }>();
  const auth = page?.props?.auth;
  const initialCart = page?.props?.cart || {};
  const addresses = page?.props?.addresses || [];
  const activeAddress = page?.props?.activeAddress;
  const [cart, setCart] = useState<Record<string, CartItem>>(initialCart);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(page?.props?.checkoutMessage || null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [tempQuantities, setTempQuantities] = useState<Record<number, number | string>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});

  const [editingItems, setEditingItems] = useState<Set<number>>(new Set());
  const [cartTotal, setCartTotal] = useState<number>(page?.props?.cartTotal || 0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // Address confirmation dialog state
  const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);
  const [pendingAddressId, setPendingAddressId] = useState<number | null>(null);
  const [pendingAddress, setPendingAddress] = useState<Address | null>(null);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

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

  // Set default address when addresses are loaded
  useEffect(() => {
    // Always prioritize the active address from user_addresses table where is_active = 1
    if (activeAddress && activeAddress.id) {
      setSelectedAddressId(activeAddress.id);
    } else if (addresses.length > 0 && !selectedAddressId) {
      // If no active address but we have addresses, pick the first one
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, activeAddress]);

  // Handle flash messages from server
  useEffect(() => {
    if (page?.props?.flash?.success) {
      setCheckoutMessage(page.props.flash.success);
    } else if (page?.props?.flash?.error) {
      setCheckoutMessage(page.props.flash.error);
    }
  }, [page?.props?.flash]);

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

  const handleAddressChange = (addressId: number) => {
    const address = addresses.find(addr => addr.id === addressId);
    
    if (!address) return;
    
    // Always show confirmation dialog when switching addresses
    setPendingAddressId(addressId);
    setPendingAddress(address);
    setShowAddressConfirmation(true);
  };

  const confirmAddressChange = () => {
    if (!pendingAddress) return;
    
    setIsUpdatingAddress(true);
    
    if (pendingAddressId === null) {
      // Switching back to registration address - just update local state
      setSelectedAddressId(null);
      setShowAddressConfirmation(false);
      setPendingAddressId(null);
      setPendingAddress(null);
      setIsUpdatingAddress(false);
      setCheckoutMessage('Switched to active address successfully!');
    } else {
      // Switching to a different address from addresses table
      router.post(
        `/customer/profile/addresses/${pendingAddressId}/update-main`,
        {},
        {
          preserveScroll: true,
          onSuccess: (page: any) => {
            // Update local state immediately to reflect the change
            setSelectedAddressId(pendingAddressId);
            setShowAddressConfirmation(false);
            setPendingAddressId(null);
            setPendingAddress(null);
            setIsUpdatingAddress(false);
            
            // Show success message
            if (page.props?.flash?.success) {
              setCheckoutMessage(page.props.flash.success);
            } else {
              setCheckoutMessage('Address updated successfully!');
            }
          },
          onError: (errors) => {
            setIsUpdatingAddress(false);
            setCheckoutMessage('Failed to update address. Please try again.');
          },
        }
      );
    }
  };

  const cancelAddressChange = () => {
    setShowAddressConfirmation(false);
    setPendingAddressId(null);
    setPendingAddress(null);
  };

  const handleCheckout = () => {
    // If no address is selected and we have an active address, we're using the active address
    if (!selectedAddressId && !activeAddress) {
      setCheckoutMessage('Please select a delivery address.');
      return;
    }

    router.post(
      '/customer/cart/checkout',
      { 
        delivery_address_id: selectedAddressId,
        use_main_address: !selectedAddressId && !!activeAddress
      },
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
      <div className="min-h-[90vh] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Notification Messages - Top of Page */}
          {checkoutMessage && (
            <div className={`mb-6 p-4 rounded-xl shadow-lg ${
              checkoutMessage.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center gap-3">
                {checkoutMessage.includes('successfully') ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className="text-sm font-semibold">{checkoutMessage}</span>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Your cart is empty</h2>
              <p className="text-green-600 dark:text-green-400 mb-8">Start adding fresh produce to your cart to get started!</p>
              <Button 
                onClick={() => router.visit('/customer/produce')}
                className="px-8 py-3 text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Cart Items
                </h2>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full border border-green-200 dark:border-green-700">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-700">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3">
                      <div className="col-span-4">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Product</h3>
                      </div>
                      <div className="col-span-1 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Category</h3>
                      </div>
                      <div className="col-span-2 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Quantity</h3>
                      </div>
                      <div className="col-span-2 text-left">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Unit Price</h3>
                      </div>
                      <div className="col-span-2 text-left">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Subtotal</h3>
                      </div>
                      <div className="col-span-1 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide"></h3>
                      </div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                      <div key={item.item_id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                          {/* Product Column */}
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              {/* Product Image */}
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 dark:text-green-400 text-xs font-medium">IMG</span>
                              </div>
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Product ID: {item.product_id}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    {item.category}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>In Stock</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Category Column */}
                          <div className="col-span-1 text-center">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {item.category}
                            </span>
                          </div>
                          
                          {/* Quantity Column */}
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
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
                                    className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 flex items-center justify-center font-bold text-xs"
                                  >
                                    −
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
                                    className="w-14 h-7 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all duration-200"
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
                                    className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 flex items-center justify-center font-bold text-xs"
                                  >
                                    +
                                  </Button>
                                </>
                              ) : (
                                <div className="w-14 h-7 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm flex items-center justify-center">
                                  {formatQuantityDisplay(item.quantity, item.category)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Unit Price Column */}
                          <div className="col-span-2 text-left">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              ₱{((Number(item.total_price) || 0) / (Number(item.quantity) || 1)).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              per {item.category}
                            </div>
                          </div>

                          {/* Subtotal Column */}
                          <div className="col-span-2 text-left">
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              ₱{(Number(item.total_price) || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Available: {formatQuantityDisplay(typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0, item.category)}
                            </div>
                          </div>

                          {/* Remove Column */}
                          <div className="col-span-1 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeItem(item.item_id)}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        
                        {/* Action Buttons Row - Full Width */}
                        <div className="col-span-12 px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-center gap-3">
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
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                >
                                  {updatingItems.has(item.item_id) ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Saving...</span>
                                    </div>
                                  ) : (
                                    'Save Changes'
                                  )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exitEditMode(item.item_id)}
                                disabled={updatingItems.has(item.item_id)}
                                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 px-6 py-2 rounded-xl font-semibold transition-all duration-200"
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
                                className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 px-6 py-2 rounded-xl font-semibold transition-all duration-200"
                            >
                              Edit Quantity
                            </Button>
                          )}
                      </div>
                    </div>
                    
                        {/* Error Display */}
                        {quantityErrors[item.item_id] && (
                          <div className="col-span-12 px-6 py-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-t border-red-200 dark:border-red-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div>
                                <span className="text-red-700 dark:text-red-300 text-sm font-semibold">
                            {quantityErrors[item.item_id]}
                          </span>
                              </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address and Order Summary Section */}
              <div className="lg:col-span-1 space-y-5 sticky top-24 self-start">
                {/* Delivery Address Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 p-4.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">Delivery Address</h3>
                  </div>
                  
                  {activeAddress ? (
                    <div className="space-y-3.5">
                      {/* Currently Selected Address */}
                      <div className="p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                            {selectedAddressId 
                              ? 'Selected Address' 
                              : 'Active Address (Auto-Selected)'
                            }
                          </span>
                        </div>
                        <div className="pl-1">
                          {selectedAddressId ? (
                            // Show selected address - check if it's the active address or from dropdown
                            (() => {
                              // First check if the selected address is the active address
                              if (activeAddress && activeAddress.id === selectedAddressId) {
                                return (
                                  <>
                                    <span className="font-medium text-green-800 dark:text-green-200 text-sm">{activeAddress.street}</span>
                                    <span className="text-xs text-green-600 dark:text-green-400 block">
                                      {activeAddress.barangay}, {activeAddress.city}, {activeAddress.province}
                                    </span>
                                    <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                                      ✓ Active address will be used for delivery
                                    </span>
                                  </>
                                );
                              }
                              
                              // Otherwise, look for it in the addresses dropdown
                              const selectedAddr = addresses.find(addr => addr.id === selectedAddressId);
                              return selectedAddr ? (
                                <>
                                  <span className="font-medium text-green-800 dark:text-green-200 text-sm">{selectedAddr.street}</span>
                                  <span className="text-xs text-green-600 dark:text-green-400 block">
                                    {selectedAddr.barangay}, {selectedAddr.city}, {selectedAddr.province}
                                  </span>
                                  <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                                    ✓ This address will be used for delivery
                                  </span>
                                </>
                              ) : null;
                            })()
                          ) : (
                            // Show active address when no specific selection
                            <>
                              <span className="font-medium text-green-800 dark:text-green-200 text-sm">{activeAddress.street}</span>
                              <span className="text-xs text-green-600 dark:text-green-400 block">
                                {activeAddress.barangay}, {activeAddress.city}, {activeAddress.province}
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                                ✓ This address will be used for delivery automatically
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Address Selection Dropdown */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <Label htmlFor="delivery-address" className="text-xs font-semibold text-green-600 dark:text-green-400">
                            Switch to Different Address
                          </Label>
                        </div>
                        
                        <Select 
                          value={selectedAddressId ? selectedAddressId.toString() : ''} 
                          onValueChange={(value) => {
                            if (value === 'active') {
                              // Switching back to active address
                              if (selectedAddressId) {
                                setPendingAddressId(null);
                                setPendingAddress({
                                  id: null,
                                  street: activeAddress.street,
                                  barangay: activeAddress.barangay,
                                  city: activeAddress.city,
                                  province: activeAddress.province,
                                  is_active: true
                                });
                                setShowAddressConfirmation(true);
                              }
                            } else {
                              const addressId = parseInt(value);
                              if (!isNaN(addressId)) {
                                handleAddressChange(addressId);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-10 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <SelectValue placeholder="Choose a different address" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
                            {/* Active Address Option - show if we have an active address and it's not currently selected */}
                            {activeAddress && activeAddress.id !== selectedAddressId && (
                              <SelectItem value="active" className="p-3 hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-50 dark:focus:bg-green-900/20">
                                <div className="flex items-start gap-3 w-full">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-green-800 dark:text-green-200 truncate">{activeAddress.street}</span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                        Active
                                      </span>
                                    </div>
                                    <p className="text-sm text-green-600 dark:text-green-400 truncate">
                                      {activeAddress.barangay}, {activeAddress.city}, {activeAddress.province}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            )}
                            
                            {/* All Addresses - exclude currently selected one */}
                            {addresses
                              .filter(address => address.id !== selectedAddressId && address.id !== null)
                              .map((address) => (
                              <SelectItem key={address.id || 'unknown'} value={address.id?.toString() || ''} className="p-3 hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-50 dark:focus:bg-green-900/20">
                                <div className="flex items-start gap-3 w-full">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-green-800 dark:text-green-200 truncate">{address.street}</span>
                                      {address.is_active && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-green-600 dark:text-green-400 truncate">
                                      {address.barangay}, {address.city}, {address.province}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            
                            {/* Empty state */}
                            {addresses.filter(address => address.id !== selectedAddressId).length === 0 && 
                             (!activeAddress || activeAddress.id === selectedAddressId) && (
                              <div className="p-4 text-center text-green-600 dark:text-green-400">
                                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-400 dark:text-green-500" />
                                <p className="text-sm">No other addresses available</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.visit('/customer/profile/addresses?add_address=true')}
                          className="flex items-center gap-2 w-full border-2 border-dashed border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors text-xs py-2"
                        >
                          <Plus className="h-3 w-3" />
                          Add New Address
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-sm text-green-600 dark:text-green-400">No delivery addresses found. Please add an address to continue.</p>
                      <Button
                        onClick={() => router.visit('/customer/profile/addresses?add_address=true')}
                        className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Address
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order Summary Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 p-4.5">
                  <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2.5">Order Summary</h3>
                  
                  <div className="space-y-1.5 mb-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 dark:text-green-400">Subtotal:</span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{(Number(cartTotal) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 dark:text-green-400">Delivery Fee (10%):</span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{((Number(cartTotal) || 0) * 0.10).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-green-200 dark:border-green-700 pt-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Total:</span>
                        <span className="text-base font-bold text-green-600 dark:text-green-400">₱{((Number(cartTotal) || 0) * 1.10).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Minimum Order Requirement */}
                  <div className={`p-2 rounded-lg mb-2.5 ${meetsMinimumOrder ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700'}`}>
                    <div className="flex items-center gap-2">
                      {meetsMinimumOrder ? (
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      )}
                      <span className={`text-xs font-medium ${meetsMinimumOrder ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {meetsMinimumOrder ? (
                          `✓ Minimum order requirement met (₱${minimumOrder})`
                        ) : (
                          `⚠ Minimum order requirement: ₱${minimumOrder} (add ₱${(minimumOrder - (Number(cartTotal) || 0)).toFixed(2)} more)`
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Approval Note */}
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Note: This order requires approval. Please expect a confirmation call regarding your order.
                      </span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <div className="mt-4.5">
                    <Button 
                      onClick={handleCheckout} 
                      disabled={cartItems.length === 0 || editingItems.size > 0 || !meetsMinimumOrder || (!selectedAddressId && !activeAddress)}
                      className={`w-full py-2 text-sm font-semibold transition-all duration-300 rounded-lg shadow-md hover:shadow-lg ${
                        !meetsMinimumOrder || (!selectedAddressId && !activeAddress) 
                          ? 'opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
                    </Button>
                    
                    
                    {editingItems.size > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Please complete or cancel all pending updates before checkout
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {!meetsMinimumOrder && cartItems.length > 0 && (
                      <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Please add more items to meet the minimum order requirement of ₱{minimumOrder}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {(!selectedAddressId && !activeAddress) && cartItems.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Please select a delivery address to continue with checkout
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Confirmation Dialog */}
      <Dialog open={showAddressConfirmation} onOpenChange={setShowAddressConfirmation}>
        <DialogContent className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              Confirm Address Change
            </DialogTitle>
            <DialogDescription className="text-green-600 dark:text-green-400">
              {pendingAddressId === null 
                ? "You are about to switch back to your active address for delivery."
                : "You are about to change your delivery address. This will also update your main address in your profile."
              }
            </DialogDescription>
          </DialogHeader>
          
          {pendingAddress && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  {pendingAddressId === null ? 'Active Address:' : 'New Address:'}
                </h4>
                <p className="text-green-700 dark:text-green-300 font-medium">{pendingAddress.street}</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {pendingAddress.barangay}, {pendingAddress.city}, {pendingAddress.province}
                </p>
                {pendingAddressId === null && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                    ✓ This is your active address
                  </p>
                )}
              </div>
              
              <div className="text-sm text-green-600 dark:text-green-400">
                <p className="font-medium mb-2">This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set this as your delivery address for this order</li>
                  {pendingAddressId !== null && (
                    <li>Update your main address in your profile</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelAddressChange}
              disabled={isUpdatingAddress}
              className="border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAddressChange}
              disabled={isUpdatingAddress}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingAddress ? 'Updating...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppHeaderLayout>
  );
}