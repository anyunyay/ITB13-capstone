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
import { AlertTriangle, CheckCircle, Truck, Upload, Camera, X } from 'lucide-react';
import { getDisplayEmail } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

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
  const t = useTranslation();
  
  // Use useState to manage the order state for real-time updates
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  
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

  // Form for delivery confirmation
  const deliveryForm = useForm({
    delivery_proof_image: null as File | null,
    confirmation_text: '',
  });

  // Helper function to format quantities with proper units
  const formatQuantity = (quantity: number, category: string) => {
    switch (category.toLowerCase()) {
      case 'kilo':
        return `${quantity} ${t('logistic.kg')}`;
      case 'pc':
        return `${quantity} ${t('logistic.pc')}`;
      case 'tali':
        return `${quantity} ${t('logistic.tali')}`;
      default:
        return `${quantity} ${category}`;
    }
  };

  // Note: Backend now provides aggregated quantities, so no need for client-side aggregation

  // Get appropriate badge styling for delivery status
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="bg-primary text-primary-foreground">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-blue-600 text-white">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-green-600 text-green-600">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      alert(t('logistic.upload_image_required'));
      return;
    }

    if (confirmationText !== 'I Confirm') {
      alert(t('logistic.type_confirm_exact'));
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

  return (
    <div className="min-h-screen bg-background">
      <LogisticHeader />
      <Head title={t('logistic.order_number', { id: currentOrder.id }) + ' ' + t('logistic.order_details')} />
      
      <div className="p-6 pt-25 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('logistic.order_number', { id: currentOrder.id })}</h1>
            <p className="text-muted-foreground">{t('logistic.order_details_management')}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            {t('logistic.back_to_orders')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">{t('logistic.order_information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.order_id')}</p>
                  <p className="text-sm text-foreground">#{currentOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.order_date')}</p>
                  <p className="text-sm text-foreground">{format(new Date(currentOrder.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.total_amount')}</p>
                  <p className="text-sm text-semibold text-foreground">₱{currentOrder.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.delivery_status')}</p>
                  <div className="flex items-center space-x-2">
                    {getDeliveryStatusBadge(currentOrder.delivery_status)}
                  </div>
                </div>
                {currentOrder.delivery_ready_time && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.ready_at')}</p>
                    <p className="text-sm text-primary">
                      {format(new Date(currentOrder.delivery_ready_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {currentOrder.delivery_packed_time && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.packed_at')}</p>
                    <p className="text-sm text-blue-600">
                      {format(new Date(currentOrder.delivery_packed_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {currentOrder.delivered_time && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.delivered_at')}</p>
                    <p className="text-sm text-green-600">
                      {format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">{t('logistic.customer_information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('logistic.customer_name')}</p>
                <p className="text-sm text-foreground">{currentOrder.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('logistic.email')}</p>
                <p className="text-sm text-foreground">{displayEmail}</p>
              </div>
              {currentOrder.customer.contact_number && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.contact_number')}</p>
                  <p className="text-sm text-foreground">{currentOrder.customer.contact_number}</p>
                </div>
              )}
              {currentOrder.delivery_address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.delivery_address')}</p>
                  <p className="text-sm text-foreground">{currentOrder.delivery_address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Status Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              {currentOrder.delivery_status === 'delivered' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {t('logistic.delivery_status_completed')}
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5 text-blue-600" />
                  {t('logistic.delivery_progress')}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progressive Status Line */}
            <div className="space-y-4">
              {/* Status Steps */}
              <div className="flex items-center justify-between">
                {/* Step 1: Pending */}
                <div className={`flex flex-col items-center ${currentOrder.delivery_status === 'pending' ? 'text-blue-400' : currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'text-green-400' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentOrder.delivery_status === 'pending' ? 'bg-blue-600 text-white' : currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    {currentOrder.delivery_status === 'pending' ? '1' : '✓'}
                  </div>
                  <span className="text-xs mt-1 text-center">{t('logistic.preparing')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-2 ${currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-gray-600'}`}></div>

                {/* Step 2: Ready to Pick Up */}
                <div className={`flex flex-col items-center ${currentOrder.delivery_status === 'ready_to_pickup' ? 'text-green-400' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'text-green-400' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentOrder.delivery_status === 'ready_to_pickup' ? 'bg-green-600 text-white' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    {currentOrder.delivery_status === 'ready_to_pickup' ? '2' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? '✓' : '2'}
                  </div>
                  <span className="text-xs mt-1 text-center">{t('logistic.ready')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-2 ${currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-gray-600'}`}></div>

                {/* Step 3: Out for Delivery */}
                <div className={`flex flex-col items-center ${currentOrder.delivery_status === 'out_for_delivery' ? 'text-blue-400' : currentOrder.delivery_status === 'delivered' ? 'text-green-400' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentOrder.delivery_status === 'out_for_delivery' ? 'bg-blue-600 text-white' : currentOrder.delivery_status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    {currentOrder.delivery_status === 'out_for_delivery' ? '3' : currentOrder.delivery_status === 'delivered' ? '✓' : '3'}
                  </div>
                  <span className="text-xs mt-1 text-center">{t('logistic.out_for_delivery')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-2 ${currentOrder.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-gray-600'}`}></div>

                {/* Step 4: Delivered */}
                <div className={`flex flex-col items-center ${currentOrder.delivery_status === 'delivered' ? 'text-green-400' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentOrder.delivery_status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    {currentOrder.delivery_status === 'delivered' ? '✓' : '4'}
                  </div>
                  <span className="text-xs mt-1 text-center">{t('logistic.delivered')}</span>
                </div>
              </div>

              {/* Current Status Message */}
              <div className="mt-4">
                {currentOrder.delivery_status === 'pending' && (
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {t('logistic.order_pending_preparation')}
                  </p>
                )}
                {currentOrder.delivery_status === 'ready_to_pickup' && (
                  <p className="text-sm text-primary flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t('logistic.order_ready_pickup')}
                  </p>
                )}
                {currentOrder.delivery_status === 'out_for_delivery' && (
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {t('logistic.order_out_delivery')}
                  </p>
                )}
                {currentOrder.delivery_status === 'delivered' && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t('logistic.order_delivered_completed')}
                  </p>
                )}
              </div>

              {/* Action Button - Only for Delivered */}
              {currentOrder.delivery_status !== 'delivered' && (
                <div className="mt-4">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:cursor-not-allowed"
                    onClick={() => setShowDeliveryModal(true)}
                    disabled={currentOrder.delivery_status !== 'out_for_delivery'}
                    title={currentOrder.delivery_status !== 'out_for_delivery' ? 
                      'Order must be marked as "Out for Delivery" before it can be delivered' : 
                      'Mark this order as delivered'
                    }
                  >
                    {currentOrder.delivery_status === 'pending' ? t('logistic.waiting_for_preparation') : 
                     currentOrder.delivery_status === 'ready_to_pickup' ? t('logistic.waiting_pickup_confirmation') : 
                     t('logistic.mark_as_delivered')}
                  </Button>
                  {currentOrder.delivery_status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {t('admin.you_can_only_mark_delivered_after_ready')}
                    </p>
                  )}
                  {currentOrder.delivery_status === 'ready_to_pickup' && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {t('logistic.order_ready_pickup_note')}
                    </p>
                  )}
                  {currentOrder.delivery_status === 'out_for_delivery' && (
                    <p className="text-xs text-primary mt-2 text-center">
                      {t('logistic.order_out_delivery_note')}
                    </p>
                  )}
                </div>
              )}

              {/* Delivered Status Display */}
              {currentOrder.delivery_status === 'delivered' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/30 dark:border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('admin.order_delivered')}</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('logistic.order_delivered_note')}
                  </p>
                  {currentOrder.delivery_proof_image && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-foreground mb-2">{t('logistic.delivery_proof')}:</p>
                      <img 
                        src={currentOrder.delivery_proof_image} 
                        alt="Delivery proof" 
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{t('logistic.order_items')}</CardTitle>
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
                  <div key={`${item.product.name}-${item.category}-${index}`} className="p-4 border border-border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Category: <span className="capitalize text-foreground">{item.category}</span>
                        </p>
                        {price && typeof price === 'number' && (
                          <p className="text-sm text-muted-foreground">
                            Price per {item.category.toLowerCase()}: ₱{price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          Quantity: {formatQuantity(item.quantity, item.category)}
                        </p>
                        {totalPrice && typeof totalPrice === 'number' && (
                          <p className="text-sm text-muted-foreground">
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

        {/* Delivery Confirmation Modal */}
        <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Camera className="h-5 w-5 text-primary" />
                {t('logistic.confirm_delivery')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('logistic.upload_photo_confirm')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <Label className="text-sm font-medium text-foreground">{t('logistic.delivery_proof_image')} *</Label>
                <div className="mt-2">
                  {!imagePreview ? (
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{t('logistic.click_upload_proof')}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{t('logistic.file_size_limit')}</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt={t('logistic.delivery_proof_preview')} 
                        className="w-full h-48 object-cover rounded-lg border border-border"
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
                <Label className="text-sm font-medium text-foreground">
                  {t('logistic.type_confirm_finalize')} *
                </Label>
                <Input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={t('logistic.i_confirm')}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('logistic.action_cannot_undone')}
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
              >
                {t('ui.cancel')}
              </Button>
              <Button 
                onClick={handleDeliveryConfirmation}
                disabled={!deliveryImage || confirmationText !== 'I Confirm' || deliveryForm.processing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted"
              >
                {deliveryForm.processing ? t('logistic.confirming') : t('logistic.confirm_delivery_button')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 