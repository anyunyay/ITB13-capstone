import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
  assigned_area?: string;
  average_rating?: number;
  total_ratings?: number;
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
  customerBarangay?: string;
}

export const LogisticAssignment = ({
  orderId,
  logistic,
  logistics,
  assignLogisticDialogOpen,
  setAssignLogisticDialogOpen,
  assignLogisticForm,
  onAssignLogistic,
  customerBarangay
}: LogisticAssignmentProps) => {
  const t = useTranslation();
  
  // Find recommended logistics based on customer's barangay
  const recommendedLogistics = customerBarangay 
    ? logistics.filter(l => l.assigned_area === customerBarangay)
    : [];
  
  // Sort by rating (highest first), then by name if ratings are equal
  const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
    // If both have ratings, compare them
    if (a.average_rating && b.average_rating) {
      return b.average_rating - a.average_rating; // Higher rating first
    }
    // If only one has rating, prioritize the one with rating
    if (a.average_rating && !b.average_rating) return -1;
    if (!a.average_rating && b.average_rating) return 1;
    // If neither has rating, sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Get the highest-rated recommended logistic
  const recommendedLogistic = sortedRecommendedLogistics.length > 0 ? sortedRecommendedLogistics[0] : null;
  
  // Auto-select recommended logistic when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    if (open && recommendedLogistic && !assignLogisticForm.data.logistic_id) {
      assignLogisticForm.setData('logistic_id', recommendedLogistic.id.toString());
    }
    setAssignLogisticDialogOpen(open);
  };
  
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
            {logistic.average_rating && (
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{logistic.average_rating.toFixed(1)}</span>
                <span>/ 5</span>
                {logistic.total_ratings && (
                  <span className="text-green-500">
                    ({logistic.total_ratings} {logistic.total_ratings === 1 ? t('admin.rating') : t('admin.ratings')})
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <Dialog open={assignLogisticDialogOpen} onOpenChange={handleDialogOpenChange}>
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
                  {customerBarangay && (
                    <span className="block mt-2 text-sm">
                      {t('admin.customer_location')}: <strong>{customerBarangay}</strong>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {recommendedLogistic && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {t('admin.recommended_logistic')}: {recommendedLogistic.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {t('admin.assigned_to_area')}: {recommendedLogistic.assigned_area}
                    </p>
                    {recommendedLogistic.average_rating && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{recommendedLogistic.average_rating.toFixed(1)}</span>
                        <span>/ 5</span>
                        {recommendedLogistic.total_ratings && (
                          <span className="text-green-500 dark:text-green-400">
                            ({recommendedLogistic.total_ratings} {recommendedLogistic.total_ratings === 1 ? t('admin.rating') : t('admin.ratings')})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
                {customerBarangay && sortedRecommendedLogistics.length === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ {t('admin.no_logistic_for_area', { area: customerBarangay })}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">{t('admin.select_logistic_provider')}</label>
                  <select
                    value={assignLogisticForm.data.logistic_id}
                    onChange={(e) => assignLogisticForm.setData('logistic_id', e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                    required
                  >
                    <option value="">{t('admin.choose_logistic_provider')}</option>
                    {sortedRecommendedLogistics.length > 0 && (
                      <optgroup label={t('admin.recommended_for_area')}>
                        {sortedRecommendedLogistics.map((logistic) => (
                          <option key={logistic.id} value={logistic.id}>
                            ⭐ {logistic.name} {logistic.contact_number && `(${logistic.contact_number})`} - {logistic.assigned_area}
                            {logistic.average_rating && ` ★${logistic.average_rating.toFixed(1)}`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={sortedRecommendedLogistics.length > 0 ? t('admin.other_logistics') : t('admin.all_logistics')}>
                      {logistics
                        .filter(l => !sortedRecommendedLogistics.includes(l))
                        .map((logistic) => (
                          <option key={logistic.id} value={logistic.id}>
                            {logistic.name} {logistic.contact_number && `(${logistic.contact_number})`}
                            {logistic.assigned_area && ` - ${logistic.assigned_area}`}
                            {logistic.average_rating && ` ★${logistic.average_rating.toFixed(1)}`}
                          </option>
                        ))}
                    </optgroup>
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
