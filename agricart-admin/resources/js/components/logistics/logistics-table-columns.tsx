import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { Logistic } from '@/types/logistics';

export const createLogisticsTableColumns = (t: (key: string) => string): BaseTableColumn<Logistic>[] => [
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
        render: (logistic) => (
            <div className="text-sm">{logistic.contact_number || '-'}</div>
        ),
    },
    {
        key: 'address',
        label: t('admin.address') || 'Address',
        icon: MapPin,
        align: 'left',
        maxWidth: '250px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm text-muted-foreground truncate">
                {logistic.default_address 
                    ? `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}`
                    : '-'
                }
            </div>
        ),
    },
    {
        key: 'active',
        label: t('admin.status') || 'Status',
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (logistic) => (
            <Badge variant={logistic.active ? 'default' : 'secondary'}>
                {logistic.active ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
            </Badge>
        ),
    },
    {
        key: 'registration_date',
        label: t('admin.registered') || 'Registered',
        sortable: true,
        align: 'left',
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
        key: 'actions',
        label: t('admin.actions') || 'Actions',
        align: 'center',
        maxWidth: '150px',
        render: (logistic) => (
            <div className="flex gap-1 justify-center">
                <Button asChild variant="outline" size="sm">
                    <Link href={route('logistics.edit', logistic.id)}>
                        <Edit className="h-3 w-3" />
                    </Link>
                </Button>
            </div>
        ),
    },
];

// Mobile card component
export const LogisticsMobileCard = ({ logistic, t }: { logistic: Logistic; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono">
                #{logistic.id}
            </Badge>
            <Badge variant={logistic.active ? 'default' : 'secondary'}>
                {logistic.active ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
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
            
            {logistic.default_address && (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {`${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}`}
                    </span>
                </div>
            )}
        </div>
        
        <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={route('logistics.edit', logistic.id)}>
                    <Edit className="h-3 w-3 mr-1" />
                    {t('admin.edit') || 'Edit'}
                </Link>
            </Button>
        </div>
    </div>
);
