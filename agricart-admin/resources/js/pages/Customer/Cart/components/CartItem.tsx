import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CartItemQuantityControl } from './CartItemQuantityControl';
import type { CartItem as CartItemType } from '../types';
import { useTranslation } from '@/hooks/use-translation';

interface CartItemProps {
  item: CartItemType;
  isEditing: boolean;
  isUpdating: boolean;
  tempQuantity: number | string;
  quantityError: string;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onTempQuantityChange: (quantity: number | string) => void;
}

export function CartItem({
  item,
  isEditing,
  isUpdating,
  tempQuantity,
  quantityError,
  onEnterEditMode,
  onExitEditMode,
  onUpdateQuantity,
  onRemove,
  onTempQuantityChange,
}: CartItemProps) {
  const t = useTranslation();
  
  const formatQuantityDisplay = (quantity: number | string | undefined, category: string) => {
    const numQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity)) || 0;
    return category === 'Kilo' ? numQuantity.toFixed(2) : Math.floor(numQuantity).toString();
  };

  const handleSaveChanges = () => {
    const currentQty = typeof tempQuantity === 'number' ? tempQuantity : tempQuantity === '' ? 1 : Number(tempQuantity) || 0;
    const availableStock = typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0;
    
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
    
    onUpdateQuantity(normalized);
    onExitEditMode();
  };

  const unitPrice = ((Number(item.total_price) || 0) / (Number(item.quantity) || 1)).toFixed(2);

  return (
    <div className="group hover:bg-muted/50 transition-colors duration-200">
      {/* Mobile Layout */}
      <div className="lg:hidden p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          {/* Product Header */}
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 text-xs font-medium">IMG</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-card-foreground mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                {item.name}
              </h3>
              <p className="text-base md:text-xl lg:text-2xl text-muted-foreground mb-2">
                Product ID: {item.product_id}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {item.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>In Stock</span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRemove}
              className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            >
              ×
            </Button>
          </div>

          {/* Mobile Quantity and Price Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-base md:text-xl lg:text-2xl font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-2 block">Quantity</label>
              <CartItemQuantityControl
                item={item}
                isEditing={isEditing}
                tempQuantity={tempQuantity}
                onTempQuantityChange={onTempQuantityChange}
                formatQuantityDisplay={formatQuantityDisplay}
              />
            </div>

            <div>
              <label className="text-base md:text-xl lg:text-2xl font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-2 block">Subtotal</label>
              <div className="text-base md:text-xl lg:text-2xl font-bold text-card-foreground">
                ₱{(Number(item.total_price) || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Mobile Price Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Unit Price:</span>
              <div className="font-semibold">₱{unitPrice} per {item.category}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Available:</span>
              <div className="font-semibold">{formatQuantityDisplay(item.available_stock, item.category)}</div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-border min-h-[48px] relative">
            {isEditing ? (
              <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-200 will-change-transform">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isUpdating || !!quantityError}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1"
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('ui.saving')}</span>
                    </div>
                  ) : (
                    t('ui.save_changes')
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExitEditMode}
                  disabled={isUpdating}
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex-1"
                >
                  {t('ui.cancel')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onEnterEditMode}
                disabled={isUpdating}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 px-6 py-2 rounded-xl font-semibold transition-all duration-200 animate-in fade-in zoom-in-95 duration-200 will-change-transform"
              >
                {t('ui.edit_quantity')}
              </Button>
            )}
          </div>

          {/* Mobile Error Display */}
          {quantityError && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-red-700 dark:text-red-300 text-sm font-semibold">
                  {quantityError}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-4 items-center">
        {/* Product Column - Left Aligned */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 text-xs font-medium">IMG</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-card-foreground mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                Product ID: {item.product_id}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {item.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>In Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Column - Centered */}
        <div className="col-span-2 flex justify-center">
          <span className="text-sm font-semibold text-card-foreground">
            {item.category}
          </span>
        </div>
        
        {/* Quantity Column - Centered */}
        <div className="col-span-2 flex justify-center">
          <CartItemQuantityControl
            item={item}
            isEditing={isEditing}
            tempQuantity={tempQuantity}
            onTempQuantityChange={onTempQuantityChange}
            formatQuantityDisplay={formatQuantityDisplay}
          />
        </div>

        {/* Unit Price Column - Right Aligned */}
        <div className="col-span-2 flex flex-col items-end">
          <div className="text-sm font-semibold text-card-foreground">
            ₱{unitPrice}
          </div>
          <div className="text-xs text-muted-foreground">
            per {item.category}
          </div>
        </div>

        {/* Subtotal Column - Right Aligned */}
        <div className="col-span-2 flex flex-col items-end">
          <div className="text-base font-bold text-card-foreground">
            ₱{(Number(item.total_price) || 0).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Available: {formatQuantityDisplay(item.available_stock, item.category)}
          </div>
        </div>

        {/* Remove Column - Centered */}
        <div className="col-span-1 flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRemove}
            className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center"
          >
            ×
          </Button>
        </div>
      </div>
      
      {/* Desktop Action Buttons Row */}
      <div className="hidden lg:block px-6 py-3 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-center gap-3 min-h-[44px] relative">
          {isEditing ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 will-change-transform">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isUpdating || !!quantityError}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('ui.saving')}</span>
                  </div>
                ) : (
                  t('ui.save_changes')
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExitEditMode}
                disabled={isUpdating}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 px-6 py-2 rounded-xl font-semibold transition-all duration-200 active:scale-95"
              >
                {t('ui.cancel')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onEnterEditMode}
              disabled={isUpdating}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 px-8 py-2 rounded-xl font-semibold transition-all duration-200 animate-in fade-in zoom-in-95 duration-200 will-change-transform"
            >
              {t('ui.edit_quantity')}
            </Button>
          )}
        </div>
        
        {/* Desktop Error Display */}
        {quantityError && (
          <div className="mt-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-700 dark:text-red-300 text-sm font-semibold">
                {quantityError}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
