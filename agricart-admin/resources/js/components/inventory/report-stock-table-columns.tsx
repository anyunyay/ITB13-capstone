import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Package, User, Calendar, PackageCheck, PackageOpen, PackageX } from 'lucide-react';
import dayjs from 'dayjs';

export interface ReportStock {
  id: number;
  product: {
    name: string;
    produce_type: string;
  };
  quantity: number;
  category: string;
  member: {
    name: string;
    email: string;
  };
  removed_at?: string;
  created_at: string;
  notes?: string;
}

const getStatusBadge = (stock: ReportStock, t: (key: string) => string) => {
  if (stock.removed_at) {
    return <Badge variant="destructive" className="bg-red-600 text-white flex items-center gap-1"><PackageX className="h-3 w-3" />{t('admin.removed')}</Badge>;
  } else if (stock.quantity === 0) {
    return <Badge variant="secondary" className="bg-gray-600 text-white flex items-center gap-1"><PackageOpen className="h-3 w-3" />{t('admin.sold')}</Badge>;
  } else {
    return <Badge variant="default" className="bg-green-600 text-white flex items-center gap-1"><PackageCheck className="h-3 w-3" />{t('admin.available')}</Badge>;
  }
};

export const createReportStockTableColumns = (t: (key: string) => string): BaseTableColumn<ReportStock>[] => [
  {
    key: 'id',
    label: t('admin.stock_id'),
    icon: Package,
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (stock) => (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        #{stock.id}
      </Badge>
    ),
  },
  {
    key: 'product_name',
    label: t('admin.product'),
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (stock) => (
      <div>
        <div className="font-medium text-foreground">{stock.product.name}</div>
        <div className="text-sm text-muted-foreground">{stock.product.produce_type}</div>
      </div>
    ),
  },
  {
    key: 'quantity',
    label: t('admin.quantity'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (stock) => (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        {stock.quantity} {stock.quantity === 1 ? 'unit' : 'units'}
      </Badge>
    ),
  },
  {
    key: 'category',
    label: t('admin.category'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (stock) => (
      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
        {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
      </Badge>
    ),
  },
  {
    key: 'member_name',
    label: t('admin.member'),
    icon: User,
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (stock) => (
      <div>
        <div className="font-medium text-foreground">{stock.member.name}</div>
        <div className="text-sm text-muted-foreground">{stock.member.email}</div>
      </div>
    ),
  },
  {
    key: 'status',
    label: t('admin.status'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (stock) => getStatusBadge(stock, t),
  },
  {
    key: 'created_at',
    label: t('admin.created'),
    icon: Calendar,
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (stock) => (
      <span className="text-sm text-muted-foreground">
        {dayjs(stock.created_at).format('MMM DD, YYYY')}
      </span>
    ),
  },
  {
    key: 'notes',
    label: t('admin.notes'),
    sortable: false,
    align: 'left',
    maxWidth: '200px',
    render: (stock) => (
      stock.notes ? (
        <p className="text-sm text-muted-foreground truncate" title={stock.notes}>
          {stock.notes}
        </p>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    ),
  },
];

// Mobile card component for report stocks
export const ReportStockMobileCard = ({ stock, t }: { stock: ReportStock; t: (key: string) => string }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 space-y-2.5 sm:space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              #{stock.id}
            </Badge>
            {getStatusBadge(stock, t)}
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{stock.product.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{stock.product.produce_type}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div>
          <span className="text-muted-foreground block mb-1">{t('admin.quantity')}:</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
            {stock.quantity} {stock.quantity === 1 ? 'unit' : 'units'}
          </Badge>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1">{t('admin.category')}:</span>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
            {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm pt-2 border-t border-border">
        <div>
          <span className="text-muted-foreground">{t('admin.member')}:</span>
          <div className="font-medium text-foreground truncate">{stock.member.name}</div>
          <div className="text-xs text-muted-foreground truncate">{stock.member.email}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('admin.created')}:</span>
          <span className="text-foreground font-medium">{dayjs(stock.created_at).format('MMM DD, YYYY')}</span>
        </div>
        {stock.notes && (
          <div>
            <span className="text-muted-foreground">{t('admin.notes')}:</span>
            <p className="text-foreground mt-0.5 line-clamp-2">{stock.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
