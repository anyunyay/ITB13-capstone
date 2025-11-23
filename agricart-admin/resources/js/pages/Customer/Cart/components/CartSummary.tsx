import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface CartSummaryProps {
  cartTotal: number;
  minimumOrder: number;
  meetsMinimumOrder: boolean;
  hasEditingItems: boolean;
  hasAddress: boolean;
  cartItemsCount: number;
  isRateLimited?: boolean;
  countdownText?: string;
  onCheckout: () => void;
}

export function CartSummary({
  cartTotal,
  minimumOrder,
  meetsMinimumOrder,
  hasEditingItems,
  hasAddress,
  cartItemsCount,
  isRateLimited = false,
  countdownText = '',
  onCheckout,
}: CartSummaryProps) {
  const t = useTranslation();
  const deliveryFee = cartTotal * 0.10;
  const total = cartTotal * 1.10;

  return (
    <div className="bg-card rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 p-4 lg:p-4 xl:p-4.5">
      <h3 className="text-base sm:text-sm font-semibold text-green-600 dark:text-green-400 mb-3 lg:mb-3 xl:mb-2.5">{t('ui.order_summary')}</h3>
      
      <div className="space-y-1.5 mb-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-green-600 dark:text-green-400">{t('ui.subtotal')}:</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-green-600 dark:text-green-400">{t('ui.delivery_fee')} (10%):</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">₱{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-green-200 dark:border-green-700 pt-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{t('ui.total')}:</span>
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
              `✓ ${t('ui.minimum_order_amount')} (₱${minimumOrder})`
            ) : (
              `⚠ ${t('ui.minimum_order_not_met', { amount: minimumOrder })} (${t('ui.add_more_items', { amount: (minimumOrder - cartTotal).toFixed(2) })})`
            )}
          </span>
        </div>
      </div>
      
      {/* Approval Note */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5" />
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {t('ui.order_requires_approval_note')}
          </span>
        </div>
      </div>
      
      {/* Rate Limit Warning */}
      {isRateLimited && countdownText && (
        <div className="mt-2 mb-3 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
                {t('ui.checkout_limit_reached')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('ui.checkout_limit_message')}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  {t('ui.available_in')}:
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 rounded text-sm font-bold text-red-700 dark:text-red-300 tabular-nums">
                  {countdownText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <div className="mt-2">
        <Button 
          onClick={onCheckout} 
          disabled={cartItemsCount === 0 || hasEditingItems || !meetsMinimumOrder || !hasAddress || isRateLimited}
          className={`w-full py-2 text-sm font-semibold transition-all duration-300 rounded-lg shadow-md hover:shadow-lg ${
            !meetsMinimumOrder || !hasAddress || isRateLimited
              ? 'opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isRateLimited && countdownText ? (
            <span className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('ui.checkout_available_in')} {countdownText}
            </span>
          ) : (
            cartItemsCount === 0 ? t('ui.your_cart_is_empty') : t('ui.checkout')
          )}
        </Button>
        
        {hasEditingItems && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {t('ui.complete_editing_items')}
              </span>
            </div>
          </div>
        )}
        
        {!meetsMinimumOrder && cartItemsCount > 0 && (
          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {t('ui.minimum_order_not_met', { amount: minimumOrder })}
              </span>
            </div>
          </div>
        )}
        
        {!hasAddress && cartItemsCount > 0 && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {t('ui.please_select_address_checkout')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
