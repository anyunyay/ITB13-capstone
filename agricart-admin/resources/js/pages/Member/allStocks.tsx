import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ArrowLeft, TrendingUp, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member-header';

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
    lastCustomer?: {
        id: number;
        name: string;
    };
    created_at: string;
    totalRevenue?: number; // For sold stocks
}

interface SalesData {
    totalSales: number;
    totalRevenue: number;
    totalQuantitySold: number;
    salesBreakdown: Array<{
        product_id: number;
        product_name: string;
        total_quantity: number;
        price_per_unit: number;
        total_revenue: number;
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
    product: Product;
}

interface PageProps {
    availableStocks: Stock[];
    salesData: SalesData;
    comprehensiveStockData: ComprehensiveStockData[];
}

export default function AllStocks({ availableStocks, salesData, comprehensiveStockData }: PageProps) {
    const { auth } = usePage<SharedData>().props;

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

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="All Stocks" />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-white">All Stocks</h1>
                    <p className="text-gray-400 mt-2">Complete overview of all your stock assignments</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalProducts}</div>
                            <p className="text-xs text-gray-400">Different products</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Quantity</CardTitle>
                            <Package className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalQuantity}</div>
                            <p className="text-xs text-gray-400">All stock items</p>
                        </CardContent>
                    </Card>
                    {/* Sold Stock Card */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Sold Stock</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-400">{totalSold}</div>
                            <p className="text-xs text-gray-400">Total items sold</p>
                        </CardContent>
                    </Card>
                    {/* Available Stock Card */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Available Stock</CardTitle>
                            <Package className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{totalAvailable}</div>
                            <p className="text-xs text-gray-400">Items ready for sale</p>
                        </CardContent>
                    </Card>
                    {/* Revenue Card */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-400">₱{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-gray-400">From sales</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Comprehensive Stock Overview */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Stock Quantity Overview</CardTitle>
                        <CardDescription className="text-gray-400">
                            Complete breakdown of your stock quantities: Total, Sold, and Available (Balance)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {comprehensiveStockData.length > 0 ? (
                            <div className="space-y-4">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <Card className="bg-gray-700 border-gray-600">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Products</p>
                                                    <p className="text-2xl font-bold text-white">{comprehensiveStockData.length}</p>
                                                </div>
                                                <Package className="h-8 w-8 text-blue-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gray-700 border-gray-600">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Quantity</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {comprehensiveStockData.reduce((sum, item) => sum + item.total_quantity, 0)}
                                                    </p>
                                                </div>
                                                <TrendingUp className="h-8 w-8 text-green-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gray-700 border-gray-600">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Revenue</p>
                                                    <p className="text-2xl font-bold text-white">
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
                                        <TableRow className="border-gray-700">
                                            <TableHead className="text-gray-300">Product Name</TableHead>
                                            <TableHead className="text-gray-300">Category</TableHead>
                                            <TableHead className="text-gray-300">Total Stock</TableHead>
                                            <TableHead className="text-gray-300">Sold Quantity</TableHead>
                                            <TableHead className="text-gray-300">Available (Balance)</TableHead>
                                            <TableHead className="text-gray-300">Unit Price</TableHead>
                                            <TableHead className="text-gray-300">Total Revenue</TableHead>
                                            <TableHead className="text-gray-300">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comprehensiveStockData.map((item, index) => (
                                            <TableRow key={`${item.product_id}-${item.category}`} className="border-gray-700 hover:bg-gray-700">
                                                <TableCell className="font-medium text-white">
                                                    {item.product_name}
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    <Badge variant="secondary" className="bg-gray-600 text-white">
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-blue-400" />
                                                        <span className="font-semibold">{item.total_quantity}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-red-400" />
                                                        <span className="font-semibold text-red-300">{item.sold_quantity}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                                        <span className={`font-semibold ${
                                                            item.balance_quantity > 0 ? 'text-green-300' : 'text-gray-400'
                                                        }`}>
                                                            {item.balance_quantity}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    ₱{item.unit_price.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    <span className="font-semibold text-yellow-300">
                                                        ₱{item.total_revenue.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.balance_quantity > 0 ? (
                                                        <Badge className="bg-green-600 text-white">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Available
                                                        </Badge>
                                                    ) : item.sold_quantity > 0 ? (
                                                        <Badge className="bg-red-600 text-white">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Sold Out
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-600 text-white">
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
                            <div className="text-center py-12 text-gray-400">
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
            </div>
        </div>
    );
} 