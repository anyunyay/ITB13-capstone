import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { useEffect } from 'react';
import { Truck, MapPin, Star, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  
  // Pre-fill dropdown when dialog opens and recommended logistic is available
  useEffect(() => {
    if (assignLogisticDialogOpen && recommendedLogistic && !assignLogisticForm.data.logistic_id) {
      assignLogisticForm.setData('logistic_id', recommendedLogistic.id.toString());
    }
  }, [assignLogisticDialogOpen, recommendedLogistic]);
  
  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  {t('admin.assign_logistic_to_order', { id: orderId })}
                </DialogTitle>
                <DialogDescription>
                  {t('admin.order_approved_ready_delivery')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Customer Location Info */}
                {customerBarangay && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                      <MapPin className="h-4 w-4" />
                      {t('admin.customer_location')}: <strong>{customerBarangay}</strong>
                    </div>
                  </div>
                )}

                {/* Recommended Logistic Banner */}
                {recommendedLogistic && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          {t('admin.recommended_logistic')}: {recommendedLogistic.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-green-600 dark:text-green-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {recommendedLogistic.assigned_area}
                          </span>
                          {recommendedLogistic.average_rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-semibold">{recommendedLogistic.average_rating.toFixed(1)}</span>
                              {recommendedLogistic.total_ratings && (
                                <span>({recommendedLogistic.total_ratings})</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Logistic Warning */}
                {customerBarangay && sortedRecommendedLogistics.length === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {t('admin.no_logistic_for_area', { area: customerBarangay })}
                    </div>
                  </div>
                )}

                {/* Logistic Selection */}
                <div className="space-y-2">
                  <Label htmlFor="logistic_select">
                    {t('admin.select_logistic_provider')} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={assignLogisticForm.data.logistic_id}
                    onValueChange={(value) => assignLogisticForm.setData('logistic_id', value)}
                  >
                    <SelectTrigger id="logistic_select" className="w-full">
                      <SelectValue placeholder={t('admin.choose_logistic_provider')} />
                    </SelectTrigger>
                    <SelectContent 
                      position="popper" 
                      side="bottom" 
                      align="start" 
                      sideOffset={4}
                      avoidCollisions={false}
                      className="max-h-[300px]"
                    >
                      {sortedRecommendedLogistics.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {t('admin.recommended_for_area')}
                          </SelectLabel>
                          {sortedRecommendedLogistics.map((logistic) => (
                            <SelectItem key={logistic.id} value={logistic.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{logistic.name}</span>
                                {logistic.average_rating && (
                                  <span className="text-xs text-muted-foreground">
                                    ★{logistic.average_rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      <SelectGroup>
                        <SelectLabel>
                          {sortedRecommendedLogistics.length > 0 ? t('admin.other_logistics') : t('admin.all_logistics')}
                        </SelectLabel>
                        {logistics
                          .filter(l => !sortedRecommendedLogistics.includes(l))
                          .map((logistic) => (
                            <SelectItem key={logistic.id} value={logistic.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{logistic.name}</span>
                                {logistic.assigned_area && (
                                  <span className="text-xs text-muted-foreground">
                                    - {logistic.assigned_area}
                                  </span>
                                )}
                                {logistic.average_rating && (
                                  <span className="text-xs text-muted-foreground">
                                    ★{logistic.average_rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
