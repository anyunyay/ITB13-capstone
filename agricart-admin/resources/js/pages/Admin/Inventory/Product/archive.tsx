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
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
    archived_at: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    archivedProducts: Product[];
    [key: string]: unknown;
}

export default function Archive() {
    const { archivedProducts, flash, auth } = usePage<PageProps & SharedData>().props;
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);
    const { processing, post, delete: destroy } = useForm();

    const handleRestore = (id: number, name: string) => {
        if (confirm(`Restore archived product - ${name}?`)) {
            post(route('inventory.archived.restore', id));
        }
    };

    const handleForceDelete = (id: number, name: string) => {
        if (confirm(`Permanently delete archived product - ${name}? This cannot be undone.`)) {
            destroy(route('inventory.archived.forceDelete', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Archived Inventory" />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>Back to Inventory</Button></Link>

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

                <div className='grid grid-cols-5 gap-2'>
                    {archivedProducts.map((product) => (
                        <Card key={product.id} className='w-70'>
                            <div>
                                <img src={product.image} alt={product.name} />
                            </div>
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    <div className="text-sm">
                                        {product.price_kilo && <div>Kilo: P{product.price_kilo}</div>}
                                        {product.price_pc && <div>Pc: P{product.price_pc}</div>}
                                        {product.price_tali && <div>Tali: P{product.price_tali}</div>}
                                        {!product.price_kilo && !product.price_pc && !product.price_tali && <div>No prices set</div>}
                                    </div>
                                </CardDescription>
                                <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                                <CardAction>
                                    <Button disabled={processing} onClick={() => handleRestore(product.id, product.name)}>
                                        Restore
                                    </Button>
                                    <Button variant="destructive" disabled={processing} onClick={() => handleForceDelete(product.id, product.name)}>
                                        Delete
                                    </Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <p className="text-md break-words">{product.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
