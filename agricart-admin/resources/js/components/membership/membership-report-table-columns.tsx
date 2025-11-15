import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import type { BaseTableColumn } from '@/components/common/base-table';

interface Member {
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

export const createMembershipReportTableColumns = (t: (key: string) => string): BaseTableColumn<Member>[] => [
  {
    key: 'member_id',
    label: t('admin.member_id'),
    sortable: true,
    align: 'center',
    render: (member) => (
      member.member_id ? (
        <span className="font-mono text-blue-600 font-semibold">{member.member_id}</span>
      ) : (
        <span className="text-muted-foreground">{t('admin.not_assigned')}</span>
      )
    ),
  },
  {
    key: 'name',
    label: t('admin.name'),
    sortable: true,
    align: 'center',
    render: (member) => (
      <div className="font-medium text-foreground">{member.name}</div>
    ),
  },
  {
    key: 'contact_number',
    label: t('admin.contact_number'),
    sortable: false,
    align: 'center',
    render: (member) => (
      <div className="text-sm text-muted-foreground">
        {member.contact_number || t('admin.not_assigned')}
      </div>
    ),
  },
  {
    key: 'address',
    label: t('admin.address'),
    sortable: false,
    align: 'center',
    render: (member) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate mx-auto">
        {member.address || t('admin.not_assigned')}
      </div>
    ),
  },
  {
    key: 'registration_date',
    label: t('admin.registration_date_label'),
    sortable: true,
    align: 'center',
    render: (member) => (
      <span className="text-sm text-muted-foreground">
        {member.registration_date ? dayjs(member.registration_date).format('MMM DD, YYYY') : t('admin.not_assigned')}
      </span>
    ),
  },
];

export const MembershipReportMobileCard = ({ member, t }: { member: Member; t: (key: string) => string }) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-base mb-1">{member.name}</div>
          {member.member_id ? (
            <span className="font-mono text-sm text-blue-600 font-semibold">{member.member_id}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{t('admin.not_assigned')}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.contact_number')}:</span>
          <span>{member.contact_number || t('admin.not_assigned')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.address')}:</span>
          <span className="truncate ml-2 max-w-[200px]">{member.address || t('admin.not_assigned')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('admin.registration_date_label')}:</span>
          <span>
            {member.registration_date ? dayjs(member.registration_date).format('MMM DD, YYYY') : t('admin.not_assigned')}
          </span>
        </div>
      </div>
    </div>
  );
};
