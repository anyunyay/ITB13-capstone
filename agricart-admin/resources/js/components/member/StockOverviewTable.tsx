import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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
    unit_price: number;
    total_revenue: number;
    total_cogs: number;
    total_gross_profit: number;
    product: Product;
}

interface StockOverviewTableProps {
    data: ComprehensiveStockData[];
}

export function StockOverviewTable({ data }: StockOverviewTableProps) {
    const t = useTranslation();

    return (
        <div className="hidden md:block overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="">
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.stock_name')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.category')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.total_stock_label')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.sold_quantity')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.available_balance')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.total_revenue')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.cogs')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.gross_profit')}</TableHead>
                        <TableHead className="text-foreground text-center whitespace-nowrap">{t('member.status')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={`${item.product_id}-${item.category}`} className=" hover:bg-muted">
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
                                        <XCircle className="h-4 w-4 text-red-400" />
                                        <span className="font-semibold text-black dark:text-white">{item.sold_quantity}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-left flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                        <span className="font-semibold text-black dark:text-white">
                                            {item.balance_quantity}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-yellow-500">₱</span>{item.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-yellow-500">₱</span>{((item.total_cogs || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-right">
                                        <span className="font-semibold text-black dark:text-white">
                                            <span className="text-yellow-500">₱</span>{((item.total_gross_profit || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex justify-center min-h-[40px] py-2 w-full">
                                    <div className="w-full max-w-[120px] text-center flex justify-center">
                                        {item.balance_quantity > 0 ? (
                                            <Badge className="bg-green-600 text-foreground">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {t('member.available')}
                                            </Badge>
                                        ) : item.sold_quantity > 0 ? (
                                            <Badge className="bg-red-600 text-foreground">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                {t('member.sold_out')}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-muted text-foreground">
                                                <AlertCircle className="h-3 w-3 mr-1" />
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
