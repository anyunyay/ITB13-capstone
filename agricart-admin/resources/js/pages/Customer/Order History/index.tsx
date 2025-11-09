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
import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarIcon, Download, FileText, X, Package, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OrderReceivedConfirmationModal from '@/components/OrderReceivedConfirmationModal';
import StarRating from '@/components/StarRating';
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
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    delivered: number;
  };
}

export default function History({ orders, currentStatus, currentDeliveryStatus, counts }: HistoryProps) {
  const t = useTranslation();
  const page = usePage<{ notifications?: Array<any> }>();
  const notifications = page.props.notifications || [];
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportOpen, setReportOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<{ [key: number]: boolean }>({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedOrderForConfirmation, setSelectedOrderForConfirmation] = useState<{ id: number; total: number } | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        router.post('/customer/notifications/mark-read', {
          ids: notifications.map(n => n.id),
        }, { preserveScroll: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

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
    router.get('/customer/orders/history', Object.fromEntries(params));
  };

  const generateReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('start_date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('end_date', endDate.toISOString().split('T')[0]);
    }
    if (currentDeliveryStatus !== 'all') {
      params.append('delivery_status', currentDeliveryStatus);
    }
    params.append('format', format);
    
    window.open(`/customer/orders/report?${params.toString()}`, '_blank');
  };

  const handleCancelOrder = (orderId: number) => {
    router.post(`/customer/orders/${orderId}/cancel`, {}, {
      onSuccess: () => {
        setCancelDialogOpen(prev => ({ ...prev, [orderId]: false }));
      },
      onError: (errors) => {
        console.error('Cancellation failed:', errors);
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('ui.pending_approval')}</Badge>;
      case 'approved':
        return <Badge variant="default">{t('ui.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('ui.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive">{t('ui.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline">{t('ui.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('ui.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">{t('ui.ready_to_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default">{t('ui.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline">{t('ui.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppHeaderLayout>
      <main className="max-w-6xl mx-auto p-4 sm:p-6 mt-20">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">{t('ui.order_history')}</h2>
          <Popover open={reportOpen} onOpenChange={setReportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <section className="space-y-4">
                <p className="text-base md:text-xl lg:text-2xl font-semibold text-foreground">{t('ui.generate_order_report')}</p>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm md:text-base lg:text-lg text-foreground">{t('ui.start_date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="text-sm">{startDate ? format(startDate, "PPP") : t('ui.pick_a_date')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm md:text-base lg:text-lg text-foreground">{t('ui.end_date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="text-sm">{endDate ? format(endDate, "PPP") : t('ui.pick_a_date')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => generateReport('csv')} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">CSV</span>
                  </Button>
                  <Button 
                    onClick={() => generateReport('pdf')} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="text-xs">PDF</span>
                  </Button>
                </div>
              </section>
            </PopoverContent>
          </Popover>
        </header>

        {notifications.length > 0 && (
          <aside className="mb-4 space-y-2" role="alert" aria-live="polite">
            {notifications.map(n => (
              <article key={n.id} className={`p-3 rounded ${
                n.data?.delivery_status ? 
                  (n.data.delivery_status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground') :
                  (n.data?.status === 'approved' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground')
              }`}>
                <p className="text-sm md:base lg:text-lg">
                  <span className="font-semibold">Order #{n.data?.order_id}:</span> {n.message}
                  <time className="ml-2 text-xs opacity-80 float-right">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</time>
                </p>
                {n.data?.sub_message && (
                  <p className="text-sm md:text-base lg:text-base opacity-90 mt-1">{n.data.sub_message}</p>
                )}
              </article>
            ))}
          </aside>
        )}

        <Tabs value={currentDeliveryStatus} onValueChange={handleDeliveryStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto" role="tablist">
            <TabsTrigger value="all" className="text-sm md:text-base lg:text-base py-2 px-2">{t('ui.all')} ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="text-sm md:text-base lg:text-base py-2 px-2">{t('ui.pending')} ({counts.pending})</TabsTrigger>
            <TabsTrigger value="out_for_delivery" className="text-sm md:text-base lg:text-base py-2 px-2">{t('ui.out_for_delivery')} ({counts.approved})</TabsTrigger>
            <TabsTrigger value="delivered" className="text-sm md:text-base lg:text-base py-2 px-2">{t('ui.delivered')} ({counts.delivered})</TabsTrigger>
          </TabsList>

          <TabsContent value={currentDeliveryStatus} className="mt-2">
            {orders.length === 0 ? (
              <Card className="p-6 text-center bg-muted">
                <section className="flex flex-col items-center gap-2">
                  <Package className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                  <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">{t('ui.no_orders_found')}</p>
                  <p className="text-base md:text-xl lg:text-2xl text-muted-foreground">{t('ui.try_adjusting_filters_check_later')}</p>
                </section>
              </Card>
            ) : (
              <section className="space-y-4">
                {orders.map((order: Order) => (
                  <article key={order.id} id={`order-${order.id}`} className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                    <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base md:text-base lg:text-lg font-semibold text-card-foreground">Order ID:</span>
                          <span className="text-base md:text-base lg:text-lg font-bold text-primary">#{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <time className="text-sm md:text-sm lg:text-base text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</time>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </header>

                    {order.status === 'approved' && order.delivery_status && (
                      <section className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-base md:text-base lg:text-lg font-semibold mb-3 text-primary">{t('ui.delivery_status')}</span>
                        <nav className="flex items-center justify-between" aria-label="Delivery progress">
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'pending' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 1">
                              {(order.delivery_status || 'pending') === 'pending' ? '1' : '✓'}
                            </div>
                            <span className="ml-2 text-xs md:text-sm lg:text-sm font-medium">{t('ui.preparing')}</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 2">
                              {(order.delivery_status || 'pending') === 'ready_to_pickup' ? '2' : '✓'}
                            </div>
                            <span className="ml-2 text-xs md:text-sm lg:text-sm font-medium">{t('ui.ready')}</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'out_for_delivery' ? 'text-primary' : (order.delivery_status || 'pending') === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'out_for_delivery' || (order.delivery_status || 'pending') === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 3">
                              {(order.delivery_status || 'pending') === 'out_for_delivery' ? '3' : (order.delivery_status || 'pending') === 'delivered' ? '✓' : '3'}
                            </div>
                            <span className="ml-2 text-xs md:text-sm lg:text-sm font-medium">{t('ui.out_for_delivery')}</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} aria-label="Step 4">
                              {(order.delivery_status || 'pending') === 'delivered' ? '✓' : '4'}
                            </div>
                            <span className="ml-2 text-xs md:text-sm lg:text-sm font-medium">{t('ui.delivered')}</span>
                          </div>
                        </nav>
                      </section>
                    )}
                    
                    {order.admin_notes && (
                      <aside className="mb-4 p-3 bg-accent/10 border-l-4 border-accent rounded">
                        <h3 className="text-base md:text-base lg:text-lg font-semibold mb-1 text-accent-foreground">Approver Notes:</h3>
                        <p className="text-base md:text-base lg:text-lg text-foreground">{order.admin_notes}</p>
                      </aside>
                    )}

                    {order.status === 'delayed' && (
                      <aside className="mb-4 p-4 bg-destructive/10 border-l-4 border-destructive rounded" role="alert">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-base md:text-base lg:text-lg font-semibold mb-2 text-destructive">{t('ui.order_delayed')}</h3>
                            <p className="text-xs md:text-sm lg:text-sm text-foreground mb-2">
                              {t('ui.order_delay_message')}
                            </p>
                            <p className="text-xs md:text-sm lg:text-sm text-foreground">
                              If you have any concerns, please contact us at: <strong>sample@email.com</strong>
                            </p>
                          </div>
                          <Dialog 
                            open={cancelDialogOpen[order.id] || false} 
                            onOpenChange={(open) => setCancelDialogOpen(prev => ({ ...prev, [order.id]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                <X className="h-4 w-4 mr-1" />
                                <span className="text-sm">Cancel Order</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-base md:text-lg lg:text-xl">Cancel Order #{order.id}</DialogTitle>
                                <DialogDescription className="text-sm md:text-base lg:text-lg">
                                  Are you sure you want to cancel this delayed order? This action cannot be undone.
                                  <br /><br />
                                  <strong>Order ID:</strong> #{order.id} <br />
                                  <strong>Order Total:</strong> ₱{Number(order.total_amount).toFixed(2)}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setCancelDialogOpen(prev => ({ ...prev, [order.id]: false }))}
                                >
                                  <span className="text-sm">Keep Order</span>
                                </Button>
                                <Button
                                  onClick={() => handleCancelOrder(order.id)}
                                  variant="destructive"
                                >
                                  <span className="text-sm">Yes, Cancel Order</span>
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </aside>
                    )}

                    {order.logistic && (
                      <aside className="mb-4 p-3 bg-secondary/10 border-l-4 border-secondary rounded">
                        <h3 className="text-base md:text-base lg:text-lg font-semibold mb-1 text-primary">Delivery Information:</h3>
                        <p className="text-sm md:text-base lg:text-base text-card-foreground">
                          <span className="font-medium">Assigned to:</span> {order.logistic.name}
                          {order.logistic.contact_number && (
                            <span className="ml-2">({order.logistic.contact_number})</span>
                          )}
                        </p>
                      </aside>
                    )}

                    <section className="hidden md:block overflow-x-auto">
                      <Table className="w-full border border-border rounded-lg min-w-[800px]">
                        <TableHeader className="bg-muted">
                          <TableRow className="border-border">
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold min-w-[150px]">{t('ui.product_name')}</TableHead>
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold text-right min-w-[100px]">{t('ui.quantity')}</TableHead>
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold text-right min-w-[80px]">{t('ui.price')}</TableHead>
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold text-right min-w-[100px]">{t('ui.subtotal')}</TableHead>
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold text-right min-w-[120px]">{t('ui.delivery_fee')}</TableHead>
                            <TableHead className="text-sm md:text-base lg:text-base text-muted-foreground font-semibold text-right min-w-[100px]">{t('ui.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-card">
                          {order.audit_trail && order.audit_trail.length > 0 ? (
                            order.audit_trail.map((item: OrderItem) => (
                              <TableRow key={`${item.product.name}-${item.category}`} className="border-border hover:bg-muted/50">
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground text-right">{item.quantity} {item.category}</TableCell>
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground text-right">
                                  {item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : 'No price set'}
                                </TableCell>
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground text-right font-semibold">
                                  ₱{Number(item.subtotal || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground text-right">
                                  ₱{Number(item.coop_share || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm md:text-base lg:text-base text-card-foreground text-right font-bold text-primary">
                                  ₱{Number(item.total_amount || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="border-border">
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                <div className="flex flex-col items-center gap-2">
                                  <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                                  <span className="text-sm md:text-base lg:text-base">{t('ui.no_items_found')}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </section>

                    <section className="md:hidden space-y-3">
                      {order.audit_trail && order.audit_trail.length > 0 ? (
                        <>
                          {order.audit_trail.map((item: OrderItem) => (
                            <article key={`${item.product.name}-${item.category}`} className="p-4 bg-card border border-border rounded-lg">
                              <div className="space-y-2">
                                <header className="flex justify-between items-start">
                                  <h4 className="text-base md:text-xl lg:text-2xl font-semibold text-card-foreground">{item.product.name}</h4>
                                </header>
                                <dl className="grid grid-cols-2 gap-2">
                                  <div className="flex justify-between">
                                    <dt className="text-xs md:text-sm lg:text-sm text-muted-foreground">Quantity:</dt>
                                    <dd className="text-xs md:text-sm lg:text-sm font-medium text-foreground">{item.quantity} {item.category}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs md:text-sm lg:text-sm text-muted-foreground">Price:</dt>
                                    <dd className="text-xs md:text-sm lg:text-sm font-medium text-foreground">{item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : 'No price set'}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs md:text-sm lg:text-sm text-muted-foreground">Subtotal:</dt>
                                    <dd className="text-xs md:text-sm lg:text-sm font-semibold text-foreground">₱{Number(item.subtotal || 0).toFixed(2)}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-xs md:text-sm lg:text-sm text-muted-foreground">Delivery Fee:</dt>
                                    <dd className="text-xs md:text-sm lg:text-sm font-medium text-foreground">₱{Number(item.coop_share || 0).toFixed(2)}</dd>
                                  </div>
                                </dl>
                                <footer className="border-t border-border pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-base md:text-xl lg:text-2xl font-semibold text-card-foreground">Total:</span>
                                    <span className="text-base md:text-xl lg:text-2xl font-bold text-primary">₱{Number(item.total_amount || 0).toFixed(2)}</span>
                                  </div>
                                </footer>
                              </div>
                            </article>
                          ))}
                        </>
                      ) : (
                        <Card className="p-6 text-center bg-muted">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            <span className="text-sm md:text-base lg:text-base text-muted-foreground">{t('ui.no_items_found')}</span>
                          </div>
                        </Card>
                      )}
                    </section>

                    <footer className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-lg md:text-xl lg:text-2xl font-semibold text-card-foreground">Order Total:</span>
                        <span className="text-lg md:text-xl lg:text-2xl font-bold text-primary">₱{Number(order.total_amount).toFixed(2)}</span>
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
                          <span className="text-sm">Confirm Order Received</span>
                        </Button>
                      </section>
                    )}

                    {order.customer_confirmed_at && (
                      <aside className="mt-4 p-3 bg-primary/10 border-l-4 border-primary rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-primary">Order Confirmed</h3>
                          <p className="ml-auto text-right text-xs mt-2 text-muted-foreground">
                            Confirmed on {format(new Date(order.customer_confirmed_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        {order.customer_rate && (
                          <div className="mb-2">
                            <p className="text-sm md:text-base lg:text-base text-muted-foreground mb-1">Your Rating:</p>
                            <StarRating rating={order.customer_rate} onRatingChange={() => {}} interactive={false} showLabel={false} />
                            <p className="text-sm md:text-base lg:text-base text-center text-foreground">{order.customer_feedback}</p>
                          </div>
                        )}
                      </aside>
                    )}
                  </article>
                ))}
              </section>
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
      </main>
    </AppHeaderLayout>
  );
}
