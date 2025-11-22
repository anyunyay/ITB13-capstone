import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ArrowLeft, User, MapPin, Phone, Mail, Package, Clock, AlertTriangle, Merge } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Order } from '@/types/orders';
import { PermissionGuard } from '@/components/common/permission-guard';
import { PermissionGate } from '@/components/common/permission-gate';
import { useState } from 'react';

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
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [isMerging, setIsMerging] = useState(false);

    const canMerge = orders.every(order => ['pending', 'delayed'].includes(order.status));

    const handleMergeOrders = () => {
        setIsMerging(true);
        
        router.post(route('admin.orders.merge-group'), {
            order_ids: orders.map(o => o.id),
            admin_notes: adminNotes,
        }, {
            onSuccess: () => {
                setShowMergeDialog(false);
                setIsMerging(false);
            },
            onError: () => {
                setIsMerging(false);
            }
        });
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
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
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
                        <div className="flex gap-2">
                            <PermissionGate permission="merge orders">
                                {canMerge && (
                                    <Button 
                                        onClick={() => setShowMergeDialog(true)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Merge className="h-4 w-4 mr-2" />
                                        Merge Orders
                                    </Button>
                                )}
                            </PermissionGate>
                            <Link href={route('admin.orders.suspicious')}>
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Suspicious Orders
                                </Button>
                            </Link>
                        </div>
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

                    {/* Merge Orders Dialog */}
                    <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Merge className="h-5 w-5" />
                                    Merge Orders into Single Order
                                </DialogTitle>
                                <DialogDescription>
                                    This will permanently combine all {groupInfo.totalOrders} orders into a single order record.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Warning */}
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                                Important: This action cannot be undone
                                            </h4>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                                All orders will be merged into Order #{orders[0].id}. The other orders will be marked as "merged" and their items will be combined.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Merge Details */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Primary Order</Label>
                                            <p className="font-semibold">Order #{orders[0].id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Orders to Merge</Label>
                                            <p className="font-semibold">{orders.slice(1).map(o => `#${o.id}`).join(', ')}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Current Total</Label>
                                            <p className="font-semibold">₱{groupInfo.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Total Items</Label>
                                            <p className="font-semibold">
                                                {orders.reduce((sum, order) => sum + (order.audit_trail?.length || 0), 0)} items
                                            </p>
                                        </div>
                                    </div>

                                    {/* What will happen */}
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-2">What will happen:</h4>
                                        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                            <li>All items will be combined into Order #{orders[0].id}</li>
                                            <li>Total amount will be updated to ₱{groupInfo.totalAmount.toFixed(2)}</li>
                                            <li>Orders {orders.slice(1).map(o => `#${o.id}`).join(', ')} will be marked as "merged"</li>
                                            <li>The merged order will retain the earliest order timestamp</li>
                                            <li>All audit trails will be preserved</li>
                                        </ul>
                                    </div>

                                    {/* Admin Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                                        <Textarea
                                            id="admin-notes"
                                            placeholder="Add any notes about why these orders are being merged..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMergeDialog(false)}
                                    disabled={isMerging}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleMergeOrders}
                                    disabled={isMerging}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isMerging ? 'Merging...' : `Merge ${groupInfo.totalOrders} Orders`}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
