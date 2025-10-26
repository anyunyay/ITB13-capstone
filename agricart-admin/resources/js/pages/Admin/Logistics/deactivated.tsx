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
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
                        {/* Flash Messages */}
                        <FlashMessage flash={flash} />
                        
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-3">
                            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <RotateCcw className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-foreground leading-tight m-0">Deactivated Logistics</h1>
                                            <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                                View and manage deactivated logistics partners
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Button asChild variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('logistics.index')}>
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Back to Active Logistics
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Deactivated Logistics Table */}
                        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
                            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                                        <RotateCcw className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Deactivated Logistics Partners</h2>
                                        <p className="text-sm text-muted-foreground m-0">
                                            {deactivatedLogistics.length} deactivated logistics partner{deactivatedLogistics.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {deactivatedLogistics.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[color-mix(in_srgb,var(--muted)_50%,transparent)]">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Email</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Contact Number</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Address</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Registration Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deactivatedLogistics.map((logistic, idx) => (
                                                <tr key={logistic.id} className="border-b border-border transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]">
                                                    <td className="px-4 py-3 text-sm text-foreground">{idx + 1}</td>
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
                                                        <div className="flex gap-2">
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
                                <div className="text-center py-8">
                                    <RotateCcw className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No deactivated logistics found</h3>
                                    <p className="text-muted-foreground">
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