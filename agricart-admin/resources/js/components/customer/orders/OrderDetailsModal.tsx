import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { CalendarIcon, FileText, Package, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
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
  unit_price?: number;
  subtotal?: number;
  coop_share?: number;
  total_amount?: number;
}

interface Order {
  id: number; // This is the sales_audit_id (original order number)
  sales_id?: number; // Internal sales table ID (for delivered orders)
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

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const t = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/customer/orders/${orderId}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.pending_approval')}</Badge>;
      case 'approved':
        return <Badge className="status-approved text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.approved')}</Badge>;
      case 'rejected':
        return <Badge className="status-rejected text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.rejected')}</Badge>;
      case 'delayed':
        return <Badge className="status-delayed text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.delayed')}</Badge>;
      case 'cancelled':
        return <Badge className="status-cancelled text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.cancelled')}</Badge>;
      case 'delivered':
        return <Badge className="status-delivered text-xs sm:text-sm px-2 sm:px-3 py-1">{t('customer.delivered')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-base sm:text-xl md:text-2xl font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span className="truncate">{t('customer.order_details')} #{orderId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
              <p className="text-sm sm:text-base text-muted-foreground">{t('customer.loading_order_details')}</p>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-xs sm:text-sm mb-3">{error}</p>
              <Button onClick={fetchOrderDetails} variant="outline" size="sm" className="w-full sm:w-auto">
                {t('customer.retry')}
              </Button>
            </div>
          )}

          {!isLoading && !error && order && (
            <div className="space-y-3 sm:space-y-4">
              {/* Order Header */}
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                {/* Mobile: Order ID and Status on same row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{t('customer.order_id_label')}</span>
                    <span className="text-xs sm:text-sm font-bold text-primary">#{order.id}</span>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                {/* Date on separate row */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <time className="text-[10px] sm:text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                  </time>
                </div>
              </div>

              {/* Delivery Status */}
              {((order.status === 'approved' || order.status === 'delivered') && order.delivery_status) && (
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20 overflow-x-auto">
                  <span className="block text-[10px] sm:text-xs md:text-sm font-semibold mb-2 text-primary">
                    {t('customer.delivery_status')}
                  </span>
                  <div className="flex items-center justify-between gap-1 min-w-max">
                    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${order.delivery_status === 'pending' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${order.delivery_status === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {order.delivery_status === 'pending' ? '1' : '✓'}
                      </div>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-center">{t('customer.preparing')}</span>
                    </div>
                    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${order.delivery_status === 'ready_to_pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${order.delivery_status === 'ready_to_pickup' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {order.delivery_status === 'ready_to_pickup' ? '2' : '✓'}
                      </div>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-center">{t('customer.ready')}</span>
                    </div>
                    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${order.delivery_status === 'out_for_delivery' || order.delivery_status === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${order.delivery_status === 'out_for_delivery' || order.delivery_status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {order.delivery_status === 'out_for_delivery' ? '3' : order.delivery_status === 'delivered' ? '✓' : '3'}
                      </div>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-center leading-tight">{t('customer.out_for_delivery')}</span>
                    </div>
                    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${order.delivery_status === 'delivered' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${order.delivery_status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {order.delivery_status === 'delivered' ? '✓' : '4'}
                      </div>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-center">{t('customer.delivered')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {order.admin_notes && (
                <div className="p-2 sm:p-3 bg-accent/10 border-l-4 border-accent rounded">
                  <h3 className="text-xs sm:text-sm font-semibold mb-1 text-primary">{t('customer.approver_notes_label')}</h3>
                  <p className="text-xs sm:text-sm text-foreground break-words">{order.admin_notes}</p>
                </div>
              )}

              {/* Logistic Info */}
              {order.logistic && (
                <div className="p-2 sm:p-3 bg-secondary/10 border-l-4 border-secondary rounded">
                  <h3 className="text-xs sm:text-sm font-semibold mb-1 text-primary">{t('customer.delivery_information')}</h3>
                  <p className="text-xs sm:text-sm text-foreground break-words">
                    <span className="font-medium">{t('customer.assigned_to')}</span> {order.logistic.name}
                    {order.logistic.contact_number && (
                      <span className="ml-1 sm:ml-2">({order.logistic.contact_number})</span>
                    )}
                  </p>
                </div>
              )}

              {/* Order Items - Desktop */}
              <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                <Table className="w-full border border-border rounded-lg min-w-[600px]">
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">{t('customer.product_name')}</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">{t('customer.quantity')}</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">{t('customer.price')}</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">{t('customer.subtotal')}</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">{t('customer.delivery_fee')}</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">{t('customer.total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.audit_trail && order.audit_trail.length > 0 ? (
                      order.audit_trail.map((item: OrderItem) => (
                        <TableRow key={`${item.product.name}-${item.category}`}>
                          <TableCell className="text-xs sm:text-sm font-medium">{item.product.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm text-right">{item.quantity} {item.category}</TableCell>
                          <TableCell className="text-xs sm:text-sm text-right">
                            {item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : t('customer.no_price_set')}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-right font-semibold">
                            ₱{Number(item.subtotal || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-right">
                            ₱{Number(item.coop_share || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-right font-bold text-primary">
                            ₱{Number(item.total_amount || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                            <span className="text-xs sm:text-sm">{t('customer.no_items_found')}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Order Items - Mobile */}
              <div className="md:hidden space-y-2 sm:space-y-3">
                {order.audit_trail && order.audit_trail.length > 0 ? (
                  order.audit_trail.map((item: OrderItem) => (
                    <div key={`${item.product.name}-${item.category}`} className="p-2 sm:p-3 bg-card border border-border rounded-lg">
                      <h4 className="text-sm sm:text-base font-semibold mb-2 break-words">{item.product.name}</h4>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">{t('customer.quantity_label')}</span>
                          <span className="font-medium">{item.quantity} {item.category}</span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">{t('customer.price_label')}</span>
                          <span className="font-medium">{item.unit_price && item.unit_price > 0 ? `₱${Number(item.unit_price).toFixed(2)}` : t('customer.no_price_set')}</span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">{t('customer.subtotal_label')}</span>
                          <span className="font-semibold">₱{Number(item.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">{t('customer.delivery_fee_label')}</span>
                          <span className="font-medium">₱{Number(item.coop_share || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-semibold">{t('customer.total_label')}</span>
                        <span className="text-xs sm:text-sm font-bold text-primary">₱{Number(item.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <Card className="p-4 sm:p-6 text-center bg-muted rounded-lg">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{t('customer.no_items_found')}</span>
                    </div>
                  </Card>
                )}
              </div>

              {/* Order Total */}
              <div className="pt-3 sm:pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">{t('customer.order_total_label')}</span>
                  <span className="text-base sm:text-lg font-bold text-primary">₱{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Confirmation Status */}
              {order.customer_confirmed_at && (
                <div className="p-2 sm:p-3 bg-primary/10 border-l-4 border-primary rounded">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <h3 className="text-xs sm:text-sm font-semibold text-primary">{t('customer.order_confirmed')}</h3>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('customer.confirmed_on')} {format(new Date(order.customer_confirmed_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t border-border sticky bottom-0 bg-background pb-2">
                <Button onClick={onClose} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                  {t('customer.close')}
                </Button>
                <Button 
                  onClick={() => window.location.href = `/customer/orders/history#order-${orderId}`} 
                  variant="default"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {t('customer.view_in_history')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
