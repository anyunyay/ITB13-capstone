import React from 'react';
import { Head } from '@inertiajs/react';
import OrderReceiptPreview from '@/components/OrderReceiptPreview';
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              📄 Receipt Preview - Order #{order.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-medium text-green-600">
                    ₱{order.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Items</p>
                  <p className="font-medium">{order.audit_trail?.length || 0} item(s)</p>
                </div>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Email Preview</span>
                  <button
                    onClick={() => window.print()}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    📄 Print
                  </button>
                </div>
              </div>
              <div className="p-4">
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