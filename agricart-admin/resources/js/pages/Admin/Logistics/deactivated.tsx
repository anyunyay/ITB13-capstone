import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, RotateCcw, CheckCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';
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

interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    registration_date?: string;
    type: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        full_address: string;
    };
    [key: string]: unknown;
}

interface PageProps {
    flash: {
        message?: string
        error?: string
    }
    deactivatedLogistics: Logistic[];
    [key: string]: unknown;
}

export default function Deactivated() {

    const { deactivatedLogistics, flash, auth } = usePage<PageProps & SharedData>().props;
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
                <div className="m-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Deactivated Logistics</h1>
                    <div className="flex gap-2">
                        <Link href={route('logistics.index')}><Button variant="outline">Back to Active Logistics</Button></Link>
                    </div>
                </div>

                <div className='m-4'>
                    <div>
                        {flash.message && (
                            <Alert>
                                <BellDot className='h-4 w-4 text-blue-500' />
                                <AlertTitle>Notification!</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
                            </Alert>
                        )}
                        {flash.error && (
                            <Alert className="border-red-300">
                                <BellDot className='h-4 w-4 text-red-500' />
                                <AlertTitle>Error!</AlertTitle>
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

            {deactivatedLogistics.length > 0 && (
                <div className='w-full pt-8'>
                    <Table>
                        <TableCaption>Total list of deactivated logistics</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Email</TableHead>
                                <TableHead className="text-center">Contact Number</TableHead>
                                <TableHead className="text-center">Address</TableHead>
                                <TableHead className="text-center">Registration Date</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deactivatedLogistics.map((logistic, idx) => (
                                <TableRow className="text-center" key={logistic.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{logistic.name}</TableCell>
                                    <TableCell>{logistic.email}</TableCell>
                                    <TableCell>{logistic.contact_number}</TableCell>
                                    <TableCell>
                                        {logistic.default_address ? 
                                            `${logistic.default_address.street}, ${logistic.default_address.barangay}, ${logistic.default_address.city}, ${logistic.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>{logistic.registration_date}</TableCell>
                                    <TableCell>
                                        <PermissionGate permission="edit logistics">
                                            <Button 
                                                disabled={processing} 
                                                onClick={() => handleReactivateClick(logistic)} 
                                                className='bg-green-600 hover:bg-green-700 text-white'
                                            >
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                Reactivate
                                            </Button>
                                        </PermissionGate>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {deactivatedLogistics.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No deactivated logistics found.</p>
                </div>
            )}

            {/* Reactivation Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Confirm Reactivation
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reactivate this logistic?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLogistic && (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-1">Logistic Details:</h4>
                                <p className="text-green-700">{selectedLogistic.name}</p>
                                <p className="text-sm text-green-600">{selectedLogistic.email}</p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>This action will:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Reactivate the logistic account</li>
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
        </AppLayout>
        </PermissionGuard>
    );
}