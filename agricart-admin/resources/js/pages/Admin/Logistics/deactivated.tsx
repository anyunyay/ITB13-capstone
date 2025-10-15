import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, RotateCcw, CheckCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';
import { FlashMessage } from '@/components/flash-message';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Logistic } from '@/types/logistics';
import styles from './logistics.module.css';

interface PageProps extends SharedData {
    flash: {
        message?: string;
        error?: string;
    };
    deactivatedLogistics: Logistic[];
}

export default function Deactivated() {
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

    return (
        <PermissionGuard 
            permissions={['view logistics', 'edit logistics']}
            pageTitle="Logistics Management Access Denied"
        >
            <AppLayout>
                <Head title="Deactivated Logistics" />
                <div className={styles.logisticsContainer}>
                    <div className={styles.mainContent}>
                        {/* Flash Messages */}
                        <FlashMessage flash={flash} />
                        
                        {/* Header Section */}
                        <div className={styles.dashboardHeader}>
                            <div className={styles.headerMain}>
                                <div className={styles.headerTitleSection}>
                                    <div className={styles.titleContainer}>
                                        <RotateCcw className={styles.headerIcon} />
                                        <div>
                                            <h1 className={styles.headerTitle}>Deactivated Logistics</h1>
                                            <p className={styles.headerSubtitle}>
                                                View and manage deactivated logistics partners
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerActions}>
                                    <Button asChild variant="outline" className={styles.secondaryAction}>
                                        <Link href={route('logistics.index')}>
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Back to Active Logistics
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Deactivated Logistics Table */}
                        <div className={styles.logisticManagementSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionTitleContainer}>
                                    <div className={styles.sectionIcon}>
                                        <RotateCcw className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Deactivated Logistics Partners</h2>
                                        <p className={styles.sectionSubtitle}>
                                            {deactivatedLogistics.length} deactivated logistics partner{deactivatedLogistics.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {deactivatedLogistics.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className={styles.logisticTable}>
                                        <thead className={styles.logisticTableHeader}>
                                            <tr>
                                                <th className={styles.logisticTableHeaderCell}>ID</th>
                                                <th className={styles.logisticTableHeaderCell}>Name</th>
                                                <th className={styles.logisticTableHeaderCell}>Email</th>
                                                <th className={styles.logisticTableHeaderCell}>Contact Number</th>
                                                <th className={styles.logisticTableHeaderCell}>Address</th>
                                                <th className={styles.logisticTableHeaderCell}>Registration Date</th>
                                                <th className={styles.logisticTableHeaderCell}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deactivatedLogistics.map((logistic, idx) => (
                                                <tr key={logistic.id} className={styles.logisticTableRow}>
                                                    <td className={styles.logisticTableCell}>{idx + 1}</td>
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
                                                        <div className={styles.logisticActionCell}>
                                                            <PermissionGate permission="edit logistics">
                                                                <Button 
                                                                    disabled={processing} 
                                                                    onClick={() => handleReactivateClick(logistic)} 
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                                    Reactivate
                                                                </Button>
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
                                    <RotateCcw className={styles.emptyStateIcon} />
                                    <h3 className={styles.emptyStateTitle}>No deactivated logistics found</h3>
                                    <p className={styles.emptyStateDescription}>
                                        There are currently no deactivated logistics partners in the system.
                                    </p>
                                </div>
                            )}
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