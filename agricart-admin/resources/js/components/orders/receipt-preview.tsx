import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ReceiptModal } from './receipt-modal';
import { Order } from '@/types/order';

interface ReceiptPreviewProps {
  orderId: number;
  customerEmail: string;
  order: Order;
}

export const ReceiptPreview = ({ orderId, customerEmail, order }: ReceiptPreviewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            📄 Preview Receipt Email
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Preview the receipt email that was sent to {customerEmail}
          </p>
        </CardContent>
      </Card>

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
      />
    </>
  );
};
