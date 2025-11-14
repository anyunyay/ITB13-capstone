import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';
import { Package, Hash, Weight, Tag, FileText, Calendar, Settings } from 'lucide-react';
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

    // Define table columns
    const columns: BaseTableColumn<RemovedStockItem>[] = [
        {
            key: 'id',
            label: t('admin.stock_id'),
            icon: Hash,
            align: 'center',
            maxWidth: '120px',
            render: (stock) => stock.id,
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
            key: 'quantity',
            label: t('admin.quantity'),
            icon: Weight,
            align: 'right',
            maxWidth: '120px',
            render: (stock) => stock.category === 'Kilo' ? stock.quantity : Math.floor(stock.quantity),
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
            key: 'notes',
            label: t('admin.removal_notes'),
            icon: FileText,
            align: 'left',
            maxWidth: '200px',
            render: (stock) => (
                <span className="truncate" title={stock.notes}>
                    {stock.notes || t('admin.no_notes')}
                </span>
            ),
        },
        {
            key: 'removed_at',
            label: t('admin.removed_at'),
            icon: Calendar,
            align: 'center',
            maxWidth: '150px',
            render: (stock) => new Date(stock.removed_at).toLocaleString(),
        },
        {
            key: 'actions',
            label: t('admin.actions'),
            icon: Settings,
            align: 'center',
            maxWidth: '120px',
            render: (stock) => (
                <Button
                    onClick={() => handleRestore(stock.id)}
                    disabled={processing}
                    variant="outline"
                    size="sm"
                >
                    {t('admin.restore')}
                </Button>
            ),
        },
    ];

    // Empty state component
    const emptyState = (
        <div className="w-full pt-8 flex justify-center">
            <Alert>
                <AlertTitle>{t('admin.no_removed_stock_data')}</AlertTitle>
                <AlertDescription>
                    {t('admin.no_removed_stock_records')}
                </AlertDescription>
            </Alert>
        </div>
    );

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

                <div className='w-full pt-8'>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-muted-foreground">
                            {t('admin.list_recently_removed_stocks')}
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


