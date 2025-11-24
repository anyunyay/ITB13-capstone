import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, PackageOpen, PackageCheck, PackageX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
}

interface ComprehensiveStockData {
    product_id: number;
    product_name: string;
    category: string;
    total_quantity: number;
    available_quantity: number;
    sold_quantity: number;
    balance_quantity: number;
    damaged_defective_count: number;
    damaged_defective_loss: number;
    unit_price: number;
    total_revenue: number;
    total_cogs: number;
    total_gross_profit: number;
    product: Product;
}

interface StockOverviewTableProps {
    data: ComprehensiveStockData[];
    sortBy?: string;
    sortDir?: string;
    onSort?: (column: string) => void;
}

export function StockOverviewTable({ data, sortBy, sortDir, onSort }: StockOverviewTableProps) {
    const t = useTranslation();

    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />;
        }
        return sortDir === 'asc' 
            ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
            : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
    };

    const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
        <TableHead className="text-foreground text-center whitespace-nowrap">
            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-2 group hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary font-semibold transition-colors duration-200"
                onClick={() => onSort?.(column)}
            >
                {children}
                {getSortIcon(column)}
            </Button>
        </TableHead>
    );

    return (
        <div className="hidden md:block overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-muted/30">
                        <SortableHeader column="product_name">{t('member.stock_name')}</SortableHeader>
                        <SortableHeader column="category">{t('member.category')}</SortableHeader>
                        <SortableHeader column="total_quantity">{t('member.total_stock_label')}</SortableHeader>
                        <SortableHeader column="sold_quantity">{t('member.sold_quantity')}</SortableHeader>
                        <SortableHeader column="balance_quantity">{t('member.available_balance')}</SortableHeader>
                        <SortableHeader column="damaged_defective_count">{t('member.damaged_defective_count') || 'Damaged/Defective'}</SortableHeader>
                        <SortableHeader column="total_revenue">{t('member.total_revenue')}</SortableHeader>
                        <SortableHeader column="total_cogs">{t('member.cogs')}</SortableHeader>
                        <SortableHeader column="total_gross_profit">{t('member.gross_profit')}</SortableHeader>
                        <SortableHeader column="damaged_defective_loss">{t('member.loss') || 'Loss'}</SortableHeader>
                        <TableHead className="text-foreground text-center whitespace-nowrap font-semibold">{t('member.status')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow 
                            key={`${item.product_id}-${item.category}`} 
                            className=" hover:bg-muted"
                            data-product-id={item.product_id}
                            data-category={item.category}
                        >
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left">
                                        {item.product_name}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center flex justify-center">
                                        <Badge variant="secondary" className="bg-muted text-foreground">
                                            {item.category}
                                        </Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-400" />
                                        <span className="font-semibold text-black dark:text-white">{item.total_quantity}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <PackageOpen className="h-4 w-4 text-gray-400" />
                                        <span className="font-semibold text-black dark:text-white">{item.sold_quantity}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <PackageCheck className="h-4 w-4 text-green-400" />
                                        <span className="font-semibold text-black dark:text-white">
                                            {item.balance_quantity}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <PackageX className="h-4 w-4 text-red-400" />
                                        <span className="font-semibold text-black dark:text-white">
                                            {item.damaged_defective_count || 0}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-black dark:text-white">₱</span>{item.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-black dark:text-white">₱</span>{((item.total_cogs || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-black dark:text-white">₱</span>{((item.total_gross_profit || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-red-600 dark:text-red-400">
                                            <span className="text-black dark:text-white">₱</span>{((item.damaged_defective_loss || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center flex justify-center">
                                        {item.balance_quantity > 0 ? (
                                            <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600 hover:bg-green-700">
                                                <PackageCheck className="h-4 w-4" />
                                                {t('member.available')}
                                            </Badge>
                                        ) : item.sold_quantity > 0 ? (
                                            <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-gray-600 hover:bg-gray-700 text-white">
                                                <PackageOpen className="h-4 w-4" />
                                                {t('member.sold_out')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                <PackageX className="h-4 w-4" />
                                                {t('member.no_stock')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
