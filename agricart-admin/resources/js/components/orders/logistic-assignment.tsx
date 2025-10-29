import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface LogisticAssignmentProps {
  orderId: number;
  logistic?: Logistic;
  logistics: Logistic[];
  assignLogisticDialogOpen: boolean;
  setAssignLogisticDialogOpen: (open: boolean) => void;
  assignLogisticForm: {
    data: { logistic_id: string };
    setData: (key: string, value: string) => void;
    processing: boolean;
  };
  onAssignLogistic: () => void;
}

export const LogisticAssignment = ({
  orderId,
  logistic,
  logistics,
  assignLogisticDialogOpen,
  setAssignLogisticDialogOpen,
  assignLogisticForm,
  onAssignLogistic
}: LogisticAssignmentProps) => {
  const t = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{t('admin.logistic_assignment')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logistic ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              {t('admin.assigned_to')}: {logistic.name}
            </p>
            {logistic.contact_number && (
              <p className="text-sm text-green-600">
                {t('admin.contact')}: {logistic.contact_number}
              </p>
            )}
          </div>
        ) : (
          <Dialog open={assignLogisticDialogOpen} onOpenChange={setAssignLogisticDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                {t('admin.assign_logistic')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.assign_logistic_to_order', { id: orderId })}</DialogTitle>
                <DialogDescription>
                  {t('admin.order_approved_ready_delivery')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('admin.select_logistic_provider')}</label>
                  <select
                    value={assignLogisticForm.data.logistic_id}
                    onChange={(e) => assignLogisticForm.setData('logistic_id', e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                    required
                  >
                    <option value="">{t('admin.choose_logistic_provider')}</option>
                    {logistics.map((logistic) => (
                      <option key={logistic.id} value={logistic.id}>
                        {logistic.name} {logistic.contact_number && `(${logistic.contact_number})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignLogisticDialogOpen(false)}>
                  {t('ui.cancel')}
                </Button>
                <Button 
                  onClick={onAssignLogistic} 
                  disabled={assignLogisticForm.processing || !assignLogisticForm.data.logistic_id}
                >
                  {assignLogisticForm.processing ? t('admin.assigning') : t('admin.assign_logistic')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};
