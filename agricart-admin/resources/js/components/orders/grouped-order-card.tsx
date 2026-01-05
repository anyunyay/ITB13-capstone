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
    
    // If only one order remains in the group, render as a normal order card
    const isSingleOrder = orders.length === 1;
    
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
    
    // Extract connected order ID from admin_notes if this is a single suspicious order
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
    
    const connectedOrderId = isSingleOrder ? getConnectedOrderId(orders[0]) : null;

    const formatTimeSpan = (timeSpanInMinutes: number) => {
        if (timeSpanInMinutes < 1) {
            const seconds = Math.round(timeSpanInMinutes * 60);
            return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
        }
        return `${timeSpanInMinutes} ${timeSpanInMinutes === 1 ? 'minute' : 'minutes'}`;
    };

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
            case 'merged':
                return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Merged</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className={`bg-card border border-border rounded-lg shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-full box-border hover:shadow-md hover:-translate-y-0.5 ${highlight ? 'border-2 border-primary shadow-lg' : isSingleOrder ? 'border-2 border-orange-500' : 'border-2 border-red-500'}`}>
            {/* Header with Suspicious Badge */}
            <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-shrink-0">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground m-0 mb-1 leading-tight">
                        {isSingleOrder 
                            ? `Order #${orders[0].id}` 
                            : `${orders.length} Orders from Same Customer`}
                    </h3>
                    <p className="text-sm text-muted-foreground m-0 leading-snug">
                        {isSingleOrder 
                            ? format(firstOrderTime, 'MMM dd, yyyy HH:mm')
                            : `${format(firstOrderTime, 'MMM dd, yyyy HH:mm')} - ${format(lastOrderTime, 'HH:mm')} (${formatTimeSpan(minutesDiff)})`}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center flex-shrink-0">
                    <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
                        ⚠️ Suspicious
                    </Badge>
                    {isSingleOrder && connectedOrderId && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700">
                            🔗 Connected to #{connectedOrderId}
                        </Badge>
                    )}
                    {isSingleOrder && getStatusBadge(orders[0].status)}
                </div>
            </div>
            
            {/* Customer Info & Summary */}
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Warning Message */}
                <div className={`p-3 border rounded-lg ${isSingleOrder ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
                    <p className={`text-sm font-semibold m-0 flex items-start gap-2 ${isSingleOrder ? 'text-orange-800 dark:text-orange-300' : 'text-red-800 dark:text-red-300'}`}>
                        <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
                        <span>
                            {isSingleOrder 
                                ? (connectedOrderId 
                                    ? `Part of suspicious group - other order(s) already processed. Connected to Order #${connectedOrderId}.`
                                    : orders[0].suspicious_reason || `Flagged as suspicious (Total: ₱${totalAmount.toFixed(2)})`)
                                : `${orders.length} orders placed within ${formatTimeSpan(minutesDiff)} (Total: ₱${totalAmount.toFixed(2)})`
                            }
                        </span>
                    </p>
                </div>

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
                                <span className="font-medium text-foreground">{t('admin.email')}:</span> 
                                <span className="truncate ml-1">{customer.email}</span>
                            </p>
                            {customer.contact_number && (
                                <p className="text-sm text-muted-foreground flex items-center m-0 leading-snug">
                                    <Phone className="h-4 w-4 inline mr-2 flex-shrink-0" />
                                    <span className="font-medium text-foreground">{t('admin.contact')}:</span> 
                                    <span className="ml-1">{customer.contact_number}</span>
                                </p>
                            )}
                            {deliveryAddress && (
                                <p className="text-sm text-muted-foreground flex items-start m-0 leading-snug">
                                    <MapPin className="h-4 w-4 inline mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="flex-1">
                                        <span className="font-medium text-foreground">{t('admin.address')}:</span> {deliveryAddress}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center m-0 leading-tight">
                            <Package className="h-4 w-4 inline mr-2 flex-shrink-0" />
                            {isSingleOrder ? t('admin.order_summary') : 'Combined Order Summary'}
                        </h4>
                        <div className="flex flex-col gap-2">
                            {!isSingleOrder && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">Total Orders:</span> {orders.length}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{t('admin.total_amount')}:</span> ₱{totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground m-0 leading-snug">
                                <span className="font-medium text-foreground">{isSingleOrder ? t('admin.items') : `Total ${t('admin.items')}`}:</span> {totalItems}
                            </p>
                            {!isSingleOrder && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">Time Span:</span> {formatTimeSpan(minutesDiff)}
                                </p>
                            )}
                            {isSingleOrder && orders[0].admin && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">{t('admin.processed_by')}:</span> {orders[0].admin.name}
                                </p>
                            )}
                            {isSingleOrder && orders[0].logistic && (
                                <p className="text-sm text-muted-foreground m-0 leading-snug">
                                    <span className="font-medium text-foreground">{t('admin.assigned_to')}:</span> {orders[0].logistic.name}
                                    {orders[0].logistic.contact_number && (
                                        <span className="text-muted-foreground ml-2">({orders[0].logistic.contact_number})</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Individual Orders List */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground m-0 leading-tight">
                            {orders.length > 1 ? 'Individual Orders' : t('admin.order_items_header')}
                        </h4>
                        {orders.length > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs h-8 px-3"
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
                        )}
                    </div>
                    
                    {orders.length > 1 ? (
                        isExpanded ? (
                            <div className="flex flex-col gap-2">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)]">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
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
                                        <div className="flex flex-col gap-1 mb-2">
                                            {order.audit_trail?.slice(0, 2).map((item) => (
                                                <div key={item.id} className="text-sm text-muted-foreground">
                                                    • {item.product.name} ({item.category}) - {item.quantity} units
                                                </div>
                                            ))}
                                            {order.audit_trail && order.audit_trail.length > 2 && (
                                                <div className="text-sm text-muted-foreground">
                                                    • +{order.audit_trail.length - 2} more items
                                                </div>
                                            )}
                                        </div>
                                        <PermissionGate permission="view orders">
                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                <Link href={route('admin.orders.show', order.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </Button>
                                        </PermissionGate>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {orders.slice(0, 2).map((order) => (
                                    <div key={order.id} className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-foreground font-medium">Order #{order.id}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <span className="text-sm text-muted-foreground font-semibold">
                                            ₱{order.total_amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                {orders.length > 2 && (
                                    <Badge variant="secondary" className="text-xs mx-auto">
                                        +{orders.length - 2} more
                                    </Badge>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col gap-2">
                            {orders[0].audit_trail?.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-[color-mix(in_srgb,var(--muted)_20%,transparent)] rounded-lg border border-[color-mix(in_srgb,var(--border)_50%,transparent)] min-h-[2.5rem]">
                                    <span className="text-sm text-foreground flex-1 font-medium">{item.product.name} ({item.category})</span>
                                    <span className="text-sm text-muted-foreground font-semibold ml-2">{item.quantity} {item.category}</span>
                                </div>
                            ))}
                            {orders[0].audit_trail && orders[0].audit_trail.length > 2 && (
                                <Badge variant="secondary" className="text-xs mx-auto">
                                    +{orders[0].audit_trail.length - 2} more
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-3 sm:p-5 pt-0 flex gap-2 flex-wrap flex-shrink-0 w-full box-border overflow-hidden border-t border-border bg-muted/20">
                <PermissionGate permission="view orders">
                    {isSingleOrder ? (
                        <Button asChild variant="outline" className="flex-1 min-w-[120px] py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 min-h-[2.625rem] hover:-translate-y-0.5 hover:shadow-sm">
                            <Link href={route('admin.orders.show', orders[0].id)}>
                                <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                                {t('admin.view_details')}
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="default" size="sm" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                            <Link href={route('admin.orders.group', { orders: orders.map(o => o.id).join(',') })}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                View Group Details
                            </Link>
                        </Button>
                    )}
                </PermissionGate>
            </div>
        </div>
    );
};
