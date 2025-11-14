import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, RotateCcw, CheckCircle, Hash, User, Mail, Phone, MapPin, Calendar, Settings } from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { PermissionGate } from '@/components/common/permission-gate';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Logistic } from '@/types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface PageProps extends SharedData {
    flash: {
        message?: string;
        error?: string;
    };
    deactivatedLogistics: Logistic[];
}

export default function Deactivated() {
    const t = useTranslation();
    const { deactivatedLogistics, flash, auth } = usePage<PageProps>().props;
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedLogistic, setSelectedLogistic] = useState<Logistic | null>(null);
    
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, post } = useForm();

    const handleReactivateClick = (logistic: Logistic) => {
        setSelectedLogistic(logistic);
        setShowConfirmationModal(true);
    };

    const handleConfirmReactivation = () => {
        if (selectedLogistic) {
            post(route('logistics.reactivate', selectedLogistic.id));
            setShowConfirmationModal(false);
            setSelectedLogistic(null);
        }
    };

    const handleCancelReactivation = () => {
        setShowConfirmationModal(false);
        setSelectedLogistic(null);
    };

    // Define table columns
    const columns: BaseTableColumn<Logistic>[] = [
        {
            key: 'index',
            label: 'ID',
            icon: Hash,
            align: 'left',
            maxWidth: '80px',
            render: (logistic, index) => index + 1,
        },
        {
            key: 'name',
            label: t('admin.name'),
            icon: User,
            align: 'left',
            maxWidth: '180px',
            render: (logistic) => <div className="font-medium">{logistic.name}</div>,
        },
        {
            key: 'email',
            label: t('admin.email'),
            icon: Mail,
            align: 'left',
            maxWidth: '200px',
            render: (logistic) => logistic.email,
        },
        {
            key: 'contact_number',
            label: t('admin.contact_number'),
            icon: Phone,
            align: 'left',
            maxWidth: '150px',
            render: (logistic) => logistic.contact_number || t('admin.not_available'),
        },
        {
            key: 'address',
            label: t('admin.address'),
            icon: MapPin,
            align: 'left',
            maxWidth: '250px',
            render: (logistic) => logistic.default_address 
                ? `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}` 
                : t('admin.not_available'),
        },
        {
            key: 'registration_date',
            label: t('admin.registration_date'),
            icon: Calendar,
            align: 'left',
            maxWidth: '150px',
            render: (logistic) => logistic.registration_date 
                ? new Date(logistic.registration_date).toLocaleDateString() 
                : t('admin.not_available'),
        },
        {
            key: 'actions',
            label: t('admin.actions'),
            icon: Settings,
            align: 'left',
            maxWidth: '150px',
            render: (logistic) => (
                <PermissionGate permission="edit logistics">
                    <Button 
                        disabled={processing} 
                        onClick={() => handleReactivateClick(logistic)} 
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t('admin.reactivate')}
                    </Button>
                </PermissionGate>
            ),
        },
    ];

    // Empty state component
    const emptyState = (
        <div className="text-center py-8">
            <RotateCcw className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_deactivated_logistics_found')}</h3>
            <p className="text-muted-foreground">
                {t('admin.no_deactivated_logistics')}
            </p>
        </div>
    );

    return (
        <PermissionGuard 
            permissions={['view logistics', 'edit logistics']}
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.deactivated_logistics')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                        {/* Flash Messages */}
                        <FlashMessage flash={flash} />
                        
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <RotateCcw className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-foreground leading-tight m-0">{t('admin.deactivated_logistics_title')}</h1>
                                            <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                                {t('admin.logistic_management_description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Button asChild variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('logistics.index')}>
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            {t('admin.back_to_active_logistics')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Deactivated Logistics Table */}
                        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
                            <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                                        <RotateCcw className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.deactivated_logistics_title')}</h2>
                                        <p className="text-sm text-muted-foreground m-0">
                                            {deactivatedLogistics.length} {t('admin.deactivated_logistics')} {deactivatedLogistics.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <BaseTable
                                data={deactivatedLogistics}
                                columns={columns}
                                keyExtractor={(logistic) => logistic.id.toString()}
                                emptyState={emptyState}
                                hideMobileCards={true}
                            />
                        </div>

                        {/* Reactivation Confirmation Modal */}
                        <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Confirm Reactivation
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to reactivate this logistics partner?
                                    </DialogDescription>
                                </DialogHeader>
                                
                                {selectedLogistic && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <h4 className="font-medium text-green-800 mb-1">Logistics Partner Details:</h4>
                                            <p className="text-green-700">{selectedLogistic.name}</p>
                                            <p className="text-sm text-green-600">{selectedLogistic.email}</p>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600">
                                            <p><strong>This action will:</strong></p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li>Reactivate the logistics partner account</li>
                                                <li>Allow them to access the system again</li>
                                                <li>Move them back to the active logistics list</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                <DialogFooter>
                                    <Button variant="outline" onClick={handleCancelReactivation}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-white" 
                                        onClick={handleConfirmReactivation}
                                        disabled={processing}
                                    >
                                        {processing ? 'Reactivating...' : 'Reactivate'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}