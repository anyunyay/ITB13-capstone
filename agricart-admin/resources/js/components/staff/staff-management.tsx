import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Search, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Shield, Filter } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { Staff } from '../../types/staff';
import styles from './staff-highlights.module.css';

interface StaffManagementProps {
    staff: Staff[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
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
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
}

export const StaffManagement = ({
    staff,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
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
    setSortOrder,
    showSearch,
    setShowSearch
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

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
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
                    <Button
                        variant={showSearch ? "default" : "outline"}
                        onClick={() => {
                            if (showSearch) {
                                setSearchTerm('');
                            }
                            setShowSearch(!showSearch);
                        }}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        {showSearch ? 'Hide Search' : 'Search'}
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${
                showSearch ? styles.expanded : styles.collapsed
            }`}>
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search staff by name, email, or contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="inventory">Inventory Management</SelectItem>
                                    <SelectItem value="orders">Order Management</SelectItem>
                                    <SelectItem value="logistics">Logistics Management</SelectItem>
                                    <SelectItem value="sales">Sales Management</SelectItem>
                                    <SelectItem value="trends">Trend Analysis</SelectItem>
                                    <SelectItem value="general">General Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        Showing {paginatedStaff.length} of {filteredAndSortedStaff.length} staff members
                        {selectedCategory !== 'all' && ` (${selectedCategory} category)`}
                    </span>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="text-sm text-primary no-underline transition-colors duration-200 hover:text-primary/80"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Staff Table */}
            {paginatedStaff.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-[color-mix(in_srgb,var(--muted)_50%,transparent)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                    <button
                                        onClick={() => handleSort('id')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        ID {getSortIcon('id')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Name {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Address</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Permissions</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Created {getSortIcon('created_at')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStaff.map((staffMember) => (
                                <tr
                                    key={staffMember.id}
                                    className={`border-b border-border transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)] ${
                                        highlightStaffId === staffMember.id ? styles.highlighted : ''
                                    }`}
                                >
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{staffMember.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                                        <div>{staffMember.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{staffMember.email}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {staffMember.contact_number || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {staffMember.default_address ? 
                                            `${staffMember.default_address.street}, ${staffMember.default_address.barangay}, ${staffMember.default_address.city}, ${staffMember.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
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
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(staffMember.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8">
                    <UsersRound className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'No staff found' : 'No staff available'}
                    </h3>
                    <p className="text-muted-foreground">
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
