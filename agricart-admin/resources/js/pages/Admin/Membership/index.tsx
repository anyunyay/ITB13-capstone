import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BellDot, Clock, CheckCircle, XCircle } from 'lucide-react';
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
    }
    members: Member[];
    pendingPasswordRequests: PasswordChangeRequest[];
    [key: string]: unknown;
}

export default function Index() {

    const { members, flash, auth, pendingPasswordRequests } = usePage<PageProps & SharedData>().props;
    const [newRequest, setNewRequest] = useState<PasswordChangeRequest | null>(null);
    const [highlightMemberId, setHighlightMemberId] = useState<number | null>(null);
    const prevRequestIdsRef = useRef<Set<number>>(new Set());
    const requestIds = useMemo(() => new Set((pendingPasswordRequests || []).map(r => r.id)), [pendingPasswordRequests]);
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy, post } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete - ${name}?`)) {
            // Call the delete route
            destroy(route('membership.destroy', id));
        }
    };

    const handleApprovePasswordChange = (requestId: number) => {
        if (confirm('Are you sure you want to approve this password change request?')) {
            post(route('membership.approve-password-change', requestId));
        }
    };

    const handleRejectPasswordChange = (requestId: number) => {
        if (confirm('Are you sure you want to reject this password change request?')) {
            post(route('membership.reject-password-change', requestId));
        }
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
            permissions={['view members', 'create members', 'edit members', 'delete members', 'generate membership report']}
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
                                                    onClick={() => handleApprovePasswordChange(request.id)}
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleRejectPasswordChange(request.id)}
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
                                        <Link href={route('membership.edit', member.id)}><Button disabled={processing} className=''>Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(member.id, member.name)} className=''>Remove</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
