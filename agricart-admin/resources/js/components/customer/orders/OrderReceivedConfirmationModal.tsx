import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import StarRating from '@/components/customer/products/StarRating';
import { useTranslation } from '@/hooks/use-translation';

interface OrderReceivedConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTotal: number;
}

export default function OrderReceivedConfirmationModal({
  isOpen,
  onClose,
  orderId,
  orderTotal
}: OrderReceivedConfirmationModalProps) {
  const t = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    router.post(`/customer/orders/${orderId}/confirm-received`, {
      rating: rating > 0 ? rating : null,
      feedback: feedback.trim() || null
    }, {
      onSuccess: () => {
        setIsConfirmed(true);
        setTimeout(() => {
          onClose();
          setIsConfirmed(false);
          setRating(0);
          setFeedback('');
        }, 2000);
      },
      onError: (errors) => {
        console.error('Confirmation failed:', errors);
        setIsSubmitting(false);
      }
    });
  };

  const handleClose = () => {
    if (!isSubmitting && !isConfirmed) {
      onClose();
      setRating(0);
      setFeedback('');
    }
  };

  if (isConfirmed) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              {t('customer.order_confirmed')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('customer.thank_you_feedback')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('customer.confirm_order_received_title')}</DialogTitle>
          <DialogDescription>
            {t('customer.confirm_order_description', { order_id: orderId, total: orderTotal.toFixed(2) })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('customer.rate_your_experience')}</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              maxRating={5}
              size="lg"
              interactive={true}
              showLabel={true}
            />
          </div>
          
          {/* Feedback Section */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-base font-semibold">
              {t('customer.additional_feedback')}
            </Label>
            <Textarea
              id="feedback"
              placeholder={t('customer.feedback_placeholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {feedback.length}/1000 {t('customer.characters')}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t('customer.note')}</strong> {t('customer.order_confirmation_note')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('customer.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('customer.confirming')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('customer.confirm_order_received')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
