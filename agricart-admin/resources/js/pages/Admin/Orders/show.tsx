import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  category: string;
  quantity: number;
  stock?: {
    id: number;
    quantity: number;
  };
}

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
  };
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  created_at: string;
  admin?: {
    name: string;
  };
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: OrderItem[];
}

interface OrderShowProps {
  order: Order;
  logistics: Array<{
    id: number;
    name: string;
    contact_number?: string;
  }>;
}

export default function OrderShow({ order, logistics }: OrderShowProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignLogisticDialogOpen, setAssignLogisticDialogOpen] = useState(false);

  const approveForm = useForm({
    admin_notes: '',
  });

  const rejectForm = useForm({
    admin_notes: '',
  });

  const assignLogisticForm = useForm({
    logistic_id: '',
  });

  // Auto-open logistic assignment dialog for newly approved orders without logistic
  useEffect(() => {
    if (order.status === 'approved' && !order.logistic) {
      setAssignLogisticDialogOpen(true);
    }
  }, [order.status, order.logistic]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  const handleApprove = () => {
    approveForm.post(route('admin.orders.approve', order.id), {
      onSuccess: () => {
        setApproveDialogOpen(false);
        approveForm.reset();
      },
    });
  };

  const handleReject = () => {
    rejectForm.post(route('admin.orders.reject', order.id), {
      onSuccess: () => {
        setRejectDialogOpen(false);
        rejectForm.reset();
      },
    });
  };

  const handleAssignLogistic = () => {
    assignLogisticForm.post(route('admin.orders.assignLogistic', order.id), {
      onSuccess: () => {
        setAssignLogisticDialogOpen(false);
        assignLogisticForm.reset();
        // Show success message
        alert('Logistic assigned successfully!');
      },
    });
  };

  return (
    <AppSidebarLayout>
      <Head title={`Order #${order.id}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-500">
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            <Link href={route('admin.orders.index')}>
              <Button variant="outline">Back to Orders</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-sm">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{order.customer.email}</p>
                  </div>
                  {order.customer.contact_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Number</p>
                      <p className="text-sm">{order.customer.contact_number}</p>
                    </div>
                  )}
                  {order.customer.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm">{order.customer.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Group items by product ID and combine quantities
                    const groupedItems = order.audit_trail?.reduce((acc, item) => {
                      const key = `${item.product.id}-${item.category}`;
                      if (!acc[key]) {
                        acc[key] = {
                          id: item.id,
                          product: item.product,
                          category: item.category,
                          quantity: 0,
                          totalPrice: 0
                        };
                      }
                      acc[key].quantity += Number(item.quantity);
                      acc[key].totalPrice += Number(item.quantity) * Number(
                        item.category === 'Kilo' ? (item.product.price_kilo || 0) :
                        item.category === 'Pc' ? (item.product.price_pc || 0) :
                        item.category === 'Tali' ? (item.product.price_tali || 0) : 0
                      );
                      return acc;
                    }, {} as Record<string, any>) || {};

                    const combinedItems = Object.values(groupedItems);

                    return combinedItems.length > 0 ? (
                      combinedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.category} × ₱{
                                item.category === 'Kilo' ? (item.product.price_kilo || 0) :
                                item.category === 'Pc' ? (item.product.price_pc || 0) :
                                item.category === 'Tali' ? (item.product.price_tali || 0) : 0
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₱{item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No items found</p>
                    );
                  })()}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">₱{Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {order.admin_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.admin_notes}</p>
                  {order.admin && (
                    <p className="text-xs text-gray-500 mt-2">
                      Added by {order.admin.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    {getStatusBadge(order.status)}
                  </div>
                  {order.status === 'approved' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Delivery Status</span>
                      {getDeliveryStatusBadge(order.delivery_status)}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Items</span>
                    <span className="text-sm">{order.audit_trail?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-sm font-medium">₱{order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.admin && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Processed by</span>
                      <span className="text-sm">{order.admin.name}</span>
                    </div>
                  )}
                  {order.logistic && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assigned to</span>
                      <span className="text-sm">{order.logistic.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {order.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="default">
                        Approve Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Order #{order.id}</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to approve this order? This will process the stock and complete the order.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Notes (Optional)</label>
                          <Textarea
                            placeholder="Add any notes about this approval..."
                            value={approveForm.data.admin_notes}
                            onChange={(e) => approveForm.setData('admin_notes', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={approveForm.processing}>
                          {approveForm.processing ? 'Approving...' : 'Approve Order'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        Reject Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Order #{order.id}</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reject this order? Please provide a reason for the rejection.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Reason for Rejection *</label>
                          <Textarea
                            placeholder="Please provide a reason for rejecting this order..."
                            value={rejectForm.data.admin_notes}
                            onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleReject} 
                          disabled={rejectForm.processing || !rejectForm.data.admin_notes}
                        >
                          {rejectForm.processing ? 'Rejecting...' : 'Reject Order'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Logistic Assignment for Approved Orders */}
            {order.status === 'approved' && (
              <Card>
                <CardHeader>
                  <CardTitle>Logistic Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.logistic ? (
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">
                        Assigned to: {order.logistic.name}
                      </p>
                      {order.logistic.contact_number && (
                        <p className="text-sm text-green-600">
                          Contact: {order.logistic.contact_number}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Dialog open={assignLogisticDialogOpen} onOpenChange={setAssignLogisticDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          Assign Logistic
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Logistic to Order #{order.id}</DialogTitle>
                          <DialogDescription>
                            This order has been approved and is ready for delivery. Please select a logistic provider to handle the delivery.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Select Logistic Provider *</label>
                            <select
                              value={assignLogisticForm.data.logistic_id}
                              onChange={(e) => assignLogisticForm.setData('logistic_id', e.target.value)}
                              className="mt-1 w-full p-2 border rounded"
                              required
                            >
                              <option value="">Choose a logistic provider...</option>
                              {logistics.map((logistic) => (
                                <option key={logistic.id} value={logistic.id}>
                                  {logistic.name} {logistic.contact_number && `(${logistic.contact_number})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAssignLogisticDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAssignLogistic} 
                            disabled={assignLogisticForm.processing || !assignLogisticForm.data.logistic_id}
                          >
                            {assignLogisticForm.processing ? 'Assigning...' : 'Assign Logistic'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 