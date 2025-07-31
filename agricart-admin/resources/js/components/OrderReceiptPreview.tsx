import React from 'react';

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

interface OrderReceiptPreviewProps {
  order: Order;
}

const OrderReceiptPreview: React.FC<OrderReceiptPreviewProps> = ({ order }) => {
  // Defensive programming - check if order exists
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-8">
        <div className="text-center text-gray-500">
          <p>Order data not available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const getItemPrice = (item: OrderItem) => {
    const price = item.product.price_kilo || item.product.price_pc || item.product.price_tali || 0;
    return formatPrice(price);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
        <h1 className="text-2xl font-light mb-2">🎉 Order Approved!</h1>
        <p className="text-sm opacity-90">
          Your order has been successfully approved and is now being processed.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Order Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-green-600 mb-3">📋 Order Information</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-600 text-sm">Order ID:</span>
              <span className="text-gray-800 text-sm">#{order.id}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-600 text-sm">Order Date:</span>
              <span className="text-gray-800 text-sm">{formatDate(order.created_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-600 text-sm">Approval Date:</span>
              <span className="text-gray-800 text-sm">{formatDate(order.updated_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-600 text-sm">Status:</span>
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                ✓ Approved
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-600 text-sm">Approved by:</span>
              <span className="text-gray-800 text-sm">{order.admin.name}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600 text-sm">Customer:</span>
              <span className="text-gray-800 text-sm">{order.customer.name}</span>
            </div>
          </div>
        </div>

                {/* Admin Notes */}
        {order.admin_notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <h4 className="text-yellow-800 font-semibold mb-1 text-sm">📝 Admin Notes:</h4>
            <p className="text-yellow-700 text-sm">{order.admin_notes}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-green-600 mb-3">🛒 Order Items</h3>
           
                       <div className="space-y-2">
              {order.audit_trail && order.audit_trail.length > 0 ? (
                order.audit_trail.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{item.product.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Quantity: {item.quantity} {item.category}</span>
                      <span>Price: {getItemPrice(item)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300">
                  <p className="text-gray-500 text-center text-sm">No items found</p>
                </div>
              )}
            </div>
         </div>

        {/* Total Section */}
        <div className="bg-green-500 text-white rounded-lg p-4 text-center">
          <div className="text-lg font-bold mb-1">
            Total Amount: {formatPrice(order.total_amount)}
          </div>
          <p className="opacity-90 text-sm">Thank you for your order!</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center text-gray-600 text-xs">
        <p>This is an automated receipt from AgriCart Admin System.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>&copy; {new Date().getFullYear()} AgriCart. All rights reserved.</p>
      </div>
    </div>
  );
};

export default OrderReceiptPreview; 