import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin } from 'lucide-react';
import type { Address } from '../types';
import { useTranslation } from '@/hooks/use-translation';

interface AddressConfirmationDialogProps {
  isOpen: boolean;
  isUpdating: boolean;
  pendingAddress: Address | null;
  pendingAddressId: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AddressConfirmationDialog({
  isOpen,
  isUpdating,
  pendingAddress,
  pendingAddressId,
  onConfirm,
  onCancel,
}: AddressConfirmationDialogProps) {
  const t = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-card border-green-200 dark:border-green-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            {t('ui.confirm_address_change')}
          </DialogTitle>
          <DialogDescription className="text-green-600 dark:text-green-400">
            {pendingAddressId === null 
              ? t('ui.switch_back_to_active_address')
              : t('ui.change_delivery_address_message')
            }
          </DialogDescription>
        </DialogHeader>
        
        {pendingAddress && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                {pendingAddressId === null ? `${t('ui.active_address')}:` : `${t('ui.new_address')}:`}
              </h4>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    {pendingAddress.street}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {pendingAddress.barangay}, {pendingAddress.city}, {pendingAddress.province}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {pendingAddressId === null 
                    ? t('ui.set_active_address_delivery')
                    : t('ui.set_main_address_future_orders')
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            {t('ui.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('ui.updating')}</span>
              </div>
            ) : (
              t('ui.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
