import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Hash } from 'lucide-react';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        price_kilo?: number;
        price_pc?: number;
        price_tali?: number;
    };
    category: string;
    quantity: number;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    unit_price?: number;
    subtotal?: number;
    coop_share?: number;
    available_stock?: number;
    total_amount?: number;
    stock_preview?: {
        current_stock: number;
        quantity_to_deduct: number;
        remaining_stock: number;
        sufficient_stock: boolean;
    };
    stock?: {
        id: number;
        quantity: number;
    };
}

interface OrderItemsTableProps {
    items: OrderItem[];
    showStock?: boolean;
    compact?: boolean;
}

export const OrderItemsTable = ({ items, showStock = false, compact = false }: OrderItemsTableProps) => {
    if (!items || items.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Package className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>No items found</h3>
                <p className={styles.emptyStateDescription}>
                    This order doesn't contain any items.
                </p>
            </div>
        );
    }

    // Use items directly since they're already aggregated from the backend
    const combinedItems = items;
    
    // Calculate totals
    const totalSubtotal = combinedItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalCoopShare = combinedItems.reduce((sum, item) => sum + Number(item.coop_share || 0), 0);
    const totalAmount = combinedItems.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

    return (
        <div className="rounded-md border">
            <Table className={`${styles.orderTable} ${compact ? styles.compact : ''}`}>
                <TableHeader className={styles.orderTableHeader}>
                    <TableRow>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                #
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product
                            </div>
                        </TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>Quantity</TableHead>
                        <TableHead className={styles.orderTableHeaderCell}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Unit Price
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
                                <Package className="h-4 w-4" />
                                Available Stock
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combinedItems.map((item, index) => {
                        return (
                            <TableRow key={item.id} className={styles.orderTableRow}>
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-mono text-sm">
                                        {index + 1}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="flex flex-col">
                                        <div className="font-medium text-sm">
                                            {item.product.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.category} • ID: {item.product.id}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm">
                                        {item.quantity} {item.category}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="text-sm">
                                        ₱{Number(item.unit_price || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm">
                                        ₱{Number(item.subtotal || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm text-green-600">
                                        ₱{Number(item.coop_share || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="text-sm">
                                        {item.stock_preview ? (
                                            // Stock preview for pending orders
                                            <div>
                                                <div className={`font-medium ${
                                                    item.stock_preview.sufficient_stock ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {item.stock_preview.current_stock} → {item.stock_preview.remaining_stock} after approval
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Deducting: {item.stock_preview.quantity_to_deduct} {item.category}
                                                </div>
                                                {!item.stock_preview.sufficient_stock && (
                                                    <div className="text-xs text-red-600 font-medium mt-1">
                                                        ⚠️ Insufficient stock!
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Regular stock display for approved orders
                                            <div>
                                                <div className={`font-medium ${
                                                    (item.available_stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {item.available_stock || 0} {item.category}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    
                    {/* Total Row */}
                    <TableRow className={`${styles.orderTableRow} border-t-2 border-primary/20 bg-primary/5`}>
                        <TableCell className={styles.orderTableCell} colSpan={6}>
                            <div className="flex justify-end">
                                <div className="text-right space-y-1">
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-medium">₱{totalSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-muted-foreground">Co-op Share (10%):</span>
                                        <span className="font-medium text-green-600">₱{totalCoopShare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-lg font-bold border-t pt-1">
                                        <span className="text-primary">Total Amount:</span>
                                        <span className="text-primary">₱{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};
