import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import OrderReceiptPreview from '@/components/customer/orders/OrderReceiptPreview';
import { Order } from '@/types/order';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden sm:w-[90vw] sm:h-[90vh] sm:max-h-[90vh] p-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="truncate">📄 Receipt Preview - Order #{order.id}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                📄 Print
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                ✕ Close
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
          {/* Receipt Preview - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <OrderReceiptPreview order={order} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
