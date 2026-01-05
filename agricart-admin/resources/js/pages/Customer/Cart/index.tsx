import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import type { SharedData } from '@/types';
import StockManager from '@/lib/stock-manager';
import { CartItem } from './components/CartItem';
import { CartSummary } from './components/CartSummary';
import { AddressSelector } from './components/AddressSelector';
import { AddressConfirmationDialog } from './components/AddressConfirmationDialog';
import type { CartItem as CartItemType, Address } from './types';
import { useTranslation } from '@/hooks/use-translation';

interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  reset_at: string | null;
  current_count: number;
}

interface PageProps {
  [key: string]: any;
  auth?: SharedData['auth'];
  cart?: Record<string, CartItemType>;
  checkoutMessage?: string;
  cartTotal?: number;
  addresses?: Address[];
  activeAddress?: Address;
  rateLimitInfo?: RateLimitInfo;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CartPage() {
  const page = usePage<PageProps>();
  const auth = page?.props?.auth;
  const initialCart = page?.props?.cart || {};
  const addresses = page?.props?.addresses || [];
  const activeAddress = page?.props?.activeAddress;
  const rateLimitInfo = page?.props?.rateLimitInfo;
  const t = useTranslation();

  const [cart, setCart] = useState<Record<string, CartItemType>>(initialCart);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(page?.props?.checkoutMessage || null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [tempQuantities, setTempQuantities] = useState<Record<number, number | string>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});
  const [editingItems, setEditingItems] = useState<Set<number>>(new Set());
  const [cartTotal, setCartTotal] = useState<number>(page?.props?.cartTotal || 0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Rate limit countdown state
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>('');
  const [resetTime, setResetTime] = useState<Date | null>(null);

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
    const hasCartChanged = JSON.stringify(initialCart) !== JSON.stringify(cart);
    const hasTotalChanged = page?.props?.cartTotal !== cartTotal;

    if (hasCartChanged) {
      setCart(initialCart);
    }

    if (hasTotalChanged) {
      setCartTotal(page?.props?.cartTotal || 0);
    }

    const tempQty: Record<number, number> = {};
    Object.values(initialCart).forEach(item => {
      if (!editingItems.has(item.item_id)) {
        const baseQty = Number(item.quantity) || 0;
        const formattedQuantity = item.category === 'Kilo'
          ? Number((Math.max(1, baseQty) * 4).toFixed(0)) / 4
          : Math.floor(Math.max(1, baseQty));
        tempQty[item.item_id] = formattedQuantity;
      }
    });

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
    if (activeAddress && activeAddress.id) {
      setSelectedAddressId(activeAddress.id);
    } else if (addresses.length > 0 && !selectedAddressId) {
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

  // Initialize rate limit state
  useEffect(() => {
    if (rateLimitInfo) {
      setIsRateLimited(!rateLimitInfo.allowed);
      if (rateLimitInfo.reset_at) {
        setResetTime(new Date(rateLimitInfo.reset_at));
      }
    }
  }, [rateLimitInfo]);

  // Countdown timer effect
  useEffect(() => {
    if (!isRateLimited || !resetTime) {
      setCountdownText('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setIsRateLimited(false);
        setCountdownText('');
        setResetTime(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setCountdownText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setCountdownText(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, resetTime]);

  const removeItem = (cartItem: number) => {
    const itemToRemove = Object.values(cart).find(item => item.item_id === cartItem);

    router.delete(`/customer/cart/remove/${cartItem}`, {
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props.cart) setCart(page.props.cart as Record<string, CartItemType>);
        if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);

        if (itemToRemove) {
          const stockManager = StockManager.getInstance();
          stockManager.removeItemFromCart(itemToRemove.product_id, itemToRemove.category);
        }
      },
    });
  };

  const updateItemQuantity = (cartItem: number, newQuantity: number) => {
    if (newQuantity <= 0 || newQuantity === null || newQuantity === undefined || isNaN(newQuantity)) {
      removeItem(cartItem);
      return;
    }

    const itemToUpdate = Object.values(cart).find(item => item.item_id === cartItem);
    if (!itemToUpdate) return;

    const oldQuantity = Number(itemToUpdate.quantity) || 0;
    const formattedQuantity = formatQuantityForStorage(newQuantity, itemToUpdate.category);
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

    router.put(`/customer/cart/update/${cartItem}`, { quantity: formattedQuantity }, {
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props.cart) setCart(page.props.cart as Record<string, CartItemType>);
        if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartItem);
          return newSet;
        });

        if (itemToUpdate) {
          const stockManager = StockManager.getInstance();
          const quantityDifference = formattedQuantity - oldQuantity;
          if (quantityDifference > 0) {
            stockManager.addToCart(itemToUpdate.product_id, itemToUpdate.category, quantityDifference);
          } else if (quantityDifference < 0) {
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
    });
  };

  const enterEditMode = useCallback((cartItem: number) => {
    setEditingItems(prev => new Set(prev).add(cartItem));

    const currentItem = cart[cartItem];
    if (currentItem) {
      const currentQuantity = Number(currentItem.quantity) || 0;
      const formattedQuantity = currentItem.category === 'Kilo'
        ? Number((Math.max(1, currentQuantity) * 4).toFixed(0)) / 4
        : Math.floor(Math.max(1, currentQuantity));

      setTempQuantities(prev => ({ ...prev, [cartItem]: formattedQuantity }));
      setQuantityErrors(prev => ({ ...prev, [cartItem]: '' }));
    }
  }, [cart]);

  const exitEditMode = useCallback((cartItem: number) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(cartItem);
      return newSet;
    });

