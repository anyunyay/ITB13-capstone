import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, Trash2, Shield } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Staff } from '../../types/staff';

const getPermissionDisplayName = (permission: string) => {
  const permissionMap: { [key: string]: string } = {
    'view inventory': 'View Inventory',
    'create products': 'Create Products',
    'edit products': 'Edit Products',
    'view archive': 'View Archive',
    'archive products': 'Archive Products',
    'unarchive products': 'Unarchive Products',
    'view stocks': 'View Stocks',
    'create stocks': 'Create Stocks',
    'edit stocks': 'Edit Stocks',
    'view sold stock': 'View Sold Stock',
    'view stock trail': 'View Stock Trail',
    'view orders': 'View Orders',
    'manage orders': 'Manage Orders',
    'approve orders': 'Approve Orders',
    'reject orders': 'Reject Orders',
    'process orders': 'Process Orders',
    'assign logistics': 'Assign Logistics',
    'mark orders urgent': 'Mark Urgent',
    'unmark orders urgent': 'Unmark Urgent',
    'view order receipts': 'View Receipts',
    'view sales': 'View Sales',
    'view member sales': 'View Member Sales',
    'export sales data': 'Export Sales',
    'view logistics': 'View Logistics',
    'create logistics': 'Create Logistics',
    'edit logistics': 'Edit Logistics',
    'deactivate logistics': 'Deactivate Logistics',
    'reactivate logistics': 'Reactivate Logistics',
    'generate order report': 'Order Reports',
    'generate logistics report': 'Logistics Reports',
    'generate inventory report': 'Inventory Reports',
    'generate sales report': 'Sales Reports'
  };
  return permissionMap[permission] || permission;
};

export const createStaffTableColumns = (
  t: (key: string, params?: any) => string,
  processing: boolean,
  onDelete: (staff: Staff) => void
): BaseTableColumn<Staff>[] => [
  {
    key: 'id',
    label: t('staff.id'),
    sortable: true,
    render: (staff) => (
      <span className="text-sm text-muted-foreground">{staff.id}</span>
    )
  },
  {
    key: 'name',
    label: t('staff.name'),
    sortable: true,
    render: (staff) => (
      <div className="text-sm font-medium text-foreground">{staff.name}</div>
    )
  },
  {
    key: 'email',
    label: t('staff.email'),
    sortable: false,
    render: (staff) => (
      <span className="text-sm text-muted-foreground">{staff.email}</span>
    )
  },
  {
    key: 'contact_number',
    label: t('staff.contact'),
    sortable: false,
    render: (staff) => (
      <span className="text-sm text-muted-foreground">
        {staff.contact_number || t('admin.na')}
      </span>
    )
  },
  {
    key: 'address',
    label: t('staff.address'),
    sortable: false,
    render: (staff) => (
      <span className="text-sm text-muted-foreground">
        {staff.default_address
          ? `${staff.default_address.street}, ${staff.default_address.barangay}, ${staff.default_address.city}, ${staff.default_address.province}`
          : t('admin.na')}
      </span>
    )
  },
  {
    key: 'permissions',
    label: t('staff.permissions'),
    sortable: false,
    render: (staff) => (
      <div className="flex flex-wrap gap-1">
        {staff.permissions.length > 0 ? (
          <>
            {staff.permissions.slice(0, 3).map((permission) => (
              <Badge
                key={permission.name}
                variant="secondary"
                className="text-xs gap-1"
              >
                <Shield className="h-3 w-3" />
                {getPermissionDisplayName(permission.name)}
              </Badge>
            ))}
            {staff.permissions.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs">
                      +{staff.permissions.length - 3} more
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      {staff.permissions.slice(3).map((permission) => (
                        <div key={permission.name} className="text-sm">
                          {getPermissionDisplayName(permission.name)}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">{t('staff.no_permissions')}</span>
        )}
      </div>
    )
  },
  {
    key: 'status',
    label: t('staff.status'),
    sortable: true,
    render: (staff) => (
      staff.email_verified_at ? (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {t('staff.active')}
        </Badge>
      ) : (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          {t('staff.inactive')}
        </Badge>
      )
    )
  },
  {
    key: 'created_at',
    label: t('staff.created'),
    sortable: true,
    render: (staff) => (
      <span className="text-sm text-muted-foreground">
        {new Date(staff.created_at).toLocaleDateString()}
      </span>
    )
  },
  {
    key: 'actions',
    label: t('staff.actions'),
    sortable: false,
    render: (staff) => (
      <div className="flex gap-2">
        <PermissionGate permission="edit staffs">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
          >
            <Link href={route('staff.edit', staff.id)}>
              <Edit className="h-4 w-4" />
              {t('ui.edit')}
            </Link>
          </Button>
        </PermissionGate>
        <PermissionGate permission="delete staffs">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(staff)}
            disabled={processing}
            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
          >
            <Trash2 className="h-4 w-4" />
            {t('ui.delete')}
          </Button>
        </PermissionGate>
      </div>
    )
  }
];

// Mobile card component
interface StaffMobileCardProps {
  staff: Staff;
  t: (key: string, params?: any) => string;
  processing: boolean;
  onDelete: (staff: Staff) => void;
}

export const StaffMobileCard = ({ staff, t, processing, onDelete }: StaffMobileCardProps) => {
  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{staff.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {staff.id}</p>
        </div>
        {staff.email_verified_at ? (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {t('staff.active')}
          </Badge>
        ) : (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            {t('staff.inactive')}
          </Badge>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{staff.email}</p>
        <p className="text-sm text-muted-foreground">
          {staff.contact_number || t('admin.na')}
        </p>
      </div>

      {/* Address */}
      {staff.default_address && (
        <div className="text-sm text-muted-foreground">
          {staff.default_address.street}, {staff.default_address.barangay}, {staff.default_address.city}, {staff.default_address.province}
        </div>
      )}

      {/* Permissions */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">{t('staff.permissions')}</p>
        <div className="flex flex-wrap gap-1">
          {staff.permissions.length > 0 ? (
            <>
              {staff.permissions.slice(0, 2).map((permission) => (
                <Badge key={permission.name} variant="secondary" className="text-xs">
                  {getPermissionDisplayName(permission.name)}
                </Badge>
              ))}
              {staff.permissions.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{staff.permissions.length - 2} more
                </Badge>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">{t('staff.no_permissions')}</span>
          )}
        </div>
      </div>

      {/* Created Date */}
      <p className="text-xs text-muted-foreground">
        {t('staff.created')}: {new Date(staff.created_at).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <PermissionGate permission="edit staffs">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href={route('staff.edit', staff.id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('ui.edit')}
            </Link>
          </Button>
        </PermissionGate>
        <PermissionGate permission="delete staffs">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(staff)}
            disabled={processing}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('ui.delete')}
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
};
