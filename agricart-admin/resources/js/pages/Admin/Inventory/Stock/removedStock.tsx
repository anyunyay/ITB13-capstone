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

interface RemovedStockItem {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    product: Product;
    member: Member;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: 'removed' | 'damaged' | 'expired';
    removed_at: string;
    notes?: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    stocks: RemovedStockItem[];
    [key: string]: unknown;
}

export default function RemovedStockIndex() {
    const t = useTranslation();
    const { stocks = [], flash, auth } = usePage<PageProps & SharedData>().props;
    const { post, processing } = useForm();

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const handleRestore = (stockId: number) => {
        post(route('inventory.removedStock.restore', stockId), {
            onSuccess: () => {
                // The page will refresh and show updated data
            },
        });
    };

    return (
        <AppLayout>
            <Head title={t('admin.removed_stock')} />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>{t('admin.back_to_inventory')}</Button></Link>

                {flash.message && (
                    <Alert className="mt-4">
                            <AlertTitle>{t('admin.success')}</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {stocks.length > 0 ? (
                    <div className='w-full pt-8'>
                        <Table>
                            <TableCaption>{t('admin.list_recently_removed_stocks')}</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">{t('admin.stock_id')}</TableHead>
                                    <TableHead className="text-center">{t('admin.product_name')}</TableHead>
                                    <TableHead className="text-center">{t('admin.quantity')}</TableHead>
                                    <TableHead className="text-center">{t('admin.category')}</TableHead>
                                    <TableHead className="text-center">{t('admin.removal_notes')}</TableHead>
                                    <TableHead className="text-center">{t('admin.removed_at')}</TableHead>
                                    <TableHead className="text-center">{t('admin.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.map((stock) => (
                                    <TableRow key={stock.id}>
                                        <TableCell className="text-center">{stock.id}</TableCell>
                                        <TableCell className="text-center">{stock.product?.name}</TableCell>
                                        <TableCell className="text-center">{
                                            stock.category === 'Kilo'
                                                ? stock.quantity
                                                : Math.floor(stock.quantity)
                                        }</TableCell>
                                        <TableCell className="text-center">{stock.category}</TableCell>
                                        <TableCell className="text-center max-w-xs truncate" title={stock.notes}>
                                            {stock.notes || t('admin.no_notes')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {new Date(stock.removed_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                onClick={() => handleRestore(stock.id)}
                                                disabled={processing}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {t('admin.restore')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="w-full pt-8 flex justify-center">
                        <Alert>
                            <AlertTitle>{t('admin.no_removed_stock_data')}</AlertTitle>
                            <AlertDescription>
                                {t('admin.no_removed_stock_records')}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}


