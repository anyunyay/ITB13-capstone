import { Package } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createReportOrderTableColumns, ReportOrderMobileCard, ReportOrder } from './report-order-table-columns';

interface ReportOrderTableProps {
  orders: ReportOrder[];
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

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
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
  }, [orders, sortBy, sortOrder]);

  // Create column definitions
  const columns = useMemo(() => createReportOrderTableColumns(t), [t]);

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
    <BaseTable
      data={sortedOrders}
      columns={columns}
      keyExtractor={(order) => order.id}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      renderMobileCard={(order) => <ReportOrderMobileCard order={order} t={t} />}
      emptyState={
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_orders_found')}</h3>
          <p className="text-muted-foreground">{t('admin.no_orders_match_filters')}</p>
        </div>
      }
    />
  );
}
