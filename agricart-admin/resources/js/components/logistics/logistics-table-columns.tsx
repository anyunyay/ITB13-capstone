import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, UserMinus, RotateCcw, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Logistic } from '@/types/logistics';

export const createLogisticsTableColumns = (
  t: (key: string) => string,
  processing: boolean,
  onDeactivate: (logistic: Logistic) => void,
  onReactivate: (logistic: Logistic) => void,
  startIndex: number = 0
): BaseTableColumn<Logistic>[] => [
  {
    key: 'index',
    label: t('admin.id_column'),
    sortable: false,
    align: 'center',
    maxWidth: '80px',
    render: (logistic, index) => (
      <div className="flex justify-center">
        <Badge variant="outline">#{startIndex + index + 1}</Badge>
      </div>
    ),
  },
  {
    key: 'name',
    label: t('admin.name'),
    sortable: true,
    align: 'center',
    maxWidth: '180px',
    render: (logistic) => (
      <div className="font-medium text-sm text-left">{logistic.name}</div>
    ),
  },
  {
    key: 'email',
    label: t('admin.email'),
    sortable: false,
    align: 'center',
    maxWidth: '200px',
    render: (logistic) => (
      <div className="text-sm text-foreground text-left">{logistic.email}</div>
    ),
  },
  {
    key: 'contact_number',
    label: t('admin.contact'),
    sortable: false,
    align: 'center',
    maxWidth: '150px',
    render: (logistic) => (
      <div className="text-sm text-foreground text-left">
        {logistic.contact_number || t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'address',
    label: t('admin.address'),
    sortable: false,
    align: 'center',
    maxWidth: '250px',
    render: (logistic) => (
      <div className="text-sm text-foreground text-left">
        {logistic.default_address
          ? `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}`
          : t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'registration_date',
    label: t('admin.registration_date'),
    sortable: true,
    align: 'center',
    maxWidth: '150px',
    render: (logistic) => (
      <div className="text-sm text-foreground text-center">
        {logistic.registration_date
          ? new Date(logistic.registration_date).toLocaleDateString()
          : t('admin.not_available')}
      </div>
    ),
  },
  {
    key: 'actions',
    label: t('admin.actions'),
    sortable: false,
    align: 'center',
    maxWidth: '200px',
    render: (logistic) => (
      <div className="flex gap-2 justify-center">
        <PermissionGate permission="edit logistics">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
          >
            <Link href={route('logistics.edit', logistic.id)}>
              <Edit className="h-4 w-4" />
              {t('ui.edit')}
            </Link>
          </Button>
        </PermissionGate>
        {logistic.active ? (
          <PermissionGate permission="deactivate logistics">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeactivate(logistic)}
                      disabled={processing || !logistic.can_be_deactivated}
                      className={`transition-all duration-200 hover:shadow-lg hover:opacity-90 ${
                        !logistic.can_be_deactivated ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <UserMinus className="h-4 w-4" />
                      {t('admin.deactivate')}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!logistic.can_be_deactivated && logistic.deactivation_reason && (
                  <TooltipContent>
                    <p className="max-w-xs text-center">{logistic.deactivation_reason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </PermissionGate>
        ) : (
          <PermissionGate permission="reactivate logistics">
            <Button
              variant="default"
              size="sm"
              onClick={() => onReactivate(logistic)}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" />
              {t('admin.reactivate')}
            </Button>
          </PermissionGate>
        )}
      </div>
    ),
  },
];

// Mobile card component for logistics
export const LogisticsMobileCard = ({
  logistic,
  t,
  processing,
  onDeactivate,
  onReactivate,
}: {
  logistic: Logistic;
  t: (key: string) => string;
  processing: boolean;
  onDeactivate: (logistic: Logistic) => void;
  onReactivate: (logistic: Logistic) => void;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="font-medium text-sm">{logistic.name}</div>
        <div className="text-xs text-muted-foreground">ID: {logistic.id}</div>
      </div>
      <Badge variant={logistic.can_be_deactivated ? 'default' : 'secondary'}>
        {logistic.can_be_deactivated ? t('admin.active') : t('admin.protected')}
      </Badge>
    </div>

    <div className="space-y-2 mb-3 pb-3 border-b border-border text-xs">
      <div className="flex items-center gap-2">
        <Mail className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{logistic.email}</span>
      </div>
      {logistic.contact_number && (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{logistic.contact_number}</span>
        </div>
      )}
      {logistic.default_address && (
        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground">
            {`${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}`}
          </span>
        </div>
      )}
      {logistic.registration_date && (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date(logistic.registration_date).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>

    <div className="flex gap-2">
      <PermissionGate permission="edit logistics">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Link href={route('logistics.edit', logistic.id)}>
            <Edit className="h-4 w-4 mr-1" />
            {t('ui.edit')}
          </Link>
        </Button>
      </PermissionGate>
      {logistic.active ? (
        <PermissionGate permission="deactivate logistics">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeactivate(logistic)}
                    disabled={processing || !logistic.can_be_deactivated}
                    className={`w-full ${
                      !logistic.can_be_deactivated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    {t('admin.deactivate')}
                  </Button>
                </div>
              </TooltipTrigger>
              {!logistic.can_be_deactivated && logistic.deactivation_reason && (
                <TooltipContent>
                  <p className="max-w-xs text-center">{logistic.deactivation_reason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </PermissionGate>
      ) : (
        <PermissionGate permission="reactivate logistics">
          <Button
            variant="default"
            size="sm"
            onClick={() => onReactivate(logistic)}
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('admin.reactivate')}
          </Button>
        </PermissionGate>
      )}
    </div>
  </div>
);
