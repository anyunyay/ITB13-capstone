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
        <div className="min-h-screen bg-background">
            <MemberHeader />
            <div className="p-6 pt-25">
                <Head title="Available Stocks" />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Available Stocks</h1>
                    <p className="text-muted-foreground mt-2">Your stocks ready for sale</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Stocks</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{availableStocks.length}</div>
                            <p className="text-xs text-muted-foreground">Available items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Quantity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{totalQuantity}</div>
                            <p className="text-xs text-muted-foreground">Units available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Categories</CardTitle>
                            <Package className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {new Set(availableStocks.map(s => s.category)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">Different types</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Products</CardTitle>
                            <Package className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {new Set(availableStocks.map(s => s.product_id)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">Unique items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Avg Quantity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.length > 0 ? Math.round(totalQuantity / availableStocks.length) : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Per stock item</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Kilo Items</CardTitle>
                            <Package className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.filter(s => s.category === 'Kilo').length}
                            </div>
                            <p className="text-xs text-muted-foreground">By weight</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Piece Items</CardTitle>
                            <Package className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.filter(s => s.category === 'Pc').length}
                            </div>
                            <p className="text-xs text-muted-foreground">By piece</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stocks Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Available Stock Details</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Detailed view of all your available stocks ready for sale
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {availableStocks.length > 0 ? (
                            <Table>
                                <TableCaption>A list of your available stocks</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-foreground/80">Product</TableHead>
                                        <TableHead className="text-foreground/80">Type</TableHead>
                                        <TableHead className="text-foreground/80">Quantity</TableHead>
                                        <TableHead className="text-foreground/80">Category</TableHead>
                                        <TableHead className="text-foreground/80">Total Value</TableHead>
                                        <TableHead className="text-foreground/80">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availableStocks.map((stock) => (
                                        <TableRow key={stock.id} className="hover:bg-muted">
                                            <TableCell className="font-medium text-foreground">
                                                {stock.product.name}
                                            </TableCell>
                                            <TableCell className="text-foreground/80">
                                                {stock.product.produce_type}
                                            </TableCell>
                                            <TableCell className="text-foreground/80">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-green-400">{stock.quantity}</span>
                                                    <span className="text-xs text-muted-foreground">Available</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground/80">
                                                <Badge variant="secondary">
                                                    {stock.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-foreground/80">
                                                {stock.category === 'Kilo' && stock.product.price_kilo && `₱${(stock.quantity * stock.product.price_kilo).toLocaleString()}`}
                                                {stock.category === 'Pc' && stock.product.price_pc && `₱${(stock.quantity * stock.product.price_pc).toLocaleString()}`}
                                                {stock.category === 'Tali' && stock.product.price_tali && `₱${(stock.quantity * stock.product.price_tali).toLocaleString()}`}
                                                {(!stock.product.price_kilo && !stock.product.price_pc && !stock.product.price_tali) && 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    Available
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No Available Stocks</h3>
                                <p className="text-sm">You don't have any stocks available for sale at the moment.</p>
                                <Button asChild className="mt-4">
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