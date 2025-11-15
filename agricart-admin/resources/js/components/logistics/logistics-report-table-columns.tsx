import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';

interface Logistic {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  registration_date?: string;
  email_verified_at?: string;
  created_at: string;
}

export const createLogisticsReportTableColumns = (
  t: (key: string, params?: any) => string
): BaseTableColumn<Logistic>[] => [
  {
    key: 'id',
    label: t('admin.member_id'),
    sortable: true,
    render: (logistic) => (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        #{logistic.id}
      </Badge>
    )
  },
  {
    key: 'name',
    label: t('admin.name'),
    sortable: true,
    render: (logistic) => (
      <div className="font-medium text-foreground">{logistic.name}</div>
    )
  },
  {
    key: 'email',
    label: t('admin.email'),
    sortable: false,
    render: (logistic) => (
      <div className="text-sm text-muted-foreground">{logistic.email}</div>
    )
  },
  {
    key: 'contact_number',
    label: t('admin.contact'),
    sortable: false,
    render: (logistic) => (
      <div className="text-sm text-muted-foreground">
        {logistic.contact_number || t('admin.not_available')}
      </div>
    )
  },
  {
    key: 'address',
    label: t('admin.address'),
    sortable: false,
    render: (logistic) => (
      <div className="max-w-xs">
        <p className="text-sm text-muted-foreground truncate" title={logistic.address || t('admin.not_available')}>
          {logistic.address || t('admin.not_available')}
        </p>
      </div>
    )
  },
  {
    key: 'status',
    label: t('admin.status'),
    sortable: true,
    render: (logistic) => (
      logistic.email_verified_at ? (
        <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
          {t('admin.verified')}
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          {t('admin.pending')}
        </Badge>
      )
    )
  },
  {
    key: 'registration_date',
    label: t('admin.registration_date'),
    sortable: true,
    render: (logistic) => (
      <span className="text-sm text-muted-foreground">
        {logistic.registration_date ? dayjs(logistic.registration_date).format('MMM DD, YYYY') : t('admin.not_available')}
      </span>
    )
  },
  {
    key: 'email_verified_at',
    label: t('admin.email_verified'),
    sortable: true,
    render: (logistic) => (
      <span className="text-sm text-muted-foreground">
        {logistic.email_verified_at ? dayjs(logistic.email_verified_at).format('MMM DD, YYYY') : t('admin.not_verified')}
      </span>
    )
  }
];

// Mobile card component
interface LogisticsReportMobileCardProps {
  logistic: Logistic;
  t: (key: string, params?: any) => string;
}

export const LogisticsReportMobileCard = ({ logistic, t }: LogisticsReportMobileCardProps) => {
  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{logistic.name}</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-1">
            #{logistic.id}
          </Badge>
        </div>
        {logistic.email_verified_at ? (
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
            {t('admin.verified')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
            {t('admin.pending')}
          </Badge>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{logistic.email}</p>
        <p className="text-sm text-muted-foreground">
          {logistic.contact_number || t('admin.not_available')}
        </p>
      </div>

      {/* Address */}
      {logistic.address && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{t('admin.address')}: </span>
          {logistic.address}
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">{t('admin.registration_date')}</p>
          <p className="text-sm font-medium text-foreground">
            {logistic.registration_date ? dayjs(logistic.registration_date).format('MMM DD, YYYY') : t('admin.not_available')}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('admin.email_verified')}</p>
          <p className="text-sm font-medium text-foreground">
            {logistic.email_verified_at ? dayjs(logistic.email_verified_at).format('MMM DD, YYYY') : t('admin.not_verified')}
          </p>
        </div>
      </div>
    </div>
  );
};
