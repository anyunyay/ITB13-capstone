import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, UserMinus, RotateCcw, MapPin, Phone, Calendar, FileText } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Member } from '@/types/membership';
import { SafeImage } from '@/lib/image-utils';

export const createMemberTableColumns = (
  t: (key: string) => string,
  processing: boolean,
  onDeactivate: (member: Member) => void,
  onReactivate: (member: Member) => void,
  startIndex: number = 0
): BaseTableColumn<Member>[] => [
  {
    key: 'index',
    label: t('admin.id_column'),
    sortable: false,
    align: 'center',
    maxWidth: '80px',
    render: (member, index) => (
      <div className="flex justify-center">
        <Badge variant="outline">#{startIndex + index + 1}</Badge>
      </div>
    ),
  },
  {
    key: 'member_id',
    label: t('admin.member_id'),
    sortable: true,
    align: 'center',
    maxWidth: '120px',
    render: (member) => (
      <div className="text-sm text-foreground text-center">
        {member.member_id || t('admin.not_assigned')}
      </div>
    ),
  },
  {
    key: 'name',
    label: t('admin.name'),
    sortable: true,
    align: 'center',
    maxWidth: '180px',
    render: (member) => (
      <div className="font-medium text-sm text-left">{member.name}</div>
    ),
  },
  {
    key: 'contact_number',
    label: t('admin.contact_number'),
    sortable: false,
    align: 'center',
    maxWidth: '150px',
    render: (member) => (
      <div className="text-sm text-foreground text-left">
        {member.contact_number || t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'address',
    label: t('admin.address'),
    sortable: false,
    align: 'center',
    maxWidth: '250px',
    render: (member) => (
      <div className="text-sm text-foreground text-left">
        {member.default_address
          ? `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}`
          : t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'registration_date',
    label: t('admin.registration_date_label'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (member) => (
      <div className="text-sm text-foreground text-center">
        {member.registration_date
          ? new Date(member.registration_date).toLocaleDateString()
          : t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'document',
    label: t('admin.document_upload_label'),
    sortable: false,
    align: 'center',
    maxWidth: '120px',
    render: (member) => (
      <div className="flex justify-center">
        <SafeImage
          src={member.document}
          alt={`Document for ${member.name}`}
          className="max-w-24 object-cover rounded"
        />
      </div>
    ),
  },
  {
    key: 'actions',
    label: t('admin.actions'),
    sortable: false,
    align: 'center',
    maxWidth: '200px',
    render: (member) => (
      <div className="flex gap-2 justify-center">
        <PermissionGate permission="edit members">
          <Button asChild size="sm" className="transition-all duration-200 hover:shadow-lg hover:opacity-90">
            <Link href={route('membership.edit', member.id)}>
              <Edit className="h-3 w-3 mr-1" />
              {t('ui.edit')}
            </Link>
          </Button>
        </PermissionGate>
        {member.active ? (
          <PermissionGate permission="deactivate members">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      disabled={processing || !member.can_be_deactivated}
                      onClick={() => onDeactivate(member)}
                      size="sm"
                      variant="destructive"
                      className={`transition-all duration-200 hover:shadow-lg hover:opacity-90 ${
                        !member.can_be_deactivated ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <UserMinus className="h-3 w-3 mr-1" />
                      {t('admin.deactivate')}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!member.can_be_deactivated && member.deactivation_reason && (
                  <TooltipContent>
                    <p className="max-w-xs text-center">{member.deactivation_reason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </PermissionGate>
        ) : (
          <PermissionGate permission="edit members">
            <Button
              disabled={processing}
              onClick={() => onReactivate(member)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg hover:opacity-90"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t('admin.reactivate')}
            </Button>
          </PermissionGate>
        )}
      </div>
    ),
  },
];

// Mobile card component for members
export const MemberMobileCard = ({
  member,
  index,
  t,
  processing,
  onDeactivate,
  onReactivate,
}: {
  member: Member;
  index: number;
  t: (key: string) => string;
  processing: boolean;
  onDeactivate: (member: Member) => void;
  onReactivate: (member: Member) => void;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="font-medium text-sm">{member.name}</div>
        <div className="text-xs text-muted-foreground">
          {member.member_id || t('admin.not_assigned')}
        </div>
      </div>
      {member.active ? (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          {t('admin.active')}
        </Badge>
      ) : (
        <Badge variant="destructive">{t('admin.deactivated')}</Badge>
      )}
    </div>

    <div className="space-y-2 mb-3 pb-3 border-b border-border text-xs">
      {member.contact_number && (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{member.contact_number}</span>
        </div>
      )}
      {member.default_address && (
        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground">
            {`${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}`}
          </span>
        </div>
      )}
      {member.registration_date && (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date(member.registration_date).toLocaleDateString()}
          </span>
        </div>
      )}
      {member.document && (
        <div className="flex items-start gap-2">
          <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
          <SafeImage
            src={member.document}
            alt={`Document for ${member.name}`}
            className="max-w-24 object-cover rounded"
          />
        </div>
      )}
    </div>

    <div className="flex gap-2">
      <PermissionGate permission="edit members">
        <Button asChild size="sm" className="flex-1">
          <Link href={route('membership.edit', member.id)}>
            <Edit className="h-3 w-3 mr-1" />
            {t('ui.edit')}
          </Link>
        </Button>
      </PermissionGate>
      {member.active ? (
        <PermissionGate permission="deactivate members">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Button
                    disabled={processing || !member.can_be_deactivated}
                    onClick={() => onDeactivate(member)}
                    size="sm"
                    variant="destructive"
                    className={`w-full ${
                      !member.can_be_deactivated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <UserMinus className="h-3 w-3 mr-1" />
                    {t('admin.deactivate')}
                  </Button>
                </div>
              </TooltipTrigger>
              {!member.can_be_deactivated && member.deactivation_reason && (
                <TooltipContent>
                  <p className="max-w-xs text-center">{member.deactivation_reason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </PermissionGate>
      ) : (
        <PermissionGate permission="edit members">
          <Button
            disabled={processing}
            onClick={() => onReactivate(member)}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {t('admin.reactivate')}
          </Button>
        </PermissionGate>
      )}
    </div>
  </div>
);
