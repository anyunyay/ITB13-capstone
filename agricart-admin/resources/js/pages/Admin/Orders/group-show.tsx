import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowLeft, User, MapPin, Phone, Mail, Package, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Order } from '@/types/orders';
import { PermissionGuard } from '@/components/common/permission-guard';

interface GroupShowProps {
    orders: Order[];
    groupInfo: {
        customerName: string;
        customerEmail: string;
        totalOrders: number;
        totalAmount: number;
        timeSpan: number;
        firstOrderTime: string;
        lastOrderTime: string;
    };
}

export default function GroupShow({ orders, groupInfo }: GroupShowProps) {
    const t = useTranslation();

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

    const getDeliveryStatusBadge = (status: string | null) => {
        if (!status) return null;
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">{t('admin.pending')}</Badge>;
            case 'ready':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{t('admin.ready')}</Badge>;
            case 'in_transit':
                return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">{t('admin.in_transit')}</Badge>;
            case 'delivered':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t('admin.delivered')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Suspicious Order Group - ${groupInfo.customerName}`} />

            <PermissionGuard permission="view orders">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground m-0 mb-1">
                                    Suspicious Order Group
                                </h1>
                                <p className="text-sm text-muted-foreground m-0">
                                    {groupInfo.totalOrders} orders from {groupInfo.customerName}
                                </p>
                            </div>
                        </div>
                        <Link href={route('admin.orders.suspicious')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Suspicious Orders
                            </Button>
                        </Link>
                    </div>

                    {/* Warning Banner */}
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 m-0 mb-2">
                                    Suspicious Pattern Detected
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400 m-0">
                                    {groupInfo.totalOrders} orders were placed within {groupInfo.timeSpan} minutes from the same customer. 
                                    This pattern may indicate unusual activity and requires review.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Customer & Group Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{orders[0].customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </p>
                                        <p className="font-medium">{orders[0].customer.email}</p>
                                    </div>
                                    {orders[0].customer.contact_number && (
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Contact
                                            </p>
                                            <p className="font-medium">{orders[0].customer.contact_number}</p>
                                        </div>
                                    )}
                                    {orders[0].delivery_address && (
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Delivery Address
                                            </p>
                                            <p className="font-medium">{orders[0].delivery_address}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Group Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Group Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Orders</p>
                                        <p className="text-2xl font-bold">{groupInfo.totalOrders}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Combined Total</p>
                                        <p className="text-2xl font-bold text-primary">₱{groupInfo.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Time Span
                                        </p>
                                        <p className="font-medium">{groupInfo.timeSpan} minutes</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">First Order</p>
                                        <p className="font-medium">{format(new Date(groupInfo.firstOrderTime), 'MMM dd, yyyy HH:mm:ss')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Order</p>
                                        <p className="font-medium">{format(new Date(groupInfo.lastOrderTime), 'MMM dd, yyyy HH:mm:ss')}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Individual Orders */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">Individual Orders</h2>
                            
                            {orders.map((order, index) => (
                                <Card key={order.id} className="border-l-4 border-l-red-500">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(order.status)}
                                                {order.delivery_status && getDeliveryStatusBadge(order.delivery_status)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground mb-2">Items</h4>
                                                <div className="space-y-2">
                                                    {order.audit_trail?.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{item.product.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.quantity} {item.category} × ₱{item.unit_price?.toFixed(2) || '0.00'}
                                                                </p>
                                                            </div>
                                                            <p className="font-semibold">
                                                                ₱{((item.unit_price || 0) * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Total */}
                                            <div className="pt-3 border-t border-border">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">Order Total</span>
                                                    <span className="text-xl font-bold text-primary">
                                                        ₱{order.total_amount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Admin Notes */}
                                            {order.admin_notes && (
                                                <div className="pt-3 border-t border-border">
                                                    <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                                                    <p className="text-sm">{order.admin_notes}</p>
                                                </div>
                                            )}

                                            {/* View Details Button */}
                                            <div className="pt-3">
                                                <Link href={route('admin.orders.show', order.id)}>
                                                    <Button variant="outline" className="w-full">
                                                        View Full Order Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
