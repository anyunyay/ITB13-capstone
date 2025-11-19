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
      {/* Header with Logo */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-5 md:p-6">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-md">
            <img 
              src="/storage/logo/SMMC Logo-1.webp" 
              alt="SMMC Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-13 md:w-13 object-contain"
              onError={(e) => {
                // Fallback to PNG if webp fails
                e.currentTarget.src = '/storage/logo/SMMC Logo-1.png';
              }}
            />
          </div>
          <div className="text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">SMMC</h2>
          </div>
        </div>
        
        {/* Success Message */}
        <div className="text-center border-t border-white/20 pt-3 sm:pt-4">
          <h1 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">🎉 Order Approved!</h1>
          <p className="text-[10px] sm:text-xs md:text-sm opacity-90 leading-tight">
            Your order has been successfully approved and is now being processed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 md:p-4">
        {/* Order Information */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-green-600 mb-2 sm:mb-3 flex items-center gap-2">
            <span className="bg-green-100 p-1 rounded">📋</span>
            Order Information
          </h2>
          
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
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 shadow-sm">
            <h4 className="text-yellow-800 font-bold mb-1 sm:mb-2 text-[10px] sm:text-xs flex items-center gap-2">
              <span className="bg-yellow-200 p-1 rounded">📝</span>
              Admin Notes
            </h4>
            <p className="text-yellow-700 text-[10px] sm:text-xs break-words leading-relaxed">{order.admin_notes}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-green-600 mb-2 sm:mb-3 flex items-center gap-2">
            <span className="bg-green-100 p-1 rounded">🛒</span>
            Order Items
          </h3>
           
          <div className="space-y-2">
            {order.audit_trail && order.audit_trail.length > 0 ? (
              combineOrderItems(order.audit_trail).map((item, index) => (
                <div key={`${item.product.name}-${item.category}-${index}`} className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-2 sm:p-3 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
                    <span className="font-bold text-gray-800 text-[10px] sm:text-xs md:text-sm break-words flex-1 leading-tight">{item.product.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] md:text-xs">
                    <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      Qty: <span className="font-semibold">{item.quantity} {item.category}</span>
                    </span>
                    <span className="font-bold text-green-600">{getItemPrice(item)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 text-center text-[10px] sm:text-xs">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3 sm:p-4 md:p-5 text-center shadow-lg">
          <p className="text-[10px] sm:text-xs opacity-90 mb-1">Total Amount</p>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
            {formatPrice(order.total_amount)}
          </div>
          <div className="border-t border-white/30 pt-2">
            <p className="opacity-90 text-[10px] sm:text-xs md:text-sm font-medium">✓ Thank you for your order!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 text-center border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-white rounded-full p-1 shadow-sm">
            <img 
              src="/storage/logo/SMMC Logo-1.webp" 
              alt="SMMC Logo" 
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              onError={(e) => {
                // Fallback to PNG if webp fails
                e.currentTarget.src = '/storage/logo/SMMC Logo-1.png';
              }}
            />
          </div>
          <span className="font-bold text-gray-800 text-xs sm:text-sm">SMMC</span>
        </div>
        <div className="text-gray-600 text-[9px] sm:text-[10px] space-y-1 leading-relaxed">
          <p className="font-medium">This is an automated receipt from SMMC.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p className="text-gray-500 mt-2">&copy; {new Date().getFullYear()} SMMC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}; 