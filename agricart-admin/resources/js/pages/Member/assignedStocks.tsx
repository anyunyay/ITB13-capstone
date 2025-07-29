import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Users } from 'lucide-react';
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
    assignedStocks: Stock[];
}

export default function AssignedStocks({ assignedStocks }: PageProps) {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const partialStocks = assignedStocks.filter(stock => stock.quantity > 0);
    const soldStocks = assignedStocks.filter(stock => stock.quantity === 0);

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="Assigned Stocks" />
                
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
                    <h1 className="text-3xl font-bold text-white">Assigned Stocks</h1>
                    <p className="text-gray-400 mt-2">All stocks that have been purchased by customers</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Partially Sold</CardTitle>
                            <Users className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{assignedStocks.length}</div>
                            <p className="text-xs text-gray-400">With remaining quantity</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Quantity</CardTitle>
                            <Package className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{assignedStocks.reduce((sum, stock) => sum + stock.quantity, 0)}</div>
                            <p className="text-xs text-gray-400">Remaining units</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Unique Customers</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {new Set(assignedStocks.map(s => s.customer?.id)).size}
                            </div>
                            <p className="text-xs text-gray-400">Different customers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stocks List */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Partially Sold Stocks</CardTitle>
                        <CardDescription className="text-gray-400">
                            Stocks that have been purchased by customers but still have remaining quantity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignedStocks.length > 0 ? (
                            <div className="space-y-4">
                                {assignedStocks.map((stock) => (
                                    <div key={stock.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Package className={`h-5 w-5 ${stock.quantity === 0 ? 'text-green-400' : 'text-yellow-400'}`} />
                                                <div>
                                                    <h4 className="font-medium text-white">{stock.product.name}</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {stock.product.produce_type} • {stock.category}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(stock.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-white">
                                                    {stock.quantity} {stock.category}
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {stock.quantity === 0 ? 'Sold' : 'Remaining'}
                                                </p>
                                            </div>
                                            {stock.customer && (
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-white">
                                                        {stock.customer.name}
                                                    </div>
                                                    <p className="text-xs text-gray-400">Customer</p>
                                                </div>
                                            )}
                                            <Badge 
                                                variant="secondary" 
                                                className={stock.quantity === 0 ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}
                                            >
                                                {stock.quantity === 0 ? "Sold" : "Partial"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">No Partially Sold Stocks</h3>
                                <p className="text-sm">You don't have any partially sold stocks at the moment.</p>
                                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                    <Link href={route('member.allStocks')}>View All Stocks</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 