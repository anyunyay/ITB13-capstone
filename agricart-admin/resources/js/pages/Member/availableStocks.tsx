import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ArrowLeft, TrendingUp } from 'lucide-react';
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
    quantity: number;
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    created_at: string;
}

interface PageProps {
    availableStocks: Stock[];
}

export default function AvailableStocks({ availableStocks }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const totalQuantity = availableStocks.reduce((sum, stock) => sum + stock.quantity, 0);
    // Remove total value calculation since we no longer have a single price field

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="Available Stocks" />
                
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
                    <h1 className="text-3xl font-bold text-white">Available Stocks</h1>
                    <p className="text-gray-400 mt-2">Your stocks ready for sale</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Stocks</CardTitle>
                            <Package className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{availableStocks.length}</div>
                            <p className="text-xs text-gray-400">Available items</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Quantity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalQuantity}</div>
                            <p className="text-xs text-gray-400">Units available</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Categories</CardTitle>
                            <Package className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {new Set(availableStocks.map(s => s.category)).size}
                            </div>
                            <p className="text-xs text-gray-400">Different types</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stocks Table */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Available Stock Details</CardTitle>
                        <CardDescription className="text-gray-400">
                            Detailed view of all your available stocks ready for sale
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {availableStocks.length > 0 ? (
                            <Table>
                                <TableCaption>A list of your available stocks</TableCaption>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-gray-300">Product</TableHead>
                                        <TableHead className="text-gray-300">Type</TableHead>
                                        <TableHead className="text-gray-300">Quantity</TableHead>
                                        <TableHead className="text-gray-300">Category</TableHead>
                                        <TableHead className="text-gray-300">Price</TableHead>
                                        <TableHead className="text-gray-300">Total Value</TableHead>
                                        <TableHead className="text-gray-300">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availableStocks.map((stock) => (
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
                                                {stock.category === 'Kilo' && stock.product.price_kilo && `₱${stock.product.price_kilo}`}
                                                {stock.category === 'Pc' && stock.product.price_pc && `₱${stock.product.price_pc}`}
                                                {stock.category === 'Tali' && stock.product.price_tali && `₱${stock.product.price_tali}`}
                                                {(!stock.product.price_kilo && !stock.product.price_pc && !stock.product.price_tali) && 'No price set'}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {stock.category === 'Kilo' && stock.product.price_kilo && `₱${(stock.quantity * stock.product.price_kilo).toLocaleString()}`}
                                                {stock.category === 'Pc' && stock.product.price_pc && `₱${(stock.quantity * stock.product.price_pc).toLocaleString()}`}
                                                {stock.category === 'Tali' && stock.product.price_tali && `₱${(stock.quantity * stock.product.price_tali).toLocaleString()}`}
                                                {(!stock.product.price_kilo && !stock.product.price_pc && !stock.product.price_tali) && 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-600 text-white">
                                                    Available
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">No Available Stocks</h3>
                                <p className="text-sm">You don't have any stocks available for sale at the moment.</p>
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