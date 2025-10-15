import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Search, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Shield } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { Staff } from '../../types/staff';
import styles from '../../pages/Admin/Staff/staff.module.css';

interface StaffManagementProps {
    staff: Staff[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAndSortedStaff: Staff[];
    paginatedStaff: Staff[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalStaff: number;
    itemsPerPage: number;
    processing: boolean;
    onDelete: (staff: Staff) => void;
    highlightStaffId: number | null;
    sortBy: string;
    setSortBy: (sort: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const StaffManagement = ({
    staff,
    searchTerm,
    setSearchTerm,
    filteredAndSortedStaff,
    paginatedStaff,
    currentPage,
    setCurrentPage,
    totalPages,
    totalStaff,
    itemsPerPage,
    processing,
    onDelete,
    highlightStaffId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}: StaffManagementProps) => {
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === 'asc' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />;
    };

    const getPermissionCategory = (permission: string) => {
        if (permission.includes('inventory') || permission.includes('products') || permission.includes('stocks') || permission.includes('archive')) {
            return 'inventory';
        }
        if (permission.includes('order')) {
            return 'orders';
        }
        if (permission.includes('logistic')) {
            return 'logistics';
        }
        if (permission.includes('report')) {
            return 'reports';
        }
        if (permission.includes('sales')) {
            return 'sales';
        }
        return 'default';
    };

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
            'create orders': 'Create Orders',
            'edit orders': 'Edit Orders',
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

    return (
        <div className={styles.staffManagementSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Staff Directory</h2>
                        <p className={styles.sectionSubtitle}>
                            Manage and view all staff members and their permissions
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className={styles.searchFilterSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchInputContainer}>
                        <Search className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search staff by name, email, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        Showing {paginatedStaff.length} of {totalStaff} staff members
                    </span>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className={styles.clearSearch}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            </div>

            {/* Staff Table */}
            {paginatedStaff.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className={styles.staffTable}>
                        <thead className={styles.staffTableHeader}>
                            <tr>
                                <th className={styles.staffTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('id')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        ID {getSortIcon('id')}
                                    </button>
                                </th>
                                <th className={styles.staffTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Name {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className={styles.staffTableHeaderCell}>Email</th>
                                <th className={styles.staffTableHeaderCell}>Contact</th>
                                <th className={styles.staffTableHeaderCell}>Address</th>
                                <th className={styles.staffTableHeaderCell}>Permissions</th>
                                <th className={styles.staffTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Created {getSortIcon('created_at')}
                                    </button>
                                </th>
                                <th className={styles.staffTableHeaderCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStaff.map((staffMember) => (
                                <tr
                                    key={staffMember.id}
                                    className={`${styles.staffTableRow} ${
                                        highlightStaffId === staffMember.id ? styles.highlighted : ''
                                    }`}
                                >
                                    <td className={styles.staffTableCell}>{staffMember.id}</td>
                                    <td className={styles.staffTableCell}>
                                        <div className="font-medium">{staffMember.name}</div>
                                    </td>
                                    <td className={styles.staffTableCell}>{staffMember.email}</td>
                                    <td className={styles.staffTableCell}>
                                        {staffMember.contact_number || 'N/A'}
                                    </td>
                                    <td className={styles.staffTableCell}>
                                        {staffMember.default_address ? 
                                            `${staffMember.default_address.street}, ${staffMember.default_address.barangay}, ${staffMember.default_address.city}, ${staffMember.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className={styles.staffTableCell}>
                                        <div className="flex flex-wrap gap-1">
                                            {staffMember.permissions.length > 0 ? (
                                                staffMember.permissions.slice(0, 3).map((permission) => (
                                                    <span
                                                        key={permission.name}
                                                        className={`${styles.permissionBadge} ${styles[getPermissionCategory(permission.name)]}`}
                                                    >
                                                        <Shield className="h-3 w-3" />
                                                        {getPermissionDisplayName(permission.name)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No permissions</span>
                                            )}
                                            {staffMember.permissions.length > 3 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className={`${styles.permissionBadge} ${styles.default}`}>
                                                                +{staffMember.permissions.length - 3} more
                                                            </span>
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
                                    </td>
                                    <td className={styles.staffTableCell}>
                                        {new Date(staffMember.created_at).toLocaleDateString()}
                                    </td>
                                    <td className={styles.staffTableCell}>
                                        <div className={styles.staffActionCell}>
                                            <PermissionGate permission="edit staffs">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className={styles.staffActionButton}
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
                                                    className={styles.staffActionButton}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </PermissionGate>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <UsersRound className={styles.emptyStateIcon} />
                    <h3 className={styles.emptyStateTitle}>
                        {searchTerm ? 'No staff found' : 'No staff available'}
                    </h3>
                    <p className={styles.emptyStateDescription}>
                        {searchTerm 
                            ? `No staff members match your search for "${searchTerm}". Try adjusting your search terms.`
                            : 'No staff members have been added yet.'
                        }
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalStaff}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};
