import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { IdCard, Edit, UserMinus, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Logistic } from '../../types/logistics';

interface LogisticManagementProps {
    logistics: Logistic[];
    pagination?: PaginationData;
    processing: boolean;
    onDeactivate: (logistic: Logistic) => void;
    onReactivate: (logistic: Logistic) => void;
    onDataChange?: (queryParams: Record<string, any>) => void;
    highlightLogisticId?: number | null;
    showDeactivated?: boolean;
    setShowDeactivated?: (show: boolean) => void;
}

export const LogisticManagement = ({
    logistics,
    pagination,
    processing,
    onDeactivate,
    onReactivate,
    onDataChange,
    highlightLogisticId,
    showDeactivated = false,
    setShowDeactivated
}: LogisticManagementProps) => {
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
            key: 'vehicle_type',
            label: 'Vehicle Type',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'license_number',
            label: 'License',
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
            key: 'status',
            label: 'Status',
            sortable: false,
            className: 'w-24'
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
    const renderLogisticRow = (logistic: Logistic, index: number) => (
        <TableRow
            key={logistic.id}
            className={`transition-colors duration-150 hover:bg-muted/50 ${
                highlightLogisticId === logistic.id ? 'bg-primary/5 border-primary/20' : ''
            }`}
        >
            <TableCell className="text-sm text-muted-foreground">
                {logistic.id}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {logistic.name}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {logistic.email}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {logistic.contact_number || 'N/A'}
            </TableCell>
            <TableCell className="text-sm">
                {logistic.vehicle_type ? (
                    <Badge variant="outline" className="text-xs">
                        {logistic.vehicle_type}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {logistic.license_number || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {logistic.default_address ? 
                    `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}` 
                    : 'N/A'
                }
            </TableCell>
            <TableCell>
                <Badge 
                    variant={logistic.active ? "default" : "secondary"}
                    className="text-xs"
                >
                    {logistic.active ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(logistic.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <PermissionGate permission="edit logistics">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('logistics.edit', logistic.id)}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </PermissionGate>
                    
                    {logistic.active ? (
                        <PermissionGate permission="deactivate logistics">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeactivate(logistic)}
                                disabled={processing}
                                className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                            >
                                <UserMinus className="h-4 w-4" />
                                Deactivate
                            </Button>
                        </PermissionGate>
                    ) : (
                        <PermissionGate permission="reactivate logistics">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => onReactivate(logistic)}
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

    // Filter component for showing/hiding deactivated logistics
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
                        <IdCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Logistics Management</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Manage delivery personnel and logistics operations
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="create logistics">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                        >
                            <Link href={route('logistics.create')}>
                                <IdCard className="h-4 w-4" />
                                Add Logistics
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Unified Table */}
            <UnifiedTable
                data={logistics}
                columns={columns}
                pagination={pagination}
                onDataChange={onDataChange}
                renderRow={renderLogisticRow}
                emptyMessage="No logistics personnel found"
                searchPlaceholder="Search logistics by name, email, or contact..."
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
                    routeName: 'logistics.index'
                }}
            />
        </div>
    );
};