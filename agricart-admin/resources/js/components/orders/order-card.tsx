import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Order } from '@/types/orders';
import animations from '../../pages/Admin/Orders/orders-animations.module.css';
import { useTranslation } from '@/hooks/use-translation';

interface OrderCardProps {
    order: Order;
    highlight?: boolean;
    isUrgent?: boolean;
}

export const OrderCard = ({ order, highlight = false, isUrgent = false }: OrderCardProps) => {
    const t = useTranslation();
    
    // Extract connected order ID from admin_notes if this order is suspicious
    const getConnectedOrderId = (order: Order): number | null => {
        if (!order.admin_notes) return null;
        
        // Check if this order was merged into another order
        const mergedIntoMatch = order.admin_notes.match(/Merged into order #(\d+)/i);
        if (mergedIntoMatch) {
            return parseInt(mergedIntoMatch[1], 10);
        }
        
        // Check if this order has other orders merged into it
        const mergedFromMatch = order.admin_notes.match(/Merged from orders: ([\d, ]+)/i);
        if (mergedFromMatch) {
            const orderIds = mergedFromMatch[1].split(',').map(id => parseInt(id.trim(), 10));
            // Return the first connected order ID (excluding itself)
            const connectedId = orderIds.find(id => id !== order.id);
            return connectedId || null;
        }
        
        return null;
    };
    
    const connectedOrderId = order.is_suspicious ? getConnectedOrderId(order) : null;
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{t('admin.pending')}</Badge>;
            case 'approved':
                return <Badge className="status-approved">{t('admin.approved')}</Badge>;
            case 'rejected':
                return <Badge className="status-rejected">{t('admin.rejected')}</Badge>;
            case 'expired':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t('admin.expired')}</Badge>;
            case 'delayed':
                return <Badge className="status-delayed">{t('admin.delayed')}</Badge>;
            case 'cancelled':
                return <Badge className="status-cancelled">{t('admin.cancelled')}</Badge>;
            case 'merged':
                return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Merged</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDeliveryStatusBadge = (status: string, orderStatus: string) => {
        // Show N/A for rejected orders
        if (orderStatus === 'rejected') {
            return <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">N/A</Badge>;
        }
        
        switch (status) {
            case 'pending':
                return <Badge className="status-pending">{t('admin.pending')}</Badge>;
            case 'ready_to_pickup':
                return <Badge className="status-ready">{t('admin.ready_to_pickup')}</Badge>;
            case 'out_for_delivery':
                return <Badge className="status-out-for-delivery">{t('admin.out_for_delivery')}</Badge>;
            case 'delivered':
                return <Badge className="status-delivered">{t('admin.delivered')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Use the aggregated audit trail data directly (already grouped and processed by backend)
    const combinedItems = order.audit_trail || [];

    return (
        <div className={`bg-card border border-border rounded-lg shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-full box-border hover:shadow-md hover:-translate-y-0.5 ${highlight ? 'border-2 border-primary shadow-lg' : ''} ${isUrgent ? 'border-2 border-orange-500 shadow-lg' : ''}`}>
            <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-shrink-0">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground m-0 mb-1 leading-tight">{t('admin.order_number', { id: order.id })}</h3>
                    <p className="text-sm text-muted-foreground m-0 leading-snug">
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center flex-shrink-0">
                    {getStatusBadge(order.status)}
                    {isUrgent && (
                        <Badge variant="destructive" className={`bg-red-100 text-red-800 ${animations.statusUrgent}`}>
                            {order.is_urgent ? 'Urgent (Manual)' : 'Urgent'}
                        </Badge>
                    )}
                    {order.is_suspicious && (
                        <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
                            ⚠️ Suspicious
                        </Badge>
                    )}
                    {order.is_suspicious && connectedOrderId && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700">
                            🔗 Connected to #{connectedOrderId}
                        </Badge>
                    )}
                </div>
            </div>
            
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center m-0 leading-tight">
                            <User className="h-4 w-4 inline mr-2 flex-shrink-0" />
                            {t('admin.customer_information')}
                        </h4>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.name')}:</span> {order.customer.name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center m-0 leading-snug">
                                <Mail className="h-4 w-4 inline mr-2 flex-shrink-0" />
                                <span className="font-medium text-foreground">{t('admin.email')}:</span> <span className="truncate ml-1">{order.customer.email}</span>
                            </p>
                            {order.customer.contact_number && (
                                <p className="text-sm text-muted-foreground flex items-center m-0 leading-snug">
                                    <Phone className="h-4 w-4 inline mr-2 flex-shrink-0" />
                                    <span className="font-medium text-foreground">{t('admin.contact')}:</span> <span className="ml-1">{order.customer.contact_number}</span>
                                </p>
                            )}
                            {order.delivery_address && (
                                <p className="text-sm text-muted-foreground flex items-start m-0 leading-snug">
                                    <MapPin className="h-4 w-4 inline mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="flex-1"><span className="font-medium text-foreground">{t('admin.address')}:</span> {order.delivery_address}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center m-0 leading-tight">
                            <Package className="h-4 w-4 inline mr-2 flex-shrink-0" />
                            {t('admin.order_summary')}
                        </h4>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.total_amount')}:</span> ₱{Number(order.total_amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.items')}:</span> {combinedItems.length}
                            </p>
                            {order.admin && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">{t('admin.processed_by')}:</span> {order.admin.name}
                                </p>
                            )}
                            {order.logistic && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">{t('admin.assigned_to')}:</span> {order.logistic.name}
                                    {order.logistic.contact_number && (
                                        <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                                    )}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.delivery_status')}:</span> {getDeliveryStatusBadge(order.delivery_status, order.status)}
                            </p>
                            {order.status === 'approved' && !order.logistic && (
                                <p className="text-orange-600 dark:text-orange-400 text-sm m-0 leading-snug">
                                    <span className="font-medium">{t('admin.needs_logistic_assignment')}</span>
                                </p>
                            )}
                            {order.is_suspicious && order.suspicious_reason && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                    <p className="text-red-700 dark:text-red-400 text-xs font-semibold m-0 leading-snug">
                                        ⚠️ {order.suspicious_reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground m-0 leading-tight">{t('admin.order_items_header')}</h4>
                        {combinedItems.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{combinedItems.length - 2} more
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {combinedItems.length > 0 ? (
                            combinedItems.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                    <span className="text-sm text-foreground flex-1 font-medium">{item.product.name} ({item.category})</span>
                                    <span className="text-sm text-muted-foreground font-semibold ml-2">{item.quantity} {item.category}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-3 bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] rounded-lg border border-dashed border-border m-0">{t('admin.no_items_found')}</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-5 pt-0 flex gap-2 flex-wrap flex-shrink-0 w-full box-border overflow-hidden">
                <PermissionGate permission="view orders">
                    <Button asChild variant="outline" className="flex-1 min-w-[120px] py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 min-h-[2.625rem] hover:-translate-y-0.5 hover:shadow-sm">
                        <Link href={route('admin.orders.show', order.id)}>
                            <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                            {t('admin.view_details')}
                        </Link>
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};
