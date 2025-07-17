import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
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
        title: 'Inventory Stock Trail',
        href: '/inventory/stock-trail',
    },
];

interface Product {
    id: number;
    name: string;
}

interface Member {
    id: number;
    name: string;
}

interface Stock {
    stock_id?: number;
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    product: Product;
    member: Member;
    category: 'Kilo' | 'Pc' | 'Tali';
    created_at: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    products: Product[];
    stocks: Stock[];
    [key: string]: unknown;
}

export default function Index() {

    const { stocks = [], flash, auth } = usePage<PageProps & SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    console.log('stocks:', stocks); // Debug output

    const { processing, delete: destroy, post } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Trail" />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>Back to Inventory</Button></Link>

                {stocks.length > 0 ? (
                    <div className='w-full pt-8'>
                        <Table>
                            <TableCaption>List of recently removed stocks</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Stock ID</TableHead>
                                    <TableHead className="text-center">Product Name</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-center">Category</TableHead>
                                    <TableHead className="text-center">Assigned To</TableHead>
                                    <TableHead className="text-center">Deleted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.map((stock) => (
                                    <TableRow key={stock.id}>
                                        <TableCell className="text-center">{stock.stock_id ?? stock.id}</TableCell>
                                        <TableCell className="text-center">{stock.product?.name}</TableCell>
                                        <TableCell className="text-center">{
                                            stock.category === 'Kilo'
                                                ? stock.quantity
                                                : Math.floor(stock.quantity)
                                        }</TableCell>
                                        <TableCell className="text-center">{stock.category}</TableCell>
                                        <TableCell className="text-center">{stock.member?.name}</TableCell>
                                        <TableCell className="text-center">
                                            {new Date(stock.created_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="w-full pt-8 flex justify-center">
                        <Alert>
                            <AlertTitle>No Stock Data</AlertTitle>
                            <AlertDescription>
                                There are currently no stock records to display.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
