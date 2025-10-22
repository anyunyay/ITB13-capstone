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
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | null;
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
  const page = usePage<{ notifications?: Array<any> }>();
  const notifications = page.props.notifications || [];
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportOpen, setReportOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<{ [key: number]: boolean }>({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedOrderForConfirmation, setSelectedOrderForConfirmation] = useState<{ id: number; total: number } | null>(null);

  // Note: Backend now provides aggregated quantities and calculated values, so no need for client-side aggregation

  useEffect(() => {
    if (notifications.length > 0) {
      // Mark notifications as read after a delay to ensure they're visible
      const timer = setTimeout(() => {
        router.post('/customer/notifications/mark-read', {
          ids: notifications.map(n => n.id),
        }, { preserveScroll: true });
      }, 2000); // Wait 2 seconds before marking as read

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Handle hash navigation to scroll to specific order
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#order-')) {
      const orderId = hash.replace('#order-', '');
      const timer = setTimeout(() => {
        const orderElement = document.getElementById(`order-${orderId}`);
        if (orderElement) {
          // Calculate position with offset for better spacing
          const elementPosition = orderElement.offsetTop;
          const offsetPosition = elementPosition - 100; // 100px from top
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Add a subtle highlight effect
          orderElement.style.transition = 'box-shadow 0.3s ease';
          orderElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            orderElement.style.boxShadow = '';
          }, 2000);
        }
      }, 500); // Wait for page to fully load

      return () => clearTimeout(timer);
    }
  }, [orders]); // Re-run when orders change

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
        // Close the dialog
        setCancelDialogOpen(prev => ({ ...prev, [orderId]: false }));
        // The page will refresh automatically due to Inertia
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
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'delayed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">Ready to Pick Up</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-secondary';
      case 'ready_to_pickup':
        return 'text-primary';
      case 'out_for_delivery':
        return 'text-primary';
      case 'delivered':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };


  return (
    <AppHeaderLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Order History</h1>
          <Popover open={reportOpen} onOpenChange={setReportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <FileText className="h-4 w-4" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h3 className="font-semibold">Generate Order Report</h3>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
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
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
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
                    CSV
                  </Button>
                  <Button 
                    onClick={() => generateReport('pdf')} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>


        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded text-white ${
                n.data?.delivery_status ? 
                  (n.data.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-blue-600') :
                  (n.data?.status === 'approved' ? 'bg-green-600' : 'bg-red-600')
              }`}>
                <span className="font-semibold">Order #{n.data?.order_id}:</span> {n.message}
                {n.data?.sub_message && (
                  <div className="text-sm opacity-90 mt-1">{n.data.sub_message}</div>
                )}
                <span className="ml-2 text-xs opacity-80">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            ))}
          </div>
        )}

        <Tabs value={currentDeliveryStatus} onValueChange={handleDeliveryStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2 px-2">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm py-2 px-2">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="out_for_delivery" className="text-xs sm:text-sm py-2 px-2">Out for Delivery ({counts.approved})</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs sm:text-sm py-2 px-2">Delivered ({counts.delivered})</TabsTrigger>
          </TabsList>

          <TabsContent value={currentDeliveryStatus} className="mt-6">
            {orders.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order.id} id={`order-${order.id}`} className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">Order ID:</span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">#{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Delivery Status Tracker */}
                    {order.status === 'approved' && order.delivery_status && (
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h5 className="font-semibold text-sm mb-3 text-blue-800 dark:text-blue-200">Delivery Status</h5>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'pending' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                              {(order.delivery_status || 'pending') === 'pending' ? '1' : '✓'}
                            </div>
                            <span className="ml-2 text-sm font-medium">Preparing</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'ready_to_pickup' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                              {(order.delivery_status || 'pending') === 'ready_to_pickup' ? '2' : '✓'}
                            </div>
                            <span className="ml-2 text-sm font-medium">Ready</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'out_for_delivery' ? 'text-blue-600 dark:text-blue-400' : (order.delivery_status || 'pending') === 'delivered' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'out_for_delivery' || (order.delivery_status || 'pending') === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                              {(order.delivery_status || 'pending') === 'out_for_delivery' ? '3' : (order.delivery_status || 'pending') === 'delivered' ? '✓' : '3'}
                            </div>
                            <span className="ml-2 text-sm font-medium">Out for Delivery</span>
                          </div>
                          <div className={`flex items-center ${(order.delivery_status || 'pending') === 'delivered' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                              {(order.delivery_status || 'pending') === 'delivered' ? '✓' : '4'}
                            </div>
                            <span className="ml-2 text-sm font-medium">Delivered</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          {getDeliveryStatusBadge(order.delivery_status || 'pending')}
                        </div>
                      </div>
                    )}
                    
                    {order.admin_notes && (
                      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded">
                        <h5 className="font-semibold text-sm mb-1 text-amber-800 dark:text-amber-200">Admin Notes:</h5>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{order.admin_notes}</p>
                      </div>
                    )}

                    {/* Delayed Order Notice and Cancellation Button */}
                    {order.status === 'delayed' && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm mb-2 text-red-800 dark:text-red-200">Order Delayed</h5>
                            <p className="text-sm text-red-900 dark:text-red-100 mb-2">
                              Your order has exceeded the standard 24-hour approval time. We apologize for the delay.
                            </p>
                            <p className="text-sm text-red-900 dark:text-red-100">
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
                                Cancel Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Order #{order.id}</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel this delayed order? This action cannot be undone.
                                  <br /><br />
                                  <strong>Order Total:</strong> ₱{Number(order.total_amount).toFixed(2)}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setCancelDialogOpen(prev => ({ ...prev, [order.id]: false }))}
                                >
                                  Keep Order
                                </Button>
                                <Button
                                  onClick={() => handleCancelOrder(order.id)}
                                  variant="destructive"
                                >
                                  Yes, Cancel Order
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}

                    {order.logistic && (
                      <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-400 dark:border-teal-500 rounded">
                        <h5 className="font-semibold text-sm mb-1 text-teal-800 dark:text-teal-200">Delivery Information:</h5>
                        <p className="text-sm text-teal-900 dark:text-teal-100">
                          <span className="font-medium">Assigned to:</span> {order.logistic.name}
                          {order.logistic.contact_number && (
                            <span className="ml-2">({order.logistic.contact_number})</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg min-w-[800px]">
                        <TableHeader className="bg-gray-50 dark:bg-gray-700">
                          <TableRow className="border-gray-200 dark:border-gray-600">
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold min-w-[150px]">Product Name</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-right min-w-[100px]">Quantity</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-right min-w-[80px]">Price</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-right min-w-[100px]">Subtotal</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-right min-w-[120px]">Delivery Fee</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-right min-w-[100px]">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white dark:bg-gray-800">
                          {order.audit_trail && order.audit_trail.length > 0 ? (
                            order.audit_trail.map((item: OrderItem) => (
                              <TableRow key={`${item.product.name}-${item.category}`} className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <TableCell className="text-gray-900 dark:text-gray-100 font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-gray-900 dark:text-gray-100 text-right">{item.quantity} {item.category}</TableCell>
                                <TableCell className="text-gray-900 dark:text-gray-100 text-right">
                                  {item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : 'No price set'}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-gray-100 text-right font-semibold">
                                  ₱{Number(item.subtotal || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-gray-100 text-right">
                                  ₱{Number(item.coop_share || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-gray-100 text-right font-bold text-green-600 dark:text-green-400">
                                  ₱{Number(item.total_amount || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="border-gray-200 dark:border-gray-600">
                              <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                <div className="flex flex-col items-center gap-2">
                                  <Package className="h-8 w-8 text-gray-400" />
                                  <span>No items found</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {order.audit_trail && order.audit_trail.length > 0 ? (
                        <>
                          {order.audit_trail.map((item: OrderItem) => (
                            <Card key={`${item.product.name}-${item.category}`} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.product.name}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                    <span className="font-medium">{item.quantity} {item.category}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="font-medium">{item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : 'No price set'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                    <span className="font-semibold">₱{Number(item.subtotal || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                                    <span className="font-medium">₱{Number(item.coop_share || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">₱{Number(item.total_amount || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      ) : (
                        <Card className="p-6 text-center text-muted-foreground bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-gray-400" />
                            <span>No items found</span>
                          </div>
                        </Card>
                      )}
                    </div>

                    {/* Order Received Confirmation Section */}
                    {order.source === 'sales' && order.delivery_status === 'delivered' && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 rounded">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-200">
                              {order.customer_received ? 'Order Confirmed Received' : 'Confirm Order Received'}
                            </h5>
                            {order.customer_received ? (
                              <div className="space-y-3">
                                <p className="text-sm text-green-900 dark:text-green-100">
                                  ✓ You have confirmed receiving this order.
                                </p>
                                {order.customer_confirmed_at && (
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    Confirmed on: {format(new Date(order.customer_confirmed_at), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                )}
                                {order.customer_rate && (
                                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Your Rating:</p>
                                    <StarRating
                                      rating={order.customer_rate}
                                      onRatingChange={() => {}} // Read-only
                                      maxRating={5}
                                      size="sm"
                                      interactive={false}
                                      showLabel={true}
                                    />
                                  </div>
                                )}
                                {order.customer_feedback && (
                                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Your Feedback:</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{order.customer_feedback}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-green-900 dark:text-green-100 mb-2">
                                  Please confirm that you have received your order. You can optionally provide feedback about your experience.
                                </p>
                                {order.delivered_at && (
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    Delivered on: {format(new Date(order.delivered_at), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          {!order.customer_received && (
                            <Button
                              onClick={() => handleOpenConfirmationModal(order.id, order.total_amount)}
                              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Received
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Order Received Confirmation Modal */}
        {selectedOrderForConfirmation && (
          <OrderReceivedConfirmationModal
            isOpen={confirmationModalOpen[selectedOrderForConfirmation.id] || false}
            onClose={() => handleCloseConfirmationModal(selectedOrderForConfirmation.id)}
            orderId={selectedOrderForConfirmation.id}
            orderTotal={selectedOrderForConfirmation.total}
          />
        )}
      </div>
    </AppHeaderLayout>
  );
}
