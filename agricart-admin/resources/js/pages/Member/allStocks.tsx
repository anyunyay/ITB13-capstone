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
    const [showTransactions, setShowTransactions] = useState(false);

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    // Calculate summary statistics from comprehensive data
    const totalProducts = comprehensiveStockData.length;
    const totalQuantity = comprehensiveStockData.reduce((sum, item) => sum + item.total_quantity, 0);
    const totalSold = comprehensiveStockData.reduce((sum, item) => sum + item.sold_quantity, 0);
    const totalAvailable = comprehensiveStockData.reduce((sum, item) => sum + item.balance_quantity, 0);
    const totalRevenue = comprehensiveStockData.reduce((sum, item) => sum + item.total_revenue, 0);

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
        }).format(amount);
    };

    const formatDateTime = (dateString: string): string => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    return (
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-6 pt-25">
                <Head title="All Stocks" />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        
                        {/* Toggle Switch */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-sm text-foreground">
                                    Stock Overview
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
                                    Show Transactions
                                </Label>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {showTransactions ? 'Transaction History' : 'All Stocks'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {showTransactions 
                            ? 'View all transactions related to your stocks' 
                            : 'Complete overview of all your stock assignments'
                        }
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                    {showTransactions ? (
                        <>
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Transactions</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{summary?.total_transactions || 0}</div>
                                    <p className="text-xs text-muted-foreground">All time</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Quantity</CardTitle>
                                    <Package className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{summary?.total_quantity || 0}</div>
                                    <p className="text-xs text-muted-foreground">Items sold</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_revenue || 0)}</div>
                                    <p className="text-xs text-muted-foreground">Gross sales</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Member Revenue</CardTitle>
                                    <Users className="h-4 w-4 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary?.total_member_share || 0)}</div>
                                    <p className="text-xs text-muted-foreground">Your product revenue</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">COGS</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-orange-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-400">{formatCurrency(summary?.total_cogs || 0)}</div>
                                    <p className="text-xs text-muted-foreground">Cost of goods sold</p>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Gross Profit</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">{formatCurrency(summary?.total_gross_profit || 0)}</div>
                                    <p className="text-xs text-muted-foreground">Revenue minus COGS</p>
                                </CardContent>
                            </Card>

                        </>
                    ) : (
                        <>
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Products</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                                    <p className="text-xs text-muted-foreground">Different products</p>
                                </CardContent>
                            </Card>
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Quantity</CardTitle>
                                    <Package className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{totalQuantity}</div>
                                    <p className="text-xs text-muted-foreground">All stock items</p>
                                </CardContent>
                            </Card>
                            {/* Sold Stock Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Sold Stock</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-400">{totalSold}</div>
                                    <p className="text-xs text-muted-foreground">Total items sold</p>
                                </CardContent>
                            </Card>
                            {/* Available Stock Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Available Stock</CardTitle>
                                    <Package className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">{totalAvailable}</div>
                                    <p className="text-xs text-muted-foreground">Items ready for sale</p>
                                </CardContent>
                            </Card>
                            {/* Revenue Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-400">₱{totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">From sales</p>
                                </CardContent>
                            </Card>

                            {/* COGS Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">COGS</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-orange-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-400">₱{comprehensiveStockData.reduce((sum, item) => sum + (item.total_cogs || 0), 0).toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">Cost of goods sold</p>
                                </CardContent>
                            </Card>

                            {/* Gross Profit Card */}
                            <Card className="">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Gross Profit</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-400">₱{comprehensiveStockData.reduce((sum, item) => sum + (item.total_gross_profit || 0), 0).toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">Revenue minus COGS</p>
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
                            <CardTitle className="text-foreground">Transaction History</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Showing {transactions?.meta?.from || 0}-{transactions?.meta?.to || 0} of {transactions?.meta?.total || 0} transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!transactions?.data || transactions.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No transactions found</h3>
                                    <p className="text-muted-foreground">No transactions match your current filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="">
                                                <TableHead className="text-foreground">Product</TableHead>
                                                <TableHead className="text-foreground">Category</TableHead>
                                                <TableHead className="text-foreground">Quantity</TableHead>
                                                <TableHead className="text-foreground">Subtotal</TableHead>
                                                <TableHead className="text-foreground">Buyer</TableHead>
                                                <TableHead className="text-foreground">Date</TableHead>
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
                                                    <TableCell className="text-foreground font-medium">
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
                            <CardTitle className="text-foreground">Stock Quantity Overview</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Complete breakdown of your stock quantities: Total, Sold, and Available (Balance)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        {comprehensiveStockData.length > 0 ? (
                            <div className="space-y-4">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <Card className="bg-muted border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Products</p>
                                                    <p className="text-2xl font-bold text-foreground">{comprehensiveStockData.length}</p>
                                                </div>
                                                <Package className="h-8 w-8 text-blue-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {comprehensiveStockData.reduce((sum, item) => sum + item.total_quantity, 0)}
                                                    </p>
                                                </div>
                                                <TrendingUp className="h-8 w-8 text-green-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        ₱{comprehensiveStockData.reduce((sum, item) => sum + item.total_revenue, 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Users className="h-8 w-8 text-yellow-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Stock Details Table */}
                                <Table>
                                    <TableCaption>Detailed breakdown of all your stock quantities</TableCaption>
                                    <TableHeader>
                                        <TableRow className="">
                                            <TableHead className="text-foreground">Product Name</TableHead>
                                            <TableHead className="text-foreground">Category</TableHead>
                                            <TableHead className="text-foreground">Total Stock</TableHead>
                                            <TableHead className="text-foreground">Sold Quantity</TableHead>
                                            <TableHead className="text-foreground">Available (Balance)</TableHead>
                                            <TableHead className="text-foreground">Total Revenue</TableHead>
                                            <TableHead className="text-foreground">COGS</TableHead>
                                            <TableHead className="text-foreground">Gross Profit</TableHead>
                                            <TableHead className="text-foreground">Status</TableHead>
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
                                                <TableCell className="text-foreground">
                                                    <span className="font-semibold text-yellow-300">
                                                        ₱{item.total_revenue.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <span className="font-semibold text-orange-300">
                                                        ₱{(item.total_cogs || 0).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <span className="font-semibold text-green-300">
                                                        ₱{(item.total_gross_profit || 0).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.balance_quantity > 0 ? (
                                                        <Badge className="bg-green-600 text-foreground">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Available
                                                        </Badge>
                                                    ) : item.sold_quantity > 0 ? (
                                                        <Badge className="bg-red-600 text-foreground">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Sold Out
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-muted text-foreground">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            No Stock
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">No Stocks Found</h3>
                                <p className="text-sm">You don't have any stocks at the moment.</p>
                                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                    <Link href={route('member.dashboard')}>Back to Dashboard</Link>
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