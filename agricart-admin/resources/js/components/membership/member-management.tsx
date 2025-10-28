import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Edit, UserMinus, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Member } from '../../types/membership';
import { SafeImage } from '@/lib/image-utils';

interface MemberManagementProps {
    members: Member[];
    pagination?: PaginationData;
    processing: boolean;
    onDeactivate: (member: Member) => void;
    onReactivate: (member: Member) => void;
    onDataChange?: (queryParams: Record<string, any>) => void;
    highlightMemberId?: number | null;
    showDeactivated?: boolean;
    setShowDeactivated?: (show: boolean) => void;
}

export const MemberManagement = ({
    members,
    pagination,
    processing,
    onDeactivate,
    onReactivate,
    onDataChange,
    highlightMemberId,
    showDeactivated = false,
    setShowDeactivated
}: MemberManagementProps) => {
    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'w-20'
        },
        {
            key: 'member_id',
            label: 'Member ID',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'contact_number',
            label: 'Contact',
            sortable: false,
            className: 'min-w-[120px]'
        },
        {
            key: 'address',
            label: 'Address',
            sortable: false,
            className: 'min-w-[200px]'
        },
        {
            key: 'registration_date',
            label: 'Registered',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            className: 'w-24'
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'w-32'
        }
    ];

    // Render table row
    const renderMemberRow = (member: Member, index: number) => (
        <TableRow
            key={member.id}
            className={`transition-colors duration-150 hover:bg-muted/50 ${
                highlightMemberId === member.id ? 'bg-primary/5 border-primary/20' : ''
            }`}
        >
            <TableCell className="text-sm text-muted-foreground">
                {member.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {member.member_id || 'N/A'}
            </TableCell>
            <TableCell className="text-sm font-medium">
                <div className="flex items-center gap-3">
                    {member.document && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <SafeImage
                                src={`/${member.document}`}
                                alt={`${member.name} document`}
                                className="w-full h-full object-cover"
                                fallback={
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <UsersRound className="h-4 w-4 text-primary" />
                                    </div>
                                }
                            />
                        </div>
                    )}
                    <span>{member.name}</span>
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {member.contact_number || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {member.default_address ? 
                    `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` 
                    : 'N/A'
                }
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {member.registration_date ? 
                    new Date(member.registration_date).toLocaleDateString() : 
                    'N/A'
                }
            </TableCell>
            <TableCell>
                <Badge 
                    variant={member.active ? "default" : "secondary"}
                    className="text-xs"
                >
                    {member.active ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <PermissionGate permission="edit members">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('membership.edit', member.id)}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </PermissionGate>
                    
                    {member.active ? (
                        <PermissionGate permission="deactivate members">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeactivate(member)}
                                disabled={processing || !member.can_be_deactivated}
                                className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                title={member.deactivation_reason || undefined}
                            >
                                <UserMinus className="h-4 w-4" />
                                Deactivate
                            </Button>
                        </PermissionGate>
                    ) : (
                        <PermissionGate permission="reactivate members">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => onReactivate(member)}
                                disabled={processing}
                                className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reactivate
                            </Button>
                        </PermissionGate>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );

    // Filter component for showing/hiding deactivated members
    const filterComponent = setShowDeactivated ? (
        <Button
            variant={showDeactivated ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDeactivated(!showDeactivated)}
            className="flex items-center gap-2"
        >
            {showDeactivated ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDeactivated ? 'Hide Inactive' : 'Show Inactive'}
        </Button>
    ) : null;

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Member Directory</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Manage and view all members and their information
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="create members">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('membership.add')}>
                                <UsersRound className="h-4 w-4" />
                                Add Member
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Unified Table */}
            <UnifiedTable
                data={members}
                columns={columns}
                pagination={pagination}
                onDataChange={onDataChange}
                renderRow={renderMemberRow}
                emptyMessage="No members found"
                searchPlaceholder="Search members by name, member ID, or contact..."
                showSearch={true}
                showFilters={!!setShowDeactivated}
                filterComponent={filterComponent}
                loading={processing}
                tableStateOptions={{
                    defaultSort: {
                        column: 'created_at',
                        direction: 'desc'
                    },
                    maxPerPage: 10,
                    persistInUrl: true,
                    routeName: 'membership.index'
                }}
            />
        </div>
    );
};