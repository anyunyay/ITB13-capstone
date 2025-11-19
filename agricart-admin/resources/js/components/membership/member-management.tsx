import { Button } from '@/components/ui/button';
import { UsersRound, Search, Eye, EyeOff } from 'lucide-react';
import { PaginationControls } from '../inventory/pagination-controls';
import { AdminSearchBar } from '@/components/ui/admin-search-bar';
import { Member } from '../../types/membership';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createMemberTableColumns, MemberMobileCard } from './member-table-columns';
import { useMemo } from 'react';

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
    onDelete: (member: Member) => void;
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
    onDelete,
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

    // Create column definitions
    const memberColumns = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return createMemberTableColumns(t, processing, onDeactivate, onReactivate, onDelete, startIndex);
    }, [t, processing, onDeactivate, onReactivate, onDelete, currentPage, itemsPerPage]);

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
            <BaseTable
                data={paginatedMembers}
                columns={memberColumns}
                keyExtractor={(member) => member.id}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                getRowClassName={(member) =>
                    highlightMemberId === member.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                }
                renderMobileCard={(member, index) => (
                    <MemberMobileCard
                        member={member}
                        index={index}
                        t={t}
                        processing={processing}
                        onDeactivate={onDeactivate}
                        onReactivate={onReactivate}
                        onDelete={onDelete}
                    />
                )}
                emptyState={
                    <div className="text-center py-8">
                        <UsersRound className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm ? t('admin.no_members_found') : t('admin.no_members_available')}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchTerm ? t('admin.try_adjusting_search_filters') : t('admin.add_new_members_get_started')}
                        </p>
                    </div>
                }
            />

            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalMembers}
                />
            )}
        </div>
    );
};
