import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface OrderPickupProps {
  orderId: number;
  deliveryStatus: string;
  logistic?: Logistic;
  deliveryReadyTime?: string;
  deliveryPackedTime?: string;
  deliveredTime?: string;
  pickedUpDialogOpen: boolean;
  setPickedUpDialogOpen: (open: boolean) => void;
  pickupConfirmationText: string;
  setPickupConfirmationText: (text: string) => void;
  pickedUpForm: {
    processing: boolean;
  };
  onMarkPickedUp: () => void;
}

export const OrderPickup = ({
  orderId,
  deliveryStatus,
  logistic,
  deliveryReadyTime,
  deliveryPackedTime,
  deliveredTime,
  pickedUpDialogOpen,
  setPickedUpDialogOpen,
  pickupConfirmationText,
  setPickupConfirmationText,
  pickedUpForm,
  onMarkPickedUp
}: OrderPickupProps) => {
  if (!logistic || deliveryStatus === 'pending') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Order Picked Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg ${
          deliveryStatus === 'ready_to_pickup' ? 'bg-green-50 border border-green-200' :
          deliveryStatus === 'out_for_delivery' ? 'bg-blue-50 border border-blue-200' :
          deliveryStatus === 'delivered' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {deliveryStatus === 'ready_to_pickup' && (
            <>
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
            </>
          )}
          {deliveryStatus === 'out_for_delivery' && (
            <>
              <p className="text-sm font-medium text-blue-800">
                ✓ Order is out for delivery
              </p>
              <p className="text-sm text-blue-600">
                The order has been picked up and is currently being delivered to the customer.
              </p>
              {deliveryPackedTime && (
                <p className="text-xs text-blue-500 mt-2">
                  Picked up: {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              {deliveryReadyTime && (
                <p className="text-xs text-blue-500 mt-1">
                  Was ready: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              <p className="text-xs text-blue-500 mt-1">
                Assigned to: {logistic.name}
                {logistic.contact_number && ` (${logistic.contact_number})`}
              </p>
            </>
          )}
          {deliveryStatus === 'delivered' && (
            <>
              <p className="text-sm font-medium text-green-800">
                ✓ Order has been delivered
              </p>
              <p className="text-sm text-green-600">
                The order has been successfully delivered to the customer.
              </p>
              {deliveredTime && (
                <p className="text-xs text-green-500 mt-2">
                  Delivered: {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              {deliveryPackedTime && (
                <p className="text-xs text-green-500 mt-1">
                  Picked up: {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              <p className="text-xs text-green-500 mt-1">
                Assigned to: {logistic.name}
                {logistic.contact_number && ` (${logistic.contact_number})`}
              </p>
            </>
          )}
        </div>
        
        {deliveryStatus === 'ready_to_pickup' ? (
          <Dialog open={pickedUpDialogOpen} onOpenChange={setPickedUpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                Mark Order as Picked Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Order as Picked Up</DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark this order as picked up? This will automatically set the delivery status to "Out for Delivery" and notify the customer that their order is in transit.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Type "Confirm Pick Up" to finalize this action *
                  </label>
                  <Input
                    type="text"
                    value={pickupConfirmationText}
                    onChange={(e) => setPickupConfirmationText(e.target.value)}
                    placeholder="Confirm Pick Up"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This action cannot be undone. The order will be marked as picked up and delivery status will be set to "Out for Delivery".
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPickedUpDialogOpen(false);
                    setPickupConfirmationText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onMarkPickedUp} 
                  disabled={pickedUpForm.processing || pickupConfirmationText !== 'Confirm Pick Up'}
                >
                  {pickedUpForm.processing ? 'Marking...' : 'Mark as Picked Up'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : deliveryStatus === 'out_for_delivery' ? (
          <Button className="w-full" variant="outline" disabled>
            Picked Up
          </Button>
        ) : deliveryStatus === 'delivered' ? (
          <Button className="w-full" variant="outline" disabled>
            Delivered
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Picked Up
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
