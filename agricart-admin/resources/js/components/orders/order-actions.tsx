import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

interface OrderActionsProps {
  orderId: number;
  status: string;
  hasInsufficientStock: boolean;
  approveDialogOpen: boolean;
  setApproveDialogOpen: (open: boolean) => void;
  rejectDialogOpen: boolean;
  setRejectDialogOpen: (open: boolean) => void;
  approveForm: {
    data: { admin_notes: string };
    setData: (key: string, value: string) => void;
    processing: boolean;
  };
  rejectForm: {
    data: { admin_notes: string };
    setData: (key: string, value: string) => void;
    processing: boolean;
  };
  selectedRejectionReason: string;
  setSelectedRejectionReason: (reason: string) => void;
  rejectionReasons: string[];
  onApprove: () => void;
  onReject: () => void;
}

export const OrderActions = ({
  orderId,
  status,
  hasInsufficientStock,
  approveDialogOpen,
  setApproveDialogOpen,
  rejectDialogOpen,
  setRejectDialogOpen,
  approveForm,
  rejectForm,
  selectedRejectionReason,
  setSelectedRejectionReason,
  rejectionReasons,
  onApprove,
  onReject
}: OrderActionsProps) => {
  const t = useTranslation();

  // Don't show actions for cancelled orders
  if (status === 'cancelled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">{t('admin.order_cancelled')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">
              <strong>{t('admin.order_cancelled_by_customer')}</strong> {t('admin.no_further_actions')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show actions for pending, delayed orders (including merged orders that remain pending)
  if (status !== 'pending' && status !== 'delayed') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{t('admin.actions')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'delayed' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>{t('admin.order_is_delayed')}</strong> {t('admin.order_delayed_description')}
            </p>
          </div>
        )}
        {hasInsufficientStock && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>{t('admin.insufficient_stock_warning')}</strong> {t('admin.insufficient_stock_description')}
            </p>
          </div>
        )}

        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              variant="default"
              disabled={hasInsufficientStock}
            >
              {hasInsufficientStock ? t('admin.cannot_approve_insufficient_stock') : t('admin.approve_order')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.approve_order_number', { id: orderId })}</DialogTitle>
              <DialogDescription>
                {t('admin.confirm_approve_order')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('admin.notes_optional')}</label>
                <Textarea
                  placeholder={t('admin.add_notes_approval')}
                  value={approveForm.data.admin_notes}
                  onChange={(e) => approveForm.setData('admin_notes', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                {t('ui.cancel')}
              </Button>
              <Button onClick={onApprove} disabled={approveForm.processing}>
                {approveForm.processing ? t('admin.approving') : t('admin.approve_order')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => {
                setSelectedRejectionReason('');
                rejectForm.setData('admin_notes', '');
              }}
            >
              {t('admin.reject_order')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.reject_order_number', { id: orderId })}</DialogTitle>
              <DialogDescription>
                {t('admin.confirm_reject_order')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('admin.reason_for_rejection')} *</label>
                <Select
                  value={selectedRejectionReason}
                  onValueChange={(value) => {
                    setSelectedRejectionReason(value);
                    if (value !== 'Other') {
                      rejectForm.setData('admin_notes', value);
                    } else {
                      rejectForm.setData('admin_notes', '');
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('admin.select_reason_for_rejection')} />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRejectionReason === 'Other' && (
                <div>
                  <label className="text-sm font-medium">{t('admin.additional_details')} *</label>
                  <Textarea
                    placeholder={t('admin.provide_additional_details_rejection')}
                    value={rejectForm.data.admin_notes}
                    onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectDialogOpen(false);
                setSelectedRejectionReason('');
                rejectForm.setData('admin_notes', '');
              }}>
                {t('ui.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                disabled={rejectForm.processing || !selectedRejectionReason || (selectedRejectionReason === 'Other' && !rejectForm.data.admin_notes)}
              >
                {rejectForm.processing ? t('admin.rejecting') : t('admin.reject_order')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
