import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, Search } from 'lucide-react';
import PermissionGuard from '@/components/PermissionGuard';

interface AuditTrail {
    id: number;
    order_id: number;
    member_id: number;
    stock_id: number;
    product_name: string;
    category: string;
    quantity: number;
    available_stock_after_sale: number;
    unit_price: number;
    total_amount: number;
    created_at: string;
    member: {
        id: number;
        name: string;
    };
    order: {
        id: number;
        status: string;
    };
    product: {
        id: number;
        name: string;
    };
}

interface Member {
    id: number;
    name: string;
}

interface Summary {
    total_entries: number;
    total_quantity_sold: number;
    unique_members: number;
    unique_orders: number;
    total_revenue: number;
}

interface Filters {
    start_date?: string;
    end_date?: string;
    member_id?: string;
    order_id?: string;
}

interface PageProps {
    auditTrails: AuditTrail[];
    members: Member[];
    summary: Summary;
    filters: Filters;
}

export default function AuditTrail({ auditTrails, members, summary, filters }: PageProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        router.get(route('admin.sales.auditTrail'), localFilters, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('admin.sales.auditTrail'), {}, {
            preserveState: true,
            replace: true
        });
    };

    const exportToCsv = () => {
        const params = new URLSearchParams(localFilters);
        window.open(route('admin.sales.auditTrail.export') + '?' + params.toString());
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'delivered': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        
        return (
            <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    return (
        <PermissionGuard 
            permissions={['view sales']}
            pageTitle="Audit Trail Access Denied"
        >
            <AppLayout>
                <Head title="Stock Audit Trail" />
                
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stock Audit Trail</h1>
                            <p className="text-gray-600 mt-1">
                                Track stock changes and member product sales across all orders
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={exportToCsv} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_entries}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Quantity Sold</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_quantity_sold.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Unique Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.unique_members}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Unique Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.unique_orders}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={localFilters.start_date || ''}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={localFilters.end_date || ''}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="member_id">Member</Label>
                                    <Select
                                        value={localFilters.member_id || ''}
                                        onValueChange={(value) => handleFilterChange('member_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Members" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Members</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="order_id">Order ID</Label>
                                    <Input
                                        id="order_id"
                                        type="number"
                                        placeholder="Order ID"
                                        value={localFilters.order_id || ''}
                                        onChange={(e) => handleFilterChange('order_id', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={applyFilters} className="flex-1">
                                        <Search className="w-4 h-4 mr-2" />
                                        Apply
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Trail Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail Entries ({auditTrails.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Quantity Sold</TableHead>
                                            <TableHead>Stock After Sale</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Order Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditTrails.map((trail) => (
                                            <TableRow key={trail.id}>
                                                <TableCell>
                                                    {new Date(trail.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Link 
                                                        href={route('admin.orders.show', trail.order_id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        #{trail.order_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{trail.member?.name || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">ID: {trail.member_id}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{trail.product_name}</div>
                                                        <div className="text-sm text-gray-500">Stock ID: {trail.stock_id}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{trail.category}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {trail.quantity}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {trail.available_stock_after_sale}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(trail.unit_price)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(trail.quantity * trail.unit_price)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(trail.order?.status || 'N/A')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {auditTrails.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No audit trail entries found for the selected filters.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
