import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, ArrowLeft, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member-header';

interface Product {
    id: number;
    name: string;
    price: number;
    produce_type: string;
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
    salesData: SalesData;
}

export default function MemberSoldStocks({ salesData }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="Sold Stocks" />
                <div className="mb-6">
                    <Button asChild variant="outline" className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Link href={route('member.dashboard')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-white">Sold Stocks</h1>
                    <p className="text-gray-400 mt-2">View all your successfully sold stocks</p>
                </div>

                {salesData.salesBreakdown.length > 0 ? (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    Sales Summary
                                </CardTitle>
                                <CardDescription>
                                    You have sold {salesData.totalSales} items across {salesData.salesBreakdown.length} products
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-green-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            {salesData.totalSales}
                                        </div>
                                        <div className="text-sm text-green-100">Total Sales</div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-600 rounded-lg">
                                        <div className="text-2xl font-bold text-white">
                                            ₱{salesData.totalRevenue.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-blue-100">Total Revenue</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sales Breakdown Table */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Sales Breakdown</CardTitle>
                                <CardDescription className="text-gray-400">Detailed view of all your sales by product</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableCaption className="text-gray-400">List of all your sales by product</TableCaption>
                                    <TableHeader>
                                        <TableRow className="border-gray-700">
                                            <TableHead className="text-center text-gray-300">Product</TableHead>
                                            <TableHead className="text-center text-gray-300">Total Quantity</TableHead>
                                            <TableHead className="text-center text-gray-300">Category</TableHead>
                                            <TableHead className="text-center text-gray-300">Price/Unit</TableHead>
                                            <TableHead className="text-center text-gray-300">Total Revenue</TableHead>
                                            <TableHead className="text-center text-gray-300">Customers</TableHead>
                                            <TableHead className="text-center text-gray-300">Sales Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesData.salesBreakdown.map((sale, index) => (
                                            <TableRow key={index} className="border-gray-700 hover:bg-gray-700">
                                                <TableCell className="text-center font-medium text-white">
                                                    {sale.product_name}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-300">
                                                    {sale.total_quantity}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="bg-gray-600 text-white">{sale.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-gray-300">
                                                    ₱{sale.price_per_unit}
                                                </TableCell>
                                                <TableCell className="text-center text-green-400 font-medium">
                                                    ₱{sale.total_revenue.toLocaleString()}
                                                </TableCell>
                                                                                            <TableCell className="text-center text-gray-300">
                                                <div className="text-xs">
                                                    {sale.customers.map((customer, idx) => (
                                                        <div key={idx} className="text-blue-400">
                                                            {customer}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                                <TableCell className="text-center text-gray-300">
                                                    {sale.sales_count}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="text-center py-12">
                            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-white mb-2">No Sales Recorded</h3>
                            <p className="text-gray-400 mb-4">
                                You haven't made any sales yet.
                            </p>
                            <p className="text-sm text-gray-500">
                                Sales will appear here once your stocks are sold to customers.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 