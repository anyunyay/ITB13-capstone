import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Hash, Package, Weight, User, DollarSign } from 'lucide-react';
import { SoldStock } from '@/types/inventory';

interface SoldStockTableColumnsProps {
    t: (key: string) => string;
}

export const getSoldStockTableColumns = ({
    t
}: SoldStockTableColumnsProps): BaseTableColumn<SoldStock>[] => [
    {
        key: 'id',
        label: t('admin.stock_id'),
        icon: Hash,
        align: 'center',
        maxWidth: '120px',
        render: (stock) => <Badge variant="outline">#{stock.id}</Badge>,
    },
    {
        key: 'product_name',
        label: t('admin.product_name'),
        icon: Package,
        align: 'left',
        maxWidth: '180px',
        render: (stock) => (
            <div className="font-medium">{stock.product?.name || '-'}</div>
        ),
    },
    {
        key: 'quantity',
        label: t('admin.quantity_sold'),
        icon: Weight,
        align: 'right',
        maxWidth: '120px',
        render: (stock) => (
            <div className="font-semibold">
                {stock.category === 'Kilo'
                    ? `${stock.sold_quantity || 0} ${t('admin.kg_sold')}`
                    : stock.category
                    ? `${Math.floor(stock.sold_quantity || 0)} ${stock.category.toLowerCase()} ${t('admin.sold_label')}`
                    : `${stock.sold_quantity || 0} ${t('admin.sold_label')}`
                }
            </div>
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
        key: 'total_amount',
        label: t('admin.total_amount'),
        icon: DollarSign,
        align: 'right',
        maxWidth: '120px',
        render: (stock) => {
            let totalAmount = 0;
            if (stock.product) {
                let price = 0;
                if (stock.category === 'Kilo') {
                    price = stock.product.price_kilo || 0;
                } else if (stock.category === 'Pc') {
                    price = stock.product.price_pc || 0;
                } else if (stock.category === 'Tali') {
                    price = stock.product.price_tali || 0;
                }
                totalAmount = (stock.sold_quantity || 0) * price;
            }
            
            return (
                <div className="font-semibold">
                    ₱{totalAmount.toFixed(2)}
                </div>
            );
        },
    },
];
