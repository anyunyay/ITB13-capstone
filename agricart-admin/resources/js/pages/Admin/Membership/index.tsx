import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BellDot, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';
import { SafeImage } from '@/lib/image-utils';
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

interface Member {
    id: number;
    name: string;
    member_id?: string;
    contact_number?: string;
    registration_date?: string;
    document?: string;
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

interface PasswordChangeRequest {
    id: number;
    member_id: number;
    status: string;
    requested_at: string;
    processed_at?: string;
    admin_notes?: string;
    member: Member;
    processed_by?: {
        id: number;
        name: string;
    };
}

interface PageProps {
    flash: {
        message?: string
        error?: string
    }
    members: Member[];
    pendingPasswordRequests: PasswordChangeRequest[];
    [key: string]: unknown;
}

export default function Index() {

    const { members, flash, auth, pendingPasswordRequests } = usePage<PageProps & SharedData>().props;
    const [newRequest, setNewRequest] = useState<PasswordChangeRequest | null>(null);
    const [highlightMemberId, setHighlightMemberId] = useState<number | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showPasswordApprovalModal, setShowPasswordApprovalModal] = useState(false);
    const [showPasswordRejectionModal, setShowPasswordRejectionModal] = useState(false);
    const [selectedPasswordRequest, setSelectedPasswordRequest] = useState<PasswordChangeRequest | null>(null);
    const prevRequestIdsRef = useRef<Set<number>>(new Set());
    const requestIds = useMemo(() => new Set((pendingPasswordRequests || []).map(r => r.id)), [pendingPasswordRequests]);
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy, post } = useForm();

    const handleDeactivateClick = (member: Member) => {
        if (member.can_be_deactivated) {
            setSelectedMember(member);
            setShowConfirmationModal(true);
        }
    };

    const handleConfirmDeactivation = () => {
        if (selectedMember) {
            destroy(route('membership.destroy', selectedMember.id));
            setShowConfirmationModal(false);
            setSelectedMember(null);
        }
    };

    const handleCancelDeactivation = () => {
        setShowConfirmationModal(false);
        setSelectedMember(null);
    };

    const handleApprovePasswordChangeClick = (request: PasswordChangeRequest) => {
        setSelectedPasswordRequest(request);
        setShowPasswordApprovalModal(true);
    };

    const handleRejectPasswordChangeClick = (request: PasswordChangeRequest) => {
        setSelectedPasswordRequest(request);
        setShowPasswordRejectionModal(true);
    };

    const handleConfirmPasswordApproval = () => {
        if (selectedPasswordRequest) {
            post(route('membership.approve-password-change', selectedPasswordRequest.id));
            setShowPasswordApprovalModal(false);
            setSelectedPasswordRequest(null);
        }
    };

    const handleConfirmPasswordRejection = () => {
        if (selectedPasswordRequest) {
            post(route('membership.reject-password-change', selectedPasswordRequest.id));
            setShowPasswordRejectionModal(false);
            setSelectedPasswordRequest(null);
        }
    };

    const handleCancelPasswordAction = () => {
        setShowPasswordApprovalModal(false);
        setShowPasswordRejectionModal(false);
        setSelectedPasswordRequest(null);
    };

    // Auto-refresh pending password requests via polling
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['pendingPasswordRequests'],
            });
        }, 10000); // every 10s
        return () => clearInterval(interval);
    }, []);

    // Detect new incoming password change requests
    useEffect(() => {
        // Initialize previous ids if empty
        if (prevRequestIdsRef.current.size === 0 && requestIds.size > 0) {
            prevRequestIdsRef.current = new Set(requestIds);
            return;
        }

        // Find newly added request ids
        const newlyAdded: number[] = [];
        requestIds.forEach(id => {
            if (!prevRequestIdsRef.current.has(id)) newlyAdded.push(id);
        });

        if (newlyAdded.length > 0 && pendingPasswordRequests && pendingPasswordRequests.length > 0) {
            const newest = pendingPasswordRequests.find(r => r.id === newlyAdded[0]) || null;
            if (newest) setNewRequest(newest);
        }

        // Update ref for next comparison
        prevRequestIdsRef.current = new Set(requestIds);
    }, [requestIds, pendingPasswordRequests]);

    const handleNavigateToMember = (memberId: number) => {
        const rowEl = document.getElementById(`member-row-${memberId}`);
        if (rowEl) {
            rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightMemberId(memberId);
            setTimeout(() => setHighlightMemberId(null), 5000);
        }
    };

    return (
        <PermissionGuard 
            permissions={['view membership']}
            pageTitle="Membership Management Access Denied"
        >
            <AppLayout>
                <Head title="Membership" />
                <div className="m-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Membership Management</h1>
                    <div className="flex gap-2">
                        <PermissionGate permission="create members">
                            <Link href={route('membership.add')}><Button>Add Member</Button></Link>
                        </PermissionGate>
                        <PermissionGate permission="view membership">
                            <Link href={route('membership.deactivated')}><Button variant="outline">View Deactivated</Button></Link>
                        </PermissionGate>
                        <PermissionGate permission="generate membership report">
                            <Link href={route('membership.report')}><Button variant="outline">Generate Report</Button></Link>
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
                        {newRequest && (
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => {
                                    handleNavigateToMember(newRequest.member.id);
                                    setNewRequest(null);
                                }}
                            >
                                <Alert className="cursor-pointer border-green-300">
                                    <BellDot className='h-4 w-4 text-green-600' />
                                    <AlertTitle>New Password Change Request</AlertTitle>
                                    <AlertDescription>
                                        {newRequest.member.name} just submitted a password change request. Click to view member.
                                    </AlertDescription>
                                </Alert>
                            </button>
                        )}
                    </div>
                </div>

                {/* Password Change Requests Section */}
                {pendingPasswordRequests && pendingPasswordRequests.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center mb-4">
                                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                <h2 className="text-lg font-semibold text-yellow-800">Pending Password Change Requests</h2>
                            </div>
                            <div className="space-y-3">
                                {pendingPasswordRequests.map((request) => (
                                    <div key={request.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.member.name}</p>
                                                        <p className="text-sm text-gray-600">Member ID: {request.member.member_id}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Requested: {new Date(request.requested_at).toLocaleString()}
                                                        </p>
                                                        {request.admin_notes && (
                                                            <p className="text-sm text-gray-500">
                                                                Notes: {request.admin_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => handleApprovePasswordChangeClick(request)}
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleRejectPasswordChangeClick(request)}
                                                    disabled={processing}
                                                    variant="destructive"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            {members.length > 0 && (
                <div className='w-full pt-8'>
                    <Table>
                        <TableCaption>Total list of members</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Member ID</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Contact Number</TableHead>
                                <TableHead className="text-center">Address</TableHead>
                                <TableHead className="text-center">Registration Date</TableHead>
                                <TableHead className="text-center">Document</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member, idx) => (
                                <TableRow
                                    id={`member-row-${member.id}`}
                                    className={`text-center ${highlightMemberId === member.id ? 'bg-yellow-100 transition-colors' : ''}`}
                                    key={member.id}
                                >
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{member.member_id || 'N/A'}</TableCell>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.contact_number}</TableCell>
                                    <TableCell>
                                        {member.default_address ? 
                                            `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>{member.registration_date}</TableCell>
                                    <TableCell className="flex justify-center">
                                        <SafeImage 
                                            src={member.document} 
                                            alt={`Document for ${member.name}`} 
                                            className="max-w-24 object-cover rounded"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-center">
                                            <PermissionGate permission="edit members">
                                                <Link href={route('membership.edit', member.id)}><Button disabled={processing} className=''>Edit</Button></Link>
                                            </PermissionGate>
                                            <PermissionGate permission="delete members">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <Button 
                                                                    disabled={processing || !member.can_be_deactivated} 
                                                                    onClick={() => handleDeactivateClick(member)} 
                                                                    className={member.can_be_deactivated ? '' : 'opacity-50 cursor-not-allowed'}
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!member.can_be_deactivated && member.deactivation_reason && (
                                                            <TooltipContent>
                                                                <p className="max-w-xs text-center">{member.deactivation_reason}</p>
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

            {/* Member Deactivation Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Confirm Deactivation
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate this member?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedMember && (
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <h4 className="font-medium text-orange-800 mb-1">Member Details:</h4>
                                <p className="text-orange-700">{selectedMember.name}</p>
                                <p className="text-sm text-orange-600">Member ID: {selectedMember.member_id}</p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>This action will:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Deactivate the member account</li>
                                    <li>Prevent them from accessing the system</li>
                                    <li>Move them to the deactivated members list</li>
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

            {/* Password Change Approval Modal */}
            <Dialog open={showPasswordApprovalModal} onOpenChange={setShowPasswordApprovalModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Approve Password Change
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this password change request?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPasswordRequest && (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-1">Member Details:</h4>
                                <p className="text-green-700">{selectedPasswordRequest.member.name}</p>
                                <p className="text-sm text-green-600">Member ID: {selectedPasswordRequest.member.member_id}</p>
                                <p className="text-sm text-green-600">
                                    Requested: {new Date(selectedPasswordRequest.requested_at).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>This action will:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Approve the password change request</li>
                                    <li>Allow the member to change their password</li>
                                    <li>Mark the request as processed</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelPasswordAction}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white" 
                            onClick={handleConfirmPasswordApproval}
                            disabled={processing}
                        >
                            {processing ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Change Rejection Modal */}
            <Dialog open={showPasswordRejectionModal} onOpenChange={setShowPasswordRejectionModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Reject Password Change
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this password change request?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPasswordRequest && (
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-medium text-red-800 mb-1">Member Details:</h4>
                                <p className="text-red-700">{selectedPasswordRequest.member.name}</p>
                                <p className="text-sm text-red-600">Member ID: {selectedPasswordRequest.member.member_id}</p>
                                <p className="text-sm text-red-600">
                                    Requested: {new Date(selectedPasswordRequest.requested_at).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>This action will:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Reject the password change request</li>
                                    <li>Prevent the member from changing their password</li>
                                    <li>Mark the request as rejected</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelPasswordAction}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleConfirmPasswordRejection}
                            disabled={processing}
                        >
                            {processing ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
