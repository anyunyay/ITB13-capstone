import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { MemberHeader } from '@/components/member-header';

interface Earning {
    id: number;
    amount: number;
    quantity: number;
    category: string;
    sale_id: number;
    created_at: string;
    sale: {
        customer: {
            name: string;
            email: string;
        };
    };
    stock: {
        product: {
            name: string;
        };
    };
}

interface Summary {
    total_earnings: number;
    total_orders: number;
    total_quantity: number;
    average_earning_per_order: number;
    total_products: number;
    total_customers: number;
}

interface Filters {
    start_date?: string;
    end_date?: string;
    category?: string;
}

interface PageProps {
    earnings: Earning[];
    summary: Summary;
    filters: Filters;
}

export default function EarningsReport({ earnings, summary, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [localFilters, setLocalFilters] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        category: filters.category || 'all'
    });

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        router.get(route('member.earnings.report'), localFilters, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const generatePDF = () => {
        const params = new URLSearchParams({
            ...localFilters,
            format: 'pdf'
        });
        window.open(`${route('member.earnings.report')}?${params.toString()}`, '_blank');
    };

    const generateCSV = () => {
        const params = new URLSearchParams({
            ...localFilters,
            format: 'csv'
        });
        window.open(`${route('member.earnings.report')}?${params.toString()}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <MemberHeader />
            <div className="p-6">
                <Head title="Earnings Report" />
                
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Earnings Report</h1>
                    <p className="text-gray-400 mt-2">View and export your earnings data</p>
                </div>

                {/* Filters */}
                <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white">Filters</CardTitle>
                        <CardDescription className="text-gray-400">
                            Filter your earnings data by date range and category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="start_date" className="text-white">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date" className="text-white">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="category" className="text-white">Category</Label>
                                <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Kilo">Kilo</SelectItem>
                                        <SelectItem value="Pc">Pc</SelectItem>
                                        <SelectItem value="Tali">Tali</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">
                                ₱{summary.total_earnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400">90% of sales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
                            <FileText className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summary.total_orders}</div>
                            <p className="text-xs text-gray-400">Completed orders</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Quantity</CardTitle>
                            <Calendar className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summary.total_quantity}</div>
                            <p className="text-xs text-gray-400">Items sold</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Avg per Order</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ₱{summary.average_earning_per_order.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400">Average earning</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Products</CardTitle>
                            <FileText className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summary.total_products}</div>
                            <p className="text-xs text-gray-400">Different products</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Customers</CardTitle>
                            <Calendar className="h-4 w-4 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summary.total_customers}</div>
                            <p className="text-xs text-gray-400">Unique customers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-4 mb-6">
                    <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button onClick={generateCSV} className="bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Earnings Table */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Earnings Details</CardTitle>
                        <CardDescription className="text-gray-400">
                            Detailed breakdown of your earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {earnings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-600">
                                            <th className="text-left py-3 px-4 text-white">Earning ID</th>
                                            <th className="text-left py-3 px-4 text-white">Sale ID</th>
                                            <th className="text-left py-3 px-4 text-white">Product</th>
                                            <th className="text-left py-3 px-4 text-white">Category</th>
                                            <th className="text-left py-3 px-4 text-white">Quantity</th>
                                            <th className="text-left py-3 px-4 text-white">Amount</th>
                                            <th className="text-left py-3 px-4 text-white">Customer</th>
                                            <th className="text-left py-3 px-4 text-white">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {earnings.map((earning) => (
                                            <tr key={earning.id} className="border-b border-gray-700">
                                                <td className="py-3 px-4 text-gray-300">#{earning.id}</td>
                                                <td className="py-3 px-4 text-gray-300">#{earning.sale_id}</td>
                                                <td className="py-3 px-4 text-white">{earning.stock.product.name}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="text-xs">
                                                        {earning.category}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-gray-300">{earning.quantity}</td>
                                                <td className="py-3 px-4 text-green-400 font-semibold">
                                                    ₱{earning.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 px-4 text-gray-300">
                                                    <div>
                                                        <div className="font-medium">{earning.sale.customer.name}</div>
                                                        <div className="text-xs text-gray-500">{earning.sale.customer.email}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-300">
                                                    {new Date(earning.created_at).toLocaleDateString('en-PH')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                                <h3 className="text-lg font-medium mb-2">No earnings found</h3>
                                <p className="text-sm">No earnings match your current filters.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
