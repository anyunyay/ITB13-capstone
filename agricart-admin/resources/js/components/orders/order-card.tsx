import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
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
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('admin.pending')}</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800">{t('admin.approved')}</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('admin.rejected')}</Badge>;
            case 'expired':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('admin.expired')}</Badge>;
            case 'delayed':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('admin.delayed')}</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('admin.cancelled')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDeliveryStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">{t('admin.pending')}</Badge>;
            case 'ready_to_pickup':
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('admin.ready_to_pickup')}</Badge>;
            case 'out_for_delivery':
                return <Badge variant="default">{t('admin.out_for_delivery')}</Badge>;
            case 'delivered':
                return <Badge variant="outline">{t('admin.delivered')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Use the aggregated audit trail data directly (already grouped and processed by backend)
    const combinedItems = order.audit_trail || [];

    return (
        <div className={`bg-card border border-border rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col h-full ${highlight ? 'border-2 border-primary shadow-lg' : ''} ${isUrgent ? 'border-2 border-orange-500 shadow-lg' : ''}`}>
            <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">{t('admin.order_number', { id: order.id })}</h3>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {getStatusBadge(order.status)}
                    {isUrgent && (
                        <Badge variant="destructive" className={`bg-red-100 text-red-800 ${animations.statusUrgent}`}>
                            {order.is_urgent ? 'Urgent (Manual)' : 'Urgent'}
                        </Badge>
                    )}
                </div>
            </div>
            
            <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center">
                            <User className="h-4 w-4 inline mr-1" />
                            {t('admin.customer_information')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{t('admin.name')}:</span> {order.customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-4 w-4 inline mr-1" />
                            <span className="font-medium text-foreground">{t('admin.email')}:</span> {order.customer.email}
                        </p>
                        {order.customer.contact_number && (
                            <p className="text-sm text-muted-foreground flex items-center">
                                <Phone className="h-4 w-4 inline mr-1" />
                                <span className="font-medium text-foreground">{t('admin.contact')}:</span> {order.customer.contact_number}
                            </p>
                        )}
                        {order.delivery_address && (
                            <p className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                <span className="font-medium text-foreground">{t('admin.address')}:</span> {order.delivery_address}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center">
                            <Package className="h-4 w-4 inline mr-1" />
                            {t('admin.order_summary')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{t('admin.total_amount')}:</span> ₱{Number(order.total_amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{t('admin.items')}:</span> {combinedItems.length}
                        </p>
                        {order.admin && (
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{t('admin.processed_by')}:</span> {order.admin.name}
                            </p>
                        )}
                        {order.logistic && (
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{t('admin.assigned_to')}:</span> {order.logistic.name}
                                {order.logistic.contact_number && (
                                    <span className="text-muted-foreground ml-2">({order.logistic.contact_number})</span>
                                )}
                            </p>
                        )}
                        {order.status === 'approved' && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{t('admin.delivery_status')}:</span> {getDeliveryStatusBadge(order.delivery_status)}
                                </p>
                                {!order.logistic && (
                                    <p className="text-orange-600 dark:text-orange-400 text-sm">
                                        <span className="font-medium">{t('admin.needs_logistic_assignment')}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {order.admin_notes && (
                    <div className="mt-4 p-3 bg-muted rounded">
                        <h5 className="font-semibold text-sm mb-1">{t('admin.admin_notes')}:</h5>
                        <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2">{t('admin.order_items_header')}</h4>
                    <div className="flex flex-col gap-1">
                        {combinedItems.length > 0 ? (
                            combinedItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm py-1">
                                    <span className="text-foreground flex-1">{item.product.name} ({item.category})</span>
                                    <span className="text-muted-foreground font-medium">{item.quantity} {item.category}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('admin.no_items_found')}</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-5 pt-0 flex gap-2 flex-wrap">
                <PermissionGate permission="view orders">
                    <Button asChild variant="outline" className="flex-1 min-w-[120px] py-2 text-sm font-medium rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-sm">
                        <Link href={route('admin.orders.show', order.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            {t('admin.view_details')}
                        </Link>
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};
