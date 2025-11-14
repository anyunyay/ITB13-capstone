import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, User, Calendar } from 'lucide-react';

export interface AuditTrail {
    id: number;
    order_id: number;
    member_id: number;
    stock_id: number;
    product_name: string;
    category: string;
    quantity: number;
    available_stock_after_sale: number;
    unit_price: number;
    total_amount: number;
    created_at: string;
    member: {
        id: number;
        name: string;
    };
    order: {
        id: number;
        status: string;
    };
    product: {
        id: number;
        name: string;
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const getStatusBadge = (status: string, t: (key: string) => string) => {
    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'delivered': 'bg-blue-100 text-blue-800',
        'cancelled': 'bg-red-100 text-red-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
        <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
            {status}
        </Badge>
    );
};

export const createAuditTrailTableColumns = (t: (key: string) => string): BaseTableColumn<AuditTrail>[] => [
    {
        key: 'created_at',
        label: t('admin.timestamp'),
        icon: Calendar,
        sortable: true,
        align: 'left',
        maxWidth: '150px',
        render: (trail) => (
            <div className="text-sm">
                {new Date(trail.created_at).toLocaleString()}
            </div>
        ),
    },
    {
        key: 'order_id',
        label: t('admin.order_id'),
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (trail) => (
            <Link 
                href={route('admin.orders.show', trail.order_id)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
                #{trail.order_id}
            </Link>
        ),
    },
    {
        key: 'member',
        label: t('admin.member'),
        icon: User,
        sortable: true,
        align: 'left',
        maxWidth: '150px',
        render: (trail) => (
            <div>
                <div className="font-medium text-sm">{trail.member?.name || t('admin.not_available')}</div>
                <div className="text-xs text-muted-foreground">{t('admin.id_prefix')} {trail.member_id}</div>
            </div>
        ),
    },
    {
        key: 'product',
        label: t('admin.product'),
        icon: Package,
        sortable: true,
        align: 'left',
        maxWidth: '150px',
        render: (trail) => (
            <div>
                <div className="font-medium text-sm">{trail.product_name}</div>
                <div className="text-xs text-muted-foreground">{t('admin.stock_id_prefix')} {trail.stock_id}</div>
            </div>
        ),
    },
    {
        key: 'category',
        label: t('admin.category'),
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (trail) => (
            <Badge variant="outline">{trail.category}</Badge>
        ),
    },
    {
        key: 'quantity',
        label: t('admin.quantity_sold'),
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (trail) => (
            <div className="text-sm font-medium">{trail.quantity}</div>
        ),
    },
    {
        key: 'available_stock_after_sale',
        label: t('admin.stock_after_sale'),
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (trail) => (
            <div className="text-sm font-medium">{trail.available_stock_after_sale}</div>
        ),
    },
    {
        key: 'unit_price',
        label: t('admin.unit_price'),
        sortable: true,
        align: 'right',
        maxWidth: '120px',
        render: (trail) => (
            <div className="text-sm">{formatCurrency(trail.unit_price)}</div>
        ),
    },
    {
        key: 'total_amount',
        label: t('admin.total_amount'),
        sortable: true,
        align: 'right',
        maxWidth: '120px',
        render: (trail) => (
            <div className="text-sm font-semibold">
                {formatCurrency(trail.quantity * trail.unit_price)}
            </div>
        ),
    },
    {
        key: 'order_status',
        label: t('admin.order_status'),
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (trail) => getStatusBadge(trail.order?.status || t('admin.not_available'), t),
    },
];

// Mobile card component for audit trail
export const AuditTrailMobileCard = ({ trail, t }: { trail: AuditTrail; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Link 
                href={route('admin.orders.show', trail.order_id)}
                className="text-blue-600 hover:text-blue-800 font-medium"
            >
                Order #{trail.order_id}
            </Link>
            {getStatusBadge(trail.order?.status || t('admin.not_available'), t)}
        </div>

        <div className="space-y-2 mb-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(trail.created_at).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1">
                    <div className="font-medium text-sm">{trail.member?.name || t('admin.not_available')}</div>
                    <div className="text-xs text-muted-foreground">{t('admin.id_prefix')} {trail.member_id}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <div className="flex-1">
                    <div className="font-medium text-sm">{trail.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-1">{trail.category}</Badge>
                        {t('admin.stock_id_prefix')} {trail.stock_id}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
                <div className="text-muted-foreground">{t('admin.quantity_sold')}</div>
                <div className="font-semibold">{trail.quantity}</div>
            </div>
            <div>
                <div className="text-muted-foreground">{t('admin.stock_after_sale')}</div>
                <div className="font-semibold">{trail.available_stock_after_sale}</div>
            </div>
            <div>
                <div className="text-muted-foreground">{t('admin.unit_price')}</div>
                <div className="font-semibold">{formatCurrency(trail.unit_price)}</div>
            </div>
            <div>
                <div className="text-muted-foreground">{t('admin.total_amount')}</div>
                <div className="font-semibold text-green-600">
                    {formatCurrency(trail.quantity * trail.unit_price)}
                </div>
            </div>
        </div>
    </div>
);
