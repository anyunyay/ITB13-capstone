import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package, ArrowLeft, TrendingUp, Users, CheckCircle, XCircle, AlertCircle, History, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member-header';
import { format } from 'date-fns';
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

interface Stock {
    id: number;
    product_id: number;
    quantity: number | string;
    sold_quantity: number;
    initial_quantity: number;
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    created_at: string;
    totalRevenue?: number; // For sold stocks
}

interface SalesData {
    totalSales: number;
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    totalQuantitySold: number;
    salesBreakdown: Array<{
        product_id: number;
        product_name: string;
        total_quantity: number;
        price_per_unit: number;
        total_revenue: number;
        total_cogs: number;
        total_gross_profit: number;
        category: string;
        sales_count: number;
        customers: string[];
    }>;
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

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface TransactionsData {
    data: Transaction[];
    links: any[];
    meta: PaginationData;
}

interface Summary {
    total_transactions: number;
    total_quantity: number;
    total_revenue: number;
    total_member_share: number;
    total_cogs: number;
    total_gross_profit: number;
}

interface PageProps {
    availableStocks: Stock[];
    salesData: SalesData;
    comprehensiveStockData: ComprehensiveStockData[];
    transactions: TransactionsData;
    summary: Summary;
}

export default function AllStocks({ availableStocks, salesData, comprehensiveStockData, transactions, summary }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const t = useTranslation();
    const [showTransactions, setShowTransactions] = useState(false);

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    // Calculate summary statistics from comprehensive data
    const totalProducts = comprehensiveStockData.length;
    const totalSold = comprehensiveStockData.reduce((sum, item) => sum + item.sold_quantity, 0);
    const totalAvailable = comprehensiveStockData.reduce((sum, item) => sum + item.balance_quantity, 0);
    const totalRevenue = comprehensiveStockData.reduce((sum, item) => sum + item.total_revenue, 0);
    
    // Calculate totals by category
    const totalKilo = comprehensiveStockData
        .filter(item => item.category === 'Kilo')
        .reduce((sum, item) => sum + item.total_quantity, 0);
    const totalPiece = comprehensiveStockData
        .filter(item => item.category === 'Pc')
        .reduce((sum, item) => sum + item.total_quantity, 0);
    const totalTali = comprehensiveStockData
        .filter(item => item.category === 'Tali')
        .reduce((sum, item) => sum + item.total_quantity, 0);

    // Transaction helper functions
    const calculateMemberRevenue = (transaction: Transaction): number => {
        // Get the appropriate price based on category
        let price = 0;
        switch (transaction.category) {
            case 'Kilo':
                price = transaction.price_kilo || transaction.unit_price || 0;
                break;
            case 'Pc':
                price = transaction.price_pc || transaction.unit_price || 0;
                break;
            case 'Tali':
                price = transaction.price_tali || transaction.unit_price || 0;
                break;
            default:
                price = transaction.unit_price || 0;
        }
        
        // Member gets 100% of product revenue (no co-op share deduction from member view)
        return transaction.quantity * price;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDateTime = (dateString: string): string => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-6 pt-25">
                <Head title={t('member.all_stocks')} />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('member.back_to_dashboard')}
                            </Link>
                        </Button>
                        
                        {/* Toggle Switch */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-sm text-foreground">
                                    {t('member.stock_overview')}
                                </Label>
                            </div>
                            <Switch
                                id="view-toggle"
                                checked={showTransactions}
                                onCheckedChange={setShowTransactions}
                            />
                            <div className="flex items-center space-x-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-sm text-foreground">
                                    {t('member.show_transactions')}
                                </Label>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {showTransactions ? t('member.transaction_history') : t('member.all_stocks')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {showTransactions 
                            ? t('member.transaction_history_description')
                            : t('member.all_stocks_description')
                        }
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
                    {showTransactions ? (
                        <>
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_transactions')}</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{summary?.total_transactions || 0}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.all_time')}</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_quantity')}</CardTitle>
                                    <Package className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{summary?.total_quantity || 0}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.items_sold_label')}</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_revenue')}</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_revenue || 0)}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.gross_sales')}</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.member_revenue')}</CardTitle>
                                    <Users className="h-4 w-4 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_member_share || 0)}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.your_product_revenue')}</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.cogs')}</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-orange-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-400">{formatCurrency(summary?.total_cogs || 0)}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.cost_of_goods_sold_label')}</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.gross_profit')}</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">{formatCurrency(summary?.total_gross_profit || 0)}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.revenue_minus_cogs')}</p>
                                </CardContent>
                            </Card>

                        </>
                    ) : (
                        <>
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_products')}</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.different_products')}</p>
                                </CardContent>
                            </Card>
                            {/* Total Kilo Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_kilo')}</CardTitle>
                                    <Package className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-400">{totalKilo}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.total_in_kilos')}</p>
                                </CardContent>
                            </Card>
                            {/* Total Piece Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_piece')}</CardTitle>
                                    <Package className="h-4 w-4 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-400">{totalPiece}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.total_pieces')}</p>
                                </CardContent>
                            </Card>
                            {/* Total Tali Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.total_tali')}</CardTitle>
                                    <Package className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">{totalTali}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.total_in_tali')}</p>
                                </CardContent>
                            </Card>
                            {/* Available Stock Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.available_stock')}</CardTitle>
                                    <Package className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">{totalAvailable}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.items_ready_for_sale')}</p>
                                </CardContent>
                            </Card>
                            {/* Sold Stock Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">{t('member.sold_stock')}</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-400">{totalSold}</div>
                                    <p className="text-xs text-muted-foreground">{t('member.items_sold')}</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                {showTransactions ? (
                    /* Transaction View */
                    <Card className="">
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('member.transaction_history_table')}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {t('member.showing_transactions', { 
                                    from: transactions?.meta?.from || 0, 
                                    to: transactions?.meta?.to || 0, 
                                    total: transactions?.meta?.total || 0 
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!transactions?.data || transactions.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">{t('member.no_transactions_found')}</h3>
                                    <p className="text-muted-foreground">{t('member.no_transactions_match_filters')}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="">
                                                <TableHead className="text-foreground">{t('member.product')}</TableHead>
                                                <TableHead className="text-foreground">{t('member.category')}</TableHead>
                                                <TableHead className="text-foreground">{t('member.quantity')}</TableHead>
                                                <TableHead className="text-foreground text-right">{t('member.subtotal')}</TableHead>
                                                <TableHead className="text-foreground">{t('member.buyer')}</TableHead>
                                                <TableHead className="text-foreground">{t('member.date')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data?.map((transaction) => (
                                                <TableRow key={transaction.id} className=" hover:bg-muted/50">
                                                    <TableCell className="text-foreground font-medium">
                                                        {transaction.product_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                            {transaction.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-foreground">
                                                        {transaction.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-foreground font-medium text-right">
                                                        {formatCurrency(calculateMemberRevenue(transaction))}
                                                    </TableCell>
                                                    <TableCell className="text-foreground">
                                                        {transaction.sale.customer.name}
                                                    </TableCell>
                                                    <TableCell className="text-foreground">
                                                        {formatDateTime(transaction.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    /* Stock Overview */
                    <Card className="">
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('member.stock_quantity_overview')}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {t('member.complete_breakdown')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        {comprehensiveStockData.length > 0 ? (
                            <div className="space-y-4">
                                {/* Stock Details Table */}
                                <Table>
                                    <TableCaption>{t('member.detailed_breakdown')}</TableCaption>
                                    <TableHeader>
                                        <TableRow className="">
                                            <TableHead className="text-foreground">{t('member.product_name')}</TableHead>
                                            <TableHead className="text-foreground">{t('member.category')}</TableHead>
                                            <TableHead className="text-foreground">{t('member.total_stock_label')}</TableHead>
                                            <TableHead className="text-foreground">{t('member.sold_quantity')}</TableHead>
                                            <TableHead className="text-foreground">{t('member.available_balance')}</TableHead>
                                            <TableHead className="text-foreground text-right">{t('member.total_revenue')}</TableHead>
                                            <TableHead className="text-foreground text-right">{t('member.cogs')}</TableHead>
                                            <TableHead className="text-foreground text-right">{t('member.gross_profit')}</TableHead>
                                            <TableHead className="text-foreground">{t('member.status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comprehensiveStockData.map((item, index) => (
                                            <TableRow key={`${item.product_id}-${item.category}`} className=" hover:bg-muted">
                                                <TableCell className="font-medium text-foreground">
                                                    {item.product_name}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <Badge variant="secondary" className="bg-muted text-foreground">
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-blue-400" />
                                                        <span className="font-semibold">{item.total_quantity}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-red-400" />
                                                        <span className="font-semibold text-red-300">{item.sold_quantity}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                                        <span className={`font-semibold ${
                                                            item.balance_quantity > 0 ? 'text-green-300' : 'text-muted-foreground'
                                                        }`}>
                                                            {item.balance_quantity}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground text-right">
                                                    <span className="font-semibold text-yellow-300">
                                                        ₱{item.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-foreground text-right">
                                                    <span className="font-semibold text-orange-300">
                                                        ₱{((item.total_cogs || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-foreground text-right">
                                                    <span className="font-semibold text-green-300">
                                                        ₱{((item.total_gross_profit || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Totals Row */}
                                        <TableRow className="bg-muted font-bold">
                                            <TableCell className="text-foreground">{t('member.total_label')}</TableCell>
                                            <TableCell className="text-foreground">-</TableCell>
                                            <TableCell className="text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-400" />
                                                    <span className="font-semibold">
                                                        {comprehensiveStockData.reduce((sum, item) => sum + item.total_quantity, 0)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-400" />
                                                    <span className="font-semibold text-red-300">
                                                        {comprehensiveStockData.reduce((sum, item) => sum + item.sold_quantity, 0)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                                    <span className="font-semibold text-green-300">
                                                        {comprehensiveStockData.reduce((sum, item) => sum + item.balance_quantity, 0)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground text-right">
                                                <span className="font-semibold text-yellow-300">
                                                    ₱{comprehensiveStockData.reduce((sum, item) => sum + item.total_revenue, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-foreground text-right">
                                                <span className="font-semibold text-orange-300">
                                                    ₱{comprehensiveStockData.reduce((sum, item) => sum + (item.total_cogs || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-foreground text-right">
                                                <span className="font-semibold text-green-300">
                                                    ₱{comprehensiveStockData.reduce((sum, item) => sum + (item.total_gross_profit || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-foreground">-</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">{t('member.no_stocks_found')}</h3>
                                <p className="text-sm">{t('member.no_stocks_message')}</p>
                                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                    <Link href={route('member.dashboard')}>{t('member.back_to_dashboard')}</Link>
                                </Button>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 