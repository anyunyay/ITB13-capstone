import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, AlertTriangle } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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
    can_be_deactivated: boolean;
    deactivation_reason?: string;
    [key: string]: unknown;
}

interface PageProps {
    flash: {
        message?: string
        error?: string
    }
    logistics: Logistic[];
    [key: string]: unknown;
}

export default function Index() {

    const { logistics, flash, auth } = usePage<PageProps & SharedData>().props;
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedLogistic, setSelectedLogistic] = useState<Logistic | null>(null);
    
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy } = useForm();

    const handleDeactivateClick = (logistic: Logistic) => {
        if (logistic.can_be_deactivated) {
            setSelectedLogistic(logistic);
            setShowConfirmationModal(true);
        }
    };

    const handleConfirmDeactivation = () => {
        if (selectedLogistic) {
            destroy(route('logistics.destroy', selectedLogistic.id));
            setShowConfirmationModal(false);
            setSelectedLogistic(null);
        }
    };

    const handleCancelDeactivation = () => {
        setShowConfirmationModal(false);
        setSelectedLogistic(null);
    };

    return (
        <PermissionGuard 
            permissions={['view logistics', 'create logistics', 'edit logistics', 'delete logistics', 'generate logistics report']}
            pageTitle="Logistics Management Access Denied"
        >
            <AppLayout>
                <Head title="Logistics " />
                <div className="m-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Logistics Management</h1>
                    <div className="flex gap-2">
                        <PermissionGate permission="create logistics">
                            <Link href={route('logistics.add')}><Button>Add Logistic</Button></Link>
                        </PermissionGate>
                        <PermissionGate permission="view logistics">
                            <Link href={route('logistics.deactivated')}><Button variant="outline">View Deactivated</Button></Link>
                        </PermissionGate>
                        <PermissionGate permission="generate logistics report">
                            <Link href={route('logistics.report')}><Button variant="outline">Generate Report</Button></Link>
                        </PermissionGate>
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

            {logistics.length > 0 && (
                <div className='w-full pt-8'>
                    <Table>
                        <TableCaption>Total list of logistics</TableCaption>
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
                            {logistics.map((logistic, idx) => (
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
                                        <div className="flex gap-2 justify-center">
                                            <PermissionGate permission="edit logistics">
                                                <Link href={route('logistics.edit', logistic.id)}><Button disabled={processing} className=''>Edit</Button></Link>
                                            </PermissionGate>
                                            <PermissionGate permission="delete logistics">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <Button 
                                                                    disabled={processing || !logistic.can_be_deactivated} 
                                                                    onClick={() => handleDeactivateClick(logistic)} 
                                                                    className={logistic.can_be_deactivated ? '' : 'opacity-50 cursor-not-allowed'}
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!logistic.can_be_deactivated && logistic.deactivation_reason && (
                                                            <TooltipContent>
                                                                <p className="max-w-xs text-center">{logistic.deactivation_reason}</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </PermissionGate>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Confirm Deactivation
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate this logistic?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLogistic && (
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <h4 className="font-medium text-orange-800 mb-1">Logistic Details:</h4>
                                <p className="text-orange-700">{selectedLogistic.name}</p>
                                <p className="text-sm text-orange-600">{selectedLogistic.email}</p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>This action will:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Deactivate the logistic account</li>
                                    <li>Prevent them from accessing the system</li>
                                    <li>Move them to the deactivated logistics list</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelDeactivation}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleConfirmDeactivation}
                            disabled={processing}
                        >
                            {processing ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
