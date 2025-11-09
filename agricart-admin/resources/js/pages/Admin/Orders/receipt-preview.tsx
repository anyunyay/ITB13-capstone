import React from 'react';
import { Head } from '@inertiajs/react';
import OrderReceiptPreview from '@/components/customer/orders/OrderReceiptPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderItem {
  id: number;
  product: {
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  quantity: number;
  category: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  unit_price?: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  admin: {
    name: string;
  };
  audit_trail: OrderItem[];
}

interface ReceiptPreviewProps {
  order: Order;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ order }) => {
  // Defensive programming - check if order exists
  if (!order) {
    return (
      <>
        <Head title="Order Receipt Preview - Order Not Found" />
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
              <p className="text-gray-600">The order you're looking for could not be found.</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title={`Order Receipt Preview - Order #${order.id}`} />
      
      <Dialog open={true} onOpenChange={() => window.history.back()}>
        <DialogContent className="max-w-6xl w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden sm:w-[90vw] sm:h-[90vh] sm:max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-white">
            <DialogTitle className="text-lg sm:text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="truncate">📄 Receipt Preview - Order #{order.id}</span>
              <button
                onClick={() => window.print()}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                📄 Print
              </button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Receipt Preview - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <OrderReceiptPreview order={order} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptPreview; 