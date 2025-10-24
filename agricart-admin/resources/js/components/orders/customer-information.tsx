import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Customer {
  name: string;
  email: string;
  contact_number?: string;
}

interface CustomerInformationProps {
  customer: Customer;
  deliveryAddress?: string;
}

export const CustomerInformation = ({ customer, deliveryAddress }: CustomerInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm text-foreground font-medium">{customer.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm text-foreground">{customer.email}</p>
          </div>
          {customer.contact_number && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
              <p className="text-sm text-foreground">{customer.contact_number}</p>
            </div>
          )}
          {deliveryAddress && (
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
              <p className="text-sm text-foreground leading-relaxed">{deliveryAddress}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
