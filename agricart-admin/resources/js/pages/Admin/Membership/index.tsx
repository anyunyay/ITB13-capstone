import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { BellDot } from 'lucide-react';
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
    address?: string;
    registration_date?: string;
    document?: string;
    type: string;
    [key: string]: unknown;
}

interface PageProps {
    flash: {
        message?: string
    }
    members: Member[];
    [key: string]: unknown;
}

export default function Index() {

    const { members, flash, auth } = usePage<PageProps & SharedData>().props;
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete - ${name}?`)) {
            // Call the delete route
            destroy(route('membership.destroy', id));
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
                    </div>
                </div>

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
                                <TableRow className="text-center" key={member.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{member.member_id || 'N/A'}</TableCell>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.contact_number}</TableCell>
                                    <TableCell>{member.address || 'N/A'}</TableCell>
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
