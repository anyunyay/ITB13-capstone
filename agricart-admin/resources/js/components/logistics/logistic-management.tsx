import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { IdCard, Search, Edit, UserMinus, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { Logistic } from '../../types/logistics';
import styles from '../../pages/Admin/Logistics/logistics.module.css';

interface LogisticManagementProps {
    logistics: Logistic[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAndSortedLogistics: Logistic[];
    paginatedLogistics: Logistic[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalLogistics: number;
    itemsPerPage: number;
    processing: boolean;
    onDeactivate: (logistic: Logistic) => void;
    highlightLogisticId: number | null;
    showDeactivated: boolean;
    setShowDeactivated: (show: boolean) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const LogisticManagement = ({
    logistics,
    searchTerm,
    setSearchTerm,
    filteredAndSortedLogistics,
    paginatedLogistics,
    currentPage,
    setCurrentPage,
    totalPages,
    totalLogistics,
    itemsPerPage,
    processing,
    onDeactivate,
    highlightLogisticId,
    showDeactivated,
    setShowDeactivated,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}: LogisticManagementProps) => {
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

    return (
        <div className={styles.logisticManagementSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <IdCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Logistics Directory</h2>
                        <p className={styles.sectionSubtitle}>
                            {showDeactivated ? 'Viewing deactivated logistics' : 'Manage and view all registered logistics partners'}
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
                            placeholder="Search logistics by ID, name, email, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        Showing {paginatedLogistics.length} of {totalLogistics} logistics
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

            {/* Logistics Table */}
            {paginatedLogistics.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className={styles.logisticTable}>
                        <thead className={styles.logisticTableHeader}>
                            <tr>
                                <th className={styles.logisticTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('id')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        ID {getSortIcon('id')}
                                    </button>
                                </th>
                                <th className={styles.logisticTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Name {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className={styles.logisticTableHeaderCell}>Email</th>
                                <th className={styles.logisticTableHeaderCell}>Contact</th>
                                <th className={styles.logisticTableHeaderCell}>Address</th>
                                <th className={styles.logisticTableHeaderCell}>
                                    <button
                                        onClick={() => handleSort('registration_date')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Registration Date {getSortIcon('registration_date')}
                                    </button>
                                </th>
                                <th className={styles.logisticTableHeaderCell}>Status</th>
                                <th className={styles.logisticTableHeaderCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogistics.map((logistic) => (
                                <tr
                                    key={logistic.id}
                                    className={`${styles.logisticTableRow} ${
                                        highlightLogisticId === logistic.id ? styles.highlighted : ''
                                    }`}
                                >
                                    <td className={styles.logisticTableCell}>{logistic.id}</td>
                                    <td className={styles.logisticTableCell}>
                                        <div className="font-medium">{logistic.name}</div>
                                    </td>
                                    <td className={styles.logisticTableCell}>{logistic.email}</td>
                                    <td className={styles.logisticTableCell}>
                                        {logistic.contact_number || 'N/A'}
                                    </td>
                                    <td className={styles.logisticTableCell}>
                                        {logistic.default_address ? 
                                            `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className={styles.logisticTableCell}>
                                        {logistic.registration_date ? 
                                            new Date(logistic.registration_date).toLocaleDateString() 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className={styles.logisticTableCell}>
                                        <Badge variant={logistic.can_be_deactivated ? "default" : "secondary"}>
                                            {logistic.can_be_deactivated ? "Active" : "Protected"}
                                        </Badge>
                                    </td>
                                    <td className={styles.logisticTableCell}>
                                        <div className={styles.logisticActionCell}>
                                            <PermissionGate permission="edit logistics">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className={styles.logisticActionButton}
                                                >
                                                    <Link href={route('logistics.edit', logistic.id)}>
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </PermissionGate>
                                            <PermissionGate permission="delete logistics">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => onDeactivate(logistic)}
                                                                    disabled={processing || !logistic.can_be_deactivated}
                                                                    className={`${styles.logisticActionButton} ${
                                                                        !logistic.can_be_deactivated ? 'opacity-50 cursor-not-allowed' : ''
                                                                    }`}
                                                                >
                                                                    <UserMinus className="h-4 w-4" />
                                                                    Deactivate
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <IdCard className={styles.emptyStateIcon} />
                    <h3 className={styles.emptyStateTitle}>
                        {searchTerm ? 'No logistics found' : 'No logistics available'}
                    </h3>
                    <p className={styles.emptyStateDescription}>
                        {searchTerm 
                            ? `No logistics match your search for "${searchTerm}". Try adjusting your search terms.`
                            : showDeactivated 
                                ? 'There are no deactivated logistics partners.'
                                : 'No logistics partners have been registered yet.'
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
                    totalItems={totalLogistics}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};
