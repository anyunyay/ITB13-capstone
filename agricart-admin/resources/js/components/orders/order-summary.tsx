import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

interface DeliveryTimeline {
  ready_duration?: number;
  packing_duration?: number;
  delivery_duration?: number;
  total_duration?: number;
}

interface Admin {
  name: string;
}

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface OrderSummaryProps {
  status: string;
  deliveryStatus?: string;
  deliveryTimeline?: DeliveryTimeline;
  deliveryReadyTime?: string;
  deliveryPackedTime?: string;
  deliveredTime?: string;
  auditTrailLength: number;
  totalAmount: number;
  subtotal: number;
  coopShare: number;
  memberShare: number;
  admin?: Admin;
  logistic?: Logistic;
  adminNotes?: string;
  getStatusBadge: (status: string) => React.ReactNode;
  getDeliveryStatusBadge: (status: string) => React.ReactNode;
}

export const OrderSummary = ({
  status,
  deliveryStatus,
  deliveryTimeline,
  deliveryReadyTime,
  deliveryPackedTime,
  deliveredTime,
  auditTrailLength,
  totalAmount,
  subtotal,
  coopShare,
  memberShare,
  admin,
  logistic,
  adminNotes,
  getStatusBadge,
  getDeliveryStatusBadge
}: OrderSummaryProps) => {
  const t = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{t('admin.order_summary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">{t('admin.status')}</span>
            {getStatusBadge(status)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">{t('admin.delivery_status')}</span>
            {status === 'rejected' ? (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">N/A</Badge>
            ) : deliveryStatus ? (
              <div className="flex items-center gap-2">
                {getDeliveryStatusBadge(deliveryStatus)}
                {deliveryStatus === 'out_for_delivery' && (
                  <span className="text-xs text-primary">(Picked Up)</span>
                )}
                {deliveryStatus === 'delivered' && (
                  <span className="text-xs text-primary">(Completed)</span>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">N/A</Badge>
            )}
          </div>
          {deliveryTimeline && (
            <>
              {deliveryReadyTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.ready_at')}</span>
                  <span className="text-sm text-primary">
                    {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryPackedTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.packed_at')}</span>
                  <span className="text-sm text-secondary">
                    {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveredTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.delivered_at')}</span>
                  <span className="text-sm text-primary">
                    {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryTimeline.ready_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.ready_duration')}</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(deliveryTimeline.ready_duration / 60)}h {deliveryTimeline.ready_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.packing_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.packing_duration')}</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(deliveryTimeline.packing_duration / 60)}h {deliveryTimeline.packing_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.delivery_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.delivery_duration')}</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(deliveryTimeline.delivery_duration / 60)}h {deliveryTimeline.delivery_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.total_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Duration</span>
                  <span className="text-sm text-foreground font-medium">
                    {Math.floor(deliveryTimeline.total_duration / 60)}h {deliveryTimeline.total_duration % 60}m
                  </span>
                </div>
              )}
            </>
          )}
          <div className="border-t border-border pt-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.items')}</span>
              <span className="text-sm text-foreground font-medium">{auditTrailLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.subtotal')}</span>
              <span className="text-sm text-foreground">₱{Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.coop_share_percent')}</span>
              <span className="text-sm font-medium text-primary">₱{Number(coopShare || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.revenue_percent')}</span>
              <span className="text-sm font-medium text-secondary">₱{Number(memberShare || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
              <span className="text-sm font-semibold text-foreground">{t('admin.total_amount')}</span>
              <span className="text-sm font-semibold text-foreground">₱{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          {admin && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.processed_by')}</span>
              <span className="text-sm text-foreground">{admin.name}</span>
            </div>
          )}
          {logistic && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('admin.assigned_to')}</span>
              <span className="text-sm text-foreground">{logistic.name}</span>
            </div>
          )}
          {adminNotes && (
            <div className="border-t border-border pt-3 mt-3">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <p className="text-sm text-foreground leading-relaxed bg-muted/50 p-3 rounded-md">
                  {adminNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
