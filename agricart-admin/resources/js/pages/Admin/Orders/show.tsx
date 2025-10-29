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
import { CustomerInformation } from '@/components/orders/customer-information';
import { DeliveryProof } from '@/components/orders/delivery-proof';
import { AdminNotes } from '@/components/orders/admin-notes';
import { OrderSummary } from '@/components/orders/order-summary';
import { OrderActions } from '@/components/orders/order-actions';
import { ReceiptPreview } from '@/components/orders/receipt-preview';
import { LogisticAssignment } from '@/components/orders/logistic-assignment';
import { OrderReady } from '@/components/orders/order-ready';
import { OrderPickup } from '@/components/orders/order-pickup';
import { useTranslation } from '@/hooks/use-translation';

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
  subtotal?: number;
  coop_share?: number;
  available_stock?: number;
  total_amount?: number;
  stock_preview?: {
    current_stock: number;
    quantity_to_deduct: number;
    remaining_stock: number;
    sufficient_stock: boolean;
  };
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
    barangay?: string;
    city?: string;
    province?: string;
  };
  total_amount: number;
  subtotal: number;
  coop_share: number;
  member_share: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'delayed';
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered';
  delivery_proof_image?: string;
  delivery_confirmed?: boolean;
  delivery_ready_time?: string;
  delivery_packed_time?: string;
  delivered_time?: string;
  delivery_timeline?: {
    ready_at?: string;
    packed_at?: string;
    delivered_at?: string;
    ready_duration?: number;
    packing_duration?: number;
    delivery_duration?: number;
    total_duration?: number;
  };
  created_at: string;
  updated_at: string;
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
  const t = useTranslation();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignLogisticDialogOpen, setAssignLogisticDialogOpen] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [pickedUpDialogOpen, setPickedUpDialogOpen] = useState(false);
  const [pickupConfirmationText, setPickupConfirmationText] = useState('');
  const [markReadyDialogOpen, setMarkReadyDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [deliveryProofModalOpen, setDeliveryProofModalOpen] = useState(false);

  // Update currentOrder when order prop changes (for real-time updates)
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Auto-refresh order data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['order'] });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Check if order has insufficient stock
  const hasInsufficientStock = order.audit_trail?.some(item =>
    item.stock_preview && !item.stock_preview.sufficient_stock
  ) || false;

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
        return <Badge variant="secondary">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('admin.rejected')}</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('admin.expired')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Ready to Pick Up</Badge>;
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
        // Auto-open logistics assignment dialog after approval
        setAssignLogisticDialogOpen(true);
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
        // Update local state to reflect the logistic assignment
        const updatedOrder = {
          ...currentOrder,
          logistic: logistics.find(l => l.id.toString() === assignLogisticForm.data.logistic_id)
        };
        setCurrentOrder(updatedOrder);
        // Refresh the page to get updated order data
        router.reload({ only: ['order'] });
      },
    });
  };


  const handleMarkReady = () => {
    setMarkReadyDialogOpen(true);
  };

  const confirmMarkReady = () => {
    router.post(route('admin.orders.markReady', order.id), {}, {
      onSuccess: () => {
        setMarkReadyDialogOpen(false);
        // Refresh the page to get updated order data
        router.reload({ only: ['order'] });
      },
      onError: (errors) => {
        console.error('Error marking order as ready:', errors);
        setMarkReadyDialogOpen(false);
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
        setPickedUpDialogOpen(false);
        setPickupConfirmationText('');
        // Refresh the page to get updated order data
        router.reload({ only: ['order'] });
      },
      onError: (errors) => {
        console.error('Error marking order as picked up:', errors);
      },
    });
  };

  return (
    <AppLayout>
      <Head title={t('admin.order_id', { id: order.id })} />
      <div className={`p-6 transition-all duration-1000 ${highlight ? 'border-2 border-primary rounded-lg shadow-lg bg-primary/5' : ''}`}>
        <div className="flex flex-col gap-2 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('admin.order_id', { id: order.id })}</h1>
            <p className="text-muted-foreground">
              {t('admin.placed_on', { date: format(new Date(order.created_at), 'MMM dd, yyyy HH:mm') })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(order.status)}
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                {order.is_urgent ? t('admin.urgent_manual') : t('admin.urgent_time_left', { hours: 24 - orderAge })}
              </Badge>
            )}
            {!canApprove && order.status === 'pending' && (
              <Badge variant="destructive">
                {t('admin.approval_time_expired')}
              </Badge>
            )}
            <Link href={route('admin.orders.index')}>
              <Button variant="outline" className="whitespace-nowrap">{t('admin.back_to_orders')}</Button>
            </Link>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="space-y-6">
          {/* Primary Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Customer Information */}
              <CustomerInformation
                customer={order.customer}
                deliveryAddress={order.delivery_address}
              />

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderItemsTable
                    items={order.audit_trail || []}
                    showStock={true}
                    compact={false}
                  />
                </CardContent>
              </Card>

              {/* Order Management Components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Order Ready Management for Approved Orders */}
                {order.status === 'approved' && currentOrder.logistic && (
                  <OrderReady
                    orderId={order.id}
                    deliveryStatus={currentOrder.delivery_status}
                    logistic={currentOrder.logistic}
                    deliveryReadyTime={currentOrder.delivery_ready_time}
                    markReadyDialogOpen={markReadyDialogOpen}
                    setMarkReadyDialogOpen={setMarkReadyDialogOpen}
                    onMarkReady={handleMarkReady}
                    onConfirmMarkReady={confirmMarkReady}
                  />
                )}

                {/* Order Picked Up Management for Approved Orders */}
                {order.status === 'approved' && currentOrder.logistic && currentOrder.delivery_status !== 'pending' && (
                  <OrderPickup
                    orderId={order.id}
                    deliveryStatus={currentOrder.delivery_status}
                    logistic={currentOrder.logistic}
                    deliveryReadyTime={currentOrder.delivery_ready_time}
                    deliveryPackedTime={currentOrder.delivery_packed_time}
                    deliveredTime={currentOrder.delivered_time}
                    pickedUpDialogOpen={pickedUpDialogOpen}
                    setPickedUpDialogOpen={setPickedUpDialogOpen}
                    pickupConfirmationText={pickupConfirmationText}
                    setPickupConfirmationText={setPickupConfirmationText}
                    pickedUpForm={pickedUpForm}
                    onMarkPickedUp={handleMarkPickedUp}
                  />
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Order Summary */}
              <OrderSummary
                status={order.status}
                deliveryStatus={currentOrder.delivery_status}
                deliveryTimeline={currentOrder.delivery_timeline}
                deliveryReadyTime={currentOrder.delivery_ready_time}
                deliveryPackedTime={currentOrder.delivery_packed_time}
                deliveredTime={currentOrder.delivered_time}
                auditTrailLength={order.audit_trail?.length || 0}
                totalAmount={order.total_amount}
                subtotal={order.subtotal}
                coopShare={order.coop_share}
                memberShare={order.member_share}
                admin={order.admin}
                logistic={order.logistic}
                getStatusBadge={getStatusBadge}
                getDeliveryStatusBadge={getDeliveryStatusBadge}
              />

              {/* Action Buttons Row */}
              <OrderActions
                orderId={order.id}
                status={order.status}
                hasInsufficientStock={hasInsufficientStock}
                approveDialogOpen={approveDialogOpen}
                setApproveDialogOpen={setApproveDialogOpen}
                rejectDialogOpen={rejectDialogOpen}
                setRejectDialogOpen={setRejectDialogOpen}
                approveForm={approveForm}
                rejectForm={rejectForm}
                selectedRejectionReason={selectedRejectionReason}
                setSelectedRejectionReason={setSelectedRejectionReason}
                rejectionReasons={rejectionReasons}
                onApprove={handleApprove}
                onReject={handleReject}
              />

              {/* Receipt Preview for Approved Orders */}
              {order.status === 'approved' && (
                <ReceiptPreview
                  orderId={order.id}
                  customerEmail={order.customer.email}
                  order={order}
                />
              )}

              {/* Logistic Assignment for Approved Orders */}
              {order.status === 'approved' && (
                <LogisticAssignment
                  orderId={order.id}
                  logistic={order.logistic}
                  logistics={logistics}
                  assignLogisticDialogOpen={assignLogisticDialogOpen}
                  setAssignLogisticDialogOpen={setAssignLogisticDialogOpen}
                  assignLogisticForm={assignLogisticForm}
                  onAssignLogistic={handleAssignLogistic}
                />
              )}
            </div>
          </div>

          {/* Additional Information Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Delivery Proof Section */}
            {currentOrder.delivery_status === 'delivered' && currentOrder.delivery_proof_image && (
              <DeliveryProof
                deliveryProofImage={currentOrder.delivery_proof_image}
                deliveredTime={currentOrder.delivered_time}
                orderId={currentOrder.id}
                onViewFullSize={() => setDeliveryProofModalOpen(true)}
              />
            )}

            {/* Admin Notes */}
            <AdminNotes
              adminNotes={order.admin_notes || ''}
              admin={order.admin}
            />
          </div>
        </div>
      </div>


      {/* Delivery Proof Modal */}
      <Dialog open={deliveryProofModalOpen} onOpenChange={setDeliveryProofModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Delivery Proof - Order #{currentOrder.id}</DialogTitle>
            <DialogDescription>
              Proof of delivery uploaded by {currentOrder.logistic?.name || 'logistic provider'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={currentOrder.delivery_proof_image}
                alt="Delivery proof"
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/products/default-product.jpg';
                  target.alt = 'Delivery proof not available';
                }}
              />
            </div>
            {currentOrder.delivered_time && (
              <div className="text-center text-sm text-gray-500">
                Delivered on {format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentOrder.delivery_proof_image!;
                link.download = `delivery-proof-order-${currentOrder.id}.jpg`;
                link.click();
              }}
            >
              📥 Download Image
            </Button>
            <Button variant="outline" onClick={() => setDeliveryProofModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
} 