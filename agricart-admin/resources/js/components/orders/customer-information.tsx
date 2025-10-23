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
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-sm">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{customer.email}</p>
          </div>
          {customer.contact_number && (
            <div>
              <p className="text-sm font-medium text-gray-500">Contact Number</p>
              <p className="text-sm">{customer.contact_number}</p>
            </div>
          )}
          {deliveryAddress && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Delivery Address</p>
              <p className="text-sm">{deliveryAddress}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
