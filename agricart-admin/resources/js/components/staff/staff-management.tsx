import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Edit, Trash2, Shield } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Staff } from '../../types/staff';

interface StaffManagementProps {
    staff: Staff[];
    pagination?: PaginationData;
    processing: boolean;
    onDelete: (staff: Staff) => void;
    onDataChange?: (queryParams: Record<string, any>) => void;
    highlightStaffId?: number | null;
}

export const StaffManagement = ({
    staff,
    pagination,
    processing,
    onDelete,
    onDataChange,
    highlightStaffId
}: StaffManagementProps) => {
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

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'w-20'
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            className: 'min-w-[150px]'
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            className: 'min-w-[200px]'
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
            key: 'permissions',
            label: 'Permissions',
            sortable: false,
            className: 'min-w-[250px]'
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'w-32'
        }
    ];

    // Render table row
    const renderStaffRow = (staffMember: Staff, index: number) => (
        <TableRow
            key={staffMember.id}
            className={`transition-colors duration-150 hover:bg-muted/50 ${
                highlightStaffId === staffMember.id ? 'bg-primary/5 border-primary/20' : ''
            }`}
        >
            <TableCell className="text-sm text-muted-foreground">
                {staffMember.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {staffMember.name}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {staffMember.email}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {staffMember.contact_number || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {staffMember.default_address ? 
                    `${staffMember.default_address.street}, ${staffMember.default_address.barangay}, ${staffMember.default_address.city}, ${staffMember.default_address.province}` 
                    : 'N/A'
                }
            </TableCell>
            <TableCell className="text-sm">
                <div className="flex flex-wrap gap-1">
                    {staffMember.permissions.length > 0 ? (
                        staffMember.permissions.slice(0, 3).map((permission) => (
                            <Badge
                                key={permission.name}
                                variant="secondary"
                                className="text-xs gap-1"
                            >
                                <Shield className="h-3 w-3" />
                                {getPermissionDisplayName(permission.name)}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-sm">No permissions</span>
                    )}
                    {staffMember.permissions.length > 3 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs">
                                        +{staffMember.permissions.length - 3} more
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="max-w-xs">
                                        {staffMember.permissions.slice(3).map((permission) => (
                                            <div key={permission.name} className="text-sm">
                                                {getPermissionDisplayName(permission.name)}
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(staffMember.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <PermissionGate permission="edit staffs">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('staff.edit', staffMember.id)}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="delete staffs">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(staffMember)}
                            disabled={processing}
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </PermissionGate>
                </div>
            </TableCell>
        </TableRow>
    );

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Staff Directory</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Manage and view all staff members and their permissions
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="create staffs">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('staff.create')}>
                                <UsersRound className="h-4 w-4" />
                                Add Staff
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Unified Table */}
            <UnifiedTable
                data={staff}
                columns={columns}
                pagination={pagination}
                onDataChange={onDataChange}
                renderRow={renderStaffRow}
                emptyMessage="No staff members found"
                searchPlaceholder="Search staff by name, email, or contact..."
                showSearch={true}
                showFilters={false}
                loading={processing}
                tableStateOptions={{
                    defaultSort: {
                        column: 'created_at',
                        direction: 'desc'
                    },
                    maxPerPage: 10,
                    persistInUrl: true,
                    routeName: 'staff.index'
                }}
            />
        </div>
    );
};