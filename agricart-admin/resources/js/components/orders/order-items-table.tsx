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

    // Group items by product ID and combine quantities
    const groupedItems = items.reduce((acc, item) => {
        const key = `${item.product.id}-${item.category}`;
        if (!acc[key]) {
            acc[key] = {
                id: item.id,
                product: item.product,
                category: item.category,
                quantity: 0,
                stock: item.stock,
                price_kilo: item.price_kilo,
                price_pc: item.price_pc,
                price_tali: item.price_tali,
                unit_price: item.unit_price
            };
        }
        acc[key].quantity += Number(item.quantity);
        return acc;
    }, {} as Record<string, any>);

    const combinedItems = Object.values(groupedItems);
    const totalAmount = combinedItems.reduce((sum, item) => {
        // Use stored prices from audit trail, fallback to product prices
        const price = item.category === 'Kilo' ? (item.price_kilo || item.product.price_kilo || 0) :
                     item.category === 'Pc' ? (item.price_pc || item.product.price_pc || 0) :
                     item.category === 'Tali' ? (item.price_tali || item.product.price_tali || 0) : 
                     (item.unit_price || 0);
        return sum + (Number(item.quantity) * Number(price));
    }, 0);

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
                        <TableHead className={styles.orderTableHeaderCell}>Category</TableHead>
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
                                Total
                            </div>
                        </TableHead>
                        {showStock && (
                            <TableHead className={styles.orderTableHeaderCell}>Stock</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combinedItems.map((item, index) => {
                        // Use stored prices from audit trail, fallback to product prices
                        const price = item.category === 'Kilo' ? (item.price_kilo || item.product.price_kilo || 0) :
                                     item.category === 'Pc' ? (item.price_pc || item.product.price_pc || 0) :
                                     item.category === 'Tali' ? (item.price_tali || item.product.price_tali || 0) : 
                                     (item.unit_price || 0);
                        const totalPrice = Number(item.quantity) * Number(price);
                        
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
                                            Product ID: {item.product.id}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <Badge variant="secondary" className="text-xs">
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm">
                                        {item.quantity} {item.category}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="text-sm">
                                        ₱{Number(price).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className={styles.orderTableCell}>
                                    <div className="font-semibold text-sm">
                                        ₱{totalPrice.toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                {showStock && (
                                    <TableCell className={styles.orderTableCell}>
                                        {item.stock ? (
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {item.stock.quantity} {item.category}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Stock ID: {item.stock.id}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                    
                    {/* Total Row */}
                    <TableRow className={`${styles.orderTableRow} border-t-2 border-primary/20 bg-primary/5`}>
                        <TableCell className={styles.orderTableCell} colSpan={showStock ? 6 : 5}>
                            <div className="flex justify-end">
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Total Amount</div>
                                    <div className="text-lg font-bold text-primary">
                                        ₱{totalAmount.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        {showStock && (
                            <TableCell className={styles.orderTableCell}></TableCell>
                        )}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};
