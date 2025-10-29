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
import { useTranslation } from '@/hooks/use-translation';

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
    product: Product;
    member: Member;
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
    const t = useTranslation();
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
            <Head title={t('admin.sold_stock')} />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>{t('admin.back_to_inventory')}</Button></Link>

                {stocks.length > 0 ? (
                    <div className='w-full pt-8'>
                        <Table>
                            <TableCaption>{t('admin.list_of_sold_stocks')}</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">{t('admin.stock_id')}</TableHead>
                                    <TableHead className="text-center">{t('admin.product_name')}</TableHead>
                                    <TableHead className="text-center">{t('admin.category')}</TableHead>
                                    <TableHead className="text-center">{t('admin.status')}</TableHead>
                                    <TableHead className="text-center">{t('admin.sold_at')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.map((stock) => (
                                    <TableRow key={stock.id}>
                                        <TableCell className="text-center">{stock.id ?? 'N/A'}</TableCell>
                                        <TableCell className="text-center">{stock.product?.name}</TableCell>
                                        <TableCell className="text-center">{stock.category}</TableCell>
                                        <TableCell className="text-center">
                                            {t('admin.sold_status')}
                                        </TableCell>
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
                            <AlertTitle>{t('admin.no_sold_stock_data')}</AlertTitle>
                            <AlertDescription>
                                {t('admin.no_sold_stock_records')}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
