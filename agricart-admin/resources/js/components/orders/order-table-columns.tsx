import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Order } from '@/types/orders';
import type { BaseTableColumn } from '@/components/common/base-table';

export const createOrderTableColumns = (t: (key: string) => string): BaseTableColumn<Order>[] => [
  {
    key: 'id',
    label: t('admin.order_id'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (order) => (
      <Badge variant="outline">#{order.id}</Badge>
    ),
  },
  {
    key: 'customer',
    label: t('admin.customer'),
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (order) => (
      <div>
        <div className="font-medium">{order.customer.name}</div>
        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
      </div>
    ),
  },
  {
    key: 'total_amount',
    label: t('admin.total_amount'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (order) => (
      <div className="font-semibold">₱{order.total_amount.toFixed(2)}</div>
    ),
  },
  {
    key: 'status',
    label: t('admin.status'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (order) => {
      const statusMap: Record<string, { className: string; label: string }> = {
        pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: t('admin.pending') },
        approved: { className: 'status-approved', label: t('admin.approved') },
        rejected: { className: 'status-rejected', label: t('admin.rejected') },
        expired: { className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: t('admin.expired') },
        delayed: { className: 'status-delayed', label: t('admin.delayed') },
        cancelled: { className: 'status-cancelled', label: t('admin.cancelled') },
      };
      const config = statusMap[order.status] || { className: 'bg-gray-100 text-gray-600', label: order.status };
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    key: 'delivery_status',
    label: t('admin.delivery_status'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (order) => {
      // Show N/A for rejected orders
      if (order.status === 'rejected') {
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">N/A</Badge>;
      }
      
      const deliveryStatusMap: Record<string, { className: string; label: string }> = {
        pending: { className: 'status-pending', label: t('admin.pending') },
        out_for_delivery: { className: 'status-out-for-delivery', label: t('admin.out_for_delivery') },
        delivered: { className: 'status-delivered', label: t('admin.delivered') },
        ready_to_pickup: { className: 'status-ready', label: t('admin.ready_to_pickup') },
      };
      const config = deliveryStatusMap[order.delivery_status] || { className: 'bg-gray-100 text-gray-600', label: order.delivery_status };
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    key: 'created_at',
    label: t('admin.order_date'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (order) => (
      <div>
        <div className="text-sm">{format(new Date(order.created_at), 'MMM dd, yyyy')}</div>
        <div className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'HH:mm')}</div>
      </div>
    ),
  },
  {
    key: 'actions',
    label: t('admin.actions'),
    sortable: false,
    align: 'center',
    maxWidth: '150px',
    render: (order) => (
      <PermissionGate permission="view orders">
        <Link href={route('admin.orders.show', order.id)}>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Eye className="h-4 w-4 mr-2" />
            {t('ui.view')}
          </Button>
        </Link>
      </PermissionGate>
    ),
  },
];

export const OrderMobileCard = ({ order, t }: { order: Order; t: (key: string) => string }) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: t('admin.pending') },
      approved: { className: 'status-approved', label: t('admin.approved') },
      rejected: { className: 'status-rejected', label: t('admin.rejected') },
      expired: { className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: t('admin.expired') },
      delayed: { className: 'status-delayed', label: t('admin.delayed') },
      cancelled: { className: 'status-cancelled', label: t('admin.cancelled') },
    };
    const config = statusMap[status] || { className: 'bg-gray-100 text-gray-600', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDeliveryStatusBadge = (status: string, orderStatus: string) => {
    // Show N/A for rejected orders
    if (orderStatus === 'rejected') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">N/A</Badge>;
    }
    
    const deliveryStatusMap: Record<string, { className: string; label: string }> = {
      pending: { className: 'status-pending', label: t('admin.pending') },
      out_for_delivery: { className: 'status-out-for-delivery', label: t('admin.out_for_delivery') },
      delivered: { className: 'status-delivered', label: t('admin.delivered') },
      ready_to_pickup: { className: 'status-ready', label: t('admin.ready_to_pickup') },
    };
    const config = deliveryStatusMap[status] || { className: 'bg-gray-100 text-gray-600', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-4 space-y-3 bg-card border border-border rounded-lg shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-px">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-base">#{order.id}</div>
          <div className="text-sm text-muted-foreground">{order.customer.name}</div>
          <div className="text-xs text-muted-foreground">{order.customer.email}</div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          {getStatusBadge(order.status)}
          {getDeliveryStatusBadge(order.delivery_status, order.status)}
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.total_amount')}:</span>
          <span className="font-semibold">₱{order.total_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.order_date')}:</span>
          <span>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      </div>

      <PermissionGate permission="view orders">
        <Link href={route('admin.orders.show', order.id)} className="block">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            {t('admin.view_details')}
          </Button>
        </Link>
      </PermissionGate>
    </div>
  );
};
