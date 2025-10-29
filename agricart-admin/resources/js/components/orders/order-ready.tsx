import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

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
  const t = useTranslation();
  if (!logistic) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{t('admin.order_ready')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveryStatus === 'pending' && (
            <>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  {t('admin.order_approved_ready_prepare')}
                </p>
                <p className="text-sm text-yellow-600">
                  {t('admin.mark_order_ready_when_prepared')}
                </p>
                <p className="text-xs text-yellow-500 mt-2">
                  {t('admin.assigned_to')}: {logistic.name}
                  {logistic.contact_number && ` (${logistic.contact_number})`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                variant="default"
                onClick={onMarkReady}
              >
                {t('admin.mark_order_as_ready')}
              </Button>
            </>
          )}
          
          {deliveryStatus === 'ready_to_pickup' && (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
              </div>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                ✓ {t('admin.ready_to_pick_up')}
              </Button>
            </>
          )}
          
          {(deliveryStatus === 'out_for_delivery' || deliveryStatus === 'delivered') && (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✓ {t('admin.order_has_been_processed')}
                </p>
                <p className="text-sm text-green-600">
                  {t('admin.order_moved_beyond_ready')}
                </p>
                {deliveryReadyTime && (
                  <p className="text-xs text-green-500 mt-2">
                    {t('admin.was_ready')}: {format(new Date(deliveryReadyTime), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                <p className="text-xs text-green-500 mt-1">
                  {t('admin.assigned_to')}: {logistic.name}
                  {logistic.contact_number && ` (${logistic.contact_number})`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                ✓ {t('admin.ready_to_pick_up')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mark Ready Confirmation Dialog */}
      <Dialog open={markReadyDialogOpen} onOpenChange={setMarkReadyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.mark_order_as_ready')}</DialogTitle>
            <DialogDescription>
              {t('admin.confirm_mark_order_ready')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('admin.order_number', { id: orderId })}</strong> {t('admin.will_be_marked_ready_pickup')}.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {t('admin.logistic_provider_will_be_notified', { name: logistic?.name })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkReadyDialogOpen(false)}>
              {t('ui.cancel')}
            </Button>
            <Button onClick={onConfirmMarkReady}>
              {t('admin.mark_as_ready')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
