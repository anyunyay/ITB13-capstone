import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Mail, Phone, MapPin, Calendar, FileImage } from 'lucide-react';
import { SafeImage } from '@/lib/image-utils';

export interface Member {
    id: number;
    member_id?: string;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    registration_date?: string;
    document?: string;
    email_verified_at?: string;
    created_at: string;
}

export const createMemberReportTableColumns = (t: (key: string) => string): BaseTableColumn<Member>[] => [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (member) => (
            <Badge variant="outline" className="font-mono">
                #{member.id}
            </Badge>
        ),
    },
    {
        key: 'member_id',
        label: t('admin.member_id') || 'Member ID',
        sortable: true,
        align: 'center',
        maxWidth: '150px',
        render: (member) => (
            <Badge variant="outline" className="font-mono text-blue-600">
                {member.member_id || '-'}
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
        render: (member) => (
            <div className="font-medium text-sm">{member.name}</div>
        ),
    },
    {
        key: 'email',
        label: t('admin.email') || 'Email',
        icon: Mail,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (member) => (
            <div className="text-sm text-muted-foreground">{member.email}</div>
        ),
    },
    {
        key: 'contact_number',
        label: t('admin.contact') || 'Contact',
        icon: Phone,
        align: 'center',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (member) => (
            <div className="text-sm">{member.contact_number || '-'}</div>
        ),
    },
    {
        key: 'address',
        label: t('admin.address') || 'Address',
        icon: MapPin,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (member) => (
            <div className="text-sm text-muted-foreground truncate">
                {member.address || '-'}
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
        render: (member) => (
            <div className="text-sm">
                {member.registration_date 
                    ? format(new Date(member.registration_date), 'MMM dd, yyyy')
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
        render: (member) => (
            <Badge variant={member.email_verified_at ? 'default' : 'secondary'}>
                {member.email_verified_at ? (t('admin.verified') || 'Verified') : (t('admin.pending') || 'Pending')}
            </Badge>
        ),
    },
];

// Mobile card component
export const MemberReportMobileCard = ({ member, t }: { member: Member; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div>
                <Badge variant="outline" className="font-mono mb-1">
                    #{member.id}
                </Badge>
                {member.member_id && (
                    <Badge variant="outline" className="font-mono text-blue-600 ml-2">
                        {member.member_id}
                    </Badge>
                )}
            </div>
            <Badge variant={member.email_verified_at ? 'default' : 'secondary'}>
                {member.email_verified_at ? (t('admin.verified') || 'Verified') : (t('admin.pending') || 'Pending')}
            </Badge>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{member.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{member.email}</span>
            </div>
            
            {member.contact_number && (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.contact_number}</span>
                </div>
            )}
            
            {member.address && (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{member.address}</span>
                </div>
            )}
            
            {member.registration_date && (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                        {format(new Date(member.registration_date), 'MMM dd, yyyy')}
                    </span>
                </div>
            )}
        </div>
        
        {member.document && (
            <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('admin.document') || 'Document'}</span>
                </div>
                <SafeImage
                    src={member.document}
                    alt={`Document for ${member.name}`}
                    className="max-w-full max-h-32 object-contain border rounded"
                />
            </div>
        )}
    </div>
);
