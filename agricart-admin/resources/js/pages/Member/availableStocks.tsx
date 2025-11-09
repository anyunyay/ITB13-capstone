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
import { MemberHeader } from '@/components/member/member-header';
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
    const t = useTranslation();

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
                <Head title={t('member.available_stocks_page')} />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('member.back_to_dashboard')}
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">{t('member.available_stocks_page')}</h1>
                    <p className="text-muted-foreground mt-2">{t('member.stocks_ready_for_sale')}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.total_stocks')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{availableStocks.length}</div>
                            <p className="text-xs text-muted-foreground">{t('member.available_items')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.total_quantity')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{totalQuantity}</div>
                            <p className="text-xs text-muted-foreground">{t('member.units_available')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.categories')}</CardTitle>
                            <Package className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {new Set(availableStocks.map(s => s.category)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('member.different_types')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.total_products')}</CardTitle>
                            <Package className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {new Set(availableStocks.map(s => s.product_id)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('member.unique_items')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.avg_quantity')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.length > 0 ? Math.round(totalQuantity / availableStocks.length) : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('member.per_stock_item')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.kilo_items')}</CardTitle>
                            <Package className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.filter(s => s.category === 'Kilo').length}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('member.by_weight')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">{t('member.piece_items')}</CardTitle>
                            <Package className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {availableStocks.filter(s => s.category === 'Pc').length}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('member.by_piece')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stocks Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">{t('member.available_stock_details')}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {t('member.detailed_view')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {availableStocks.length > 0 ? (
                            <Table>
                                <TableCaption>{t('member.list_of_available_stocks')}</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-foreground/80">{t('member.product')}</TableHead>
                                        <TableHead className="text-foreground/80">{t('member.type')}</TableHead>
                                        <TableHead className="text-foreground/80">{t('member.quantity')}</TableHead>
                                        <TableHead className="text-foreground/80">{t('member.category')}</TableHead>
                                        <TableHead className="text-foreground/80">{t('member.total_value')}</TableHead>
                                        <TableHead className="text-foreground/80">{t('member.status')}</TableHead>
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
                                                    <span className="text-xs text-muted-foreground">{t('ui.available')}</span>
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
                                                    {t('member.available')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">{t('member.no_available_stocks')}</h3>
                                <p className="text-sm">{t('member.no_available_stocks_message')}</p>
                                <Button asChild className="mt-4">
                                    <Link href={route('member.dashboard')}>{t('member.back_to_dashboard')}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 