import { BaseTableColumn } from '@/components/common/base-table';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface Product {
    id: number;
    name: string;
}

interface Member {
    id: number;
    name: string;
}

export interface RemovedStockItem {
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

interface RemovedStockTableColumnsProps {
    onRestore: (stockId: number) => void;
    processing: boolean;
    t: (key: string) => string;
}

export const createRemovedStockTableColumns = ({
    onRestore,
    processing,
    t
}: RemovedStockTableColumnsProps): BaseTableColumn<RemovedStockItem>[] => [
    {
        key: 'id',
        label: t('admin.stock_id'),
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (stock) => stock.id
    },
    {
        key: 'product_name',
        label: t('admin.product_name'),
        icon: Package,
        sortable: true,
        align: 'left',
        maxWidth: '180px',
        render: (stock) => stock.product?.name || 'N/A'
    },
    {
        key: 'quantity',
        label: t('admin.quantity'),
        sortable: true,
        align: 'right',
        maxWidth: '120px',
        render: (stock) => 
            stock.category === 'Kilo' 
                ? stock.quantity.toString()
                : Math.floor(stock.quantity).toString()
    },
    {
        key: 'category',
        label: t('admin.category'),
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (stock) => stock.category
    },
    {
        key: 'notes',
        label: t('admin.removal_notes'),
        align: 'left',
        maxWidth: '200px',
        render: (stock) => (
            <span className="truncate" title={stock.notes}>
                {stock.notes || t('admin.no_notes')}
            </span>
        )
    },
    {
        key: 'removed_at',
        label: t('admin.removed_at'),
        sortable: true,
        align: 'center',
        maxWidth: '150px',
        render: (stock) => new Date(stock.removed_at).toLocaleString()
    },
    {
        key: 'actions',
        label: t('admin.actions'),
        align: 'center',
        maxWidth: '120px',
        render: (stock) => (
            <Button
                onClick={() => onRestore(stock.id)}
                disabled={processing}
                variant="outline"
                size="sm"
            >
                {t('admin.restore')}
            </Button>
        )
    }
];
