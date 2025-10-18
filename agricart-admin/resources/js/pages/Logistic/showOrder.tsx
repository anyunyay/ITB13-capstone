import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogisticHeader } from '@/components/logistic-header';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Truck, Clock, Upload, Camera, X } from 'lucide-react';
import { getDisplayEmail } from '@/lib/utils';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
  };
  delivery_address?: string;
  total_amount: number;
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered';
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
  delivery_proof_image?: string;
  delivery_confirmed: boolean;
  created_at: string;
  audit_trail: Array<{
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
  }>;
}

interface ShowOrderProps {
  order: Order;
}

export default function ShowOrder({ order }: ShowOrderProps) {
  // Use useState to manage the order state for real-time updates
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  
  // State for confirmation dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered' | null>(null);
  
  // State for delivery confirmation modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current user from page props
  const { auth } = usePage().props as any;
  
  // Get display email (masked for non-admin/staff users)
  const displayEmail = getDisplayEmail(currentOrder.customer.email || '', auth?.user?.type);

  // Form for delivery status updates
  const updateDeliveryStatusForm = useForm({
    delivery_status: currentOrder.delivery_status,
  });

  // Form for delivery confirmation
  const deliveryForm = useForm({
    delivery_proof_image: null as File | null,
    confirmation_text: '',
  });

  // Helper function to format quantities with proper units
  const formatQuantity = (quantity: number, category: string) => {
    switch (category.toLowerCase()) {
      case 'kilo':
        return `${quantity} kg`;
      case 'pc':
        return `${quantity} pc`;
      case 'tali':
        return `${quantity} tali`;
      default:
        return `${quantity} ${category}`;
    }
  };

  // Note: Backend now provides aggregated quantities, so no need for client-side aggregation

  // Keep form data synchronized with current order state
  useEffect(() => {
    updateDeliveryStatusForm.setData('delivery_status', currentOrder.delivery_status);
  }, [currentOrder.delivery_status]);

  // Get appropriate badge styling for delivery status
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

  // Handle delivery status changes with confirmation
  const handleDeliveryStatusChange = (value: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered') => {
    // Prevent changes to delivered orders
    if (currentOrder.delivery_status === 'delivered') {
      return;
    }

    // Prevent multiple simultaneous requests
    if (updateDeliveryStatusForm.processing) {
      return;
    }

    // Special handling for delivered status - show delivery modal instead
    if (value === 'delivered') {
      setShowDeliveryModal(true);
      return;
    }

    // Show confirmation dialog for other status changes
    setPendingStatus(value);
    setShowConfirmationDialog(true);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDeliveryImage(file);
      deliveryForm.setData('delivery_proof_image', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setDeliveryImage(null);
    setImagePreview(null);
    deliveryForm.setData('delivery_proof_image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delivery confirmation
  const handleDeliveryConfirmation = () => {
    if (!deliveryImage) {
      alert('Please upload a delivery proof image.');
      return;
    }

    if (confirmationText !== 'I Confirm') {
      alert('Please type "I Confirm" exactly to confirm delivery.');
      return;
    }

    deliveryForm.setData('confirmation_text', confirmationText);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('delivery_proof_image', deliveryImage);
    formData.append('confirmation_text', confirmationText);

    router.post(route('logistic.orders.markDelivered', currentOrder.id), formData, {
      onSuccess: () => {
        // Update local state
        setCurrentOrder(prevOrder => ({
          ...prevOrder,
          delivery_status: 'delivered',
          delivery_confirmed: true,
          delivery_proof_image: imagePreview || undefined,
          delivered_time: new Date().toISOString(),
          delivery_timeline: {
            ...prevOrder.delivery_timeline,
            delivered_at: new Date().toISOString(),
            ready_duration: prevOrder.delivery_timeline?.ready_duration || undefined,
            packing_duration: prevOrder.delivery_timeline?.packing_duration || undefined,
            delivery_duration: prevOrder.delivery_timeline?.delivery_duration || undefined,
            total_duration: prevOrder.delivery_timeline?.total_duration || undefined,
          }
        }));
        setShowDeliveryModal(false);
        setDeliveryImage(null);
        setImagePreview(null);
        setConfirmationText('');
      },
      onError: (errors) => {
        console.error('Delivery confirmation error:', errors);
      },
      preserveScroll: true,
    });
  };

  // Confirm status change
  const confirmStatusChange = () => {
    if (!pendingStatus) return;

    // Update form data for UI consistency
    updateDeliveryStatusForm.setData('delivery_status', pendingStatus);
    
    // Send update request directly with the selected value
    router.put(route('logistic.orders.updateDeliveryStatus', currentOrder.id), {
      delivery_status: pendingStatus
    }, {
      onSuccess: () => {
        // Update local state immediately for instant UI feedback
        setCurrentOrder(prevOrder => ({
          ...prevOrder,
          delivery_status: pendingStatus,
          delivery_ready_time: pendingStatus === 'ready_to_pickup' ? new Date().toISOString() : prevOrder.delivery_ready_time,
          delivery_packed_time: pendingStatus === 'out_for_delivery' ? new Date().toISOString() : prevOrder.delivery_packed_time,
          delivered_time: pendingStatus === 'delivered' ? new Date().toISOString() : prevOrder.delivered_time,
          delivery_timeline: {
            ...prevOrder.delivery_timeline,
            ready_at: pendingStatus === 'ready_to_pickup' ? new Date().toISOString() : prevOrder.delivery_timeline?.ready_at,
            packed_at: pendingStatus === 'out_for_delivery' ? new Date().toISOString() : prevOrder.delivery_timeline?.packed_at,
            delivered_at: pendingStatus === 'delivered' ? new Date().toISOString() : prevOrder.delivery_timeline?.delivered_at,
            ready_duration: prevOrder.delivery_timeline?.ready_duration || undefined,
            packing_duration: prevOrder.delivery_timeline?.packing_duration || undefined,
            delivery_duration: prevOrder.delivery_timeline?.delivery_duration || undefined,
            total_duration: prevOrder.delivery_timeline?.total_duration || undefined,
          }
        }));
        setShowConfirmationDialog(false);
        setPendingStatus(null);
      },
      onError: (errors) => {
        // Handle validation or server errors silently
        // Errors will be displayed in the form if any
        setShowConfirmationDialog(false);
        setPendingStatus(null);
      },
      preserveScroll: true,
    });
  };

  // Cancel status change
  const cancelStatusChange = () => {
    setShowConfirmationDialog(false);
    setPendingStatus(null);
    // Reset form to current order status
    updateDeliveryStatusForm.setData('delivery_status', currentOrder.delivery_status);
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
          <Button 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => window.history.back()}
          >
            Back to Orders
          </Button>
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
                {currentOrder.delivery_timeline && (
                  <>
                    {currentOrder.delivery_ready_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Ready At</p>
                        <p className="text-sm text-green-400">
                          {format(new Date(currentOrder.delivery_ready_time), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {currentOrder.delivery_packed_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Packed At</p>
                        <p className="text-sm text-blue-400">
                          {format(new Date(currentOrder.delivery_packed_time), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {currentOrder.delivered_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Delivered At</p>
                        <p className="text-sm text-green-400">
                          {format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {currentOrder.delivery_timeline.ready_duration && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Ready Duration</p>
                        <p className="text-sm text-gray-300">
                          {Math.floor(currentOrder.delivery_timeline.ready_duration / 60)}h {currentOrder.delivery_timeline.ready_duration % 60}m
                        </p>
                      </div>
                    )}
                    {currentOrder.delivery_timeline.packing_duration && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Packing Duration</p>
                        <p className="text-sm text-gray-300">
                          {Math.floor(currentOrder.delivery_timeline.packing_duration / 60)}h {currentOrder.delivery_timeline.packing_duration % 60}m
                        </p>
                      </div>
                    )}
                    {currentOrder.delivery_timeline.delivery_duration && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Delivery Duration</p>
                        <p className="text-sm text-gray-300">
                          {Math.floor(currentOrder.delivery_timeline.delivery_duration / 60)}h {currentOrder.delivery_timeline.delivery_duration % 60}m
                        </p>
                      </div>
                    )}
                    {currentOrder.delivery_timeline.total_duration && (
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Duration</p>
                        <p className="text-sm text-gray-300">
                          {Math.floor(currentOrder.delivery_timeline.total_duration / 60)}h {currentOrder.delivery_timeline.total_duration % 60}m
                        </p>
                      </div>
                    )}
                  </>
                )}
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
                <p className="text-sm text-white">{displayEmail}</p>
              </div>
              {currentOrder.customer.contact_number && (
                <div>
                  <p className="text-sm font-medium text-gray-400">Contact Number</p>
                  <p className="text-sm text-white">{currentOrder.customer.contact_number}</p>
                </div>
              )}
              {currentOrder.delivery_address && (
                <div>
                  <p className="text-sm font-medium text-gray-400">Delivery Address</p>
                  <p className="text-sm text-white">{currentOrder.delivery_address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Status Update */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {currentOrder.delivery_status === 'delivered' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Delivery Status (Completed)
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5 text-blue-400" />
                  Update Delivery Status
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="max-w-md">
                <label className="text-sm font-medium text-white">Delivery Status</label>
                <Select
                  value={updateDeliveryStatusForm.data.delivery_status}
                  onValueChange={(value) => handleDeliveryStatusChange(value as 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered')}
                  disabled={updateDeliveryStatusForm.processing || currentOrder.delivery_status === 'delivered' || currentOrder.delivery_status === 'pending'}
                >
                  <SelectTrigger className={currentOrder.delivery_status === 'delivered' || currentOrder.delivery_status === 'pending' ? 'bg-gray-700 cursor-not-allowed' : ''}>
                    <SelectValue placeholder="Select delivery status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" disabled>Pending</SelectItem>
                    <SelectItem value="ready_to_pickup" disabled>Ready to Pick Up</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Mark as Delivered</SelectItem>
                  </SelectContent>
                </Select>
                {currentOrder.delivery_status === 'delivered' && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      This order has been delivered and cannot be modified.
                    </p>
                    {currentOrder.delivery_proof_image && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-300 mb-2">Delivery Proof:</p>
                        <img 
                          src={currentOrder.delivery_proof_image} 
                          alt="Delivery proof" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                )}
                {currentOrder.delivery_status === 'pending' && (
                  <p className="text-sm text-yellow-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    This order is pending preparation. You cannot change the delivery status until the admin marks it as ready.
                  </p>
                )}
                {currentOrder.delivery_status === 'ready_to_pickup' && (
                  <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Order is ready for pickup. You can mark it as out for delivery when you collect it.
                  </p>
                )}
                {currentOrder.delivery_status === 'out_for_delivery' && (
                  <p className="text-sm text-blue-400 mt-2 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Order is out for delivery. You can mark it as delivered when you complete the delivery.
                  </p>
                )}
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
              {currentOrder.audit_trail.map((item, index) => {
                // Get the appropriate price based on category
                const getPrice = () => {
                  let rawPrice;
                  switch (item.category.toLowerCase()) {
                    case 'kilo':
                      rawPrice = item.product.price_kilo;
                      break;
                    case 'pc':
                      rawPrice = item.product.price_pc;
                      break;
                    case 'tali':
                      rawPrice = item.product.price_tali;
                      break;
                    default:
                      return null;
                  }
                  
                  // Convert to number if it's a string, return null if invalid
                  if (rawPrice === null || rawPrice === undefined) {
                    return null;
                  }
                  
                  const numPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
                  return isNaN(numPrice) ? null : numPrice;
                };

                const price = getPrice();
                const totalPrice = (price && typeof price === 'number') ? price * item.quantity : null;

                return (
                  <div key={`${item.product.name}-${item.category}-${index}`} className="p-4 border border-gray-600 rounded-lg bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.product.name}</h4>
                        <p className="text-sm text-gray-400">
                          Category: <span className="capitalize text-gray-300">{item.category}</span>
                        </p>
                        {price && typeof price === 'number' && (
                          <p className="text-sm text-gray-400">
                            Price per {item.category.toLowerCase()}: ₱{price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          Quantity: {formatQuantity(item.quantity, item.category)}
                        </p>
                        {totalPrice && typeof totalPrice === 'number' && (
                          <p className="text-sm text-gray-300">
                            Subtotal: ₱{totalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirm Status Change
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Are you sure you want to change the delivery status?
              </DialogDescription>
            </DialogHeader>
            
            {pendingStatus && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Current Status:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeliveryStatusBadge(currentOrder.delivery_status)}
                  </div>
                </div>
                
                <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">New Status:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeliveryStatusBadge(pendingStatus)}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={cancelStatusChange}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmStatusChange}
                disabled={updateDeliveryStatusForm.processing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateDeliveryStatusForm.processing ? 'Updating...' : 'Confirm Change'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery Confirmation Modal */}
        <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5 text-green-500" />
                Confirm Delivery
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Please upload a photo of the delivered package and confirm the delivery.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <Label className="text-sm font-medium text-white">Delivery Proof Image *</Label>
                <div className="mt-2">
                  {!imagePreview ? (
                    <div 
                      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Click to upload delivery proof</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Delivery proof preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Confirmation Text Input */}
              <div>
                <Label className="text-sm font-medium text-white">
                  Type "I Confirm" to finalize delivery *
                </Label>
                <Input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="I Confirm"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This action cannot be undone. The order will be marked as delivered and become read-only.
                </p>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryImage(null);
                  setImagePreview(null);
                  setConfirmationText('');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeliveryConfirmation}
                disabled={!deliveryImage || confirmationText !== 'I Confirm' || deliveryForm.processing}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600"
              >
                {deliveryForm.processing ? 'Confirming...' : 'Confirm Delivery'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 