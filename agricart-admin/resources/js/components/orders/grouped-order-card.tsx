import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { PermissionGate } from '@/components/common/permission-gate';
import { Order } from '@/types/orders';
import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface GroupedOrderCardProps {
    orders: Order[];
    highlight?: boolean;
}

export const GroupedOrderCard = ({ orders, highlight = false }: GroupedOrderCardProps) => {
    const t = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalItems = orders.reduce((sum, order) => sum + (order.audit_trail?.length || 0), 0);
    
    // Get customer info from first order
    const customer = orders[0].customer;
    const deliveryAddress = orders[0].delivery_address;
    
    // Get time range
    const firstOrderTime = new Date(orders[0].created_at);
    const lastOrderTime = new Date(orders[orders.length - 1].created_at);
    const minutesDiff = Math.round((lastOrderTime.getTime() - firstOrderTime.getTime()) / 60000);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{t('admin.pending')}</Badge>;
            case 'approved':
                return <Badge className="status-approved">{t('admin.approved')}</Badge>;
            case 'rejected':
                return <Badge className="status-rejected">{t('admin.rejected')}</Badge>;
            case 'delayed':
                return <Badge className="status-delayed">{t('admin.delayed')}</Badge>;
            case 'cancelled':
                return <Badge className="status-cancelled">{t('admin.cancelled')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className={`bg-card border-2 border-red-500 rounded-lg shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full box-border ${highlight ? 'shadow-xl' : ''}`}>
            {/* Header with Suspicious Badge */}
            <div className="p-5 border-b border-border bg-red-50 dark:bg-red-900/20 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="bg-red-600 text-white animate-pulse text-sm">
                            ⚠️ SUSPICIOUS ORDER GROUP
                        </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground m-0 mb-1 leading-tight">
                        {orders.length} Orders from Same Customer
                    </h3>
                    <p className="text-sm text-muted-foreground m-0 leading-snug">
                        {format(firstOrderTime, 'MMM dd, yyyy HH:mm')} - {format(lastOrderTime, 'HH:mm')} ({minutesDiff} minutes)
                    </p>
                </div>
            </div>

            {/* Warning Message */}
            <div className="px-5 pt-4 pb-2">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-red-800 dark:text-red-300 text-sm font-semibold m-0 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>
                            {orders.length} orders placed within {minutesDiff} minutes (Total: ₱{totalAmount.toFixed(2)})
                        </span>
                    </p>
                </div>
            </div>
            
            {/* Customer Info & Summary */}
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center m-0 leading-tight">
                            <User className="h-4 w-4 inline mr-2 flex-shrink-0" />
                            {t('admin.customer_information')}
                        </h4>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.name')}:</span> {customer.name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center m-0 leading-snug">
                                <Mail className="h-4 w-4 inline mr-2 flex-shrink-0" />
                                <span className="font-medium text-foreground">{t('admin.email')}:</span> <span className="truncate ml-1">{customer.email}</span>
                            </p>
                            {customer.contact_number && (
                                <p className="text-sm text-muted-foreground flex items-center m-0 leading-snug">
                                    <Phone className="h-4 w-4 inline mr-2 flex-shrink-0" />
                                    <span className="font-medium text-foreground">{t('admin.contact')}:</span> <span className="ml-1">{customer.contact_number}</span>
                                </p>
                            )}
                            {deliveryAddress && (
                                <p className="text-sm text-muted-foreground flex items-start m-0 leading-snug">
                                    <MapPin className="h-4 w-4 inline mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="flex-1"><span className="font-medium text-foreground">{t('admin.address')}:</span> {deliveryAddress}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center m-0 leading-tight">
                            <Package className="h-4 w-4 inline mr-2 flex-shrink-0" />
                            Combined Order Summary
                        </h4>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">Total Orders:</span> {orders.length}
                            </p>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.total_amount')}:</span> ₱{totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">Total {t('admin.items')}:</span> {totalItems}
                            </p>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">Time Span:</span> {minutesDiff} minutes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Individual Orders List */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground m-0 leading-tight">Individual Orders</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Collapse
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Expand ({orders.length})
                                </>
                            )}
                        </Button>
                    </div>
                    
                    {isExpanded ? (
                        <div className="flex flex-col gap-3">
                            {orders.map((order) => (
                                <div key={order.id} className="p-3 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-foreground">
                                                Order #{order.id}
                                            </span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            ₱{order.total_amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {order.audit_trail?.slice(0, 2).map((item) => (
                                            <div key={item.id} className="text-xs text-muted-foreground">
                                                • {item.product.name} ({item.category}) - {item.quantity} units
                                            </div>
                                        ))}
                                        {order.audit_trail && order.audit_trail.length > 2 && (
                                            <div className="text-xs text-muted-foreground">
                                                • +{order.audit_trail.length - 2} more items
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <PermissionGate permission="view orders">
                                            <Button asChild variant="outline" size="sm" className="w-full text-xs">
                                                <Link href={route('admin.orders.show', order.id)}>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View Details
                                                </Link>
                                            </Button>
                                        </PermissionGate>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {orders.slice(0, 2).map((order) => (
                                <div key={order.id} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-foreground font-medium">Order #{order.id}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <span className="text-sm text-muted-foreground font-semibold">
                                        ₱{order.total_amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {orders.length > 2 && (
                                <div className="text-center py-2 text-sm text-muted-foreground">
                                    +{orders.length - 2} more orders
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-5 pt-0 flex gap-2 flex-wrap flex-shrink-0 w-full box-border overflow-hidden border-t border-border bg-muted/20">
                <PermissionGate permission="view orders">
                    <Button asChild variant="default" className="flex-1 min-w-[120px]">
                        <Link href={route('admin.orders.show', orders[0].id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review First Order
                        </Link>
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};
