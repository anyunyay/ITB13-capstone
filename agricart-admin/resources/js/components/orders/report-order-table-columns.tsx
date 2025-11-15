import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Package, User, Calendar } from 'lucide-react';

export interface ReportOrder {
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

const getStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('admin.pending')}</Badge>;
    case 'approved':
      return <Badge variant="default" className="bg-green-100 text-green-800">{t('admin.approved')}</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('admin.rejected')}</Badge>;
    case 'delayed':
      return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('admin.delayed')}</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('admin.cancelled')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDeliveryStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">{t('admin.pending')}</Badge>;
    case 'ready_to_pickup':
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.ready_to_pickup')}</Badge>;
    case 'out_for_delivery':
      return <Badge variant="default">{t('admin.out_for_delivery')}</Badge>;
    case 'delivered':
      return <Badge variant="outline">{t('admin.delivered')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const createReportOrderTableColumns = (t: (key: string) => string): BaseTableColumn<ReportOrder>[] => [
  {
    key: 'id',
    label: t('admin.order_id_header'),
    icon: Package,
    sortable: true,
    align: 'center',
    maxWidth: '100px',
    render: (order) => (
      <Badge variant="outline" className="font-mono">
        #{order.id}
      </Badge>
    ),
  },
  {
    key: 'customer',
    label: t('admin.customer'),
    icon: User,
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (order) => (
      <div>
        <div className="font-medium text-sm">{order.customer.name}</div>
        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
        {order.customer.contact_number && (
          <div className="text-xs text-muted-foreground">{order.customer.contact_number}</div>
        )}
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
      <div className="font-semibold text-sm">
        ₱{Number(order.total_amount).toFixed(2)}
      </div>
    ),
  },
  {
    key: 'items',
    label: t('admin.items_header'),
    icon: Package,
    align: 'left',
    maxWidth: '200px',
    render: (order) => {
      const totalItems = order.audit_trail?.length || 0;
      return (
        <div className="text-sm">
          <div className="font-medium">{totalItems} items</div>
          {order.audit_trail && order.audit_trail.length > 0 && (
            <div className="text-muted-foreground text-xs">
              {order.audit_trail.slice(0, 2).map((item, index) => (
                <span key={item.id}>
                  {item.product.name}
                  {index < Math.min(2, order.audit_trail.length - 1) ? ', ' : ''}
                </span>
              ))}
              {order.audit_trail.length > 2 && (
                <span className="text-muted-foreground">
                  {' '}+{order.audit_trail.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: t('admin.status_header'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (order) => getStatusBadge(order.status, t),
  },
  {
    key: 'delivery_status',
    label: t('admin.delivery_status_header'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (order) => {
      if (order.status === 'approved') {
        return getDeliveryStatusBadge(order.delivery_status, t);
      }
      return <span className="text-muted-foreground text-sm">-</span>;
    },
  },
  {
    key: 'created_at',
    label: t('admin.date'),
    icon: Calendar,
    sortable: true,
    align: 'left',
    maxWidth: '150px',
    render: (order) => (
      <div className="text-sm">
        <div className="font-medium">
          {format(new Date(order.created_at), 'MMM dd, yyyy')}
        </div>
        <div className="text-muted-foreground">
          {format(new Date(order.created_at), 'HH:mm')}
        </div>
      </div>
    ),
  },
  {
    key: 'admin',
    label: t('admin.processed_by'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (order) => (
      <div className="text-sm">{order.admin?.name || t('admin.not_available')}</div>
    ),
  },
  {
    key: 'logistic',
    label: t('admin.logistic'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (order) => {
      if (order.logistic) {
        return (
          <div className="text-sm">
            <div className="font-medium">{order.logistic.name}</div>
            {order.logistic.contact_number && (
              <div className="text-xs text-muted-foreground">
                {order.logistic.contact_number}
              </div>
            )}
          </div>
        );
      }
      return <span className="text-muted-foreground text-sm">{t('admin.unassigned')}</span>;
    },
  },
];

// Mobile card component for report orders
export const ReportOrderMobileCard = ({ order, t }: { order: ReportOrder; t: (key: string) => string }) => {
  const totalItems = order.audit_trail?.length || 0;
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2.5 sm:mb-3 gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          #{order.id}
        </Badge>
        {getStatusBadge(order.status, t)}
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-border">
        <div className="flex items-start gap-2">
          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs sm:text-sm truncate">{order.customer.name}</div>
            <div className="text-xs text-muted-foreground truncate">{order.customer.email}</div>
            {order.customer.contact_number && (
              <div className="text-xs text-muted-foreground">{order.customer.contact_number}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
        </div>

        <div className="flex items-start gap-2 text-xs">
          <Package className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-medium">{totalItems} items</span>
            {order.audit_trail && order.audit_trail.length > 0 && (
              <span className="text-muted-foreground block truncate">
                {order.audit_trail[0].product.name}
                {order.audit_trail.length > 1 && ` +${order.audit_trail.length - 1} more`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-2.5 sm:mb-3">
        <div className="flex justify-between text-xs sm:text-sm items-center">
          <span className="text-muted-foreground">{t('admin.total_amount')}:</span>
          <span className="font-semibold text-sm sm:text-base">₱{Number(order.total_amount).toFixed(2)}</span>
        </div>

        {order.status === 'approved' && (
          <div className="flex justify-between text-xs sm:text-sm items-center gap-2">
            <span className="text-muted-foreground shrink-0">{t('admin.delivery_status_header')}:</span>
            {getDeliveryStatusBadge(order.delivery_status, t)}
          </div>
        )}
      </div>

      {(order.admin || order.logistic) && (
        <div className="pt-2.5 sm:pt-3 border-t border-border text-xs space-y-1">
          {order.admin && (
            <div className="text-muted-foreground truncate">
              <span className="font-medium">{t('admin.processed_by')}:</span> {order.admin.name}
            </div>
          )}
          {order.logistic && (
            <div className="text-muted-foreground truncate">
              <span className="font-medium">{t('admin.logistic')}:</span> {order.logistic.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
