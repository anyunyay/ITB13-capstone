import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
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
import { CalendarIcon, Download, FileText } from 'lucide-react';

interface OrderItem {
  id: number;
  product: {
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | null;
  created_at: string;
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: OrderItem[];
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
  const page = usePage<{ customerNotifications?: Array<any> }>();
  const notifications = page.props.customerNotifications || [];
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportOpen, setReportOpen] = useState(false);

  // Helper function to combine quantities for the same items
  const combineOrderItems = (auditTrail: OrderItem[]) => {
    const combinedItems = new Map<string, OrderItem>();
    
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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
      default:
        return 'text-gray-600';
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

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'out_for_delivery':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AppHeaderLayout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <Popover open={reportOpen} onOpenChange={setReportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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
                n.delivery_status ? 
                  (n.delivery_status === 'delivered' ? 'bg-green-600' : 'bg-blue-600') :
                  (n.status === 'approved' ? 'bg-green-600' : 'bg-red-600')
              }`}>
                <span className="font-semibold">Order #{n.order_id}:</span> {n.message}
                <span className="ml-2 text-xs opacity-80">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            ))}
          </div>
        )}

        <Tabs value={currentDeliveryStatus} onValueChange={handleDeliveryStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="out_for_delivery">Out for Delivery ({counts.approved})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          </TabsList>

          <TabsContent value={currentDeliveryStatus} className="mt-6">
            {orders.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No orders found.</Card>
            ) : (
              orders.map((order: Order) => (
                <Card key={order.id} className="mb-6 p-4">
                  <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="font-medium">Order ID:</span> #{order.id}<br />
                      <span className="font-medium">Date:</span> {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <div className="text-lg font-semibold text-primary">
                        Total: ₱{Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status Tracker */}
                  {order.status === 'approved' && order.delivery_status && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-sm mb-3 text-gray-700">Delivery Status</h5>
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center ${(order.delivery_status || 'pending') === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            {(order.delivery_status || 'pending') === 'pending' ? '1' : '✓'}
                          </div>
                          <span className="ml-2 text-sm font-medium">Preparing</span>
                        </div>
                        <div className={`flex items-center ${(order.delivery_status || 'pending') === 'out_for_delivery' ? 'text-blue-600' : (order.delivery_status || 'pending') === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'out_for_delivery' || (order.delivery_status || 'pending') === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            {(order.delivery_status || 'pending') === 'out_for_delivery' ? '2' : (order.delivery_status || 'pending') === 'delivered' ? '✓' : '2'}
                          </div>
                          <span className="ml-2 text-sm font-medium">Out for Delivery</span>
                        </div>
                        <div className={`flex items-center ${(order.delivery_status || 'pending') === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(order.delivery_status || 'pending') === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                            {(order.delivery_status || 'pending') === 'delivered' ? '✓' : '3'}
                          </div>
                          <span className="ml-2 text-sm font-medium">Delivered</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {getDeliveryStatusBadge(order.delivery_status || 'pending')}
                      </div>
                    </div>
                  )}
                  
                  {order.admin_notes && (
                    <div className="mb-4 p-3 bg-amber-100 border-l-4 border-amber-400 rounded">
                      <h5 className="font-semibold text-sm mb-1 text-amber-800">Admin Notes:</h5>
                      <p className="text-sm text-amber-900">{order.admin_notes}</p>
                    </div>
                  )}

                  {order.logistic && (
                    <div className="mb-4 p-3 bg-teal-50 border-l-4 border-teal-400 rounded">
                      <h5 className="font-semibold text-sm mb-1 text-teal-800">Delivery Information:</h5>
                      <p className="text-sm text-teal-900">
                        <span className="font-medium">Assigned to:</span> {order.logistic.name}
                        {order.logistic.contact_number && (
                          <span className="ml-2">({order.logistic.contact_number})</span>
                        )}
                      </p>
                    </div>
                  )}

                  <Table className="mt-2 border">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                                      <TableBody>
                    {order.audit_trail && combineOrderItems(order.audit_trail).length > 0 ? (
                      combineOrderItems(order.audit_trail).map((item: OrderItem) => (
                        <TableRow key={`${item.product.name}-${item.category}`}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity} {item.category}</TableCell>
                          <TableCell>
                            {item.category === 'Kilo' && item.product.price_kilo && `₱${Number(item.product.price_kilo).toFixed(2)}`}
                            {item.category === 'Pc' && item.product.price_pc && `₱${Number(item.product.price_pc).toFixed(2)}`}
                            {item.category === 'Tali' && item.product.price_tali && `₱${Number(item.product.price_tali).toFixed(2)}`}
                            {(!item.product.price_kilo && !item.product.price_pc && !item.product.price_tali) && 'No price set'}
                          </TableCell>
                          <TableCell>
                            {item.category === 'Kilo' && item.product.price_kilo && `₱${(Number(item.quantity) * Number(item.product.price_kilo)).toFixed(2)}`}
                            {item.category === 'Pc' && item.product.price_pc && `₱${(Number(item.quantity) * Number(item.product.price_pc)).toFixed(2)}`}
                            {item.category === 'Tali' && item.product.price_tali && `₱${(Number(item.quantity) * Number(item.product.price_tali)).toFixed(2)}`}
                            {(!item.product.price_kilo && !item.product.price_pc && !item.product.price_tali) && 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  </Table>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppHeaderLayout>
  );
}
