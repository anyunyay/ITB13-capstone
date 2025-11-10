import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, XCircle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
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

interface StockOverviewCardsProps {
    data: ComprehensiveStockData[];
}

export function StockOverviewCards({ data }: StockOverviewCardsProps) {
    const t = useTranslation();

    return (
        <div className="block md:hidden space-y-4">
            {data.map((item) => (
                <Card key={`${item.product_id}-${item.category}`} className="relative overflow-hidden">
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                        {item.balance_quantity > 0 ? (
                            <Badge className="bg-green-600 text-white shadow-md">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('member.available')}
                            </Badge>
                        ) : item.sold_quantity > 0 ? (
                            <Badge className="bg-red-600 text-white shadow-md">
                                <XCircle className="h-3 w-3 mr-1" />
                                {t('member.sold_out')}
                            </Badge>
                        ) : (
                            <Badge className="bg-gray-500 text-white shadow-md">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {t('member.no_stock')}
                            </Badge>
                        )}
                    </div>

                    <CardContent className="pt-6 pb-4 pr-3">
                        {/* Product Name & Category */}
                        <div className="mb-4 pr-24">
                            <h3 className="font-bold text-lg text-foreground mb-1">
                                {item.product_name}
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">
                                    {item.category}
                                </Badge>
                            </h3>
                        </div>

                        {/* Stock Information - First Row */}
                        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b">
                            <div className="flex flex-col items-center text-center">
                                <Package className="h-4 w-4 text-blue-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.total_stock_label')}</p>
                                <p className="font-semibold text-foreground">{item.total_quantity}</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <XCircle className="h-4 w-4 text-red-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.sold_quantity')}</p>
                                <p className="font-semibold text-foreground">{item.sold_quantity}</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <CheckCircle className="h-4 w-4 text-green-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.available_balance')}</p>
                                <p className="font-semibold text-foreground">{item.balance_quantity}</p>
                            </div>
                        </div>

                        {/* Financial Details - Second Row */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="h-4 w-4 text-yellow-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.total_revenue')}</p>
                                <p className="font-semibold text-foreground text-base">
                                    <span className="text-yellow-500">₱</span>{item.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="h-4 w-4 text-orange-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.cogs')}</p>
                                <p className="font-semibold text-orange-400 text-base">
                                    <span className="text-yellow-500">₱</span>{((item.total_cogs || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="h-4 w-4 text-green-400 mb-1 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground mb-0.5">{t('member.gross_profit')}</p>
                                <p className="font-semibold text-green-400 text-base">
                                    <span className="text-yellow-500">₱</span>{((item.total_gross_profit || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
