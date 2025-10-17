import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { OrderItemsTable } from '@/components/orders/order-items-table';

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
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  unit_price?: number;
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
  };
  total_amount: number;
  subtotal: number;
  coop_share: number;
  member_share: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'delayed';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
  delivery_packed_time?: string;
  delivered_time?: string;
  delivery_timeline?: {
    packed_at?: string;
    delivered_at?: string;
    packing_duration?: number;
    delivery_duration?: number;
    total_duration?: number;
  };
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
  is_urgent?: boolean;
  delivery_address?: string;
  order_address?: {
    street: string;
    barangay: string;
    city: string;
    province: string;
  };
}

interface OrderShowProps {
  order: Order;
  logistics: Array<{
    id: number;
    name: string;
    contact_number?: string;
  }>;
  highlight?: boolean;
  isUrgent?: boolean;
  canApprove?: boolean;
  orderAge?: number;
}

export default function OrderShow({ order, logistics, highlight = false, isUrgent = false, canApprove = true, orderAge = 0 }: OrderShowProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignLogisticDialogOpen, setAssignLogisticDialogOpen] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [pickedUpDialogOpen, setPickedUpDialogOpen] = useState(false);
  const [pickupConfirmationText, setPickupConfirmationText] = useState('');
  const [currentOrder, setCurrentOrder] = useState(order);

  // Common rejection reasons
  const rejectionReasons = [
    'Out of stock',
    'Insufficient stock',
    'Invalid order details',
    'Payment issues',
    'Delivery area not covered',
    'Customer request',
    'Other'
  ];

  const approveForm = useForm({
    admin_notes: '',
  });

  const rejectForm = useForm({
    admin_notes: '',
  });

  const assignLogisticForm = useForm({
    logistic_id: '',
  });

  const pickedUpForm = useForm({
    confirmation_text: '',
  });

  // Auto-open logistic assignment dialog for newly approved orders without logistic
  useEffect(() => {
    if (currentOrder.status === 'approved' && !currentOrder.logistic) {
      setAssignLogisticDialogOpen(true);
    }
  }, [currentOrder.status, currentOrder.logistic]);

  // Handle highlighting effect when coming from notification
  useEffect(() => {
    if (highlight) {
      // Add a temporary highlight effect
      const timer = setTimeout(() => {
        // Remove highlight after 3 seconds
        const url = new URL(window.location.href);
        url.searchParams.delete('highlight');
        window.history.replaceState({}, '', url.toString());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlight]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Cancelled</Badge>;
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


  const handleMarkPickedUp = () => {
    if (pickupConfirmationText !== 'Confirm Pick Up') {
      alert('Please type "Confirm Pick Up" exactly to confirm.');
      return;
    }

    router.post(route('admin.orders.markPickedUp', order.id), {
      confirmation_text: pickupConfirmationText
    }, {
      onSuccess: () => {
        // Update the local order state to reflect the new delivery status
        const updatedOrder = {
          ...currentOrder,
          delivery_status: 'out_for_delivery' as const,
          delivery_packed_time: new Date().toISOString(),
          delivery_timeline: {
            ...currentOrder.delivery_timeline,
            packed_at: new Date().toISOString(),
            packing_duration: currentOrder.delivery_timeline?.packing_duration || 0,
            delivery_duration: currentOrder.delivery_timeline?.delivery_duration || undefined,
            total_duration: currentOrder.delivery_timeline?.total_duration || undefined,
          }
        };

        setCurrentOrder(updatedOrder);
        setPickedUpDialogOpen(false);
        setPickupConfirmationText('');
      },
      onError: (errors) => {
        console.error('Error marking order as picked up:', errors);
      },
    });
  };

  return (
    <AppLayout>
      <Head title={`Order #${order.id}`} />
      <div className={`p-6 transition-all duration-1000 ${highlight ? 'border-2 border-blue-500 rounded-lg shadow-lg' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-500">
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                {order.is_urgent ? 'Urgent (Manual)' : `Urgent - ${24 - orderAge}h left`}
              </Badge>
            )}
            {!canApprove && order.status === 'pending' && (
              <Badge variant="destructive">
                Approval Time Expired
              </Badge>
            )}
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
                  {order.delivery_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                      <p className="text-sm">{order.delivery_address}</p>
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
                <OrderItemsTable 
                  items={order.audit_trail || []} 
                  showStock={true}
                  compact={false}
                />
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
                      <div className="flex items-center gap-2">
                        {getDeliveryStatusBadge(currentOrder.delivery_status)}
                        {currentOrder.delivery_status === 'out_for_delivery' && (
                          <span className="text-xs text-blue-600">(Picked Up)</span>
                        )}
                        {currentOrder.delivery_status === 'delivered' && (
                          <span className="text-xs text-green-600">(Completed)</span>
                        )}
                      </div>
                    </div>
                  )}
                  {currentOrder.delivery_timeline && (
                    <>
                      {currentOrder.delivery_packed_time && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Packed At</span>
                          <span className="text-sm text-blue-600">
                            {format(new Date(currentOrder.delivery_packed_time), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                      {currentOrder.delivered_time && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivered At</span>
                          <span className="text-sm text-green-600">
                            {format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                      {currentOrder.delivery_timeline.packing_duration && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Packing Duration</span>
                          <span className="text-sm text-gray-700">
                            {Math.floor(currentOrder.delivery_timeline.packing_duration / 60)}h {currentOrder.delivery_timeline.packing_duration % 60}m
                          </span>
                        </div>
                      )}
                      {currentOrder.delivery_timeline.delivery_duration && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivery Duration</span>
                          <span className="text-sm text-gray-700">
                            {Math.floor(currentOrder.delivery_timeline.delivery_duration / 60)}h {currentOrder.delivery_timeline.delivery_duration % 60}m
                          </span>
                        </div>
                      )}
                      {currentOrder.delivery_timeline.total_duration && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Duration</span>
                          <span className="text-sm text-gray-700">
                            {Math.floor(currentOrder.delivery_timeline.total_duration / 60)}h {currentOrder.delivery_timeline.total_duration % 60}m
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Items</span>
                    <span className="text-sm">{order.audit_trail?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-sm font-medium">₱{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Subtotal:</span>
                    <span className="text-sm font-medium">₱{Number(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Co-op Share (10%):</span>
                    <span className="text-sm font-medium text-green-600">₱{Number(order.coop_share || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Member Share (100%):</span>
                    <span className="text-sm font-medium text-blue-600">₱{Number(order.member_share || 0).toFixed(2)}</span>
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
            {(order.status === 'pending' || order.status === 'delayed') && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.status === 'delayed' && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm text-orange-800">
                        <strong>This order is delayed.</strong> It has exceeded the standard 24-hour processing time but can still be approved or rejected.
                      </p>
                    </div>
                  )}
                  <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="default"
                      >
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
                      <Button 
                        className="w-full" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedRejectionReason('');
                          rejectForm.reset();
                        }}
                      >
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
                          <Select
                            value={selectedRejectionReason}
                            onValueChange={(value) => {
                              setSelectedRejectionReason(value);
                              if (value !== 'Other') {
                                rejectForm.setData('admin_notes', value);
                              } else {
                                rejectForm.setData('admin_notes', '');
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a reason for rejection" />
                            </SelectTrigger>
                            <SelectContent>
                              {rejectionReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedRejectionReason === 'Other' && (
                          <div>
                            <label className="text-sm font-medium">Additional Details *</label>
                            <Textarea
                              placeholder="Please provide additional details for the rejection..."
                              value={rejectForm.data.admin_notes}
                              onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                              className="mt-1"
                              required
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setRejectDialogOpen(false);
                          setSelectedRejectionReason('');
                          rejectForm.reset();
                        }}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleReject} 
                          disabled={rejectForm.processing || !selectedRejectionReason || (selectedRejectionReason === 'Other' && !rejectForm.data.admin_notes)}
                        >
                          {rejectForm.processing ? 'Rejecting...' : 'Reject Order'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}


            {/* Receipt Preview for Approved Orders */}
            {order.status === 'approved' && (
              <Card>
                <CardHeader>
                  <CardTitle>Receipt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={route('admin.orders.receiptPreview', order.id)}>
                    <Button className="w-full" variant="outline">
                      📄 Preview Receipt Email
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Preview the receipt email that was sent to {order.customer.email}
                  </p>
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


            {/* Order Picked Up Management for Approved Orders */}
            {order.status === 'approved' && order.logistic && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Picked Up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`p-3 rounded ${
                    currentOrder.delivery_status === 'pending' ? 'bg-yellow-50' :
                    currentOrder.delivery_status === 'out_for_delivery' ? 'bg-blue-50' :
                    currentOrder.delivery_status === 'delivered' ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    {currentOrder.delivery_status === 'pending' && (
                      <>
                        <p className="text-sm font-medium text-yellow-800">
                          Order is ready but not yet picked up
                        </p>
                        <p className="text-sm text-yellow-600">
                          Mark the order as picked up when the logistic provider collects it.
                        </p>
                      </>
                    )}
                    {currentOrder.delivery_status === 'out_for_delivery' && (
                      <>
                        <p className="text-sm font-medium text-blue-800">
                          Order is out for delivery
                        </p>
                        <p className="text-sm text-blue-600">
                          The order has been picked up and is currently being delivered to the customer.
                        </p>
                      </>
                    )}
                    {currentOrder.delivery_status === 'delivered' && (
                      <>
                        <p className="text-sm font-medium text-green-800">
                          Order has been delivered
                        </p>
                        <p className="text-sm text-green-600">
                          The order has been successfully delivered to the customer.
                        </p>
                      </>
                    )}
                  </div>
                  
                  {currentOrder.delivery_status === 'pending' ? (
                    <Dialog open={pickedUpDialogOpen} onOpenChange={setPickedUpDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="default">
                          Mark Order as Picked Up
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark Order as Picked Up</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to mark this order as picked up? This will automatically set the delivery status to "Out for Delivery" and notify the customer that their order is in transit.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Type "Confirm Pick Up" to finalize this action *
                            </label>
                            <Input
                              type="text"
                              value={pickupConfirmationText}
                              onChange={(e) => setPickupConfirmationText(e.target.value)}
                              placeholder="Confirm Pick Up"
                              className="mt-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This action cannot be undone. The order will be marked as picked up and delivery status will be set to "Out for Delivery".
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setPickedUpDialogOpen(false);
                              setPickupConfirmationText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleMarkPickedUp} 
                            disabled={pickedUpForm.processing || pickupConfirmationText !== 'Confirm Pick Up'}
                          >
                            {pickedUpForm.processing ? 'Marking...' : 'Mark as Picked Up'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : currentOrder.delivery_status === 'out_for_delivery' ? (
                    <Button className="w-full" variant="outline" disabled>
                      Picked Up
                    </Button>
                  ) : currentOrder.delivery_status === 'delivered' ? (
                    <Button className="w-full" variant="outline" disabled>
                      Delivered
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Picked Up
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 