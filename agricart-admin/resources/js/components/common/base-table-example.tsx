/**
 * BASE TABLE USAGE EXAMPLES
 * 
 * This file demonstrates how to use the BaseTable component
 * to create consistent, reusable tables across the application.
 */

import { BaseTable, BaseTableColumn } from './base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Calendar, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';

// Example 1: Simple Order Table
interface SimpleOrder {
    id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export function SimpleOrderTable({ orders }: { orders: SimpleOrder[] }) {
    const columns: BaseTableColumn<SimpleOrder>[] = [
        {
            key: 'id',
            label: 'Order ID',
            icon: Package,
            sortable: true,
            align: 'center',
            maxWidth: '150px',
            render: (order) => (
                <Badge variant="outline" className="font-mono">
                    #{order.id}
                </Badge>
            ),
        },
        {
            key: 'customer_name',
            label: 'Customer',
            icon: User,
            sortable: true,
            align: 'left',
            maxWidth: '200px',
            render: (order) => (
                <div className="font-medium text-sm">{order.customer_name}</div>
            ),
        },
        {
            key: 'created_at',
            label: 'Date',
            icon: Calendar,
            sortable: true,
            align: 'left',
            maxWidth: '180px',
            render: (order) => (
                <div className="text-sm">
                    <div className="font-medium">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-muted-foreground">
                        {format(new Date(order.created_at), 'HH:mm')}
                    </div>
                </div>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total',
            icon: DollarSign,
            sortable: true,
            align: 'right',
            maxWidth: '120px',
            render: (order) => (
                <div className="font-semibold text-sm">
                    ₱{Number(order.total_amount).toFixed(2)}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            maxWidth: '120px',
            render: (order) => {
                const variant = order.status === 'approved' ? 'default' : 
                               order.status === 'pending' ? 'secondary' : 'destructive';
                return <Badge variant={variant}>{order.status}</Badge>;
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            maxWidth: '120px',
            render: (order) => (
                <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                </Button>
            ),
        },
    ];

    return (
        <BaseTable
            data={orders}
            columns={columns}
            keyExtractor={(order) => order.id}
            sortBy="id"
            sortOrder="desc"
            onSort={(field) => console.log('Sort by:', field)}
            getRowClassName={(order) => 
                order.status === 'urgent' ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
            }
            renderMobileCard={(order) => (
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="font-mono">#{order.id}</Badge>
                        <Badge variant={order.status === 'approved' ? 'default' : 'secondary'}>
                            {order.status}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="font-semibold">₱{Number(order.total_amount).toFixed(2)}</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                    </Button>
                </div>
            )}
        />
    );
}

// Example 2: Sales Table with Conditional Columns
interface SalesRecord {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    date: string;
}

export function SalesTable({ 
    sales, 
    showDetails = true 
}: { 
    sales: SalesRecord[];
    showDetails?: boolean;
}) {
    const columns: BaseTableColumn<SalesRecord>[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            align: 'center',
            render: (sale) => <span className="font-mono">#{sale.id}</span>,
        },
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            align: 'left',
            render: (sale) => <div className="font-medium">{sale.product_name}</div>,
        },
        {
            key: 'quantity',
            label: 'Qty',
            sortable: true,
            align: 'center',
            hideOnMobile: !showDetails,
            render: (sale) => <span>{sale.quantity}</span>,
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            align: 'right',
            hideOnMobile: !showDetails,
            render: (sale) => <span>₱{Number(sale.price).toFixed(2)}</span>,
        },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            align: 'right',
            render: (sale) => (
                <div className="font-semibold">₱{Number(sale.total).toFixed(2)}</div>
            ),
        },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            align: 'left',
            render: (sale) => (
                <span className="text-sm">{format(new Date(sale.date), 'MMM dd, yyyy')}</span>
            ),
        },
    ];

    return (
        <BaseTable
            data={sales}
            columns={columns}
            keyExtractor={(sale) => sale.id}
            emptyState={
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No sales records found</h3>
                    <p className="text-muted-foreground">Start adding sales to see them here</p>
                </div>
            }
        />
    );
}

// Example 3: Inventory Table with Highlighting
interface InventoryItem {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    price: number;
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
    const columns: BaseTableColumn<InventoryItem>[] = [
        {
            key: 'name',
            label: 'Product Name',
            sortable: true,
            align: 'left',
            render: (item) => <div className="font-medium">{item.name}</div>,
        },
        {
            key: 'stock',
            label: 'Stock',
            sortable: true,
            align: 'center',
            render: (item) => (
                <Badge 
                    variant={item.stock <= item.min_stock ? 'destructive' : 'default'}
                    className={item.stock <= item.min_stock ? 'animate-pulse' : ''}
                >
                    {item.stock}
                </Badge>
            ),
        },
        {
            key: 'min_stock',
            label: 'Min Stock',
            align: 'center',
            render: (item) => <span className="text-muted-foreground">{item.min_stock}</span>,
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            align: 'right',
            render: (item) => <span>₱{Number(item.price).toFixed(2)}</span>,
        },
    ];

    return (
        <BaseTable
            data={items}
            columns={columns}
            keyExtractor={(item) => item.id}
            getRowClassName={(item) => 
                item.stock <= item.min_stock 
                    ? 'bg-red-50 border-l-4 border-l-red-500' 
                    : ''
            }
            renderMobileCard={(item) => (
                <div className={`bg-card border rounded-lg p-4 ${
                    item.stock <= item.min_stock ? 'border-red-500 bg-red-50' : 'border-border'
                }`}>
                    <div className="flex justify-between items-start">
                        <div className="font-medium">{item.name}</div>
                        <Badge 
                            variant={item.stock <= item.min_stock ? 'destructive' : 'default'}
                        >
                            Stock: {item.stock}
                        </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                        Min Stock: {item.min_stock}
                    </div>
                    <div className="mt-2 font-semibold">₱{Number(item.price).toFixed(2)}</div>
                </div>
            )}
        />
    );
}
