import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';
import { Package, Hash, Tag, CheckCircle, Calendar } from 'lucide-react';
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

    const { processing, delete: destroy, post } = useForm();

    // Define table columns
    const columns: BaseTableColumn<SoldStock>[] = [
        {
            key: 'id',
            label: t('admin.stock_id'),
            icon: Hash,
            align: 'center',
            maxWidth: '120px',
            render: (stock) => stock.id ?? 'N/A',
        },
        {
            key: 'product_name',
            label: t('admin.product_name'),
            icon: Package,
            align: 'left',
            maxWidth: '180px',
            render: (stock) => stock.product?.name || 'N/A',
        },
        {
            key: 'category',
            label: t('admin.category'),
            icon: Tag,
            align: 'center',
            maxWidth: '120px',
            render: (stock) => stock.category,
        },
        {
            key: 'status',
            label: t('admin.status'),
            icon: CheckCircle,
            align: 'center',
            maxWidth: '120px',
            render: () => t('admin.sold_status'),
        },
        {
            key: 'updated_at',
            label: t('admin.sold_at'),
            icon: Calendar,
            align: 'center',
            maxWidth: '150px',
            render: (stock) => new Date(stock.updated_at).toLocaleString(),
        },
    ];

    // Empty state component
    const emptyState = (
        <div className="w-full pt-8 flex justify-center">
            <Alert>
                <AlertTitle>{t('admin.no_sold_stock_data')}</AlertTitle>
                <AlertDescription>
                    {t('admin.no_sold_stock_records')}
                </AlertDescription>
            </Alert>
        </div>
    );

    return (
        <AppLayout>
            <Head title={t('admin.sold_stock')} />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>{t('admin.back_to_inventory')}</Button></Link>

                {/* Flash Messages */}
                <div className="mt-4">
                    <FlashMessage flash={{ message: flash.message, type: 'success' }} />
                </div>

                <div className='w-full pt-8'>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-muted-foreground">
                            {t('admin.list_of_sold_stocks')}
                        </h2>
                    </div>
                    <BaseTable
                        data={stocks}
                        columns={columns}
                        keyExtractor={(stock) => stock.id.toString()}
                        emptyState={emptyState}
                        hideMobileCards={true}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
