import { Button } from '@/components/ui/button';
import { IdCard, Search, Eye, EyeOff } from 'lucide-react';
import { PaginationControls } from '../inventory/pagination-controls';
import { AdminSearchBar } from '@/components/ui/admin-search-bar';
import { Logistic } from '../../types/logistics';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createLogisticsTableColumns, LogisticsMobileCard } from './logistics-table-columns';
import { useMemo } from 'react';

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
    const logisticsColumns = useMemo(() => {
        return createLogisticsTableColumns(t, processing, onDeactivate, onReactivate);
    }, [t, processing, onDeactivate, onReactivate]);

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <IdCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.logistics_directory')}</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            {showDeactivated ? t('admin.viewing_deactivated_logistics') : t('admin.manage_and_view_all_logistics')}
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
                        {showSearch ? t('ui.hide_search') : t('ui.search')}
                    </Button>
                    <Button
                        variant={showDeactivated ? "default" : "outline"}
                        onClick={() => setShowDeactivated(!showDeactivated)}
                        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {showDeactivated ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                {t('admin.hide_deactivated')}
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('admin.view_deactivated')}
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
                placeholder={t('admin.search_logistics_placeholder')}
                resultsCount={paginatedLogistics.length}
                totalCount={totalLogistics}
            />

            {/* Logistics Table */}
            <BaseTable
                data={paginatedLogistics}
                columns={logisticsColumns}
                keyExtractor={(logistic) => logistic.id}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                getRowClassName={(logistic) => 
                    highlightLogisticId === logistic.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                }
                renderMobileCard={(logistic) => (
                    <LogisticsMobileCard
                        logistic={logistic}
                        t={t}
                        processing={processing}
                        onDeactivate={onDeactivate}
                        onReactivate={onReactivate}
                    />
                )}
                emptyState={
                    <div className="text-center py-8">
                        <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm ? t('admin.no_logistics_found') : t('admin.no_logistics_available')}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchTerm
                                ? t('admin.no_logistics_match_search', { search: searchTerm })
                                : showDeactivated
                                ? t('admin.no_deactivated_logistics')
                                : t('admin.no_logistics_registered')}
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
                    totalItems={totalLogistics}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};
