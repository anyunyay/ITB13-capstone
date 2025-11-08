import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CartSummaryProps {
  cartTotal: number;
  minimumOrder: number;
  meetsMinimumOrder: boolean;
  hasEditingItems: boolean;
  hasAddress: boolean;
  cartItemsCount: number;
  onCheckout: () => void;
}

export function CartSummary({
  cartTotal,
  minimumOrder,
  meetsMinimumOrder,
  hasEditingItems,
  hasAddress,
  cartItemsCount,
  onCheckout,
}: CartSummaryProps) {
  const deliveryFee = cartTotal * 0.10;
  const total = cartTotal * 1.10;

  return (
    <div className="bg-card rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 p-4 lg:p-4.5">
      <h3 className="text-base sm:text-sm font-semibold text-green-600 dark:text-green-400 mb-3 lg:mb-2.5">Order Summary</h3>
      
      <div className="space-y-1.5 mb-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-green-600 dark:text-green-400">Subtotal:</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-green-600 dark:text-green-400">Delivery Fee (10%):</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-green-200 dark:border-green-700 pt-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">Total:</span>
            <span className="text-base font-bold text-green-600 dark:text-green-400">₱{total.toFixed(2)}</span>
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
              `⚠ Minimum order requirement: ₱${minimumOrder} (add ₱${(minimumOrder - cartTotal).toFixed(2)} more)`
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
          onClick={onCheckout} 
          disabled={cartItemsCount === 0 || hasEditingItems || !meetsMinimumOrder || !hasAddress}
          className={`w-full py-2 text-sm font-semibold transition-all duration-300 rounded-lg shadow-md hover:shadow-lg ${
            !meetsMinimumOrder || !hasAddress 
              ? 'opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {cartItemsCount === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
        </Button>
        
        {hasEditingItems && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Please complete or cancel all pending updates before checkout
              </span>
            </div>
          </div>
        )}
        
        {!meetsMinimumOrder && cartItemsCount > 0 && (
          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Please add more items to meet the minimum order requirement of ₱{minimumOrder}
              </span>
            </div>
          </div>
        )}
        
        {!hasAddress && cartItemsCount > 0 && (
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
  );
}
