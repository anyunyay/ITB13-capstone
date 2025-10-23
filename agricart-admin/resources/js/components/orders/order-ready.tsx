import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface OrderReadyProps {
  orderId: number;
  deliveryStatus: string;
  logistic?: Logistic;
  deliveryReadyTime?: string;
  markReadyDialogOpen: boolean;
  setMarkReadyDialogOpen: (open: boolean) => void;
  onMarkReady: () => void;
  onConfirmMarkReady: () => void;
}

export const OrderReady = ({
  orderId,
  deliveryStatus,
  logistic,
  deliveryReadyTime,
  markReadyDialogOpen,
  setMarkReadyDialogOpen,
  onMarkReady,
  onConfirmMarkReady
}: OrderReadyProps) => {
  if (!logistic) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Ready</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliveryStatus === 'pending' && (
            <>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-800">
                  Order is approved and ready to be prepared for pickup
                </p>
                <p className="text-sm text-yellow-600">
                  Mark the order as ready when it has been prepared and is waiting for pickup.
                </p>
                <p className="text-xs text-yellow-500 mt-2">
                  Assigned to: {logistic.name}
                  {logistic.contact_number && ` (${logistic.contact_number})`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                variant="default"
                onClick={onMarkReady}
              >
                Mark Order as Ready
              </Button>
            </>
          )}
          
          {deliveryStatus === 'ready_to_pickup' && (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-medium text-green-800">
                  ✓ Order is ready for pickup
                </p>
                <p className="text-sm text-green-600">
                  The order has been prepared and is ready for the logistic provider to collect.
                </p>
                {deliveryReadyTime && (
                  <p className="text-xs text-green-500 mt-2">
                    Ready since: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                <p className="text-xs text-green-500 mt-1">
                  Assigned to: {logistic.name}
                  {logistic.contact_number && ` (${logistic.contact_number})`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                ✓ Ready to Pick Up
              </Button>
            </>
          )}
          
          {(deliveryStatus === 'out_for_delivery' || deliveryStatus === 'delivered') && (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-medium text-green-800">
                  ✓ Order has been processed
                </p>
                <p className="text-sm text-green-600">
                  This order has moved beyond the ready stage.
                </p>
                {deliveryReadyTime && (
                  <p className="text-xs text-green-500 mt-2">
                    Was ready: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                <p className="text-xs text-green-500 mt-1">
                  Assigned to: {logistic.name}
                  {logistic.contact_number && ` (${logistic.contact_number})`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                ✓ Ready to Pick Up
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mark Ready Confirmation Dialog */}
      <Dialog open={markReadyDialogOpen} onOpenChange={setMarkReadyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Ready</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this order as ready for pickup? This will notify the logistic provider that the order is prepared and ready for collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Order #{orderId}</strong> will be marked as ready for pickup.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                The logistic provider ({logistic?.name}) will be notified that the order is ready for collection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkReadyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirmMarkReady}>
              Mark as Ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
