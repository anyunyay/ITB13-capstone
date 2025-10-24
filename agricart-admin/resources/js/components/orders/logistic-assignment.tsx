import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Logistic Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logistic ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Assigned to: {logistic.name}
            </p>
            {logistic.contact_number && (
              <p className="text-sm text-green-600">
                Contact: {logistic.contact_number}
              </p>
            )}
          </div>
        ) : (
          <Dialog open={assignLogisticDialogOpen} onOpenChange={setAssignLogisticDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Assign Logistic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Logistic to Order #{orderId}</DialogTitle>
                <DialogDescription>
                  This order has been approved and is ready for delivery. Please select a logistic provider to handle the delivery.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Logistic Provider *</label>
                  <select
                    value={assignLogisticForm.data.logistic_id}
                    onChange={(e) => assignLogisticForm.setData('logistic_id', e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                    required
                  >
                    <option value="">Choose a logistic provider...</option>
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
                  Cancel
                </Button>
                <Button 
                  onClick={onAssignLogistic} 
                  disabled={assignLogisticForm.processing || !assignLogisticForm.data.logistic_id}
                >
                  {assignLogisticForm.processing ? 'Assigning...' : 'Assign Logistic'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};
