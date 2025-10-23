import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail, Calendar, DollarSign, Truck } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Order } from '@/types/orders';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface OrderTableProps {
    orders: Order[];
    highlightOrderId?: string;
    urgentOrders?: Order[];
    showActions?: boolean;
    compact?: boolean;
}

export const OrderTable = ({ 
    orders, 
    highlightOrderId, 
    urgentOrders = [], 
    showActions = true,
    compact = false 
}: OrderTableProps) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className={styles.statusPending}>Pending</Badge>;
            case 'approved':
                return <Badge variant="default" className={styles.statusApproved}>Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className={styles.statusRejected}>Rejected</Badge>;
            case 'expired':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>;
            case 'delayed':
                return <Badge variant="destructive" className={styles.statusDelayed}>Delayed</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDeliveryStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'out_for_delivery':
                return <Badge variant="default">Out for Delivery</Badge>;
            case 'delivered':
                return <Badge variant="outline">Delivered</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const isUrgent = (order: Order) => {
        return urgentOrders.some(urgent => urgent.id === order.id) || order.is_urgent;
    };

    const isHighlighted = (order: Order) => {
        return highlightOrderId === order.id.toString();
    };

    if (orders.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Package className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>No orders found</h3>
                <p className={styles.emptyStateDescription}>
                    No orders match your current filters.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table className={styles.orderTable}>
                <TableHeader className={styles.orderTableHeader}>
                    <TableRow>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Order ID
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Customer
                            </div>
                        </TableHead>
                        {!compact && (
                            <TableHead className={styles.orderTableHeaderCell}>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </div>
                            </TableHead>
                        )}
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Total Amount
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Subtotal
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Co-op Share
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Revenue
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Items
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>Status</TableHead>
                        {!compact && (
                            <TableHead className={styles.orderTableHeaderCell}>Delivery Status</TableHead>
                        )}
                        {!compact && (
                            <TableHead className={styles.orderTableHeaderCell}>
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    Logistic
                                </div>
                            </TableHead>
                        )}
                        {showActions && (
                            <TableHead className={styles.orderTableHeaderCell}>Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => {
                        const urgent = isUrgent(order);
                        const highlighted = isHighlighted(order);
                        
                        // Group items by product ID and combine quantities
                        const groupedItems = order.audit_trail?.reduce((acc, item) => {
                            const key = `${item.product.id}-${item.category}`;
                            if (!acc[key]) {
                                acc[key] = {
                                    id: item.id,
                                    product: item.product,
                                    category: item.category,
                                    quantity: 0
                                };
                            }
                            acc[key].quantity += Number(item.quantity);
                            return acc;
                        }, {} as Record<string, any>) || {};

                        const combinedItems = Object.values(groupedItems);
                        const totalItems = combinedItems.length;

                        return (
                            <TableRow 
                                key={order.id} 
                                className={`${styles.orderTableRow} ${highlighted ? styles.highlightedRow : ''} ${urgent ? styles.urgentRow : ''}`}
                            >
                                <TableCell className={styles.orderTableCell}>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">
                                            #{order.id}
                                        </Badge>
                                        {urgent && (
                                            <Badge variant="destructive" className={styles.statusUrgent}>
                                                Urgent
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="text-sm">
                                        <div className="font-medium">
                                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {format(new Date(order.created_at), 'HH:mm')}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="flex flex-col">
                                        <div className="font-medium text-sm">
                                            {order.customer.name}
                                        </div>
                                        {order.customer.contact_number && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {order.customer.contact_number}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                
                                {!compact && (
                                    <TableCell className={styles.orderTableCell}>
                                        <div className="text-sm text-muted-foreground">
                                            {order.customer.email}
                                        </div>
                                    </TableCell>
                                )}
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm">
                                        ₱{Number(order.total_amount).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-medium text-sm">
                                        ₱{Number(order.subtotal || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-medium text-sm text-green-600">
                                        ₱{Number(order.coop_share || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-medium text-sm text-blue-600">
                                        ₱{Number(order.member_share || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="text-sm">
                                        <div className="font-medium">{totalItems} items</div>
                                        <div className="text-muted-foreground text-xs">
                                            {combinedItems.slice(0, 2).map((item: any, index) => (
                                                <span key={item.id}>
                                                    {item.product.name}
                                                    {index < Math.min(2, combinedItems.length - 1) ? ', ' : ''}
                                                </span>
                                            ))}
                                            {combinedItems.length > 2 && (
                                                <span className="text-muted-foreground">
                                                    +{combinedItems.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    {getStatusBadge(order.status)}
                                </TableCell>
                                
                                {!compact && (
                                    <TableCell className={styles.orderTableCell}>
                                        {order.status === 'approved' ? getDeliveryStatusBadge(order.delivery_status) : '-'}
                                    </TableCell>
                                )}
                                
                                {!compact && (
                                    <TableCell className={styles.orderTableCell}>
                                        {order.logistic ? (
                                            <div className="text-sm">
                                                <div className="font-medium">{order.logistic.name}</div>
                                                {order.logistic.contact_number && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.logistic.contact_number}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Unassigned</span>
                                        )}
                                    </TableCell>
                                )}
                                
                                {showActions && (
                                    <TableCell className={styles.orderTableCell}>
                                        <div className={styles.orderActionCell}>
                                            <PermissionGate permission="view orders">
                                                <Button asChild variant="outline" size="sm" className={styles.orderActionButton}>
                                                    <Link href={route('admin.orders.show', order.id)}>
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </PermissionGate>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
