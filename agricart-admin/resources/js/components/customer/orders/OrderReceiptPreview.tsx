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
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  admin?: {
    name: string;
  };
  audit_trail: OrderItem[];
}

interface OrderReceiptPreviewProps {
  order: Order;
}

export default function OrderReceiptPreview({ order }: OrderReceiptPreviewProps) {
  // Helper function to combine quantities for the same items
  const combineOrderItems = (auditTrail: OrderItem[]) => {
    const combinedItems = new Map<string, OrderItem>();
    
    auditTrail.forEach((item) => {
      const key = `${item.product.name}-${item.category}`;
      
      if (combinedItems.has(key)) {
        // Combine quantities for the same product and category
        const existingItem = combinedItems.get(key)!;
        existingItem.quantity += item.quantity;
      } else {
        // Add new item
        combinedItems.set(key, { ...item });
      }
    });
    
    return Array.from(combinedItems.values());
  };

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
    <div className="w-full bg-white shadow-sm sm:shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2.5 sm:p-4 md:p-5 text-center">
        <h1 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">🎉 Order Approved!</h1>
        <p className="text-[10px] sm:text-xs md:text-sm opacity-90 leading-tight">
          Your order has been successfully approved and is now being processed.
        </p>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 md:p-4">
        {/* Order Information */}
        <div className="bg-gray-50 rounded-md p-2 sm:p-3 mb-2 sm:mb-3">
          <h2 className="text-xs sm:text-sm md:text-base font-semibold text-green-600 mb-1.5 sm:mb-2">📋 Order Information</h2>
          
          <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm">
            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="font-semibold text-gray-600">Order ID:</span>
              <span className="text-gray-800">#{order.id}</span>
            </div>
            
            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="font-semibold text-gray-600 shrink-0 mr-2">Order Date:</span>
              <span className="text-gray-800 text-right text-[9px] sm:text-[10px] md:text-xs">{formatDate(order.created_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="font-semibold text-gray-600 shrink-0 mr-2">Approval Date:</span>
              <span className="text-gray-800 text-right text-[9px] sm:text-[10px] md:text-xs">{formatDate(order.updated_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="font-semibold text-gray-600">Status:</span>
              <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold">
                ✓ Approved
              </span>
            </div>
            
            {order.admin?.name && (
              <div className="flex justify-between items-center py-0.5 sm:py-1">
                <span className="font-semibold text-gray-600">Approved by:</span>
                <span className="text-gray-800 text-right">{order.admin.name}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="font-semibold text-gray-600">Customer:</span>
              <span className="text-gray-800 text-right truncate max-w-[140px] sm:max-w-[200px]">{order.customer.name}</span>
            </div>
            
            {order.customer.contact_number && (
              <div className="flex justify-between items-center py-0.5 sm:py-1">
                <span className="font-semibold text-gray-600">Contact:</span>
                <span className="text-gray-800 text-right">{order.customer.contact_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        {order.admin_notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-1.5 sm:p-2 mb-2 sm:mb-3">
            <h4 className="text-yellow-800 font-semibold mb-0.5 sm:mb-1 text-[10px] sm:text-xs">📝 Admin Notes:</h4>
            <p className="text-yellow-700 text-[10px] sm:text-xs break-words leading-tight">{order.admin_notes}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-green-600 mb-1.5 sm:mb-2">🛒 Order Items</h3>
           
          <div className="space-y-1 sm:space-y-1.5">
            {order.audit_trail && order.audit_trail.length > 0 ? (
              combineOrderItems(order.audit_trail).map((item, index) => (
                <div key={`${item.product.name}-${item.category}-${index}`} className="bg-gray-50 rounded-md p-1.5 sm:p-2 border-l-3 sm:border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-0.5 sm:mb-1 gap-1">
                    <span className="font-semibold text-gray-800 text-[10px] sm:text-xs break-words flex-1 leading-tight">{item.product.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] md:text-xs text-gray-600">
                    <span>Qty: {item.quantity} {item.category}</span>
                    <span className="font-medium">{getItemPrice(item)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-md p-2 border-l-3 border-gray-300">
                <p className="text-gray-500 text-center text-[10px] sm:text-xs">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-green-500 text-white rounded-md p-2.5 sm:p-3 md:p-4 text-center">
          <div className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1">
            Total: {formatPrice(order.total_amount)}
          </div>
          <p className="opacity-90 text-[9px] sm:text-[10px] md:text-xs">Thank you for your order!</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-2 sm:p-3 text-center text-gray-600 text-[9px] sm:text-[10px] space-y-0.5 leading-tight">
        <p>This is an automated receipt from AgriCart Admin System.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>&copy; {new Date().getFullYear()} AgriCart. All rights reserved.</p>
      </div>
    </div>
  );
}; 