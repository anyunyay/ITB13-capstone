import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Weight, Tag, User, Activity, DollarSign, FileText } from 'lucide-react';

interface StockTrailItem {
    id: number;
    date: string;
    product: string;
    quantity: number;
    category: string;
    member: string;
    action: string;
    type: string;
    totalAmount: number;
    notes: string;
    oldQuantity?: number;
    newQuantity?: number;
    actionType?: string;
}

interface StockTrailTableColumnsProps {
    t: (key: string) => string;
}

export const getStockTrailTableColumns = ({
    t
}: StockTrailTableColumnsProps): BaseTableColumn<StockTrailItem>[] => [
    {
        key: 'date',
        label: t('admin.date'),
        icon: Calendar,
        align: 'center',
        maxWidth: '120px',
        render: (item) => (
            <div>
                <div className="text-sm">
                    {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleTimeString()}
                </div>
            </div>
        ),
    },
    {
        key: 'product',
        label: t('admin.product'),
        icon: Package,
        align: 'left',
        maxWidth: '180px',
        render: (item) => <div className="font-medium">{item.product}</div>,
    },
    {
        key: 'quantity',
        label: t('admin.quantity'),
        icon: Weight,
        align: 'right',
        maxWidth: '120px',
        render: (item) => (
            <div className="font-semibold">
                {item.category === 'Kilo'
                    ? `${item.quantity} kg`
                    : item.category
                    ? `${Math.floor(item.quantity)} ${item.category.toLowerCase()}`
                    : item.quantity
                }
            </div>
        ),
    },
    {
        key: 'category',
        label: t('admin.category'),
        icon: Tag,
        align: 'center',
        maxWidth: '120px',
        render: (item) => <Badge variant="secondary">{item.category}</Badge>,
    },
    {
        key: 'member',
        label: t('admin.member'),
        icon: User,
        align: 'left',
        maxWidth: '150px',
        render: (item) => item.member,
    },
    {
        key: 'action',
        label: t('admin.action'),
        icon: Activity,
        align: 'center',
        maxWidth: '120px',
        render: (item) => (
            <Badge 
                variant={item.type === 'removed' || item.type === 'reversal' ? "destructive" : "default"}
                className={item.type === 'removed' || item.type === 'reversal' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}
            >
                {item.action}
            </Badge>
        ),
    },
    {
        key: 'totalAmount',
        label: t('admin.total_amount'),
        icon: DollarSign,
        align: 'right',
        maxWidth: '120px',
        render: (item) => (
            <div className="font-semibold">
                ₱{(item.totalAmount || 0).toFixed(2)}
            </div>
        ),
    },
    {
        key: 'notes',
        label: t('admin.notes'),
        icon: FileText,
        align: 'left',
        maxWidth: '200px',
        render: (item) => (
            <div className="truncate" title={item.notes}>
                {item.notes}
            </div>
        ),
    },
];