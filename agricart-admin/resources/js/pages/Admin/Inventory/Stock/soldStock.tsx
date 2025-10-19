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

interface Product {
    id: number;
    name: string;
}

interface Member {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    name: string;
}

interface SoldStock {
    id: number;
    stock_id?: number;
    product_id: number;
    quantity: number;
    member_id: number;
    last_customer_id?: number;
    product: Product;
    member: Member;
    lastCustomer?: Customer;
    category: 'Kilo' | 'Pc' | 'Tali';
    status: 'sold' | 'removed' | 'damaged' | 'expired';
    updated_at: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    stocks: SoldStock[];
    [key: string]: unknown;
}

export default function soldIndex() {

    const { stocks = [], flash, auth } = usePage<PageProps & SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    console.log('sold stocks:', stocks); // Debug output

    const { processing, delete: destroy, post } = useForm();

    return (
        <AppLayout>
            <Head title="Sold Stock" />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>Back to Inventory</Button></Link>

                {stocks.length > 0 ? (
                    <div className='w-full pt-8'>
                        <Table>
                            <TableCaption>List of sold stocks</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Stock ID</TableHead>
                                    <TableHead className="text-center">Product Name</TableHead>
                                    <TableHead className="text-center">Category</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Bought By</TableHead>
                                    <TableHead className="text-center">Sold At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.map((stock) => (
                                    <TableRow key={stock.id}>
                                        <TableCell className="text-center">{stock.id ?? 'N/A'}</TableCell>
                                        <TableCell className="text-center">{stock.product?.name}</TableCell>
                                        <TableCell className="text-center">{stock.category}</TableCell>
                                        <TableCell className="text-center">
                                            Sold
                                        </TableCell>
                                        <TableCell className="text-center">{stock.lastCustomer?.name}</TableCell>
                                        <TableCell className="text-center">
                                            {new Date(stock.updated_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="w-full pt-8 flex justify-center">
                        <Alert>
                            <AlertTitle>No Sold Stock Data</AlertTitle>
                            <AlertDescription>
                                There are currently no sold stock records to display.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
