import { Button } from '@/components/ui/button';
import { IdCard, Eye, EyeOff } from 'lucide-react';
import { BaseTable } from '@/components/common/base-table';
import { createLogisticsTableColumns, LogisticsMobileCard } from './logistics-table-columns';
import { Logistic } from '@/types/logistics';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useMemo } from 'react';
import { AdminSearchBar } from '@/components/ui/admin-search-bar';

interface LogisticManagementProps {
    logistics: Logistic[];
    showDeactivated: boolean;
    setShowDeactivated: (show: boolean) => void;
}

export const LogisticManagement = ({
    logistics,
    showDeactivated,
    setShowDeactivated,
}: LogisticManagementProps) => {
    const t = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filter and sort logistics
    const filteredLogistics = useMemo(() => {
        let filtered = logistics.filter(logistic => {
            const matchesStatus = showDeactivated ? !logistic.active : logistic.active;
            const matchesSearch = !searchTerm ||
                logistic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                logistic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                logistic.id.toString().includes(searchTerm) ||
                (logistic.contact_number && logistic.contact_number.includes(searchTerm));
            
            return matchesStatus && matchesSearch;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'active':
                    comparison = (a.active ? 1 : 0) - (b.active ? 1 : 0);
                    break;
                case 'registration_date':
                    comparison = new Date(a.registration_date || 0).getTime() - new Date(b.registration_date || 0).getTime();
                    break;
                default:
                    return 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [logistics, showDeactivated, searchTerm, sortBy, sortOrder]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const columns = createLogisticsTableColumns(t);

    const emptyState = (
        <div className="text-center py-12">
            <IdCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? t('admin.no_logistics_found') : t('admin.no_logistics_available')}
            </h3>
            <p className="text-muted-foreground">
                {searchTerm 
                    ? t('admin.no_logistics_match_search', { search: searchTerm })
                    : showDeactivated 
                        ? t('admin.no_deactivated_logistics')
                        : t('admin.no_logistics_registered')
                }
            </p>
        </div>
    );

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <IdCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">
                            {t('admin.logistics_directory')}
                        </h2>
                        <p className="text-sm text-muted-foreground m-0">
                            {showDeactivated 
                                ? t('admin.viewing_deactivated_logistics') 
                                : t('admin.manage_and_view_all_logistics')
                            }
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
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

            <AdminSearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                placeholder={t('admin.search_logistics_placeholder')}
                resultsCount={filteredLogistics.length}
                totalCount={logistics.filter(l => showDeactivated ? !l.active : l.active).length}
            />

            <BaseTable
                data={filteredLogistics}
                columns={columns}
                keyExtractor={(logistic) => logistic.id}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                emptyState={emptyState}
                renderMobileCard={(logistic: Logistic) => <LogisticsMobileCard logistic={logistic} t={t} />}
            />
        </div>
    );
};
