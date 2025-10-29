import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { IdCard, Search, Edit, UserMinus, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { AdminSearchBar } from '@/components/ui/admin-search-bar';
import { Logistic } from '../../types/logistics';
import styles from './logistic-highlights.module.css';

interface LogisticManagementProps {
    logistics: Logistic[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    filteredAndSortedLogistics: Logistic[];
    paginatedLogistics: Logistic[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalLogistics: number;
    itemsPerPage: number;
    processing: boolean;
    onDeactivate: (logistic: Logistic) => void;
    onReactivate: (logistic: Logistic) => void;
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
    showSearch,
    setShowSearch,
    filteredAndSortedLogistics,
    paginatedLogistics,
    currentPage,
    setCurrentPage,
    totalPages,
    totalLogistics,
    itemsPerPage,
    processing,
    onDeactivate,
    onReactivate,
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
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <IdCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Logistics Directory</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            {showDeactivated ? 'Viewing deactivated logistics' : 'Manage and view all registered logistics partners'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
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
                    <Button
                        variant={showDeactivated ? "default" : "outline"}
                        onClick={() => setShowDeactivated(!showDeactivated)}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
            <AdminSearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                placeholder="Search logistics by ID, name, email, or contact..."
                resultsCount={paginatedLogistics.length}
                totalCount={totalLogistics}
            />

            {/* Logistics Table */}
            {paginatedLogistics.length > 0 ? (
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                    <button
                                        onClick={() => handleSort('registration_date')}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        Registration Date {getSortIcon('registration_date')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogistics.map((logistic) => (
                                <tr
                                    key={logistic.id}
                                    className={`border-b border-border transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)] ${
                                        highlightLogisticId === logistic.id ? styles.highlighted : ''
                                    }`}
                                >
                                    <td className="px-4 py-3 text-sm text-foreground">{logistic.id}</td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        <div className="font-medium">{logistic.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">{logistic.email}</td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        {logistic.contact_number || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        {logistic.default_address ? 
                                            `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        {logistic.registration_date ? 
                                            new Date(logistic.registration_date).toLocaleDateString() 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        <Badge variant={logistic.can_be_deactivated ? "default" : "secondary"}>
                                            {logistic.can_be_deactivated ? "Active" : "Protected"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
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
                                                        Reactivate
                                                    </Button>
                                                </PermissionGate>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8">
                    <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'No logistics found' : 'No logistics available'}
                    </h3>
                    <p className="text-muted-foreground">
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
