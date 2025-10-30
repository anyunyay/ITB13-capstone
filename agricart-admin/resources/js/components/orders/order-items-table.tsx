import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Hash } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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
    const t = useTranslation();

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_items_found')}</h3>
                <p className="text-muted-foreground">
                    {t('admin.no_orders_match_filters')}
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
        <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <Table className={`w-full border-collapse text-sm ${compact ? 'text-xs' : ''}`}>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                #
                            </div>
                        </TableHead>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                {t('admin.product')}
                            </div>
                        </TableHead>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.quantity')}</TableHead>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                {t('admin.unit_price')}
                            </div>
                        </TableHead>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                {t('admin.subtotal')}
                            </div>
                        </TableHead>
                        <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                {t('admin.co_op_share')}
                            </div>
                        </TableHead>
                        {showStock && (
                            <TableHead className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    {t('admin.available_stock')}
                                </div>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combinedItems.map((item, index) => {
                        return (
                            <TableRow key={item.id} className="border-b border-border transition-all hover:bg-muted/20">
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="font-mono text-sm">
                                        {index + 1}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="flex flex-col">
                                        <div className="font-medium text-sm">
                                            {item.product.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.category} • ID: {item.product.id}
                                        </div>
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="font-semibold text-sm">
                                        {item.quantity} {item.category}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="text-sm">
                                        ₱{Number(item.unit_price || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="font-semibold text-sm">
                                        ₱{Number(item.subtotal || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="p-4 text-sm text-foreground align-top">
                                    <div className="font-semibold text-sm text-primary">
                                        ₱{Number(item.coop_share || 0).toFixed(2)}
                                    </div>
                                </TableCell>
                                
                                {showStock && (
                                    <TableCell className="p-4 text-sm text-foreground align-top">
                                        <div className="text-sm">
                                            {item.stock_preview ? (
                                                // Stock preview for pending orders
                                                <div>
                                                    <div className={`font-medium ${
                                                        item.stock_preview.sufficient_stock ? 'text-primary' : 'text-destructive'
                                                    }`}>
                                                        {item.stock_preview.current_stock} → {item.stock_preview.remaining_stock} after approval
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Deducting: {item.stock_preview.quantity_to_deduct} {item.category}
                                                    </div>
                                                    {!item.stock_preview.sufficient_stock && (
                                                        <div className="text-xs text-destructive font-medium mt-1">
                                                            ⚠️ Insufficient stock!
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Regular stock display for approved orders
                                                <div>
                                                    <div className={`font-medium ${
                                                        (item.available_stock || 0) > 0 ? 'text-primary' : 'text-destructive'
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
                                )}
                            </TableRow>
                        );
                    })}
                    
                    {/* Total Row */}
                    <TableRow className="border-t-2 border-border bg-muted/30">
                        <TableCell className="p-4 text-foreground" colSpan={showStock ? 7 : 6}>
                            <div className="flex justify-end">
                                <div className="w-full max-w-md space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">{t('admin.subtotal_label')}</span>
                                        <span className="text-sm font-medium text-foreground">₱{totalSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">{t('admin.co_op_share')}</span>
                                        <span className="text-sm font-medium text-primary">₱{totalCoopShare.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-semibold text-foreground">{t('admin.total_amount')}</span>
                                            <span className="text-base font-semibold text-primary">₱{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </div>
        </div>
    );
};
