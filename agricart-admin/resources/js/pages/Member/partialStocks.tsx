import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft } from 'lucide-react';
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
    customer?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface PageProps {
    partialStocks: Stock[];
}

export default function PartialStocks({ partialStocks }: PageProps) {
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
                <Head title="Partially Fulfilled Stocks" />
                
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
                    <h1 className="text-3xl font-bold text-white">Partially Fulfilled Stocks</h1>
                    <p className="text-gray-400 mt-2">Stocks that have been approved by admin but not completely sold</p>
                </div>

                {/* Summary Card */}
                <Card className="bg-gray-800 border-gray-700 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Summary</CardTitle>
                        <CardDescription className="text-gray-400">Overview of your partially fulfilled stocks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{partialStocks.length}</div>
                                <p className="text-sm text-gray-400">Total Partially Fulfilled</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {partialStocks.reduce((total, stock) => total + stock.quantity, 0)}
                                </div>
                                <p className="text-sm text-gray-400">Remaining Quantity</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {partialStocks.filter(stock => stock.customer).length}
                                </div>
                                <p className="text-sm text-gray-400">With Customers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stocks List */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Partially Fulfilled Stocks</CardTitle>
                        <CardDescription className="text-gray-400">
                            These stocks have been approved by admin and partially sold
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {partialStocks.length > 0 ? (
                            <div className="space-y-4">
                                {partialStocks.map((stock) => (
                                    <div key={stock.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Package className="h-5 w-5 text-yellow-400" />
                                                <div>
                                                    <h4 className="font-medium text-white">{stock.product.name}</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {stock.product.produce_type} • {stock.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-white">
                                                    {stock.quantity} {stock.category}
                                                </div>
                                                <p className="text-sm text-gray-400">Remaining</p>
                                            </div>
                                            {stock.customer && (
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-white">
                                                        {stock.customer.name}
                                                    </div>
                                                    <p className="text-xs text-gray-400">Customer</p>
                                                </div>
                                            )}
                                            <Badge variant="secondary" className="bg-yellow-600 text-white">
                                                Partial
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">No Partially Fulfilled Stocks</h3>
                                <p className="text-sm">You don't have any stocks that are partially fulfilled at the moment.</p>
                                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                    <Link href={route('member.stocks')}>View All Stocks</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 