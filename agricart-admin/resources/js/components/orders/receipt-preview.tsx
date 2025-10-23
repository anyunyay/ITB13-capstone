import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface ReceiptPreviewProps {
  orderId: number;
  customerEmail: string;
}

export const ReceiptPreview = ({ orderId, customerEmail }: ReceiptPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={route('admin.orders.receiptPreview', orderId)}>
          <Button className="w-full" variant="outline">
            📄 Preview Receipt Email
          </Button>
        </Link>
        <p className="text-xs text-gray-500 text-center">
          Preview the receipt email that was sent to {customerEmail}
        </p>
      </CardContent>
    </Card>
  );
};
