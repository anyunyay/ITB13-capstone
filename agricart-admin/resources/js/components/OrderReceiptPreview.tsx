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
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 text-center">
        <h1 className="text-xl font-light mb-1">🎉 Order Approved!</h1>
        <p className="text-xs opacity-90">
          Your order has been successfully approved and is now being processed.
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Order Information */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <h2 className="text-base font-semibold text-green-600 mb-2">📋 Order Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Order ID:</span>
              <span className="text-gray-800">#{order.id}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Order Date:</span>
              <span className="text-gray-800">{formatDate(order.created_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Approval Date:</span>
              <span className="text-gray-800">{formatDate(order.updated_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Status:</span>
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                ✓ Approved
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Approved by:</span>
              <span className="text-gray-800">{order.admin?.name || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-600">Customer:</span>
              <span className="text-gray-800">{order.customer.name}</span>
            </div>
            {order.customer.contact_number && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-600">Contact:</span>
                <span className="text-gray-800">{order.customer.contact_number}</span>
              </div>
            )}
            {order.customer.address && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-600">Address:</span>
                <span className="text-gray-800 truncate">{order.customer.address}</span>
              </div>
            )}
            {order.customer.barangay && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-600">Barangay:</span>
                <span className="text-gray-800">{order.customer.barangay}</span>
              </div>
            )}
            {order.customer.city && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-600">City:</span>
                <span className="text-gray-800">{order.customer.city}</span>
              </div>
            )}
            {order.customer.province && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-600">Province:</span>
                <span className="text-gray-800">{order.customer.province}</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        {order.admin_notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
            <h4 className="text-yellow-800 font-semibold mb-1 text-xs">📝 Admin Notes:</h4>
            <p className="text-yellow-700 text-xs">{order.admin_notes}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-green-600 mb-2">🛒 Order Items</h3>
           
          <div className="space-y-1">
            {order.audit_trail && order.audit_trail.length > 0 ? (
              combineOrderItems(order.audit_trail).map((item, index) => (
                <div key={`${item.product.name}-${item.category}-${index}`} className="bg-gray-50 rounded-lg p-2 border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 text-xs">{item.product.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>Quantity: {item.quantity} {item.category}</span>
                    <span>Price: {getItemPrice(item)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-300">
                <p className="text-gray-500 text-center text-xs">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-green-500 text-white rounded-lg p-3 text-center">
          <div className="text-base font-bold mb-1">
            Total Amount: {formatPrice(order.total_amount)}
          </div>
          <p className="opacity-90 text-xs">Thank you for your order!</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 text-center text-gray-600 text-xs">
        <p>This is an automated receipt from AgriCart Admin System.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>&copy; {new Date().getFullYear()} AgriCart. All rights reserved.</p>
      </div>
    </div>
  );
}; 