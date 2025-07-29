import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ArrowLeft, TrendingUp, Users } from 'lucide-react';
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
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    customer?: {
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

interface PageProps {
    availableStocks: Stock[];
    partialStocks: Stock[];
    salesData: SalesData;
}

export default function AllStocks({ availableStocks, partialStocks, salesData }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const allStocks = [...availableStocks, ...partialStocks];
    const totalQuantity = allStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
    // Remove total value calculation since we no longer have a single price field
    
    // Create sold stocks from sales data for display
    const soldStocksForDisplay = salesData.salesBreakdown.map(sale => ({
        id: sale.product_id, // Using product_id as id
        product_id: sale.product_id,
        quantity: sale.total_quantity, // Show actual quantity sold
        member_id: 0,
        category: sale.category as 'Kilo' | 'Pc' | 'Tali',
        status: 'sold',
        product: {
            id: sale.product_id,
            name: sale.product_name,
            price_kilo: sale.price_per_unit,
            price_pc: sale.price_per_unit,
            price_tali: sale.price_per_unit,
            produce_type: 'fruit' // Default value, could be enhanced
        },
        customer: sale.customers.length > 0 ? { id: 0, name: sale.customers[0] } : undefined,
        created_at: new Date().toISOString(),
        totalRevenue: sale.total_revenue // Add actual sales revenue
    }));
    
    // Combine all stocks including sold ones
    const allStocksWithSold = [...allStocks, ...soldStocksForDisplay];

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
                            <CardTitle className="text-sm font-medium text-white">Total Stocks</CardTitle>
                            <Package className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{allStocks.length}</div>
                            <p className="text-xs text-gray-400">All assignments</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Available</CardTitle>
                            <Package className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{availableStocks.length}</div>
                            <p className="text-xs text-gray-400">Ready for sale</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Partial</CardTitle>
                            <Package className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{partialStocks.length}</div>
                            <p className="text-xs text-gray-400">Partially sold</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Sold</CardTitle>
                            <Package className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{salesData.totalSales}</div>
                            <p className="text-xs text-gray-400">Items sold</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Customers</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {new Set([...partialStocks].filter(s => s.customer).map(s => s.customer?.id)).size + salesData.salesBreakdown.reduce((sum, sale) => sum + sale.customers.length, 0)}
                            </div>
                            <p className="text-xs text-gray-400">Unique customers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stocks Table */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Stock Details</CardTitle>
                        <CardDescription className="text-gray-400">
                            Complete view of all your stock assignments with their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {allStocksWithSold.length > 0 ? (
                            <Table>
                                <TableCaption>A list of all your stock assignments</TableCaption>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-gray-300">Product</TableHead>
                                        <TableHead className="text-gray-300">Type</TableHead>
                                        <TableHead className="text-gray-300">Quantity</TableHead>
                                        <TableHead className="text-gray-300">Category</TableHead>
                                        <TableHead className="text-gray-300">Customer</TableHead>
                                        <TableHead className="text-gray-300">Price</TableHead>
                                        <TableHead className="text-gray-300">Total Value</TableHead>
                                        <TableHead className="text-gray-300">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allStocksWithSold.map((stock) => (
                                        <TableRow key={stock.id} className="border-gray-700 hover:bg-gray-700">
                                            <TableCell className="font-medium text-white">
                                                {stock.product.name}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {stock.product.produce_type}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {stock.quantity}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                <Badge variant="secondary" className="bg-gray-600 text-white">
                                                    {stock.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {stock.customer ? (
                                                    <span className="text-blue-400">{stock.customer.name}</span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                ₱{stock.product.price_kilo || 0}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                ₱{stock.totalRevenue ? stock.totalRevenue.toLocaleString() : (Number(stock.quantity) * (stock.product.price_kilo || 0)).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={
                                                        stock.status === 'sold'
                                                            ? "bg-red-600 text-white" 
                                                            : stock.customer 
                                                                ? "bg-yellow-600 text-white" 
                                                                : "bg-green-600 text-white"
                                                    }
                                                >
                                                    {stock.status === 'sold' ? "Sold" : stock.customer ? "Partial" : "Available"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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