import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

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
  const t = useTranslation();
  if (!logistic || deliveryStatus === 'pending') return null;

  return (
    <Card>
      <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{t('admin.order_picked_up')}</CardTitle>
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
                ✓ {t('admin.order_ready_for_pickup')}
              </p>
              <p className="text-sm text-green-600">
                {t('admin.order_prepared_ready_collect')}
              </p>
              {deliveryReadyTime && (
                <p className="text-xs text-green-500 mt-2">
                  {t('admin.ready_since')}: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              <p className="text-xs text-green-500 mt-1">
                {t('admin.assigned_to')}: {logistic.name}
                {logistic.contact_number && ` (${logistic.contact_number})`}
              </p>
            </>
          )}
          {deliveryStatus === 'out_for_delivery' && (
            <>
              <p className="text-sm font-medium text-blue-800">
                ✓ {t('admin.order_out_for_delivery')}
              </p>
              <p className="text-sm text-blue-600">
                {t('admin.order_picked_up_delivering')}
              </p>
              {deliveryPackedTime && (
                <p className="text-xs text-blue-500 mt-2">
                  {t('admin.picked_up_time')}: {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              {deliveryReadyTime && (
                <p className="text-xs text-blue-500 mt-1">
                  {t('admin.was_ready')}: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              <p className="text-xs text-blue-500 mt-1">
                {t('admin.assigned_to')}: {logistic.name}
                {logistic.contact_number && ` (${logistic.contact_number})`}
              </p>
            </>
          )}
          {deliveryStatus === 'delivered' && (
            <>
              <p className="text-sm font-medium text-green-800">
                ✓ {t('admin.order_delivered')}
              </p>
              <p className="text-sm text-green-600">
                {t('admin.order_successfully_delivered')}
              </p>
              {deliveredTime && (
                <p className="text-xs text-green-500 mt-2">
                  {t('admin.delivered_time')}: {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              {deliveryPackedTime && (
                <p className="text-xs text-green-500 mt-1">
                  {t('admin.picked_up_time')}: {format(new Date(deliveryPackedTime), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
              <p className="text-xs text-green-500 mt-1">
                {t('admin.assigned_to')}: {logistic.name}
                {logistic.contact_number && ` (${logistic.contact_number})`}
              </p>
            </>
          )}
        </div>
        
        {deliveryStatus === 'ready_to_pickup' ? (
          <Dialog open={pickedUpDialogOpen} onOpenChange={setPickedUpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                {t('admin.mark_order_as_picked_up')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.mark_order_as_picked_up')}</DialogTitle>
                <DialogDescription>
                  {t('admin.confirm_mark_order_picked_up')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    {t('admin.type_confirm_pickup_to_finalize')}
                  </label>
                  <Input
                    type="text"
                    value={pickupConfirmationText}
                    onChange={(e) => setPickupConfirmationText(e.target.value)}
                    placeholder={t('admin.confirm_pick_up')}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('admin.mark_picked_up_warning')}
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
                  {t('ui.cancel')}
                </Button>
                <Button 
                  onClick={onMarkPickedUp} 
                  disabled={pickedUpForm.processing || pickupConfirmationText !== t('admin.confirm_pick_up')}
                >
                  {pickedUpForm.processing ? t('admin.marking') : t('admin.mark_order_as_picked_up')}
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
