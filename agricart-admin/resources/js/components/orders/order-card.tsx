import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Order } from '@/types/orders';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface OrderCardProps {
    order: Order;
    highlight?: boolean;
    isUrgent?: boolean;
}

export const OrderCard = ({ order, highlight = false, isUrgent = false }: OrderCardProps) => {
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

    return (
        <div className={`${styles.orderCard} ${highlight ? styles.highlighted : ''} ${isUrgent ? styles.urgent : ''}`}>
            <div className={styles.orderCardHeader}>
                <div>
                    <h3 className={styles.orderCardTitle}>Order #{order.id}</h3>
                    <p className={styles.orderCardDate}>
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
                <div className={styles.orderCardBadges}>
                    {getStatusBadge(order.status)}
                    {isUrgent && (
                        <Badge variant="destructive" className={styles.statusUrgent}>
                            {order.is_urgent ? 'Urgent (Manual)' : 'Urgent'}
                        </Badge>
                    )}
                </div>
            </div>
            
            <div className={styles.orderCardContent}>
                <div className={styles.orderInfoGrid}>
                    <div className={styles.orderInfoSection}>
                        <h4 className={styles.orderInfoTitle}>
                            <User className="h-4 w-4 inline mr-1" />
                            Customer Information
                        </h4>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Name:</span> {order.customer.name}
                        </p>
                        <p className={styles.orderInfoItem}>
                            <Mail className="h-4 w-4 inline mr-1" />
                            <span className={styles.orderInfoValue}>Email:</span> {order.customer.email}
                        </p>
                        {order.customer.contact_number && (
                            <p className={styles.orderInfoItem}>
                                <Phone className="h-4 w-4 inline mr-1" />
                                <span className={styles.orderInfoValue}>Contact:</span> {order.customer.contact_number}
                            </p>
                        )}
                        {order.delivery_address && (
                            <p className={styles.orderInfoItem}>
                                <MapPin className="h-4 w-4 inline mr-1" />
                                <span className={styles.orderInfoValue}>Address:</span> {order.delivery_address}
                            </p>
                        )}
                    </div>
                    
                    <div className={styles.orderInfoSection}>
                        <h4 className={styles.orderInfoTitle}>
                            <Package className="h-4 w-4 inline mr-1" />
                            Order Summary
                        </h4>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Total Amount:</span> ₱{Number(order.total_amount).toFixed(2)}
                        </p>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Subtotal:</span> ₱{Number(order.subtotal || 0).toFixed(2)}
                        </p>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Co-op Share:</span> <span className="text-green-600">₱{Number(order.coop_share || 0).toFixed(2)}</span>
                        </p>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Revenue:</span> <span className="text-blue-600">₱{Number(order.member_share || 0).toFixed(2)}</span>
                        </p>
                        <p className={styles.orderInfoItem}>
                            <span className={styles.orderInfoValue}>Items:</span> {combinedItems.length}
                        </p>
                        {order.admin && (
                            <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoValue}>Processed by:</span> {order.admin.name}
                            </p>
                        )}
                        {order.logistic && (
                            <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoValue}>Assigned to:</span> {order.logistic.name}
                                {order.logistic.contact_number && (
                                    <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                                )}
                            </p>
                        )}
                        {order.status === 'approved' && (
                            <div className="space-y-1">
                                <p className={styles.orderInfoItem}>
                                    <span className={styles.orderInfoValue}>Delivery Status:</span> {getDeliveryStatusBadge(order.delivery_status)}
                                </p>
                                {!order.logistic && (
                                    <p className="text-orange-600 dark:text-orange-400 text-sm">
                                        <span className="font-medium">⚠️ Needs logistic assignment</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {order.admin_notes && (
                    <div className="mt-4 p-3 bg-muted rounded">
                        <h5 className="font-semibold text-sm mb-1">Admin Notes:</h5>
                        <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
                    </div>
                )}

                <div className={styles.orderItemsSection}>
                    <h4 className={styles.orderItemsTitle}>Order Items</h4>
                    <div className={styles.orderItemsList}>
                        {combinedItems.length > 0 ? (
                            combinedItems.map((item) => (
                                <div key={item.id} className={styles.orderItem}>
                                    <span className={styles.orderItemName}>{item.product.name} ({item.category})</span>
                                    <span className={styles.orderItemQuantity}>{item.quantity} {item.category}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No items found</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={styles.orderCardActions}>
                <PermissionGate permission="view orders">
                    <Button asChild variant="outline" className={styles.orderActionButton}>
                        <Link href={route('admin.orders.show', order.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                        </Link>
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};
