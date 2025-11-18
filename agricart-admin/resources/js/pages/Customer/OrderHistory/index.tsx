import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarIcon, Download, FileText, X, Package, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OrderReceivedConfirmationModal from '@/components/customer/orders/OrderReceivedConfirmationModal';
import OrderReceiptPreview from '@/components/customer/orders/OrderReceiptPreview';
import StarRating from '@/components/customer/products/StarRating';
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
  unit_price?: number;
  subtotal?: number;
  coop_share?: number;
  total_amount?: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled' | 'delivered';
  delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered' | null;
  created_at: string;
  delivered_at?: string;
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: OrderItem[];
  source?: 'sales_audit' | 'sales';
  customer_received?: boolean;
  customer_rate?: number;
  customer_feedback?: string;
  customer_confirmed_at?: string;
}

interface HistoryProps {
  orders: Order[];
  currentStatus: string;
  currentDeliveryStatus: string;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    delivered: number;
  };
}

export default function History({ orders, currentStatus, currentDeliveryStatus, pagination, counts }: HistoryProps) {
  const t = useTranslation();
  const page = usePage<{ 
    notifications?: Array<any>;
    auth?: {
      user?: {
        name?: string;
        email?: string;
        contact_number?: string;
        address?: string;
        barangay?: string;
        city?: string;
        province?: string;
      };
    };
  }>();
  const allNotifications = page.props.notifications || [];
  
  // Show only unread notifications - they will be removed once marked as read
  const unreadNotifications = allNotifications.filter(n => !n.read_at);
  
  // Track the initial top 3 notification IDs to prevent refilling
  const [initialTop3Ids, setInitialTop3Ids] = useState<number[]>([]);
  
  // Initialize the top 3 IDs only once on mount
  useEffect(() => {
    if (initialTop3Ids.length === 0 && unreadNotifications.length > 0) {
      const top3Ids = unreadNotifications.slice(0, 3).map(n => n.id);
      setInitialTop3Ids(top3Ids);
    }
  }, []);
  
  // Only show notifications that are in the initial top 3 AND still unread
  const highlightedNotifications = unreadNotifications.filter(n => initialTop3Ids.includes(n.id));
  const remainingNotifications = unreadNotifications.slice(3);
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reportOpen, setReportOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<{ [key: number]: boolean }>({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedOrderForConfirmation, setSelectedOrderForConfirmation] = useState<{ id: number; total: number } | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  
  // Backend returns 5 items per page, display all of them
  const paginatedOrders = orders;

  // Calculate total pages based on actual total from backend
  const totalPages = pagination?.last_page || 1;
  const currentPage = pagination?.current_page || 1;
  
  // Check if we're on the last page
  // Disable Next if: on last page OR no more orders available
  const isLastPage = currentPage >= totalPages || orders.length < (pagination?.per_page || 5);

  // Close export modal smoothly when user starts scrolling
  useEffect(() => {
    if (!reportOpen) return;

    let rafId: number | null = null;
    let hasScrolled = false;

    const handleScroll = () => {
      // Only trigger once per scroll session
      if (hasScrolled) return;
      hasScrolled = true;

      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth visual updates
      rafId = requestAnimationFrame(() => {
        setReportOpen(false);
        rafId = null;
      });
    };

    // Listen to scroll events with passive for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [reportOpen]);

  // Mark all unread notifications as read when user navigates OUT of the page
  useEffect(() => {
    const unreadNotifications = allNotifications.filter(n => !n.read_at);
    
    // Cleanup function runs when component unmounts (user navigates away)
    return () => {
      if (unreadNotifications.length > 0) {
        // Use fetch with keepalive for reliable delivery during navigation
        fetch('/customer/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ ids: unreadNotifications.map(n => n.id) }),
          keepalive: true, // Ensures request completes even if page is closing
        }).catch(error => {
          console.error('Failed to mark notifications as read:', error);
        });
      }
    };
  }, [allNotifications]);



  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#order-')) {
      const orderId = hash.replace('#order-', '');
      const timer = setTimeout(() => {
        const orderElement = document.getElementById(`order-${orderId}`);
        if (orderElement) {
          const elementPosition = orderElement.offsetTop;
          const offsetPosition = elementPosition - 100;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          orderElement.style.transition = 'box-shadow 0.3s ease';
          orderElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            orderElement.style.boxShadow = '';
          }, 2000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [orders]);

  const handleDeliveryStatusFilter = (deliveryStatus: string) => {
    const params = new URLSearchParams();
    if (deliveryStatus !== 'all') {
      params.append('delivery_status', deliveryStatus);
    }
    params.append('page', '1');
    router.get('/customer/orders/history', Object.fromEntries(params), {
      preserveScroll: true,
      preserveState: true,
      only: ['orders', 'counts', 'pagination', 'currentDeliveryStatus'], // Only fetch necessary data
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (currentDeliveryStatus !== 'all') {
      params.append('delivery_status', currentDeliveryStatus);
    }
    params.append('page', newPage.toString());
    
    router.get('/customer/orders/history', Object.fromEntries(params), {
      preserveScroll: true,
      preserveState: true,
      only: ['orders', 'pagination'], // Only fetch orders and pagination data
      onSuccess: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const generateReport = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('start_date', format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      params.append('end_date', format(endDate, 'yyyy-MM-dd'));
    }
    if (currentDeliveryStatus !== 'all') {
      params.append('delivery_status', currentDeliveryStatus);
    }
    params.append('format', 'pdf');
    
    // Directly download the PDF file
    window.location.href = `/customer/orders/report?${params.toString()}`;
    
    // Close the popover after initiating download
    setReportOpen(false);
  };

  const handleCancelOrder = (orderId: number) => {
    router.post(`/customer/orders/${orderId}/cancel`, {}, {
      preserveState: true,
      only: ['orders', 'counts', 'notifications'], // Only refresh necessary data
      onSuccess: () => {
        setCancelDialogOpen(prev => ({ ...prev, [orderId]: false }));
      },
      onError: (errors) => {
        console.error('Cancellation failed:', errors);
      }
    });
  };

  const handleDismissNotification = (notificationId: number) => {
    // Mark notification as read when user clicks X button
    router.post('/customer/notifications/mark-read', {
      ids: [notificationId],
    }, {
      preserveScroll: true,
      preserveState: true,
      only: ['notifications'], // Only refresh notifications to remove the dismissed one
    });
  };

  const handleOpenConfirmationModal = (orderId: number, orderTotal: number) => {
    setSelectedOrderForConfirmation({ id: orderId, total: orderTotal });
    setConfirmationModalOpen(prev => ({ ...prev, [orderId]: true }));
  };

  const handleCloseConfirmationModal = (orderId: number) => {
    setConfirmationModalOpen(prev => ({ ...prev, [orderId]: false }));
    setSelectedOrderForConfirmation(null);
  };

  const handleOpenReceiptModal = (order: Order) => {
    setSelectedOrderForReceipt(order);
    setReceiptModalOpen(prev => ({ ...prev, [order.id]: true }));
  };

  const handleCloseReceiptModal = (orderId: number) => {
    setReceiptModalOpen(prev => ({ ...prev, [orderId]: false }));
    setSelectedOrderForReceipt(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.pending_approval')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('ui.cancelled')}</Badge>;
        return <Badge variant="outline" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.cancelled')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{t('customer.delivered')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">{status}</Badge>;
    }
  };

  return (
    <AppHeaderLayout>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 mt-20 mb-8 sm:mb-12 md:mb-16 lg:mb-16 overflow-x-hidden">
        <header className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary p-2 truncate">{t('customer.order_history')}</h2>
          <Popover open={reportOpen} onOpenChange={setReportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 sm:gap-2 shrink-0 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-sm sm:text-base md:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 mt-2" align="end" side="bottom" sideOffset={8} alignOffset={0} avoidCollisions={true} collisionPadding={20}>
              <section className="space-y-4 sm:space-y-5">
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-2">{t('customer.export_order_report')}</p>
                  <p className="text-sm sm:text-base text-muted-foreground">{t('customer.select_date_range_optional')}</p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="start-date" className="text-sm sm:text-base text-foreground">{t('customer.start_date')} (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary py-5 sm:py-6"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">{startDate ? format(startDate, "MMM dd, yyyy") : t('customer.last_month_default')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="end-date" className="text-sm sm:text-base text-foreground">{t('customer.end_date')} (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground hover:bg-muted/50 focus:border-primary py-5 sm:py-6"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">{endDate ? format(endDate, "MMM dd, yyyy") : t('customer.today_default')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() ||
                          date < new Date("1900-01-01") ||
                          (startDate ? date < startDate : false)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t('customer.no_dates_selected_info')}
                  </p>
                </div>
                <Button 
                  onClick={generateReport} 
                  variant="default" 
                  size="default"
                  className="w-full py-5 sm:py-6 text-sm sm:text-base md:text-lg"
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>{t('customer.export_pdf_report')}</span>
                </Button>
              </section>
            </PopoverContent>
          </Popover>
        </header>

        {/* Highlighted Section: Top 3 Most Recent Notifications */}
        {highlightedNotifications.length > 0 && (
          <aside className="mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-4" role="alert" aria-live="polite">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground">{t('customer.recent_updates')}</h3>
              {remainingNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.visit('/customer/notifications')}
                  className="text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5"
                >
                  {t('customer.show_all')} ({unreadNotifications.length})
                </Button>
              )}
            </div>
            {highlightedNotifications.map(n => (
              <article key={n.id} className={`relative p-3 sm:p-4 md:p-5 pr-10 sm:pr-12 rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
                n.data?.delivery_status ? 
                  (n.data.delivery_status === 'delivered' ? 'bg-primary text-primary-foreground border-primary' : 'bg-accent text-accent-foreground border-accent') :
                  (n.data?.status === 'approved' ? 'bg-primary text-primary-foreground border-primary' : 'bg-destructive text-destructive-foreground border-destructive')
              }`}>
                <button
                  onClick={() => handleDismissNotification(n.id)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded hover:bg-black/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl break-words font-medium pr-2 leading-relaxed">
                  <span className="font-bold">Order #{n.data?.order_id}:</span> {n.message}
                </p>
                {n.data?.sub_message && (
                  <p className="text-xs sm:text-sm md:text-base opacity-90 mt-2 break-words pr-2 leading-relaxed">{n.data.sub_message}</p>
                )}
                <time className="block text-xs sm:text-sm opacity-80 mt-2 sm:mt-3">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</time>
              </article>
            ))}
          </aside>
        )}

        <Tabs value={currentDeliveryStatus} onValueChange={handleDeliveryStatusFilter} className="w-full">
          <div className="flex justify-center mb-2 sm:mb-2 lg:mb-2 overflow-x-auto">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto w-full max-w-full min-w-0" role="tablist">
              <TabsTrigger value="all" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{t('customer.all')} ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{t('customer.pending')} ({counts.pending})</TabsTrigger>
              <TabsTrigger value="out_for_delivery" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{t('customer.out_for_delivery')} ({counts.approved})</TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{t('customer.delivered')} ({counts.delivered})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={currentDeliveryStatus} className="mt-0">
            {orders.length === 0 ? (
              <Card className="p-6 sm:p-8 md:p-10 lg:p-12 text-center bg-muted rounded-2xl">
                <section className="flex flex-col items-center gap-3 sm:gap-4">
                  <Package className="h-12 sm:h-16 md:h-20 w-12 sm:w-16 md:w-20 text-muted-foreground" aria-hidden="true" />
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground">{t('customer.no_orders_found')}</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">{t('customer.try_adjusting_filters_check_later')}</p>
                </section>
              </Card>
            ) : (
              <>
                <section className="space-y-4 sm:space-y-5 md:space-y-6">
                  {paginatedOrders.map((order: Order) => (
                  <article key={order.id} id={`order-${order.id}`} className="p-4 sm:p-5 md:p-6 lg:p-8 bg-card border border-border rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative mb-3 sm:mb-4 md:mb-5">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-card-foreground">{t('customer.order_id_label')}</span>
                            <span className="text-sm font-bold text-primary">#{order.id}</span>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                            <time className="text-xs text-muted-foreground truncate">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</time>
                          </div>
                          <Button
                            onClick={() => handleOpenReceiptModal(order)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 shrink-0"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="text-xs">{t('customer.view_receipt')}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base md:text-lg lg:text-xl font-semibold text-card-foreground">{t('customer.order_id_label')}</span>
                            <span className="text-base md:text-lg lg:text-xl font-bold text-primary">#{order.id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                            <time className="text-sm md:text-base text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</time>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Button
                            onClick={() => handleOpenReceiptModal(order)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{t('customer.view_receipt')}</span>
                          </Button>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>

                    {order.status === 'approved' && order.delivery_status && (
                      <section className="mb-2 sm:mb-3 p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20 overflow-x-auto">
                        <span className="block text-xs sm:text-sm font-semibold mb-2 text-primary">{t('customer.delivery_status')}</span>
                        <nav className="flex items-center justify-between gap-1 min-w-max" aria-label="Delivery progress">
                          <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${(order.delivery_status || 'pending') === 'pending' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${(order.delivery_status || 'pending') === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 1">
                              {(order.delivery_status || 'pending') === 'pending' ? '1' : '✓'}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-center">{t('customer.preparing')}</span>
                          </div>
                          <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 2">
                              {(order.delivery_status || 'pending') === 'ready_to_pickup' ? '2' : '✓'}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-center">{t('customer.ready')}</span>
                          </div>
                          <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${(order.delivery_status || 'pending') === 'out_for_delivery' ? 'text-primary' : (order.delivery_status || 'pending') === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${(order.delivery_status || 'pending') === 'out_for_delivery' || (order.delivery_status || 'pending') === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 3">
                              {(order.delivery_status || 'pending') === 'out_for_delivery' ? '3' : (order.delivery_status || 'pending') === 'delivered' ? '✓' : '3'}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight">{t('customer.out_for_delivery')}</span>
                          </div>
                          <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${(order.delivery_status || 'pending') === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${(order.delivery_status || 'pending') === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 4">
                              {(order.delivery_status || 'pending') === 'delivered' ? '✓' : '4'}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-center">{t('customer.delivered')}</span>
                          </div>
                        </nav>
                      </section>
                    )}
                    
                    {order.admin_notes && (
                      <aside className="mb-2 sm:mb-3 p-2 bg-accent/10 border-l-4 border-accent rounded overflow-hidden">
                        <h3 className="text-xs sm:text-sm font-semibold mb-1 text-primary">{t('customer.approver_notes_label')}</h3>
                        <p className="text-xs sm:text-sm text-foreground break-words">{order.admin_notes}</p>
                      </aside>
                    )}

                    {order.status === 'delayed' && (
                      <aside className="mb-3 sm:mb-4 p-2 sm:p-3 bg-destructive/10 border-l-4 border-destructive rounded" role="alert">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-destructive">{t('customer.order_delayed')}</h3>
                            <p className="text-xs sm:text-sm text-foreground mb-1 sm:mb-2">
                              {t('customer.order_delay_message')}
                            </p>
                            <p className="text-xs sm:text-sm text-foreground">
                              {t('customer.if_you_have_concerns')} <strong>sample@email.com</strong>
                            </p>
                          </div>
                          <Dialog 
                            open={cancelDialogOpen[order.id] || false} 
                            onOpenChange={(open) => setCancelDialogOpen(prev => ({ ...prev, [order.id]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                <X className="h-4 w-4 mr-1" />
                                <span className="text-sm">{t('customer.cancel_order')}</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-sm sm:text-base">{t('customer.cancel_order')} #{order.id}</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  {t('customer.cancel_order_confirmation_message')}
                                  <br /><br />
                                  <strong>{t('customer.order_id_label')}</strong> #{order.id} <br />
                                  <strong>{t('customer.order_total_label')}</strong> ₱{Number(order.total_amount).toFixed(2)}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setCancelDialogOpen(prev => ({ ...prev, [order.id]: false }))}
                                >
                                  <span className="text-sm">{t('customer.keep_order')}</span>
                                </Button>
                                <Button
                                  onClick={() => handleCancelOrder(order.id)}
                                  variant="destructive"
                                >
                                  <span className="text-sm">{t('customer.yes_cancel_order')}</span>
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </aside>
                    )}

                    {order.logistic && (
                      <aside className="mb-2 sm:mb-3 p-2 bg-secondary/10 border-l-4 border-secondary rounded overflow-hidden">
                        <h3 className="text-xs sm:text-sm font-semibold mb-1 text-primary">{t('customer.delivery_information')}</h3>
                        <p className="text-xs sm:text-sm text-card-foreground break-words">
                          <span className="font-medium">{t('customer.assigned_to')}</span> {order.logistic.name}
                          {order.logistic.contact_number && (
                            <span className="ml-1 sm:ml-2">({order.logistic.contact_number})</span>
                          )}
                        </p>
                      </aside>
                    )}

                    <section className="hidden md:block overflow-x-auto">
                      <Table className="w-full border border-border rounded-lg min-w-[700px]">
                        <TableHeader className="bg-muted">
                          <TableRow className="border-border">
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold min-w-[120px]">{t('customer.product_name')}</TableHead>
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold text-right min-w-[80px]">{t('customer.quantity')}</TableHead>
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold text-right min-w-[70px]">{t('customer.price')}</TableHead>
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold text-right min-w-[80px]">{t('customer.subtotal')}</TableHead>
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold text-right min-w-[90px]">{t('customer.delivery_fee')}</TableHead>
                            <TableHead className="text-xs sm:text-sm text-muted-foreground font-semibold text-right min-w-[80px]">{t('customer.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-card">
                          {order.audit_trail && order.audit_trail.length > 0 ? (
                            order.audit_trail.map((item: OrderItem) => (
                              <TableRow key={`${item.product.name}-${item.category}`} className="border-border hover:bg-muted/50">
                                <TableCell className="text-xs sm:text-sm text-card-foreground font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-xs sm:text-sm text-card-foreground text-right">{item.quantity} {item.category}</TableCell>
                                <TableCell className="text-xs sm:text-sm text-card-foreground text-right">
                                  {item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : t('customer.no_price_set')}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm text-card-foreground text-right font-semibold">
                                  ₱{Number(item.subtotal || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm text-card-foreground text-right">
                                  ₱{Number(item.coop_share || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm text-card-foreground text-right font-bold text-primary">
                                  ₱{Number(item.total_amount || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="border-border">
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                <div className="flex flex-col items-center gap-2">
                                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" aria-hidden="true" />
                                  <span className="text-xs sm:text-sm">{t('customer.no_items_found')}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </section>

                    <section className="md:hidden space-y-3 sm:space-y-4">
                      {order.audit_trail && order.audit_trail.length > 0 ? (
                        <>
                          {order.audit_trail.map((item: OrderItem) => (
                            <article key={`${item.product.name}-${item.category}`} className="p-3 sm:p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow duration-200">
                              <div className="space-y-2 sm:space-y-3">
                                <header className="flex justify-between items-start">
                                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-card-foreground">{item.product.name}</h4>
                                </header>
                                <dl className="grid grid-cols-2 gap-2 sm:gap-3">
                                  <div className="flex justify-between">
                                    <dt className="text-xs sm:text-sm md:text-base text-muted-foreground">{t('customer.quantity_label')}</dt>
                                    <dd className="text-xs sm:text-sm md:text-base font-medium text-foreground">{item.quantity} {item.category}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs sm:text-sm md:text-base text-muted-foreground">{t('customer.price_label')}</dt>
                                    <dd className="text-xs sm:text-sm md:text-base font-medium text-foreground">{item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : t('customer.no_price_set')}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs sm:text-sm md:text-base text-muted-foreground">{t('customer.subtotal_label')}</dt>
                                    <dd className="text-xs sm:text-sm md:text-base font-semibold text-foreground">₱{Number(item.subtotal || 0).toFixed(2)}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs sm:text-sm md:text-base text-muted-foreground">{t('customer.delivery_fee_label')}</dt>
                                    <dd className="text-xs sm:text-sm md:text-base font-medium text-foreground">₱{Number(item.coop_share || 0).toFixed(2)}</dd>
                                  </div>
                                </dl>
                                <footer className="border-t border-border pt-2 sm:pt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base md:text-lg font-semibold text-card-foreground">{t('customer.total_label')}</span>
                                    <span className="text-sm sm:text-base md:text-lg font-bold text-primary">₱{Number(item.total_amount || 0).toFixed(2)}</span>
                                  </div>
                                </footer>
                              </div>
                            </article>
                          ))}
                        </>
                      ) : (
                        <Card className="p-6 sm:p-8 text-center bg-muted rounded-lg">
                          <div className="flex flex-col items-center gap-3">
                            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" aria-hidden="true" />
                            <span className="text-sm sm:text-base md:text-lg text-muted-foreground">{t('customer.no_items_found')}</span>
                          </div>
                        </Card>
                      )}
                    </section>

                    <footer className="mt-3 sm:mt-4 md:mt-5 pt-3 sm:pt-4 md:pt-5 border-t border-border">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-card-foreground">{t('customer.order_total_label')}</span>
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary">₱{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </footer>

                    {order.status === 'delivered' && !order.customer_received && (
                      <section className="mt-4">
                        <Button
                          onClick={() => handleOpenConfirmationModal(order.id, order.total_amount)}
                          className="w-full"
                          variant="default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">{t('customer.confirm_order_received')}</span>
                        </Button>
                      </section>
                    )}

                    {order.customer_confirmed_at && (
                      <aside className="mt-3 sm:mt-4 p-2 sm:p-3 bg-primary/10 border-l-4 border-primary rounded">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
                            <h3 className="text-sm sm:text-base font-semibold text-primary">{t('customer.order_confirmed')}</h3>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground sm:ml-auto">
                            {t('customer.confirmed_on')} {format(new Date(order.customer_confirmed_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        {order.customer_rate && (
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('customer.your_rating')}</p>
                            <StarRating rating={order.customer_rate} onRatingChange={() => {}} interactive={false} showLabel={false} />
                            <p className="text-xs sm:text-sm text-center text-foreground mt-1">{order.customer_feedback}</p>
                          </div>
                        )}
                      </aside>
                    )}
                  </article>
                ))}
              </section>

              {/* Pagination Controls */}
              {(totalPages > 1 || currentPage > 1) && (
                <nav className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 border-t border-border" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{t('customer.previous') || 'Previous'}</span>
                  </Button>
                  <div className="text-sm sm:text-base md:text-lg text-muted-foreground px-2 sm:px-3">
                    {t('customer.page')} {currentPage} {t('customer.of')} {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">{t('customer.next') || 'Next'}</span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

        {selectedOrderForConfirmation && (
          <OrderReceivedConfirmationModal
            isOpen={confirmationModalOpen[selectedOrderForConfirmation.id] || false}
            onClose={() => handleCloseConfirmationModal(selectedOrderForConfirmation.id)}
            orderId={selectedOrderForConfirmation.id}
            orderTotal={selectedOrderForConfirmation.total}
          />
        )}

        {/* Receipt Preview Modal */}
        {selectedOrderForReceipt && (
          <Dialog 
            open={receiptModalOpen[selectedOrderForReceipt.id] || false} 
            onOpenChange={(open) => {
              if (!open) handleCloseReceiptModal(selectedOrderForReceipt.id);
            }}
          >
            <DialogContent className="max-w-2xl w-[96vw] h-auto max-h-[96vh] sm:w-[85vw] sm:max-h-[90vh] p-0 gap-0">
              <DialogHeader className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-white sticky top-0 z-10 shrink-0">
                <DialogTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      onClick={() => handleCloseReceiptModal(selectedOrderForReceipt.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <span className="truncate text-xs sm:text-sm md:text-base">📄 {t('customer.receipt_preview')} - #{selectedOrderForReceipt.id}</span>
                  </div>
                  <Button
                    onClick={() => window.print()}
                    variant="default"
                    size="sm"
                    className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap h-7 sm:h-8 shrink-0"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t('customer.print')}
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                <div className="p-2 sm:p-4 md:p-6">
                  <OrderReceiptPreview 
                    order={{
                      ...selectedOrderForReceipt,
                      updated_at: selectedOrderForReceipt.delivered_at || selectedOrderForReceipt.created_at,
                      customer: {
                        name: page.props.auth?.user?.name || '',
                        email: page.props.auth?.user?.email || '',
                        contact_number: page.props.auth?.user?.contact_number,
                        address: page.props.auth?.user?.address,
                        barangay: page.props.auth?.user?.barangay,
                        city: page.props.auth?.user?.city,
                        province: page.props.auth?.user?.province,
                      }
                    }} 
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </AppHeaderLayout>
  );
}

