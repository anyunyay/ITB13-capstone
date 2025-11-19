import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UsersRound, Search, Filter } from 'lucide-react';
import { PaginationControls } from '../inventory/pagination-controls';
import { Staff } from '../../types/staff';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createStaffTableColumns, StaffMobileCard } from './staff-table-columns';
import { useMemo } from 'react';
import styles from './staff-highlights.module.css';

interface StaffManagementProps {
    staff: Staff[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    filteredStaff: Staff[];
    paginatedStaff: Staff[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalStaff: number;
    itemsPerPage: number;
    processing: boolean;
    onDelete: (staff: Staff) => void;
    onDeactivate: (staff: Staff) => void;
    onReactivate: (staff: Staff) => void;
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
    filteredStaff,
    paginatedStaff,
    currentPage,
    setCurrentPage,
    totalPages,
    totalStaff,
    itemsPerPage,
    processing,
    onDelete,
    onDeactivate,
    onReactivate,
    highlightStaffId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showSearch,
    setShowSearch
}: StaffManagementProps) => {
    const t = useTranslation();
    
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Create column definitions
    const staffColumns = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return createStaffTableColumns(t, processing, onDelete, onDeactivate, onReactivate, startIndex);
    }, [t, processing, onDelete, onDeactivate, onReactivate, currentPage, itemsPerPage]);

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('staff.staff_directory')}</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            {t('staff.staff_management_description')}
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
                        {showSearch ? t('ui.hide_search') : t('ui.search')}
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
                                placeholder={t('staff.search_staff_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder={t('staff.all_categories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('staff.all_categories')}</SelectItem>
                                    <SelectItem value="inventory">{t('staff.inventory_management')}</SelectItem>
                                    <SelectItem value="orders">{t('staff.order_management')}</SelectItem>
                                    <SelectItem value="logistics">{t('staff.logistics_management')}</SelectItem>
                                    <SelectItem value="sales">{t('staff.sales_management')}</SelectItem>
                                    <SelectItem value="trends">{t('staff.trend_analysis')}</SelectItem>
                                    <SelectItem value="general">{t('staff.general_staff')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground font-medium">
                        {t('staff.showing_staff', { 
                            count: paginatedStaff.length, 
                            total: filteredStaff.length 
                        })}
                        {selectedCategory !== 'all' && ` ${t('staff.staff_category_filter', { category: selectedCategory })}`}
                    </span>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="text-sm text-primary no-underline transition-colors duration-200 hover:text-primary/80"
                        >
                            {t('staff.clear_filters')}
                        </button>
                    )}
                </div>
            </div>

            {/* Staff Table */}
            <BaseTable
                data={paginatedStaff}
                columns={staffColumns}
                keyExtractor={(staffMember) => staffMember.id}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                getRowClassName={(staffMember) =>
                    highlightStaffId === staffMember.id ? styles.highlighted : ''
                }
                renderMobileCard={(staffMember) => (
                    <StaffMobileCard
                        staff={staffMember}
                        t={t}
                        processing={processing}
                        onDelete={onDelete}
                        onDeactivate={onDeactivate}
                        onReactivate={onReactivate}
                    />
                )}
                emptyState={
                    <div className="text-center py-8">
                        <UsersRound className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm ? t('staff.no_staff_found') : t('staff.no_staff_available')}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchTerm
                                ? t('staff.no_staff_match_search', { search: searchTerm })
                                : t('staff.no_staff_registered')}
                        </p>
                    </div>
                }
            />

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
