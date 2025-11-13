import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
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
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">
                {t('admin.order_number', { id: order.id })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {getStatusBadge(order.status)}
            {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('admin.customer_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.name')}:</span>
                <span className="text-muted-foreground ml-2">{order.customer.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.email')}:</span>
                <span className="text-muted-foreground ml-2">{order.customer.email}</span>
              </p>
              {order.customer.contact_number && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.contact_number')}:</span>
                  <span className="text-muted-foreground ml-2">{order.customer.contact_number}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              {t('admin.order_summary')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.total_amount')}:</span>
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                  ₱{Number(order.total_amount).toFixed(2)}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.subtotal')}:</span>
                <span className="text-muted-foreground ml-2">₱{Number(order.subtotal || 0).toFixed(2)}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.items')}:</span>
                <span className="text-muted-foreground ml-2">{order.audit_trail?.length || 0}</span>
              </p>
              {order.admin && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.processed_by')}:</span>
                  <span className="text-muted-foreground ml-2">{order.admin.name}</span>
                </p>
              )}
              {order.logistic && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.assigned_to')}:</span>
                  <span className="text-muted-foreground ml-2">{order.logistic.name}</span>
                  {order.logistic.contact_number && (
                    <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {order.admin_notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h5 className="font-semibold text-sm mb-1 text-foreground">{t('admin.admin_notes')}:</h5>
            <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-foreground">{t('admin.order_items')}</h4>
          <div className="space-y-2">
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

              return combinedItems.length > 0 ? (
                combinedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.product.name} ({item.category})</span>
                    <span className="text-muted-foreground">{item.quantity} {item.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('admin.no_items_found')}</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
