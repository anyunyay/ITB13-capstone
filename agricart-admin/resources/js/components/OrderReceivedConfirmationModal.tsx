import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import StarRating from '@/components/StarRating';

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
              Order Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Thank you for confirming your order. Your feedback helps us improve our service.
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
          <DialogTitle>Confirm Order Received</DialogTitle>
          <DialogDescription>
            Please confirm that you have received Order #{orderId} (₱{orderTotal.toFixed(2)}).
            We'd love to hear about your experience!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Rate Your Experience</Label>
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
              Additional Feedback (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience with the products, delivery, or any suggestions for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {feedback.length}/1000 characters
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Once confirmed, this order will be marked as received. 
              If you don't confirm within 3 days of delivery, it will be automatically confirmed.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Received
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
