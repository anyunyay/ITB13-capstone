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
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status</span>
            {getStatusBadge(status)}
          </div>
          {status === 'approved' && deliveryStatus && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Delivery Status</span>
              <div className="flex items-center gap-2">
                {getDeliveryStatusBadge(deliveryStatus)}
                {deliveryStatus === 'out_for_delivery' && (
                  <span className="text-xs text-blue-600">(Picked Up)</span>
                )}
                {deliveryStatus === 'delivered' && (
                  <span className="text-xs text-green-600">(Completed)</span>
                )}
              </div>
            </div>
          )}
          {deliveryTimeline && (
            <>
              {deliveryReadyTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ready At</span>
                  <span className="text-sm text-green-600">
                    {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryPackedTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Packed At</span>
                  <span className="text-sm text-blue-600">
                    {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveredTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Delivered At</span>
                  <span className="text-sm text-green-600">
                    {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {deliveryTimeline.ready_duration && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ready Duration</span>
                  <span className="text-sm text-gray-700">
                    {Math.floor(deliveryTimeline.ready_duration / 60)}h {deliveryTimeline.ready_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.packing_duration && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Packing Duration</span>
                  <span className="text-sm text-gray-700">
                    {Math.floor(deliveryTimeline.packing_duration / 60)}h {deliveryTimeline.packing_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.delivery_duration && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Delivery Duration</span>
                  <span className="text-sm text-gray-700">
                    {Math.floor(deliveryTimeline.delivery_duration / 60)}h {deliveryTimeline.delivery_duration % 60}m
                  </span>
                </div>
              )}
              {deliveryTimeline.total_duration && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Duration</span>
                  <span className="text-sm text-gray-700">
                    {Math.floor(deliveryTimeline.total_duration / 60)}h {deliveryTimeline.total_duration % 60}m
                  </span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Items</span>
            <span className="text-sm">{auditTrailLength}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-sm font-medium">₱{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span className="text-sm font-medium">₱{Number(subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Co-op Share (10%):</span>
            <span className="text-sm font-medium text-green-600">₱{Number(coopShare || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Revenue (100%):</span>
            <span className="text-sm font-medium text-blue-600">₱{Number(memberShare || 0).toFixed(2)}</span>
          </div>
          {admin && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Processed by</span>
              <span className="text-sm">{admin.name}</span>
            </div>
          )}
          {logistic && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Assigned to</span>
              <span className="text-sm">{logistic.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
