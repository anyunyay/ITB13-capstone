import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Calendar, Package, DollarSign, Users, TrendingUp } from 'lucide-react';
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
}

interface PageProps {
    transactions: TransactionsData;
    availableProducts: Product[];
    summary: Summary;
    filters: {
        search: string;
        product: string;
        date_from: string;
        date_to: string;
        per_page: number;
    };
}

export default function MemberTransactions({ transactions, availableProducts, summary, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [productFilter, setProductFilter] = useState(filters.product || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (productFilter && productFilter !== 'all') params.set('product', productFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (perPage !== 15) params.set('per_page', perPage.toString());

        router.get(route('member.transactions'), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setProductFilter('all');
        setDateFrom('');
        setDateTo('');
        setPerPage(15);
        router.get(route('member.transactions'));
    };

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

    const formatDate = (dateString: string): string => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const formatDateTime = (dateString: string): string => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    if (!auth?.user) {
        return (
            <div className="min-h-screen bg-gray-900">
                <MemberHeader />
                <div className="p-6 pt-25">
                    <div className="text-center py-12">
                        <div className="text-white text-xl">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle case where transactions data is not available
    if (!transactions) {
        return (
            <div className="min-h-screen bg-gray-900">
                <MemberHeader />
                <div className="p-6 pt-25">
                    <div className="text-center py-12">
                        <div className="text-white text-xl">Loading transactions...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6 pt-15">
                <Head title="Member Transactions" />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
                            <p className="text-gray-400 mt-2">View all your stock transactions and earnings</p>
                        </div>
                        <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <a href={route('member.dashboard')}>
                                <Package className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Transactions</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary?.total_transactions || 0}</div>
                            <p className="text-xs text-gray-400">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Quantity</CardTitle>
                            <Package className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summary?.total_quantity || 0}</div>
                            <p className="text-xs text-gray-400">Items sold</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{formatCurrency(summary?.total_revenue || 0)}</div>
                            <p className="text-xs text-gray-400">Gross sales</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Member Revenue</CardTitle>
                            <Users className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{formatCurrency(summary?.total_member_share || 0)}</div>
                            <p className="text-xs text-gray-400">Your product revenue</p>
                        </CardContent>
                    </Card>

                </div>

                {/* Filters */}
                <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <Label htmlFor="search" className="text-gray-300">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Product or customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="product" className="text-gray-300">Product</Label>
                                <Select value={productFilter} onValueChange={setProductFilter}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="All products" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All products</SelectItem>
                                        {availableProducts?.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="dateFrom" className="text-gray-300">From Date</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dateTo" className="text-gray-300">To Date</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="perPage" className="text-gray-300">Per Page</Label>
                                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                            <Button onClick={clearFilters} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Transaction History</CardTitle>
                        <CardDescription className="text-gray-400">
                            Showing {transactions.meta?.from || 0}-{transactions.meta?.to || 0} of {transactions.meta?.total || 0} transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!transactions.data || transactions.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">No transactions found</h3>
                                <p className="text-gray-400">No transactions match your current filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-700">
                                            <TableHead className="text-gray-300">Product</TableHead>
                                            <TableHead className="text-gray-300">Category</TableHead>
                                            <TableHead className="text-gray-300">Quantity</TableHead>
                                            <TableHead className="text-gray-300">Subtotal</TableHead>
                                            <TableHead className="text-gray-300">Buyer</TableHead>
                                            <TableHead className="text-gray-300">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data?.map((transaction) => (
                                            <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-700/50">
                                                <TableCell className="text-white font-medium">
                                                    {transaction.product_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                        {transaction.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    {transaction.quantity}
                                                </TableCell>
                                                <TableCell className="text-white font-medium">
                                                    {formatCurrency(calculateMemberRevenue(transaction))}
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    {transaction.sale.customer.name}
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    {formatDateTime(transaction.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.meta?.last_page && transactions.meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-400">
                                    Showing {transactions.meta?.from || 0} to {transactions.meta?.to || 0} of {transactions.meta?.total || 0} results
                                </div>
                                <div className="flex gap-2">
                                    {transactions.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveState: true });
                                                }
                                            }}
                                            disabled={!link.url}
                                            className={
                                                link.active
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                                            }
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
