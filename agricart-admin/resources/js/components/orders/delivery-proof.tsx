import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DeliveryProofProps {
  deliveryProofImage: string;
  deliveredTime?: string;
  orderId: number;
  onViewFullSize: () => void;
}

export const DeliveryProof = ({ 
  deliveryProofImage, 
  deliveredTime, 
  orderId, 
  onViewFullSize 
}: DeliveryProofProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = deliveryProofImage;
    link.download = `delivery-proof-order-${orderId}.jpg`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Proof</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Delivery confirmed with proof of delivery</span>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Proof of Delivery</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewFullSize}
                >
                  🔍 View Full Size
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  📥 Download
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src={deliveryProofImage}
                alt="Delivery proof"
                className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/fallback-photo.png';
                  target.alt = 'Delivery proof not available';
                }}
              />
            </div>
            
            {deliveredTime && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Delivered on {format(new Date(deliveredTime), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
