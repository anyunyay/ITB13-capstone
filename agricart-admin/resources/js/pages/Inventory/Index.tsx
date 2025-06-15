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

    const handleEdit = (id: number, name: string) => {
        // Implement edit logic here if needed
    };


    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete - ${name}?`)) {
            // Call the delete route
            destroy(route('inventory.destroy', id));
        }
    };

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

            <div className='grid grid-cols-5 gap-2 m-4'>
                {products.map((product) => (
                    <Card key={product.id} className='w-70'>
                        <div>
                            <img src={product.image} alt={product.name}/>
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
                                <Button asChild disabled={processing} onClick={() => handleEdit(product.id, product.name)} className='w-1/2'> 
                                    <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                </Button>
                                <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {products.length > 0 && (
                <div>
                    <Table>
                        <TableCaption>A list of your recent invoices.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow>
                                    <TableCell className="font-medium">{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell className="text-center">
                                        <Link href={route('inventory.edit', product.id)}><Button disabled={processing} onClick={() => handleEdit(product.id, product.name)} className=''>Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className=''>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppLayout>
    )
}
