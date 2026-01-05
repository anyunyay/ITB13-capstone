import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import { Users, Mail, Phone, Shield, Calendar } from 'lucide-react';

export interface Permission {
  id: number;
  name: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  created_at: string;
  email_verified_at?: string;
  permissions: Permission[];
}

const getStatusBadge = (staff: StaffMember) => {
  if (staff.email_verified_at) {
    return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
  } else {
    return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>;
  }
};

export const createStaffReportTableColumns = (t: (key: string) => string): BaseTableColumn<StaffMember>[] => [
  {
    key: 'id',
    label: t('staff.staff_id'),
    sortable: true,
    align: 'center',
    maxWidth: '100px',
    render: (staff) => (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        #{staff.id}
      </Badge>
    ),
  },
  {
    key: 'name',
    label: t('staff.name'),
    sortable: true,
    align: 'left',
    maxWidth: '180px',
    render: (staff) => (
      <div className="font-medium text-foreground">{staff.name}</div>
    ),
  },
  {
    key: 'email',
    label: t('staff.email'),
    sortable: false,
    align: 'left',
    maxWidth: '200px',
    render: (staff) => (
      <div className="text-sm text-muted-foreground">{staff.email}</div>
    ),
  },
  {
    key: 'contact_number',
    label: t('staff.contact'),
    sortable: false,
    align: 'center',
    maxWidth: '150px',
    render: (staff) => (
      <div className="text-sm text-muted-foreground">{staff.contact_number || 'N/A'}</div>
    ),
  },
  {
    key: 'permissions',
    label: t('staff.permissions'),
    sortable: false,
    align: 'left',
    maxWidth: '250px',
    render: (staff) => (
      <div className="max-w-xs">
        {staff.permissions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {staff.permissions.slice(0, 2).map((permission) => (
              <Badge key={permission.id} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                {permission.name}
              </Badge>
            ))}
            {staff.permissions.length > 2 && (
              <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-muted/20">
                +{staff.permissions.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">None</span>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    label: t('staff.status'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (staff) => getStatusBadge(staff),
  },
  {
    key: 'created_at',
    label: t('staff.created'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (staff) => (
      <div className="text-sm text-muted-foreground">
        {dayjs(staff.created_at).format('MMM DD, YYYY')}
      </div>
    ),
  },
];

// Mobile card component for staff report
export const StaffReportMobileCard = ({ staff, t }: { staff: StaffMember; t: (key: string) => string }) => (
  <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-foreground">{staff.name}</div>
          <div className="text-xs text-muted-foreground">
            {t('staff.staff_id')}: #{staff.id}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(staff)}
      </div>
    </div>

    <div className="space-y-2 mb-3 pb-3 border-b border-border">
      <div className="flex items-center gap-2 text-sm">
        <Mail className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{staff.email}</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{staff.contact_number || 'N/A'}</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          {dayjs(staff.created_at).format('MMM DD, YYYY')}
        </span>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Shield className="h-3 w-3" />
        {t('staff.permissions')} ({staff.permissions.length})
      </div>
      {staff.permissions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {staff.permissions.slice(0, 3).map((permission) => (
            <Badge key={permission.id} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
              {permission.name}
            </Badge>
          ))}
          {staff.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-muted/20">
              +{staff.permissions.length - 3} more
            </Badge>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('staff.no_permissions')}</p>
      )}
    </div>
  </div>
);
