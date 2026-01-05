import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { User, TrendingUp } from 'lucide-react';

export interface MemberSale {
  member_id: number;
  member_name: string;
  member_email: string;
  total_orders: number;
  total_revenue: number;
  total_coop_share: number;
  total_member_share: number;
  total_cogs: number;
  total_gross_profit: number;
  total_quantity_sold: number;
}

export const createMemberSalesTableColumns = (
  t: (key: string) => string,
  totalRevenue: number
): BaseTableColumn<MemberSale>[] => [
  {
    key: 'rank',
    label: t('admin.rank'),
    align: 'center',
    maxWidth: '80px',
    render: (member, index) => (
      <Badge variant={index < 3 ? "default" : "secondary"}>
        #{index + 1}
      </Badge>
    ),
  },
  {
    key: 'member_name',
    label: t('admin.member_name'),
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (member) => (
      <div>
        <div className="font-medium text-sm">{member.member_name}</div>
        <div className="text-xs text-muted-foreground">{member.member_email}</div>
      </div>
    ),
  },
  {
    key: 'total_orders',
    label: t('admin.total_orders'),
    sortable: true,
    align: 'center',
    maxWidth: '100px',
    render: (member) => (
      <div className="text-sm">{member.total_orders}</div>
    ),
  },
  {
    key: 'total_revenue',
    label: t('admin.total_revenue'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (member) => (
      <div className="font-semibold text-sm">
        ₱{Number(member.total_revenue || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'total_coop_share',
    label: t('admin.coop_share'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (member) => (
      <div className="font-semibold text-sm text-green-600">
        ₱{Number(member.total_coop_share || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'total_member_share',
    label: t('admin.revenue_column'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (member) => (
      <div className="font-semibold text-sm text-blue-600">
        ₱{Number(member.total_member_share || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'total_cogs',
    label: t('admin.cogs'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (member) => (
      <div className="font-semibold text-sm text-orange-600">
        ₱{Number(member.total_cogs || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'total_gross_profit',
    label: t('admin.gross_profit'),
    sortable: true,
    align: 'right',
    maxWidth: '120px',
    render: (member) => (
      <div className="font-semibold text-sm text-green-600">
        ₱{Number(member.total_gross_profit || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
    ),
  },
  {
    key: 'total_quantity_sold',
    label: t('admin.quantity_sold'),
    sortable: true,
    align: 'center',
    maxWidth: '100px',
    render: (member) => (
      <div className="text-sm">{member.total_quantity_sold}</div>
    ),
  },
  {
    key: 'average_revenue',
    label: t('admin.average_revenue'),
    sortable: false,
    align: 'right',
    maxWidth: '120px',
    render: (member) => {
      const memberOrders = Number(member.total_orders || 0);
      const averageRevenue = memberOrders > 0 
        ? Number(member.total_revenue || 0) / memberOrders 
        : 0;
      return (
        <div className="font-semibold text-sm">
          ₱{averageRevenue.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
      );
    },
  },
  {
    key: 'performance',
    label: t('admin.performance'),
    sortable: false,
    align: 'center',
    maxWidth: '150px',
    render: (member) => {
      const memberRevenue = Number(member.total_revenue || 0);
      const performancePercentage = totalRevenue > 0 
        ? (memberRevenue / totalRevenue) * 100 
        : 0;
      
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(performancePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground">
            {performancePercentage.toFixed(1)}%
          </span>
        </div>
      );
    },
  },
];

// Mobile card component for member sales
export const MemberSalesMobileCard = ({ 
  member, 
  index, 
  totalRevenue,
  t 
}: { 
  member: MemberSale; 
  index: number;
  totalRevenue: number;
  t: (key: string) => string;
}) => {
  const memberRevenue = Number(member.total_revenue || 0);
  const memberOrders = Number(member.total_orders || 0);
  const averageRevenue = memberOrders > 0 ? memberRevenue / memberOrders : 0;
  const performancePercentage = totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={index < 3 ? "default" : "secondary"}>
            #{index + 1}
          </Badge>
          <div>
            <div className="font-medium text-sm">{member.member_name}</div>
            <div className="text-xs text-muted-foreground">{member.member_email}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <div className="text-muted-foreground">{t('admin.total_orders')}</div>
          <div className="font-semibold">{member.total_orders}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t('admin.quantity_sold')}</div>
          <div className="font-semibold">{member.total_quantity_sold}</div>
        </div>
      </div>

      <div className="space-y-2 mb-3 pb-3 border-b border-border text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.total_revenue')}</span>
          <span className="font-semibold">
            ₱{memberRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.coop_share')}</span>
          <span className="font-semibold text-green-600">
            ₱{Number(member.total_coop_share || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.revenue_column')}</span>
          <span className="font-semibold text-blue-600">
            ₱{Number(member.total_member_share || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.cogs')}</span>
          <span className="font-semibold text-orange-600">
            ₱{Number(member.total_cogs || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.gross_profit')}</span>
          <span className="font-semibold text-green-600">
            ₱{Number(member.total_gross_profit || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.average_revenue')}</span>
          <span className="font-semibold">
            ₱{averageRevenue.toFixed(2)}
          </span>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">{t('admin.performance')}</span>
            <span className="font-semibold">{performancePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(performancePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
