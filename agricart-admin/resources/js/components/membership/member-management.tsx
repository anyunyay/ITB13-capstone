import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, Search, Edit, UserMinus, RotateCcw, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { PaginationControls } from '../inventory/pagination-controls';
import { AdminSearchBar } from '@/components/ui/admin-search-bar';
import { Member } from '../../types/membership';
import { SafeImage } from '@/lib/image-utils';
import styles from '../../pages/Admin/Membership/membership.module.css';
import { useTranslation } from '@/hooks/use-translation';

interface MemberManagementProps {
    members: Member[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    filteredAndSortedMembers: Member[];
    paginatedMembers: Member[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalMembers: number;
    itemsPerPage: number;
    processing: boolean;
    onDeactivate: (member: Member) => void;
    onReactivate: (member: Member) => void;
    highlightMemberId: number | null;
    showDeactivated: boolean;
    setShowDeactivated: (show: boolean) => void;
    sortBy: string;
    setSortBy: (field: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const MemberManagement = ({
    members,
    searchTerm,
    setSearchTerm,
    showSearch,
    setShowSearch,
    filteredAndSortedMembers,
    paginatedMembers,
    currentPage,
    setCurrentPage,
    totalPages,
    totalMembers,
    itemsPerPage,
    processing,
    onDeactivate,
    onReactivate,
    highlightMemberId,
    showDeactivated,
    setShowDeactivated,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}: MemberManagementProps) => {
    const t = useTranslation();
    // Handle sorting - delegate to parent component
    const handleSort = (field: string) => {
        setSortBy(field);
    };

    // Handle search toggle
    const handleSearchToggle = () => {
        if (showSearch) {
            // Clear search when hiding
            setSearchTerm('');
        }
        setShowSearch(!showSearch);
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
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center">
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.member_directory')}</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            {showDeactivated ? t('admin.viewing_deactivated_members') : t('admin.manage_and_view_all_members')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button
                        variant={showSearch ? "default" : "outline"}
                        onClick={handleSearchToggle}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        {showSearch ? t('ui.hide_search') : t('ui.search')}
                    </Button>
                    <Button
                        variant={showDeactivated ? "default" : "outline"}
                        onClick={() => setShowDeactivated(!showDeactivated)}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {showDeactivated ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />{t('admin.hide_deactivated')}
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />{t('admin.show_deactivated')}
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
                placeholder={t('admin.search_members')}
                resultsCount={paginatedMembers.length}
                totalCount={totalMembers}
            />

            {/* Members Table */}
            {paginatedMembers.length > 0 ? (
                <>
                    <div className="rounded-md border">
                        <Table className="w-full border-collapse">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('id')}
                                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-1"
                                        >
                                            {t('admin.id_column')}
                                            {getSortIcon('id')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('member_id')}
                                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-1"
                                        >
                                            {t('admin.member_id')}
                                            {getSortIcon('member_id')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('name')}
                                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-1"
                                        >
                                            {t('admin.name')}
                                            {getSortIcon('name')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                        {t('admin.contact_number')}
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">{t('admin.address')}</TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('registration_date')}
                                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-1"
                                        >
                                            {t('admin.registration_date_label')}
                                            {getSortIcon('registration_date')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">{t('admin.status')}</TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">{t('admin.document_upload_label')}</TableHead>
                                    <TableHead className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">{t('admin.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMembers.map((member, idx) => (
                                    <TableRow
                                        key={member.id}
                                        id={`member-row-${member.id}`}
                                        className={`border-b border-border transition-colors duration-150 hover:bg-muted/30 ${highlightMemberId === member.id ? styles.highlighted : ''
                                            }`}
                                    >
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            <Badge variant="outline">#{idx + 1}</Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            {member.member_id || t('admin.not_assigned')}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            <div className="font-medium">{member.name}</div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            {member.contact_number || t('admin.not_available')}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            {member.default_address ? `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` : t('admin.not_available')}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            {member.registration_date ? 
                                                new Date(member.registration_date).toLocaleDateString() 
                                                : t('admin.not_available')
                                            }
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            {member.active ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                    {t('admin.active')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    {t('admin.deactivated')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            <SafeImage
                                                src={member.document}
                                                alt={`Document for ${member.name}`}
                                                className="max-w-24 object-cover rounded"
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-foreground">
                                            <div className="flex gap-2">
                                                <PermissionGate permission="edit members">
                                                    <Button asChild size="sm" className="transition-all duration-200 hover:shadow-lg hover:opacity-90">
                                                        <Link href={route('membership.edit', member.id)}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            {t('ui.edit')}
                                                        </Link>
                                                    </Button>
                                                </PermissionGate>
                                                {member.active ? (
                                                    member.can_be_deactivated && (
                                                        <PermissionGate permission="deactivate members">
                                                            <Button
                                                                disabled={processing}
                                                                onClick={() => onDeactivate(member)}
                                                                size="sm"
                                                                variant="destructive"
                                                                className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                                            >
                                                                <UserMinus className="h-3 w-3 mr-1" />{t('admin.deactivate')}
                                                            </Button>
                                                        </PermissionGate>
                                                    )
                                                ) : (
                                                    <PermissionGate permission="edit members">
                                                        <Button
                                                            disabled={processing}
                                                            onClick={() => onReactivate(member)}
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg hover:opacity-90"
                                                        >
                                                            <RotateCcw className="h-3 w-3 mr-1" />{t('admin.reactivate')}
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
                <div className="text-center py-8">
                    <UsersRound className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? t('admin.no_members_found') : t('admin.no_members_available')}
                    </h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? t('admin.try_adjusting_search_filters') : t('admin.add_new_members_get_started')}
                    </p>
                </div>
            )}
        </div>
    );
};
