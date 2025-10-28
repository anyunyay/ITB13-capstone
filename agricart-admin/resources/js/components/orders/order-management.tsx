import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { UnifiedTable, ColumnDefinition, PaginationData } from '@/components/ui/unified-table';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { Order } from '@/types/orders';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface OrderManagementProps {
    orders: Order[];
    pagination?: PaginationData;
    currentStatus: string;
    highlightOrderId?: string;
    onDataChange?: (queryParams: Record<string, any>) => void;
    onStatusChange: (status: string) => void;
}

export const OrderManagement = ({
    orders,
    pagination,
    currentStatus,
    highlightOrderId,
    onDataChange,
    onStatusChange
}: OrderManagementProps) => {
    // Format currency
    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `₱${amount.toFixed(2)}`;
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'secondary';
            case 'approved':
                return 'default';
            case 'processing':
                return 'default';
            case 'completed':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Get delivery status badge variant
    const getDeliveryStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'secondary';
            case 'assigned':
                return 'default';
            case 'in_transit':
                return 'default';
            case 'delivered':
                return 'default';
            case 'failed':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            label: 'Order ID',
            sortable: true,
            className: 'w-24'
        },
        {
            key: 'member_name',
            label: 'Member',
            sortable: true,
            className: 'min-w-[120px]'
        },
        {
            key: 'total_amount',
            label: 'Total Amount',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'delivery_status',
            label: 'Delivery',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'is_urgent',
            label: 'Priority',
            sortable: true,
            className: 'w-20'
        },
        {
            key: 'created_at',
            label: 'Order Date',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'delivery_date',
            label: 'Delivery Date',
            sortable: true,
            className: 'min-w-[100px]'
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'w-24'
        }
    ];

    // Render order row
    const renderOrderRow = (order: Order, index: number) => (
        <TableRow
            key={order.id}
            className={`transition-colors duration-150 hover:bg-muted/50 ${
                highlightOrderId === order.id.toString() ? 'bg-primary/5 border-primary/20' : ''
            }`}
        >
            <TableCell className="text-sm font-medium">
                #{order.id}
            </TableCell>
            <TableCell className="text-sm">
                {order.member?.name || 'N/A'}
            </TableCell>
            <TableCell className="text-sm font-medium">
                {formatCurrency(order.total_amount)}
            </TableCell>
            <TableCell>
                <Badge 
                    variant={getStatusBadgeVariant(order.status)}
                    className="text-xs capitalize"
                >
                    {order.status.replace('_', ' ')}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge 
                    variant={getDeliveryStatusBadgeVariant(order.delivery_status)}
                    className="text-xs capitalize"
                >
                    {order.delivery_status.replace('_', ' ')}
                </Badge>
            </TableCell>
            <TableCell>
                {order.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {order.delivery_date ? 
                    new Date(order.delivery_date).toLocaleDateString() : 
                    'Not set'
                }
            </TableCell>
            <TableCell>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="transition-all duration-200 hover:shadow-lg hover:opacity-90"
                >
                    <Link href={route('orders.show', order.id)}>
                        <Eye className="h-4 w-4" />
                        View
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );

    // Get orders by status
    const getOrdersByStatus = (status: string) => {
        if (status === 'all') return orders;
        return orders.filter(order => order.status === status);
    };

    // Get tab icon
    const getTabIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
            case 'processing':
                return <Package className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    // Get order counts by status
    const getOrderCounts = () => {
        const counts = {
            all: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            approved: orders.filter(o => o.status === 'approved').length,
            processing: orders.filter(o => o.status === 'processing').length,
            completed: orders.filter(o => o.status === 'completed').length,
            rejected: orders.filter(o => o.status === 'rejected').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };
        return counts;
    };

    const orderCounts = getOrderCounts();

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Order Management</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Track and manage customer orders
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Status Tabs */}
            <Tabs value={currentStatus} onValueChange={onStatusChange} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        All ({orderCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        {getTabIcon('pending')}
                        Pending ({orderCounts.pending})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                        {getTabIcon('approved')}
                        Approved ({orderCounts.approved})
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="flex items-center gap-2">
                        {getTabIcon('processing')}
                        Processing ({orderCounts.processing})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex items-center gap-2">
                        {getTabIcon('completed')}
                        Completed ({orderCounts.completed})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        {getTabIcon('rejected')}
                        Rejected ({orderCounts.rejected})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex items-center gap-2">
                        {getTabIcon('cancelled')}
                        Cancelled ({orderCounts.cancelled})
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                {['all', 'pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'].map(status => (
                    <TabsContent key={status} value={status} className="mt-4">
                        <UnifiedTable
                            data={getOrdersByStatus(status)}
                            columns={columns}
                            pagination={pagination}
                            onDataChange={onDataChange}
                            renderRow={renderOrderRow}
                            emptyMessage={`No ${status === 'all' ? '' : status} orders found`}
                            searchPlaceholder="Search orders by member name or order ID..."
                            showSearch={true}
                            showFilters={false}
                            loading={false}
                            tableStateOptions={{
                                defaultSort: {
                                    column: 'created_at',
                                    direction: 'desc'
                                },
                                maxPerPage: 10,
                                persistInUrl: true,
                                routeName: 'orders.index'
                            }}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};