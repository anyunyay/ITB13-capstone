import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Hash, Package, Weight, Tag, User, Activity, Edit, Trash2 } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Stock } from '@/types/inventory';

interface StockTableColumnsProps {
    processing: boolean;
    handleRemovePerishedStock: (stock: Stock) => void;
    t: (key: string) => string;
}

export const getStockTableColumns = ({
    processing,
    handleRemovePerishedStock,
    t
}: StockTableColumnsProps): BaseTableColumn<Stock>[] => [
    {
        key: 'id',
        label: t('admin.stock_id'),
        icon: Hash,
        align: 'center',
        maxWidth: '120px',
        sortable: true,
        render: (stock) => <Badge variant="outline">#{stock.id}</Badge>,
    },
    {
        key: 'product',
        label: t('admin.product_name'),
        icon: Package,
        align: 'left',
        maxWidth: '180px',
        sortable: true,
        render: (stock) => (
            <div className="font-medium">{stock.product?.name || '-'}</div>
        ),
    },
    {
        key: 'quantity',
        label: t('admin.quantity'),
        icon: Weight,
        align: 'right',
        maxWidth: '120px',
        sortable: true,
        render: (stock) => (
            <div className="font-semibold">
                {stock.quantity === 0 ? (
                    <div>
                        {stock.category === 'Kilo'
                            ? `${stock.sold_quantity || 0} ${t('admin.kg_sold')}`
                            : stock.category
                            ? `${Math.floor(stock.sold_quantity || 0)} ${stock.category.toLowerCase()} ${t('admin.sold_label')}`
                            : `${stock.sold_quantity || 0} ${t('admin.sold_label')}`
                        }
                    </div>
                ) : (
                    <div>
                        {stock.category === 'Kilo'
                            ? `${stock.quantity} kg`
                            : stock.category
                            ? `${Math.floor(stock.quantity)} ${stock.category.toLowerCase()}`
                            : stock.quantity
                        }
                    </div>
                )}
            </div>
        ),
    },
    {
        key: 'category',
        label: t('admin.category'),
        icon: Tag,
        align: 'center',
        maxWidth: '120px',
        sortable: true,
        render: (stock) => (
            <Badge variant="secondary">{stock.category || '-'}</Badge>
        ),
    },
    {
        key: 'member',
        label: t('admin.assigned_to'),
        icon: User,
        align: 'left',
        maxWidth: '150px',
        render: (stock) => stock.member?.name || t('admin.unassigned'),
    },
    {
        key: 'status',
        label: t('admin.status'),
        icon: Activity,
        align: 'center',
        maxWidth: '120px',
        render: (stock) => (
            <Badge 
                variant={stock.quantity > 10 ? "default" : stock.quantity > 0 ? "secondary" : "destructive"}
                className={
                    stock.quantity > 10 
                        ? "bg-primary/10 text-primary" 
                        : stock.quantity > 0 
                            ? "bg-secondary/10 text-secondary" 
                            : "bg-destructive/10 text-destructive"
                }
            >
                {stock.quantity > 10 ? t('admin.available') : 
                 stock.quantity > 0 ? t('admin.low_stock') : t('admin.out_of_stock')}
            </Badge>
        ),
    },
    {
        key: 'actions',
        label: t('admin.actions'),
        align: 'center',
        maxWidth: '180px',
        render: (stock) => (
            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto justify-center">
                <PermissionGate permission="edit stocks">
                    <Button asChild size="sm" className="text-xs px-2 py-1">
                        <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}>
                            <Edit className="h-3 w-3 mr-1" />
                            {t('ui.edit')}
                        </Link>
                    </Button>
                </PermissionGate>
                <PermissionGate permission="delete stocks">
                    <Button 
                        disabled={processing} 
                        onClick={() => handleRemovePerishedStock(stock)} 
                        size="sm"
                        variant="destructive"
                        className="text-xs px-2 py-1"
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t('admin.remove')}
                    </Button>
                </PermissionGate>
            </div>
        ),
    },
];
