import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BellDot } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory',
    },
];

interface PageProps {
    flash: {
        message?: string
    }
}

export default function Index() {

    const { flash } = usePage().props as PageProps;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="m-4">
                <Link href={route('inventory.create')}><Button>Create Product</Button></Link>
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
        </AppLayout>
    );
}
