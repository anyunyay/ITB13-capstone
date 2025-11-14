import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
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
    const [showDeactivated, setShowDeactivated] = useState(false);
    const [showDeactivationModal, setShowDeactivationModal] = useState(false);
    const [showReactivationModal, setShowReactivationModal] = useState(false);
    const [selectedLogistic, setSelectedLogistic] = useState<Logistic | null>(null);

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
            pendingRequests: 0
        };
    }, [logistics]);

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
                }
            });
        }
    };

    const handleCancelReactivation = () => {
        setShowReactivationModal(false);
        setSelectedLogistic(null);
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
                            showDeactivated={showDeactivated}
                            setShowDeactivated={setShowDeactivated}
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
