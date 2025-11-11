import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Sale {
    id: number;
    customer: Customer;
    delivered_time: string;
    status: string;
    delivery_status: string;
}

interface Transaction {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    created_at: string;
    sale: Sale;
    product: Product;
}

interface TransactionHistoryTableProps {
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    formatDateTime: (dateString: string) => string;
    calculateMemberRevenue: (transaction: Transaction) => number;
    sortBy?: string;
    sortDir?: string;
    onSort?: (column: string) => void;
}

export function TransactionHistoryTable({ 
    transactions, 
    formatCurrency, 
    formatDateTime, 
    calculateMemberRevenue,
    sortBy,
    sortDir,
    onSort
}: TransactionHistoryTableProps) {
    const t = useTranslation();

    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        }
        return sortDir === 'asc' 
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
        <TableHead className="text-foreground text-center whitespace-nowrap">
            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent font-semibold"
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
                    <TableRow className="">
                        <SortableHeader column="product_name">{t('member.product')}</SortableHeader>
                        <SortableHeader column="category">{t('member.category')}</SortableHeader>
                        <SortableHeader column="quantity">{t('member.quantity')}</SortableHeader>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.subtotal')}</TableHead>
                        <SortableHeader column="customer_name">{t('member.buyer')}</SortableHeader>
                        <SortableHeader column="created_at">{t('member.date')}</SortableHeader>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow 
                            key={transaction.id} 
                            className=" hover:bg-muted/50"
                            data-transaction-id={transaction.id}
                        >
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left">
                                        {transaction.product_name}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center flex justify-center">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {transaction.category}
                                        </Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-400" />
                                        <span className="font-semibold">{transaction.quantity}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        {formatCurrency(calculateMemberRevenue(transaction))}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center">
                                        {transaction.sale.customer.name}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center">
                                        {formatDateTime(transaction.created_at)}
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
