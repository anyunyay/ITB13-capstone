import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, User, Calendar, Package } from 'lucide-react';

export interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  subtotal?: number;
  coop_share?: number;
  member_share: number;
  cogs: number;
  gross_profit: number;
  delivered_at: string;
  admin?: {
    name: string;
  };
  logistic?: {
    name: string;
  };
}

export const createSalesTableColumns = (t: (key: string) => string): BaseTableColumn<Sale>[] => [
  {
    key: 'id',
    label: t('admin.sale_id'),
    sortable: true,
    align: 'center',
    maxWidth: '100px',
    render: (sale) => (
      <Badge variant="outline" className="font-mono">
        #{sale.id}
      </Badge>
    ),
  },
  {
    key: 'customer',
    label: t('admin.customer'),
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (sale) => (
      <div>
        <div className="font-medium text-sm">{sale.customer.name}</div>
        <div className="text-xs text-muted-foreground">{sale.customer.email}</div>
      </div>
    ),
  },
  {
    key: 'total_amount',
    label: t('admin.total_amount'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (sale) => (
      <div className="font-semibold text-sm">
        ₱{Number(sale.total_amount).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'coop_share',
    label: t('admin.coop_share'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (sale) => (
      <div className="font-semibold text-sm text-green-600">
        ₱{Number(sale.coop_share || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'member_share',
    label: t('admin.revenue_column'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (sale) => (
      <div className="font-semibold text-sm text-blue-600">
        ₱{Number(sale.member_share || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'cogs',
    label: t('admin.cogs'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (sale) => (
      <div className="font-semibold text-sm text-orange-600">
        ₱{Number(sale.cogs || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'gross_profit',
    label: t('admin.gross_profit'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (sale) => (
      <div className="font-semibold text-sm text-green-600">
        ₱{Number(sale.gross_profit || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'delivered_at',
    label: t('admin.delivered_date'),
    sortable: true,
    align: 'left',
    maxWidth: '150px',
    render: (sale) => (
      <div className="text-sm">
        {format(new Date(sale.delivered_at), 'MMM dd, yyyy HH:mm')}
      </div>
    ),
  },
  {
    key: 'admin',
    label: t('admin.processed_by'),
    align: 'center',
    maxWidth: '120px',
    render: (sale) => (
      <div className="text-sm">{sale.admin?.name || t('admin.not_available')}</div>
    ),
  },
  {
    key: 'logistic',
    label: t('admin.logistic'),
    align: 'center',
    maxWidth: '120px',
    render: (sale) => (
      <div className="text-sm">{sale.logistic?.name || t('admin.not_available')}</div>
    ),
  },
];

// Mobile card component for sales
export const SalesMobileCard = ({ sale, t }: { sale: Sale; t: (key: string) => string }) => (
  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <Badge variant="outline" className="font-mono">
        #{sale.id}
      </Badge>
      <div className="text-sm font-semibold">
        ₱{Number(sale.total_amount).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    </div>

    <div className="space-y-2 mb-3 pb-3 border-b border-border">
      <div className="flex items-center gap-2">
        <User className="h-3 w-3 text-muted-foreground" />
        <div className="flex-1">
          <div className="font-medium text-sm">{sale.customer.name}</div>
          <div className="text-xs text-muted-foreground">{sale.customer.email}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{format(new Date(sale.delivered_at), 'MMM dd, yyyy HH:mm')}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>
        <div className="text-muted-foreground">{t('admin.coop_share')}</div>
        <div className="font-semibold text-green-600">
          ₱{Number(sale.coop_share || 0).toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground">{t('admin.revenue_column')}</div>
        <div className="font-semibold text-blue-600">
          ₱{Number(sale.member_share || 0).toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground">{t('admin.cogs')}</div>
        <div className="font-semibold text-orange-600">
          ₱{Number(sale.cogs || 0).toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground">{t('admin.gross_profit')}</div>
        <div className="font-semibold text-green-600">
          ₱{Number(sale.gross_profit || 0).toFixed(2)}
        </div>
      </div>
    </div>

    {(sale.admin || sale.logistic) && (
      <div className="mt-3 pt-3 border-t border-border text-xs">
        {sale.admin && (
          <div className="text-muted-foreground">
            {t('admin.processed_by')}: {sale.admin.name}
          </div>
        )}
        {sale.logistic && (
          <div className="text-muted-foreground">
            {t('admin.logistic')}: {sale.logistic.name}
          </div>
        )}
      </div>
    )}
  </div>
);
