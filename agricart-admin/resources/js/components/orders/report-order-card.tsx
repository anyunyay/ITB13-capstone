import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
  };
  total_amount: number;
  subtotal: number;
  status: string;
  delivery_status: string;
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
  audit_trail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>;
}

interface ReportOrderCardProps {
  order: Order;
}

export function ReportOrderCard({ order }: ReportOrderCardProps) {
  const t = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.ready_for_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">{t('admin.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('admin.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Row 1: Header - Order ID, Date, Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-foreground">
                {t('admin.order_number', { id: order.id })}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-center flex items-center gap-2 flex-wrap">
            {getStatusBadge(order.status)}
            {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
          </div>
        </div>

        {/* Row 2: All Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
          {/* Customer Name */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.customer')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={order.customer.name}>
              {order.customer.name}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.email')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={order.customer.email}>
              {order.customer.email}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.contact_number')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={order.customer.contact_number || '-'}>
              {order.customer.contact_number || '-'}
            </div>
          </div>

          {/* Total Amount */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.total_amount')}</div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
              ₱{Number(order.total_amount).toFixed(2)}
            </Badge>
          </div>

          {/* Items Count */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.items')}</div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
              {order.audit_trail?.length || 0}
            </Badge>
          </div>

          {/* Processed By */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.processed_by')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={order.admin?.name || '-'}>
              {order.admin?.name || '-'}
            </div>
          </div>
        </div>

        {/* Additional Info: Logistic and/or Admin Notes */}
        {(order.logistic || order.admin_notes) && (
          <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row gap-2">
            {order.logistic && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md flex-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground">{t('admin.assigned_to')}: </span>
                  <span className="text-xs text-foreground">
                    {order.logistic.name}
                    {order.logistic.contact_number && (
                      <span className="text-muted-foreground ml-1">({order.logistic.contact_number})</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {order.admin_notes && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-md flex-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground">{t('admin.notes')}: </span>
                  <span className="text-xs text-muted-foreground line-clamp-1" title={order.admin_notes}>
                    {order.admin_notes}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items Section */}
        {order.audit_trail && order.audit_trail.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-2">{t('admin.order_items')}</div>
            <div className="space-y-1">
              {(() => {
                const groupedItems = order.audit_trail?.reduce((acc, item) => {
                  const key = `${item.product.id}-${item.category}`;
                  if (!acc[key]) {
                    acc[key] = {
                      id: item.id,
                      product: item.product,
                      category: item.category,
                      quantity: 0
                    };
                  }
                  acc[key].quantity += Number(item.quantity);
                  return acc;
                }, {} as Record<string, any>) || {};

                const combinedItems = Object.values(groupedItems);

                return combinedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 px-2 bg-muted/30 rounded">
                    <span className="text-foreground line-clamp-1 flex-1">{item.product.name} ({item.category})</span>
                    <span className="text-muted-foreground font-medium ml-2 shrink-0">{item.quantity} {item.category}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
