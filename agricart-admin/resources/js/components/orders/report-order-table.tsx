import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
  };
  total_amount: number;
  subtotal: number;
  status: string;
  delivery_status: string;
  created_at: string;
  admin?: {
    name: string;
  };
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>;
}

interface ReportOrderTableProps {
  orders: Order[];
}

export function ReportOrderTable({ orders }: ReportOrderTableProps) {
  const t = useTranslation();
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ?
      <ArrowUp className="h-4 w-4 ml-1" /> :
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'total_amount':
        comparison = a.total_amount - b.total_amount;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'delivery_status':
        comparison = a.delivery_status.localeCompare(b.delivery_status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'admin':
        const adminA = a.admin?.name || '';
        const adminB = b.admin?.name || '';
        comparison = adminA.localeCompare(adminB);
        break;
      case 'logistic':
        const logisticA = a.logistic?.name || '';
        const logisticB = b.logistic?.name || '';
        comparison = logisticA.localeCompare(logisticB);
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.delayed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('admin.pending')}</Badge>;
      case 'ready_to_pickup':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.ready_for_pickup')}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">{t('admin.out_for_delivery')}</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('admin.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Mobile Card View - Hidden on md and up */}
      <div className="md:hidden space-y-3">
        {sortedOrders.map((order) => (
          <div 
            key={order.id}
            className="bg-card border border-border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                  #{order.id}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {getStatusBadge(order.status)}
                {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
              </div>
            </div>

            <div className="space-y-2 mb-3 pb-3 border-b border-border">
              <div className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-foreground">{order.customer.name}</div>
                <div className="text-xs text-muted-foreground truncate">{order.customer.email}</div>
              </div>

              {order.admin && (
                <div className="text-xs">
                  <span className="text-muted-foreground">{t('admin.processed_by')}: </span>
                  <span className="text-foreground">{order.admin.name}</span>
                </div>
              )}

              {order.logistic && (
                <div className="text-xs">
                  <span className="text-muted-foreground">{t('admin.logistic')}: </span>
                  <span className="text-foreground">{order.logistic.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('admin.total_amount')}:</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                ₱{Number(order.total_amount).toFixed(2)}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50">
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('id')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.order_id_header')}
                  {getSortIcon('id')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customer')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.customer')}
                  {getSortIcon('customer')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('total_amount')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.total_amount')}
                  {getSortIcon('total_amount')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.status')}
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('delivery_status')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.delivery_status')}
                  {getSortIcon('delivery_status')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.created')}
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('admin')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.processed_by')}
                  {getSortIcon('admin')}
                </Button>
              </TableHead>
              <TableHead className="text-center py-3 px-4 font-semibold text-foreground">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('logistic')}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
                >
                  {t('admin.logistic')}
                  {getSortIcon('logistic')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order, index) => (
              <TableRow 
                key={order.id} 
                className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
              >
                <TableCell className="py-3 px-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    #{order.id}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground">{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    ₱{Number(order.total_amount).toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-4">
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {order.delivery_status ? getDeliveryStatusBadge(order.delivery_status) : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="max-w-xs">
                    {order.admin ? (
                      <p className="text-sm text-foreground">{order.admin.name}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="max-w-xs">
                    {order.logistic ? (
                      <p className="text-sm text-foreground">{order.logistic.name}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
