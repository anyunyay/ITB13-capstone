import { Button } from '@/components/ui/button';
import type { CartItem } from '../types';

interface CartItemQuantityControlProps {
  item: CartItem;
  isEditing: boolean;
  tempQuantity: number | string;
  onTempQuantityChange: (quantity: number | string) => void;
  formatQuantityDisplay: (quantity: number | string | undefined, category: string) => string;
}

export function CartItemQuantityControl({
  item,
  isEditing,
  tempQuantity,
  onTempQuantityChange,
  formatQuantityDisplay,
}: CartItemQuantityControlProps) {
  const handleDecrement = () => {
    const currentQty = typeof tempQuantity === 'number' ? tempQuantity : tempQuantity === '' ? 1 : Number(tempQuantity) || 0;
    if (item.category === 'Kilo') {
      const newQty = Math.max(1, currentQty - 0.25);
      const roundedQuarter = Math.round(newQty * 4) / 4;
      onTempQuantityChange(Number(roundedQuarter.toFixed(2)));
    } else {
      onTempQuantityChange(Math.max(1, Math.floor(currentQty - 1)));
    }
  };

  const handleIncrement = () => {
    const currentQty = typeof tempQuantity === 'number' ? tempQuantity : tempQuantity === '' ? 1 : Number(tempQuantity) || 0;
    const availableStock = typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0;
    
    if (item.category === 'Kilo') {
      const incremented = currentQty + 0.25;
      const clamped = Math.min(availableStock, Math.max(1, incremented));
      const roundedQuarter = Math.round(clamped * 4) / 4;
      onTempQuantityChange(Number(roundedQuarter.toFixed(2)));
    } else {
      onTempQuantityChange(Math.min(availableStock, Math.floor(currentQty + 1)));
    }
  };

  const handleInputChange = (value: string) => {
    if (value === '') {
      onTempQuantityChange('');
      return;
    }
    
    if (item.category === 'Kilo') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 1) {
        onTempQuantityChange(numValue);
      }
    } else {
      const isIntegerString = /^\d+$/.test(value);
      if (isIntegerString) {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 1) {
          onTempQuantityChange(numValue);
        }
      }
    }
  };

  const handleInputBlur = (value: string) => {
    if (value === '') {
      onTempQuantityChange(1);
      return;
    }
    
    const availableStock = typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0;
    
    if (item.category === 'Kilo') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const clamped = Math.max(1, numValue);
        const capped = Math.min(availableStock, clamped);
        const roundedQuarter = Math.round(capped * 4) / 4;
        onTempQuantityChange(Number(roundedQuarter.toFixed(2)));
      }
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        onTempQuantityChange(Math.min(availableStock, Math.max(1, Math.floor(numValue))));
      }
    }
  };

  const currentQty = typeof tempQuantity === 'number' ? tempQuantity : Number(tempQuantity) || 0;
  const availableStock = typeof item.available_stock === 'number' ? item.available_stock : parseFloat(String(item.available_stock)) || 0;

  if (!isEditing) {
    return (
      <div className="w-16 h-8 lg:w-14 lg:h-7 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 will-change-transform">
        {formatQuantityDisplay(item.quantity, item.category)}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start lg:justify-center gap-1 min-h-[32px] lg:min-h-[28px] relative">
      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200 will-change-transform">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={currentQty <= 1}
          className="w-8 h-8 lg:w-7 lg:h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-150 flex items-center justify-center font-bold text-xs active:scale-90 disabled:opacity-50"
        >
          −
        </Button>
        <input
          type="number"
          min={1}
          step={item.category === 'Kilo' ? 0.25 : 1}
          max={availableStock}
          value={tempQuantity ?? ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={(e) => handleInputBlur(e.target.value)}
          className="w-16 h-8 lg:w-14 lg:h-7 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all duration-200"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={currentQty >= availableStock}
          className="w-8 h-8 lg:w-7 lg:h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-150 flex items-center justify-center font-bold text-xs active:scale-90 disabled:opacity-50"
        >
          +
        </Button>
      </div>
    </div>
  );
}
