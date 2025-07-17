import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { BellDot } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Logistics',
        href: '/logistics',
    },
];

interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    registration_date?: string;
    type: string;
    [key: string]: unknown;
}

interface PageProps {
    flash: {
        message?: string
    }
    logistics: Logistic[];
    [key: string]: unknown;
}

export default function Index() {

    const { logistics, flash, auth } = usePage<PageProps & SharedData>().props;
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
            destroy(route('logistics.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logistics " />
            <div className="m-4">
                <Link href={route('logistics.add')}><Button>Add Logistic</Button></Link>

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
                                    <TableCell>{logistic.address}</TableCell>
                                    <TableCell>{logistic.registration_date}</TableCell>
                                    <TableCell>
                                        <Link href={route('logistics.edit', logistic.id)}><Button disabled={processing} className=''>Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(logistic.id, logistic.name)} className=''>Remove</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            </div>
        </AppLayout>
    );
}
