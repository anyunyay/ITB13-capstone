import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export interface LogisticReport {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    registration_date?: string;
    email_verified_at?: string;
    created_at: string;
}

export const createLogisticsReportTableColumns = (t: (key: string) => string): BaseTableColumn<LogisticReport>[] => [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (logistic) => (
            <Badge variant="outline" className="font-mono">
                #{logistic.id}
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
        render: (logistic) => (
            <div className="font-medium text-sm">{logistic.name}</div>
        ),
    },
    {
        key: 'email',
        label: t('admin.email') || 'Email',
        icon: Mail,
        sortable: true,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm text-muted-foreground">{logistic.email}</div>
        ),
    },
    {
        key: 'contact_number',
        label: t('admin.contact') || 'Contact',
        icon: Phone,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm">{logistic.contact_number || '-'}</div>
        ),
    },
    {
        key: 'address',
        label: t('admin.address') || 'Address',
        icon: MapPin,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm text-muted-foreground truncate">
                {logistic.address || '-'}
            </div>
        ),
    },
    {
        key: 'registration_date',
        label: t('admin.registration_date') || 'Registration Date',
        icon: Calendar,
        sortable: true,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm">
                {logistic.registration_date 
                    ? format(new Date(logistic.registration_date), 'MMM dd, yyyy')
                    : '-'
                }
            </div>
        ),
    },
    {
        key: 'status',
        label: t('admin.status') || 'Status',
        align: 'center',
        maxWidth: '120px',
        render: (logistic) => (
            <Badge variant={logistic.email_verified_at ? 'default' : 'secondary'}>
                {logistic.email_verified_at ? (t('admin.verified') || 'Verified') : (t('admin.pending') || 'Pending')}
            </Badge>
        ),
    },
];

// Mobile card component
export const LogisticsReportMobileCard = ({ logistic, t }: { logistic: LogisticReport; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono">
                #{logistic.id}
            </Badge>
            <Badge variant={logistic.email_verified_at ? 'default' : 'secondary'}>
                {logistic.email_verified_at ? (t('admin.verified') || 'Verified') : (t('admin.pending') || 'Pending')}
            </Badge>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{logistic.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{logistic.email}</span>
            </div>
            
            {logistic.contact_number && (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{logistic.contact_number}</span>
                </div>
            )}
            
            {logistic.address && (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{logistic.address}</span>
                </div>
            )}
            
            {logistic.registration_date && (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                        {format(new Date(logistic.registration_date), 'MMM dd, yyyy')}
                    </span>
                </div>
            )}
        </div>
    </div>
);
