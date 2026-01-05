import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Users, History } from 'lucide-react';
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

interface TransactionHistoryCardsProps {
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    formatDateTime: (dateString: string) => string;
    calculateMemberRevenue: (transaction: Transaction) => number;
}

export function TransactionHistoryCards({ 
    transactions, 
    formatCurrency, 
    formatDateTime, 
    calculateMemberRevenue 
}: TransactionHistoryCardsProps) {
    const t = useTranslation();

    return (
        <div className="block md:hidden space-y-4">
            {transactions.map((transaction) => (
                <Card 
                    key={transaction.id} 
                    className="relative overflow-hidden"
                    data-transaction-id={transaction.id}
                >
                    {/* Category Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {transaction.category}
                        </Badge>
                    </div>

                    <CardContent className="pt-6 pb-4 pr-3">
                        {/* Product Name */}
                        <div className="mb-4 pr-20">
                            <h3 className="font-bold text-lg text-foreground mb-1">
                                {transaction.product_name}
                            </h3>
                        </div>

                        {/* Transaction Details - Grid Layout */}
                        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b">
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground mb-1">{t('member.quantity')}</p>
                                <p className="font-semibold text-foreground text-base">
                                    <Package className="h-4 w-4 inline mr-1 text-blue-400" />
                                    {transaction.quantity}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground mb-1">{t('member.subtotal')}</p>
                                <p className="font-semibold text-foreground text-base">
                                    <TrendingUp className="h-4 w-4 inline mr-1 text-yellow-400" />
                                    {formatCurrency(calculateMemberRevenue(transaction))}
                                </p>
                            </div>
                        </div>

                        {/* Buyer and Date */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">{t('member.buyer')}</p>
                                    <p className="font-medium text-foreground truncate">{transaction.sale.customer.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <History className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">{t('member.date')}</p>
                                    <p className="font-medium text-foreground text-sm">{formatDateTime(transaction.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
