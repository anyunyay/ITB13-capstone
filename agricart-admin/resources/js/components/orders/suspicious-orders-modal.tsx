import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderGroup } from '@/utils/order-grouping';
import { format } from 'date-fns';
import { Eye, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface SuspiciousOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    suspiciousGroups: OrderGroup[];
}

export const SuspiciousOrdersModal = ({ isOpen, onClose, suspiciousGroups }: SuspiciousOrdersModalProps) => {
    const [processingGroupIndex, setProcessingGroupIndex] = useState<number | null>(null);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
            case 'approved':
                return <Badge className="status-approved">Approved</Badge>;
            case 'rejected':
                return <Badge className="status-rejected">Rejected</Badge>;
            case 'delayed':
                return <Badge className="status-delayed">Delayed</Badge>;
            case 'cancelled':
                return <Badge className="status-cancelled">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleGroupVerdict = (groupIndex: number, verdict: 'approve' | 'reject') => {
        const group = suspiciousGroups[groupIndex];
        setProcessingGroupIndex(groupIndex);

        // Get all order IDs in the group
        const orderIds = group.orders.map(o => o.id);

        // Send request to apply verdict to all orders in group
        router.post(route('admin.orders.group-verdict'), {
            order_ids: orderIds,
            verdict: verdict,
            admin_notes: `Bulk ${verdict} - Suspicious order group (${group.orders.length} orders within ${group.minutesDiff} minutes)`
        }, {
            onSuccess: () => {
                setProcessingGroupIndex(null);
                // Optionally close modal or show success message
            },
            onError: () => {
                setProcessingGroupIndex(null);
                alert('Failed to apply verdict. Please try again.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">⚠️</span>
                        Suspicious Order Groups - Detailed View
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Summary */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Total Groups</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">{suspiciousGroups.length}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Orders</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                                    {suspiciousGroups.reduce((sum, g) => sum + g.orders.length, 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Amount</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                                    ₱{suspiciousGroups.reduce((sum, g) => 
                                        sum + g.orders.reduce((orderSum, o) => orderSum + o.total_amount, 0), 0
                                    ).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Unique Customers</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                                    {new Set(suspiciousGroups.map(g => g.orders[0].customer.email)).size}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Groups List */}
                    {suspiciousGroups.map((group, groupIndex) => {
                        const totalAmount = group.orders.reduce((sum, o) => sum + o.total_amount, 0);
                        const customer = group.orders[0].customer;
                        const firstOrderTime = new Date(group.orders[0].created_at);
                        const lastOrderTime = new Date(group.orders[group.orders.length - 1].created_at);
                        const isProcessing = processingGroupIndex === groupIndex;

                        return (
                            <div key={groupIndex} className="border-2 border-red-300 dark:border-red-700 rounded-lg p-4 bg-card">
                                {/* Group Header */}
                                <div className="flex items-start justify-between mb-4 pb-3 border-b border-border">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="destructive" className="bg-red-600 text-white">
                                                Group {groupIndex + 1}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {group.orders.length} orders in {group.minutesDiff} minutes
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-lg">{customer.name}</h4>
                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {format(firstOrderTime, 'MMM dd, yyyy HH:mm')} - {format(lastOrderTime, 'HH:mm')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                            ₱{totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Group Actions */}
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        onClick={() => handleGroupVerdict(groupIndex, 'approve')}
                                        disabled={isProcessing}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {isProcessing ? 'Processing...' : 'Approve All'}
                                    </Button>
                                    <Button
                                        onClick={() => handleGroupVerdict(groupIndex, 'reject')}
                                        disabled={isProcessing}
                                        variant="destructive"
                                        className="flex-1"
                                        size="sm"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        {isProcessing ? 'Processing...' : 'Reject All'}
                                    </Button>
                                </div>

                                {/* Orders in Group */}
                                <div className="space-y-2">
                                    <h5 className="text-sm font-semibold text-muted-foreground">Orders in this group:</h5>
                                    {group.orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">Order #{order.id}</span>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-lg">₱{order.total_amount.toFixed(2)}</span>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={route('admin.orders.show', order.id)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                    <Button onClick={onClose} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
