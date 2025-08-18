import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

interface RemovedStockItem {
    id: number;
    stock_id?: number;
    product_id: number;
    quantity: number;
    member_id: number;
    customer_id?: number;
    product: Product;
    member: Member;
    customer?: Customer;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: 'removed' | 'damaged' | 'expired';
    created_at: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    stocks: RemovedStockItem[];
    [key: string]: unknown;
}

export default function RemovedStockIndex() {
    const { stocks = [], flash, auth } = usePage<PageProps & SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing } = useForm();

    return (
        <AppLayout>
            <Head title="Removed Stock" />
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
                                    <TableHead className="text-center">Removed At</TableHead>
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


