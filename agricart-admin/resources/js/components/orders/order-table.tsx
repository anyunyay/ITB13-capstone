import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { Eye, Package, User, MapPin, Phone, Mail, Calendar, DollarSign, Truck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { Order } from '@/types/orders';
import { useState } from 'react';

interface OrderTableProps {
    orders: Order[];
    highlightOrderId?: string;
    urgentOrders?: Order[];
    showActions?: boolean;
    compact?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (field: string) => void;
}

export const OrderTable = ({ 
    orders, 
    highlightOrderId, 
    urgentOrders = [], 
    showActions = true,
    compact = false,
    sortBy: externalSortBy,
    sortOrder: externalSortOrder,
    onSortChange
}: OrderTableProps) => {
    // Internal sorting state if not provided externally
    const [internalSortBy, setInternalSortBy] = useState('id');
    const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const sortBy = externalSortBy || internalSortBy;
    const sortOrder = externalSortOrder || internalSortOrder;
    
    const handleSort = (field: string) => {
        if (externalSortBy !== undefined && onSortChange) {
            onSortChange(field);
        } else {
            if (internalSortBy === field) {
                setInternalSortOrder(internalSortOrder === 'asc' ? 'desc' : 'asc');
            } else {
                setInternalSortBy(field);
                setInternalSortOrder('desc');
            }
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
        return sortOrder === 'asc' ? 
            <ArrowUp className="h-4 w-4 ml-1" /> : 
            <ArrowDown className="h-4 w-4 ml-1" />;
    };
    
    // Sort orders
    const sortedOrders = [...orders].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'id':
                comparison = a.id - b.id;
                break;
            case 'created_at':
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
            case 'total_amount':
                comparison = a.total_amount - b.total_amount;
                break;
            case 'subtotal':
                comparison = ((a as any).subtotal || 0) - ((b as any).subtotal || 0);
                break;
            case 'coop_share':
                comparison = ((a as any).coop_share || 0) - ((b as any).coop_share || 0);
                break;
            case 'member_share':
                comparison = ((a as any).member_share || 0) - ((b as any).member_share || 0);
                break;
            case 'customer':
                comparison = a.customer.name.localeCompare(b.customer.name);
                break;
            default:
                return 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'expired':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>;
            case 'delayed':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Delayed</Badge>;
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
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                    No orders match your current filters.
                </p>
            </div>
        );
    }

    // Use sorted orders
    const ordersToDisplay = sortedOrders;

    return (
        <div className="rounded-md border">
            <Table className="w-full border-collapse text-sm">
                <TableHeader className="bg-muted/50 border-b-2">
                    <TableRow>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('id')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <Package className="h-4 w-4" />
                                Order ID
                                {getSortIcon('id')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <Calendar className="h-4 w-4" />
                                Date
                                {getSortIcon('created_at')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('customer')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <User className="h-4 w-4" />
                                Customer
                                {getSortIcon('customer')}
                            </button>
                        </TableHead>
                        {!compact && (
                            <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </div>
                            </TableHead>
                        )}
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('total_amount')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <DollarSign className="h-4 w-4" />
                                Total Amount
                                {getSortIcon('total_amount')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('subtotal')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <DollarSign className="h-4 w-4" />
                                Subtotal
                                {getSortIcon('subtotal')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('coop_share')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <DollarSign className="h-4 w-4" />
                                Co-op Share
                                {getSortIcon('coop_share')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <button onClick={() => handleSort('member_share')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <DollarSign className="h-4 w-4" />
                                Revenue
                                {getSortIcon('member_share')}
                            </button>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Items
                            </div>
                        </TableHead>
                        <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Status</TableHead>
                        {!compact && (
                            <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Delivery Status</TableHead>
                        )}
                        {!compact && (
                            <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    Logistic
                                </div>
                            </TableHead>
                        )}
                        {showActions && (
                            <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ordersToDisplay.map((order) => {
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
                                className={`border-b transition-all hover:bg-muted/20 ${highlighted ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm' : ''} ${urgent ? 'bg-orange-50 border-l-4 border-l-orange-500 shadow-sm' : ''}`}
                            >
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">
                                            #{order.id}
                                        </Badge>
                                        {urgent && (
                                            <Badge variant="destructive" className="bg-red-100 text-red-800 animate-pulse">
                                                Urgent
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                    <div className="text-sm">
                                        <div className="font-medium">
                                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {format(new Date(order.created_at), 'HH:mm')}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
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
                                    <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                        <div className="text-sm text-muted-foreground">
                                            {order.customer.email}
                                        </div>
                                    </TableCell>
                                )}
                                
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                    <div className="font-semibold text-sm">
                                        ₱{Number(order.total_amount).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
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
                                
                                <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                    {getStatusBadge(order.status)}
                                </TableCell>
                                
                                {!compact && (
                                    <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                        {order.status === 'approved' ? getDeliveryStatusBadge(order.delivery_status) : '-'}
                                    </TableCell>
                                )}
                                
                                {!compact && (
                                    <TableCell className="p-3 text-sm text-foreground align-top border-b">
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
                                    <TableCell className="p-3 text-sm text-foreground align-top border-b">
                                        <div className="flex gap-2 items-center">
                                            <PermissionGate permission="view orders">
                                                <Button asChild variant="outline" size="sm" className="transition-all text-xs px-3 py-2 hover:shadow-lg hover:opacity-90">
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
