import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface SaleItem {
  product_name: string;
  produce_type: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Sale {
  id: number;
  date: string;
  total_price: number;
  items: SaleItem[];
}

interface HistoryProps {
  sales: Sale[];
}

export default function History({ sales }: HistoryProps) {

  return (
    <AppHeaderLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        {sales.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">No orders found.</Card>
        ) : (
          sales.map((sale: Sale) => (
            <Card key={sale.id} className="mb-6 p-4">
              <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <span className="font-medium">Order ID:</span> #{sale.id}<br />
                  <span className="font-medium">Date:</span> {sale.date}
                </div>
                <div className="text-lg font-semibold text-primary">
                  Total: ₱{sale.total_price}
                </div>
              </div>
              <Table className="mt-2 border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item: SaleItem, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.produce_type}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₱{item.unit_price}</TableCell>
                      <TableCell>₱{item.subtotal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))
        )}
      </div>
    </AppHeaderLayout>
  );
}
