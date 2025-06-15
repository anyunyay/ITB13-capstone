import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory',
    },
];

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    products: Product[];
    [key: string]: unknown;
}

export default function Index() {

    const { products, flash } = usePage<PageProps>().props;

    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete - ${name}?`)) {
            // Call the delete route
            destroy(route('inventory.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="m-4">
                <Link href={route('inventory.create')}><Button>Create Product</Button></Link>

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
                    {products.map((product) => (
                        <Card key={product.id} className='w-70'>
                            <div>
                                <img src={product.image} alt={product.name} />
                            </div>
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>P{product.price}</CardDescription>
                                <CardAction><Button>Archive</Button></CardAction>
                            </CardHeader>
                            <CardContent>
                                <p className="text-md break-words">{product.description}</p>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button className="w-full">Add Stock</Button>
                                <div className="flex justify-betweeen w-full gap-2">
                                    <Button asChild disabled={processing} className='w-1/2'>
                                        <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                    </Button>
                                    <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {products.length > 0 && (
                    <div className='w-full pt-8'>
                        <Table>
                            <TableCaption>List of product stocks</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Name</TableHead>
                                    <TableHead className="text-center">Price</TableHead>
                                    <TableHead className="text-center">Stocks Available</TableHead>
                                    <TableHead className="text-center">Stock Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow className="text-center">
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        {/* <TableCell>{product.stocks}</TableCell> */}
                                        <TableCell>
                                            <Link href={route('inventory.edit', product.id)}><Button disabled={processing} className=''>Edit</Button></Link>
                                            <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className=''>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
