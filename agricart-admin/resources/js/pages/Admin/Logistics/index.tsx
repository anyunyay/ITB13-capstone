import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { BellDot } from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { DashboardHeader } from '@/components/logistics/dashboard-header';
import { LogisticManagement } from '@/components/logistics/logistic-management';
import { DeactivationModal } from '@/components/logistics/deactivation-modal';
import { ReactivationModal } from '@/components/logistics/reactivation-modal';
import { Logistic, LogisticStats } from '@/types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface PageProps extends SharedData {
    logistics: Logistic[];
    flash: {
        message?: string;
        error?: string;
    };
}

export default function Index() {
    const t = useTranslation();
    const { logistics = [], flash, auth } = usePage<PageProps>().props;

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showDeactivated, setShowDeactivated] = useState(false);
    const [showDeactivationModal, setShowDeactivationModal] = useState(false);
    const [showReactivationModal, setShowReactivationModal] = useState(false);
    const [selectedLogistic, setSelectedLogistic] = useState<Logistic | null>(null);
    const [highlightLogisticId, setHighlightLogisticId] = useState<number | null>(null);

    const itemsPerPage = 10;

    // Check if the user is authenticated
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy, post } = useForm();

    // Calculate statistics
    const logisticStats: LogisticStats = useMemo(() => {
        const activeLogistics = logistics.filter(l => l.active);
        const deactivatedLogistics = logistics.filter(l => !l.active);

        return {
            totalLogistics: logistics.length,
            activeLogistics: activeLogistics.length,
            deactivatedLogistics: deactivatedLogistics.length,
            pendingRequests: 0 // This would come from your backend
        };
    }, [logistics]);

    // Filter and sort logistics
    const filteredAndSortedLogistics = useMemo(() => {
        let filtered = logistics.filter(logistic => {
            const matchesSearch = !searchTerm ||
                logistic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                logistic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                logistic.id.toString().includes(searchTerm) ||
                (logistic.contact_number && logistic.contact_number.includes(searchTerm));

            const matchesStatus = showDeactivated ? !logistic.active : logistic.active;

            return matchesSearch && matchesStatus;
        });

        // Sort logistics
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
    }, [logistics, searchTerm, showDeactivated, sortBy, sortOrder]);

    // Paginate logistics
    const paginatedLogistics = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedLogistics.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedLogistics, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedLogistics.length / itemsPerPage);

    // Handle deactivation
    const handleDeactivate = (logistic: Logistic) => {
        if (logistic.can_be_deactivated) {
            setSelectedLogistic(logistic);
            setShowDeactivationModal(true);
        }
    };

    const handleConfirmDeactivation = () => {
        if (selectedLogistic) {
            destroy(route('logistics.destroy', selectedLogistic.id), {
                onSuccess: () => {
                    setShowDeactivationModal(false);
                    setSelectedLogistic(null);
                    setHighlightLogisticId(selectedLogistic.id);
                    setTimeout(() => setHighlightLogisticId(null), 3000);
                }
            });
        }
    };

    const handleCancelDeactivation = () => {
        setShowDeactivationModal(false);
        setSelectedLogistic(null);
    };

    // Handle reactivation
    const handleReactivate = (logistic: Logistic) => {
        setSelectedLogistic(logistic);
        setShowReactivationModal(true);
    };

    const handleConfirmReactivation = () => {
        if (selectedLogistic) {
            post(route('logistics.reactivate', selectedLogistic.id), {
                onSuccess: () => {
                    setShowReactivationModal(false);
                    setSelectedLogistic(null);
                    setHighlightLogisticId(selectedLogistic.id);
                    setTimeout(() => setHighlightLogisticId(null), 3000);
                }
            });
        }
    };

    const handleCancelReactivation = () => {
        setShowReactivationModal(false);
        setSelectedLogistic(null);
    };

    // Handle deletion
    const handleDelete = (logistic: Logistic) => {
        if (confirm(t('admin.confirm_delete_logistic'))) {
            destroy(route('logistics.hard-delete', logistic.id), {
                onSuccess: () => {
                    setHighlightLogisticId(logistic.id);
                    setTimeout(() => setHighlightLogisticId(null), 3000);
                }
            });
        }
    };

    return (
        <PermissionGuard
            permissions={['view logistics', 'create logistics', 'edit logistics', 'deactivate logistics', 'reactivate logistics', 'generate logistics report']}
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.logistic_management')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
                        {/* Flash Messages */}
                        <FlashMessage flash={flash} />

                        {/* Dashboard Header */}
                        <DashboardHeader logisticStats={logisticStats} />

                        {/* Logistics Management */}
                        <LogisticManagement
                            logistics={logistics}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            filteredAndSortedLogistics={filteredAndSortedLogistics}
                            paginatedLogistics={paginatedLogistics}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            totalLogistics={filteredAndSortedLogistics.length}
                            itemsPerPage={itemsPerPage}
                            processing={processing}
                            onDeactivate={handleDeactivate}
                            onReactivate={handleReactivate}
                            onDelete={handleDelete}
                            highlightLogisticId={highlightLogisticId}
                            showDeactivated={showDeactivated}
                            setShowDeactivated={setShowDeactivated}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                        />

                        {/* Deactivation Modal */}
                        <DeactivationModal
                            isOpen={showDeactivationModal}
                            onClose={handleCancelDeactivation}
                            onConfirm={handleConfirmDeactivation}
                            logistic={selectedLogistic}
                            processing={processing}
                        />

                        {/* Reactivation Modal */}
                        <ReactivationModal
                            isOpen={showReactivationModal}
                            onClose={handleCancelReactivation}
                            onConfirm={handleConfirmReactivation}
                            logistic={selectedLogistic}
                            processing={processing}
                        />
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
