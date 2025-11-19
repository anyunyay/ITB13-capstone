import React, { useRef } from 'react';
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
  const isPrintingRef = useRef(false);

  const handlePrint = () => {
    if (isPrintingRef.current) return;
    
    isPrintingRef.current = true;
    window.print();
    
    // Reset after a delay to allow for next print
    setTimeout(() => {
      isPrintingRef.current = false;
    }, 1000);
  };

  if (!order) return null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 1cm;
          }
          
          /* Hide everything except receipt */
          body * {
            visibility: hidden !important;
          }
          
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible !important;
          }
          
          /* Position receipt for printing */
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Force color printing - critical for backgrounds */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ensure all styling is preserved */
          #receipt-print-area * {
            box-shadow: none !important;
          }
          
          /* Prevent page breaks */
          #receipt-print-area,
          #receipt-print-area > div {
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-before: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Ensure rounded corners and borders print */
          #receipt-print-area .rounded-lg,
          #receipt-print-area .rounded-md,
          #receipt-print-area .rounded {
            border-radius: inherit !important;
          }
          
          /* Ensure only one page */
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden sm:w-[90vw] sm:h-[90vh] sm:max-h-[90vh] p-0">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg sm:text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="truncate">📄 Receipt Preview - Order #{order.id}</span>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
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
              <div className="max-w-4xl mx-auto" id="receipt-print-area">
                <OrderReceiptPreview order={order} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
