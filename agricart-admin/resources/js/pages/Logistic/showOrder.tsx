import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogisticHeader } from '@/components/logistic-header';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  created_at: string;
  audit_trail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>;
}

interface ShowOrderProps {
  order: Order;
}

export default function ShowOrder({ order }: ShowOrderProps) {
  // Use useState to manage the order state for real-time updates
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  // Form for delivery status updates
  const updateDeliveryStatusForm = useForm({
    delivery_status: currentOrder.delivery_status,
  });

  // Helper function to combine quantities for the same items
  const combineOrderItems = (auditTrail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>) => {
    const combinedItems = new Map<string, {
      product: { id: number; name: string };
      category: string;
      quantity: number;
    }>();
    
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

  // Keep form data synchronized with current order state
  useEffect(() => {
    updateDeliveryStatusForm.setData('delivery_status', currentOrder.delivery_status);
  }, [currentOrder.delivery_status]);

  // Get appropriate badge styling for delivery status
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle delivery status changes
  const handleDeliveryStatusChange = (value: 'pending' | 'out_for_delivery' | 'delivered') => {
    // Prevent multiple simultaneous requests
    if (updateDeliveryStatusForm.processing) {
      return;
    }

    // Update form data for UI consistency
    updateDeliveryStatusForm.setData('delivery_status', value);
    
    // Send update request directly with the selected value
    router.put(route('logistic.orders.updateDeliveryStatus', currentOrder.id), {
      delivery_status: value
    }, {
      onSuccess: () => {
        // Update local state immediately for instant UI feedback
        setCurrentOrder(prevOrder => ({
          ...prevOrder,
          delivery_status: value
        }));
      },
      onError: (errors) => {
        // Handle validation or server errors silently
        // Errors will be displayed in the form if any
      },
      preserveScroll: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <LogisticHeader />
      <Head title={`Order #${currentOrder.id} Details`} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Order #{currentOrder.id}</h1>
            <p className="text-gray-400">Order details and delivery management</p>
          </div>
          <Link href={route('logistic.orders.index')}>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Back to Orders</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Order ID</p>
                  <p className="text-sm text-white">#{currentOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Order Date</p>
                  <p className="text-sm text-white">{format(new Date(currentOrder.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Amount</p>
                  <p className="text-sm text-semibold text-white">₱{currentOrder.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Delivery Status</p>
                  <div className="flex items-center space-x-2">
                    {getDeliveryStatusBadge(currentOrder.delivery_status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Customer Name</p>
                <p className="text-sm text-white">{currentOrder.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Email</p>
                <p className="text-sm text-white">{currentOrder.customer.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Status Update */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Update Delivery Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="max-w-md">
                <label className="text-sm font-medium text-white">Delivery Status</label>
                <Select
                  value={updateDeliveryStatusForm.data.delivery_status}
                  onValueChange={(value) => handleDeliveryStatusChange(value as 'pending' | 'out_for_delivery' | 'delivered')}
                  disabled={updateDeliveryStatusForm.processing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                {updateDeliveryStatusForm.processing && (
                  <p className="text-sm text-blue-400 mt-2">Updating status...</p>
                )}
                {updateDeliveryStatusForm.errors.delivery_status && (
                  <p className="text-sm text-red-400 mt-2">{updateDeliveryStatusForm.errors.delivery_status}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {combineOrderItems(currentOrder.audit_trail).map((item, index) => (
                <div key={`${item.product.name}-${item.category}-${index}`} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{item.product.name}</h4>
                    <p className="text-sm text-gray-400">
                      Category: {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 