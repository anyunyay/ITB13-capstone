import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogisticsHeader } from '@/components/logistics/logistics-header';
import { format } from 'date-fns';
import { useState, useRef } from 'react';
import { AlertTriangle, CheckCircle, Truck, Upload, Camera, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { getDisplayEmail } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { ImageLightbox } from '@/components/customer/products/ImageLightbox';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for image lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // State for mobile collapsible sections
  const [isOrderInfoExpanded, setIsOrderInfoExpanded] = useState(false);
  const [isCustomerInfoExpanded, setIsCustomerInfoExpanded] = useState(false);
  
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
        return <Badge className="status-pending">{t('logistic.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge className="status-ready">{t('logistic.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge className="status-out-for-delivery">{t('logistic.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge className="status-delivered">{t('logistic.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, or PDF)');
        event.target.value = '';
        return;
      }

      // Validate file size (3MB = 3072KB)
      const maxSizeKB = 3072;
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > maxSizeKB) {
        alert(`File size must be less than ${maxSizeKB / 1024}MB. Current size: ${(fileSizeKB / 1024).toFixed(2)}MB`);
        event.target.value = '';
        return;
      }

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
    // Validate image
    if (!deliveryImage) {
      alert(t('logistic.upload_image_required'));
      return;
    }

    // Validate confirmation text
    if (confirmationText.trim() !== 'I Confirm') {
      alert(t('logistic.type_confirm_exact'));
      return;
    }

    // Validate order status
    if (currentOrder.delivery_status !== 'out_for_delivery') {
      alert('Order must be "Out for Delivery" before it can be marked as delivered.');
      return;
    }

    deliveryForm.setData('confirmation_text', confirmationText);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('delivery_proof_image', deliveryImage);
    formData.append('confirmation_text', confirmationText.trim());

    console.log('Submitting delivery confirmation for order:', currentOrder.id);
    console.log('File size:', deliveryImage.size, 'bytes');
    console.log('File type:', deliveryImage.type);
    console.log('Confirmation text:', confirmationText);

    setIsSubmitting(true);

    router.post(route('logistic.orders.markDelivered', currentOrder.id), formData, {
      onSuccess: (response) => {
        console.log('Delivery confirmation successful:', response);
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
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error('Delivery confirmation error details:', {
          errors,
          errorType: typeof errors,
          errorKeys: errors ? Object.keys(errors) : 'No keys',
          errorValues: errors ? Object.values(errors) : 'No values'
        });
        
        // Handle different types of errors
        if (errors && typeof errors === 'object') {
          // Check for validation errors
          if (errors.delivery_proof_image) {
            alert(`Image upload error: ${errors.delivery_proof_image}`);
          } else if (errors.confirmation_text) {
            alert(`Confirmation error: ${errors.confirmation_text}`);
          } else if (errors.message) {
            alert(`Error: ${errors.message}`);
          } else if (errors.error) {
            alert(`Server error: ${errors.error}`);
          } else {
            // Generic error handling for validation errors
            const errorMessages = Object.values(errors).flat().filter(msg => typeof msg === 'string');
            if (errorMessages.length > 0) {
              alert(`Validation error: ${errorMessages.join(', ')}`);
            } else {
              alert('An unexpected error occurred while confirming delivery. Please check the console for details and try again.');
            }
          }
        } else if (typeof errors === 'string') {
          alert(`Error: ${errors}`);
        } else {
          alert('An unexpected error occurred while confirming delivery. Please check the console for details and try again.');
        }
        setIsSubmitting(false);
      },
      preserveScroll: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LogisticsHeader />
      <Head title={t('logistic.order_number', { id: currentOrder.id }) + ' ' + t('logistic.order_details')} />
      
      <div className="p-6 pt-25 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">{t('logistic.order_number', { id: currentOrder.id })}</h1>
              </div>
            </div>
            <Link href={route('logistic.orders.index')}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg shrink-0">
                <Truck className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('logistic.order_number', { id: currentOrder.id })}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('logistic.order_details_management')}</p>
              </div>
            </div>
            <Link href={route('logistic.orders.index')}>
              <Button variant="outline" className="flex items-center gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                {t('logistic.back_to_orders')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Order Information */}
          <Card>
            <CardHeader 
              className="md:cursor-default cursor-pointer"
              onClick={() => setIsOrderInfoExpanded(!isOrderInfoExpanded)}
            >
              <CardTitle className="text-foreground flex items-center justify-between">
                <span>{t('logistic.order_information')}</span>
                <span className="md:hidden">
                  {isOrderInfoExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`${isOrderInfoExpanded ? 'block' : 'hidden md:block'}`}>
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
                    <p className="text-sm text-accent">
                      {format(new Date(currentOrder.delivery_packed_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {currentOrder.delivered_time && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.delivered_at')}</p>
                    <p className="text-sm text-secondary">
                      {format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader 
              className="md:cursor-default cursor-pointer"
              onClick={() => setIsCustomerInfoExpanded(!isCustomerInfoExpanded)}
            >
              <CardTitle className="text-foreground flex items-center justify-between">
                <span>{t('logistic.customer_information')}</span>
                <span className="md:hidden">
                  {isCustomerInfoExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`${isCustomerInfoExpanded ? 'block' : 'hidden md:block'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.customer_name')}</p>
                  <p className="text-sm text-foreground">{currentOrder.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logistic.email')}</p>
                  <p className="text-sm text-foreground break-all">{displayEmail}</p>
                </div>
                {currentOrder.customer.contact_number && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.contact_number')}</p>
                    <p className="text-sm text-foreground">{currentOrder.customer.contact_number}</p>
                  </div>
                )}
                {currentOrder.delivery_address && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('logistic.delivery_address')}</p>
                    <p className="text-sm text-foreground">{currentOrder.delivery_address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Status Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              {currentOrder.delivery_status === 'delivered' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  {t('logistic.delivery_status_completed')}
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5 text-accent" />
                  {t('logistic.delivery_progress')}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progressive Status Line */}
            <div className="space-y-4">
              {/* Status Steps */}
              <div className="flex items-center justify-between px-1 sm:px-2 md:px-0">
                {/* Step 1: Pending */}
                <div className={`flex flex-col items-center min-w-[50px] sm:min-w-[60px] md:min-w-[60px] ${currentOrder.delivery_status === 'pending' ? 'text-accent' : currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentOrder.delivery_status === 'pending' ? 'bg-accent text-accent-foreground' : currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {currentOrder.delivery_status === 'pending' ? '1' : '✓'}
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-xs mt-1 text-center leading-tight">{t('logistic.preparing')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 md:mx-2 min-w-[15px] sm:min-w-[20px] md:min-w-[20px] ${currentOrder.delivery_status === 'ready_to_pickup' || currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-secondary' : 'bg-border'}`}></div>

                {/* Step 2: Ready to Pick Up */}
                <div className={`flex flex-col items-center min-w-[50px] sm:min-w-[60px] md:min-w-[60px] ${currentOrder.delivery_status === 'ready_to_pickup' ? 'text-secondary' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentOrder.delivery_status === 'ready_to_pickup' ? 'bg-secondary text-secondary-foreground' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {currentOrder.delivery_status === 'ready_to_pickup' ? '2' : currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? '✓' : '2'}
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-xs mt-1 text-center leading-tight">{t('logistic.ready')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 md:mx-2 min-w-[15px] sm:min-w-[20px] md:min-w-[20px] ${currentOrder.delivery_status === 'out_for_delivery' || currentOrder.delivery_status === 'delivered' ? 'bg-secondary' : 'bg-border'}`}></div>

                {/* Step 3: Out for Delivery */}
                <div className={`flex flex-col items-center min-w-[50px] sm:min-w-[60px] md:min-w-[60px] ${currentOrder.delivery_status === 'out_for_delivery' ? 'text-accent' : currentOrder.delivery_status === 'delivered' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentOrder.delivery_status === 'out_for_delivery' ? 'bg-accent text-accent-foreground' : currentOrder.delivery_status === 'delivered' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {currentOrder.delivery_status === 'out_for_delivery' ? '3' : currentOrder.delivery_status === 'delivered' ? '✓' : '3'}
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-xs mt-1 text-center leading-tight">{t('logistic.out_for_delivery')}</span>
                </div>

                {/* Connector Line */}
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 md:mx-2 min-w-[15px] sm:min-w-[20px] md:min-w-[20px] ${currentOrder.delivery_status === 'delivered' ? 'bg-secondary' : 'bg-border'}`}></div>

                {/* Step 4: Delivered */}
                <div className={`flex flex-col items-center min-w-[50px] sm:min-w-[60px] md:min-w-[60px] ${currentOrder.delivery_status === 'delivered' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentOrder.delivery_status === 'delivered' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {currentOrder.delivery_status === 'delivered' ? '✓' : '4'}
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-xs mt-1 text-center leading-tight">{t('logistic.delivered')}</span>
                </div>
              </div>

              {/* Current Status Message */}
              <div className="mt-4">
                {currentOrder.delivery_status === 'pending' && (
                  <p className="text-xs sm:text-sm md:text-sm text-[color-mix(in_srgb,var(--destructive)_70%,yellow_30%)] flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{t('logistic.order_pending_preparation')}</span>
                  </p>
                )}
                {currentOrder.delivery_status === 'ready_to_pickup' && (
                  <p className="text-xs sm:text-sm md:text-sm text-primary flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{t('logistic.order_ready_pickup')}</span>
                  </p>
                )}
                {currentOrder.delivery_status === 'out_for_delivery' && (
                  <p className="text-xs sm:text-sm md:text-sm text-accent flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{t('logistic.order_out_delivery')}</span>
                  </p>
                )}
                {currentOrder.delivery_status === 'delivered' && (
                  <p className="text-xs sm:text-sm md:text-sm text-secondary flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{t('logistic.order_delivered_completed')}</span>
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
                <div className="mt-4 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 border-2 border-secondary/30 rounded-xl shadow-sm">
                  {currentOrder.delivery_proof_image && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                        <p className="text-sm sm:text-base font-semibold text-foreground">{t('logistic.delivery_proof')}</p>
                      </div>
                      
                      {/* Centered Fixed-Size Image Container with Lightbox */}
                      <div className="flex justify-center">
                        <div 
                          className="relative group w-full max-w-md cursor-pointer"
                          onClick={() => setLightboxOpen(true)}
                        >
                          <div className="relative overflow-hidden rounded-lg border-2 border-secondary/20 shadow-md hover:shadow-lg transition-all duration-300 bg-muted/30">
                            <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center">
                              <img 
                                src={currentOrder.delivery_proof_image} 
                                alt="Delivery proof"
                                onError={(e) => { e.currentTarget.src = '/storage/fallback-photo.png'; }} 
                                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 rounded-full p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Click to view hint */}
                          <p className="text-xs text-center text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Click to view full size
                          </p>
                        </div>
                      </div>
                      
                      {/* Image Info */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="leading-tight">
                          Uploaded in {currentOrder.delivered_time && format(new Date(currentOrder.delivered_time), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
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
            <CardTitle className="text-lg lg:text-xl">{t('logistic.order_items')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Card Layout */}
            <div className="block md:hidden space-y-3">
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
                  
                  if (rawPrice === null || rawPrice === undefined) {
                    return null;
                  }
                  
                  const numPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
                  return isNaN(numPrice) ? null : numPrice;
                };

                const price = getPrice();
                const totalPrice = (price && typeof price === 'number') ? price * item.quantity : null;

                return (
                  <div key={`${item.product.name}-${item.category}-${index}`} className="border border-border rounded-lg p-4 bg-card">
                    <div className="space-y-3">
                      {/* Product Name */}
                      <div>
                        <h4 className="font-semibold text-foreground">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {item.category}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Unit Price</p>
                          <p className="text-sm font-medium text-foreground">
                            {price && typeof price === 'number' ? `₱${price.toFixed(2)}` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatQuantity(item.quantity, item.category)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Subtotal</p>
                          <p className="text-sm font-semibold text-foreground">
                            {totalPrice && typeof totalPrice === 'number' ? `₱${totalPrice.toFixed(2)}` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Total Card */}
              <div className="border-2 border-border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Total Amount:</p>
                  <p className="text-lg font-bold text-foreground">₱{currentOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-center py-3 px-8 text-sm font-semibold text-foreground">Product</th>
                    <th className="text-center py-3 px-8 text-sm font-semibold text-foreground">Category</th>
                    <th className="text-center py-3 px-8 text-sm font-semibold text-foreground">Unit Price</th>
                    <th className="text-center py-3 px-8 text-sm font-semibold text-foreground">Quantity</th>
                    <th className="text-center py-3 px-8 text-sm font-semibold text-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.audit_trail.map((item, index) => {
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
                      
                      if (rawPrice === null || rawPrice === undefined) {
                        return null;
                      }
                      
                      const numPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
                      return isNaN(numPrice) ? null : numPrice;
                    };

                    const price = getPrice();
                    const totalPrice = (price && typeof price === 'number') ? price * item.quantity : null;

                    return (
                      <tr key={`${item.product.name}-${item.category}-${index}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <div className="text-sm text-foreground font-medium text-left w-full max-w-[200px]">{item.product.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <div className="text-sm text-foreground capitalize text-left w-full max-w-[120px]">{item.category}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <div className="text-sm text-foreground text-right w-full max-w-[120px]">
                              {price && typeof price === 'number' ? `₱${price.toFixed(2)}` : '-'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <div className="text-sm text-foreground text-right font-medium w-full max-w-[120px]">
                              {formatQuantity(item.quantity, item.category)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <div className="text-sm text-foreground text-right font-semibold w-full max-w-[120px]">
                              {totalPrice && typeof totalPrice === 'number' ? `₱${totalPrice.toFixed(2)}` : '-'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td colSpan={4} className="py-3 px-4">
                      <div className="flex justify-end">
                        <div className="text-sm font-semibold text-foreground text-right">
                          Total Amount:
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <div className="text-base font-bold text-foreground text-right w-full max-w-[120px]">
                          ₱{currentOrder.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                        onError={(e) => { e.currentTarget.src = '/storage/fallback-photo.png'; }} 
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
                disabled={!deliveryImage || confirmationText.trim() !== 'I Confirm' || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted"
              >
                {isSubmitting ? t('logistic.confirming') : t('logistic.confirm_delivery_button')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Lightbox */}
        <ImageLightbox
          src={currentOrder.delivery_proof_image || ''}
          alt="Delivery Proof"
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    </div>
  );
} 