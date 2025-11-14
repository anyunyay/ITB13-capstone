import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

export interface StaffReport {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    created_at: string;
    email_verified_at?: string;
    permissions: Permission[];
}

export const createStaffReportTableColumns = (t: (key: string) => string): BaseTableColumn<StaffReport>[] => [
    {
        key: 'id',
        label: 'Staff ID',
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (staff) => (
            <Badge variant="outline" className="font-mono">
                #{staff.id}
            </Badge>
        ),
    },
    {
        key: 'name',
        label: t('admin.name') || 'Name',
        icon: User,
        sortable: true,
        align: 'left',
        maxWidth: '200px',
        render: (staff) => (
            <div className="font-medium text-sm">{staff.name}</div>
        ),
    },
    {
        key: 'email',
        label: t('admin.email') || 'Email',
        icon: Mail,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (staff) => (
            <div className="text-sm text-muted-foreground">{staff.email}</div>
        ),
    },
    {
        key: 'contact_number',
        label: t('admin.contact') || 'Contact',
        icon: Phone,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (staff) => (
            <div className="text-sm">{staff.contact_number || '-'}</div>
        ),
    },
    {
        key: 'permissions',
        label: 'Permissions',
        icon: Shield,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (staff) => (
            <Badge variant="outline" className="font-mono">
                {staff.permissions.length}
            </Badge>
        ),
    },
    {
        key: 'created_at',
        label: 'Created At',
        icon: Calendar,
        sortable: true,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (staff) => (
            <div className="text-sm">
                {format(new Date(staff.created_at), 'MMM dd, yyyy')}
            </div>
        ),
    },
    {
        key: 'status',
        label: t('admin.status') || 'Status',
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (staff) => (
            <Badge variant={staff.email_verified_at ? 'default' : 'secondary'}>
                {staff.email_verified_at ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
            </Badge>
        ),
    },
];

// Mobile card component
export const StaffReportMobileCard = ({ staff, t }: { staff: StaffReport; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono">
                #{staff.id}
            </Badge>
            <Badge variant={staff.email_verified_at ? 'default' : 'secondary'}>
                {staff.email_verified_at ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
            </Badge>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{staff.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{staff.email}</span>
            </div>
            
            {staff.contact_number && (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{staff.contact_number}</span>
                </div>
            )}
            
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                    {format(new Date(staff.created_at), 'MMM dd, yyyy')}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                    {staff.permissions.length} Permissions
                </span>
            </div>
        </div>
        
        {staff.permissions.length > 0 && (
            <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                    {staff.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                        </Badge>
                    ))}
                    {staff.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{staff.permissions.length - 3}
                        </Badge>
                    )}
                </div>
            </div>
        )}
    </div>
);