    const currentItem = cart[cartItem];
    if (currentItem) {
      const baseQty = Number(currentItem.quantity) || 0;
      const formattedQuantity = currentItem.category === 'Kilo'
        ? Number((Math.max(1, baseQty) * 4).toFixed(0)) / 4
        : Math.floor(Math.max(1, baseQty));

      setTempQuantities(prev => ({ ...prev, [cartItem]: formattedQuantity }));
    } else {
      setTempQuantities(prev => {
        const newTemp = { ...prev };
        delete newTemp[cartItem];
        return newTemp;
      });
    }

    setQuantityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cartItem];
      return newErrors;
    });
  }, [cart]);

  const formatQuantityDisplay = (quantity: number | string | undefined, category: string) => {
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;
    return category === 'Kilo' ? numQuantity.toFixed(2) : Math.floor(numQuantity).toString();
  };

  const formatQuantityForStorage = (quantity: number | string | undefined, category: string) => {
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;

    if (category === 'Kilo') {
      const clamped = Math.max(1, numQuantity);
      return Math.round(clamped * 4) / 4;
    } else {
      return Math.floor(numQuantity);
    }
  };

  const handleAddressChange = (addressId: number | null) => {
    if (addressId === null) {
      // Switching back to active address
      if (selectedAddressId) {
        setPendingAddressId(null);
        setPendingAddress({
          id: null,
          street: activeAddress?.street || '',
          barangay: activeAddress?.barangay || '',
          city: activeAddress?.city || '',
          province: activeAddress?.province || '',
          is_active: true
        });
        setShowAddressConfirmation(true);
      }
    } else {
      const address = addresses.find(addr => addr.id === addressId);
      if (!address) return;

      setPendingAddressId(addressId);
      setPendingAddress(address);
      setShowAddressConfirmation(true);
    }
  };

  const confirmAddressChange = () => {
    if (!pendingAddress) return;

    setIsUpdatingAddress(true);

    if (pendingAddressId === null) {
      setSelectedAddressId(null);
      setShowAddressConfirmation(false);
      setPendingAddressId(null);
      setPendingAddress(null);
      setIsUpdatingAddress(false);
      setCheckoutMessage('Switched to active address successfully!');
    } else {
      router.post(`/customer/profile/addresses/${pendingAddressId}/update-main`, {}, {
        preserveScroll: true,
        onSuccess: (page: any) => {
          setSelectedAddressId(pendingAddressId);
          setShowAddressConfirmation(false);
          setPendingAddressId(null);
          setPendingAddress(null);
          setIsUpdatingAddress(false);

          if (page.props?.flash?.success) {
            setCheckoutMessage(page.props.flash.success);
          } else {
            setCheckoutMessage('Address updated successfully!');
          }
        },
        onError: () => {
          setIsUpdatingAddress(false);
          setCheckoutMessage('Failed to update address. Please try again.');
        },
      });
    }
  };

  const cancelAddressChange = () => {
    setShowAddressConfirmation(false);
    setPendingAddressId(null);
    setPendingAddress(null);
  };

  const handleCheckout = () => {
    if (!selectedAddressId && !activeAddress) {
      setCheckoutMessage(t('ui.please_select_delivery_address'));
      return;
    }

    router.post('/customer/cart/checkout', {
      delivery_address_id: selectedAddressId,
      use_main_address: !selectedAddressId && !!activeAddress
    }, {
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props.cart) setCart(page.props.cart as Record<string, CartItemType>);
        if (page.props.checkoutMessage) setCheckoutMessage(page.props.checkoutMessage as string);
        if (page.props.cartTotal) setCartTotal(page.props.cartTotal as number);

        const stockManager = StockManager.getInstance();
        stockManager.clearCart();
      },
    });
  };

  const cartItems = Object.values(cart);
  const minimumOrder = 75;
  const meetsMinimumOrder = cartTotal >= minimumOrder;

  return (
    <AppHeaderLayout>
      <Head title={t('ui.cart')} />
      <div className="min-h-[90vh] py-4 sm:py-6 lg:py-7 xl:py-8 mt-16 sm:mt-18 lg:mt-19 xl:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 xl:px-8">

          {/* Notification Messages */}
          {checkoutMessage && (
            <div className={`mb-6 p-4 rounded-xl shadow-lg ${checkoutMessage.includes('successfully')
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
              <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-green-600 dark:text-green-400 mb-4">{t('ui.your_cart_is_empty')}</h2>
              <p className="text-base md:text-xl lg:text-xl xl:text-2xl text-green-600 dark:text-green-400 mb-8">{t('ui.start_adding_fresh_produce')}</p>
              <Button
                onClick={() => router.visit('/customer/produce')}
                className="px-8 py-3 text-base md:text-base lg:text-base xl:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
              >
                {t('ui.browse_products')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 xl:gap-8">
              {/* Cart Items Section */}
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-green-600 dark:text-green-400">
                    {t('ui.cart_items')}
                  </h2>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full border border-green-200 dark:border-green-700">
                    <span className="text-base md:text-xl lg:text-xl xl:text-2xl font-semibold text-green-700 dark:text-green-300">
                      {cartItems.length} {cartItems.length === 1 ? t('ui.item') : t('ui.items')}
                    </span>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                  {/* Desktop Table Header */}
                  <div className="hidden lg:block bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-700">
                    <div className="grid grid-cols-12 gap-3 px-6 py-3">
                      <div className="col-span-3 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">{t('ui.product')}</h3>
                      </div>
                      <div className="col-span-2 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">{t('ui.category')}</h3>
                      </div>
                      <div className="col-span-2 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">{t('ui.quantity')}</h3>
                      </div>
                      <div className="col-span-2 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">{t('ui.unit_price')}</h3>
                      </div>
                      <div className="col-span-2 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">{t('ui.subtotal')}</h3>
                      </div>
                      <div className="col-span-1 text-center">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide"></h3>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items Body */}
                  <div className="divide-y divide-border">
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.item_id}
                        item={item}
                        isEditing={editingItems.has(item.item_id)}
                        isUpdating={updatingItems.has(item.item_id)}
                        tempQuantity={tempQuantities[item.item_id] ?? item.quantity}
                        quantityError={quantityErrors[item.item_id] || ''}
                        onEnterEditMode={() => enterEditMode(item.item_id)}
                        onExitEditMode={() => exitEditMode(item.item_id)}
                        onUpdateQuantity={(qty) => updateItemQuantity(item.item_id, qty)}
                        onRemove={() => removeItem(item.item_id)}
                        onTempQuantityChange={(qty) => setTempQuantities(prev => ({ ...prev, [item.item_id]: qty }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Section */}
              <div className="space-y-6">
                {/* Delivery Address Section */}
                <div className="bg-card rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 p-4 lg:p-4 xl:p-4.5">
                  <h3 className="text-base sm:text-sm font-semibold text-green-600 dark:text-green-400 mb-3 lg:mb-3 xl:mb-2.5">{t('ui.delivery_address')}</h3>
                  <AddressSelector
                    addresses={addresses}
                    activeAddress={activeAddress}
                    selectedAddressId={selectedAddressId}
                    onAddressChange={handleAddressChange}
                  />
                </div>

                {/* Order Summary Section */}
                <CartSummary
                  cartTotal={cartTotal}
                  minimumOrder={minimumOrder}
                  meetsMinimumOrder={meetsMinimumOrder}
                  hasEditingItems={editingItems.size > 0}
                  hasAddress={!!(selectedAddressId || activeAddress)}
                  cartItemsCount={cartItems.length}
                  isRateLimited={isRateLimited}
                  countdownText={countdownText}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Address Confirmation Dialog */}
      <AddressConfirmationDialog
        isOpen={showAddressConfirmation}
        isUpdating={isUpdatingAddress}
        pendingAddress={pendingAddress}
        pendingAddressId={pendingAddressId}
        onConfirm={confirmAddressChange}
        onCancel={cancelAddressChange}
      />
    </AppHeaderLayout>
  );
}
