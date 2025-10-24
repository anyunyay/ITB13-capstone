import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
  getStatusBadge,
  getDeliveryStatusBadge
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            {getStatusBadge(status)}
          </div>
          {status === 'approved' && deliveryStatus && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Delivery Status</span>
              <div className="flex items-center gap-2">
                {getDeliveryStatusBadge(deliveryStatus)}
                {deliveryStatus === 'out_for_delivery' && (
                  <span className="text-xs text-primary">(Picked Up)</span>
                )}
                {deliveryStatus === 'delivered' && (
                  <span className="text-xs text-primary">(Completed)</span>
                )}
              </div>
            </div>
          )}
          {deliveryTimeline && (
            <>
              {deliveryReadyTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Ready At</span>
                  <span className="text-sm text-primary">
                    {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryPackedTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Packed At</span>
                  <span className="text-sm text-secondary">
                    {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveredTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Delivered At</span>
                  <span className="text-sm text-primary">
                    {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryTimeline.ready_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Ready Duration</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(deliveryTimeline.ready_duration / 60)}h {deliveryTimeline.ready_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.packing_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Packing Duration</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(deliveryTimeline.packing_duration / 60)}h {deliveryTimeline.packing_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.delivery_duration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Delivery Duration</span>
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
              <span className="text-sm font-medium text-muted-foreground">Items</span>
              <span className="text-sm text-foreground font-medium">{auditTrailLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
              <span className="text-sm text-foreground">₱{Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Co-op Share (10%)</span>
              <span className="text-sm font-medium text-primary">₱{Number(coopShare || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Revenue (100%)</span>
              <span className="text-sm font-medium text-secondary">₱{Number(memberShare || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
              <span className="text-sm font-semibold text-foreground">Total Amount</span>
              <span className="text-sm font-semibold text-foreground">₱{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          {admin && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Processed by</span>
              <span className="text-sm text-foreground">{admin.name}</span>
            </div>
          )}
          {logistic && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Assigned to</span>
              <span className="text-sm text-foreground">{logistic.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
