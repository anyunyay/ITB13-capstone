import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Search, Edit, UserMinus, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { Member } from '../../types/membership';
import { SafeImage } from '@/lib/image-utils';
import styles from '../../pages/Admin/Membership/membership.module.css';

interface MemberManagementProps {
    members: Member[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAndSortedMembers: Member[];
    paginatedMembers: Member[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalMembers: number;
    itemsPerPage: number;
    processing: boolean;
    onDeactivate: (member: Member) => void;
    highlightMemberId: number | null;
    showDeactivated: boolean;
    setShowDeactivated: (show: boolean) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const MemberManagement = ({
    members,
    searchTerm,
    setSearchTerm,
    filteredAndSortedMembers,
    paginatedMembers,
    currentPage,
    setCurrentPage,
    totalPages,
    totalMembers,
    itemsPerPage,
    processing,
    onDeactivate,
    highlightMemberId,
    showDeactivated,
    setShowDeactivated,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}: MemberManagementProps) => {
    // Handle sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            // Toggle sort order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new sort field with default ascending order
            setSortBy(field);
            setSortOrder('asc');
        }
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };

    // Get sort icon for a field
    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortOrder === 'asc' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />;
    };

    return (
        <div className={styles.memberManagementSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Member Directory</h2>
                        <p className={styles.sectionSubtitle}>
                            {showDeactivated ? 'Viewing deactivated members' : 'Manage and view all registered members'}
                        </p>
                    </div>
                </div>
                <div className={styles.sectionActions}>
                    <Button
                        variant={showDeactivated ? "default" : "outline"}
                        onClick={() => setShowDeactivated(!showDeactivated)}
                        className={styles.sectionActionButton}
                    >
                        {showDeactivated ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Deactivated
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                View Deactivated
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className={styles.searchFilterSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchInputContainer}>
                        <Search className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search members by name, ID, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        Showing {paginatedMembers.length} of {totalMembers} members
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

            {/* Members Table */}
            {paginatedMembers.length > 0 ? (
                <>
                    <div className="rounded-md border">
                        <Table className={styles.memberTable}>
                            <TableHeader className={styles.memberTableHeader}>
                                <TableRow>
                                    <TableHead className={styles.memberTableHeaderCell}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('id')}
                                            className="h-auto p-0 font-medium hover:bg-transparent"
                                        >
                                            ID
                                            {getSortIcon('id')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Member ID</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Name</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Contact</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Address</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('registration_date')}
                                            className="h-auto p-0 font-medium hover:bg-transparent"
                                        >
                                            Registration Date
                                            {getSortIcon('registration_date')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Type</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Document</TableHead>
                                    <TableHead className={styles.memberTableHeaderCell}>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMembers.map((member, idx) => (
                                    <TableRow
                                        key={member.id}
                                        id={`member-row-${member.id}`}
                                        className={`${styles.memberTableRow} ${
                                            highlightMemberId === member.id ? styles.highlighted : ''
                                        }`}
                                    >
                                        <TableCell className={styles.memberTableCell}>
                                            <Badge variant="outline">#{idx + 1}</Badge>
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            {member.member_id || 'N/A'}
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            <div className="font-medium">{member.name}</div>
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            {member.contact_number || 'N/A'}
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            {member.default_address ? 
                                                `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` 
                                                : 'N/A'
                                            }
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            {member.registration_date || 'N/A'}
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary">
                                                    {member.type || 'Regular'}
                                                </Badge>
                                                {!member.can_be_deactivated && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Deactivated
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            <SafeImage 
                                                src={member.document} 
                                                alt={`Document for ${member.name}`} 
                                                className="max-w-24 object-cover rounded"
                                            />
                                        </TableCell>
                                        <TableCell className={styles.memberTableCell}>
                                            <div className={styles.memberActionCell}>
                                                <PermissionGate permission="edit members">
                                                    <Button asChild size="sm" className={styles.memberActionButton}>
                                                        <Link href={route('membership.edit', member.id)}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </PermissionGate>
                                                {member.can_be_deactivated && (
                                                    <PermissionGate permission="deactivate members">
                                                        <Button 
                                                            disabled={processing} 
                                                            onClick={() => onDeactivate(member)} 
                                                            size="sm"
                                                            variant="destructive"
                                                            className={styles.memberActionButton}
                                                        >
                                                            <UserMinus className="h-3 w-3 mr-1" />
                                                            Deactivate
                                                        </Button>
                                                    </PermissionGate>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalMembers}
                    />
                </>
            ) : (
                <div className={styles.emptyState}>
                    <UsersRound className={styles.emptyStateIcon} />
                    <h3 className={styles.emptyStateTitle}>
                        {searchTerm ? 'No members found' : 'No members available'}
                    </h3>
                    <p className={styles.emptyStateDescription}>
                        {searchTerm 
                            ? 'Try adjusting your search criteria or filters.'
                            : 'Add new members to get started with membership management.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};
