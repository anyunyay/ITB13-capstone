import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search, Package } from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useTranslation } from '@/hooks/use-translation';
import { BaseTable } from '@/components/common/base-table';
import { createAuditTrailTableColumns, AuditTrailMobileCard, type AuditTrail } from '@/components/sales/audit-trail-table-columns';

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
    const t = useTranslation();
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

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Create column definitions
    const columns = useMemo(() => createAuditTrailTableColumns(t), [t]);

    return (
        <PermissionGuard 
            permissions={['view sales']}
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.stock_audit_trail')} />
                
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('admin.stock_audit_trail_page_title')}</h1>
                            <p className="text-gray-600 mt-1">
                                {t('admin.stock_audit_trail_description')}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={exportToCsv} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                {t('admin.export_csv')}
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{t('admin.total_entries')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_entries}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{t('admin.quantity_sold')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_quantity_sold.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{t('admin.unique_members')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.unique_members}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{t('admin.unique_orders')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.unique_orders}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{t('admin.total_revenue')}</CardTitle>
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
                                {t('admin.filters_label')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                                <div>
                                    <Label htmlFor="start_date">{t('admin.start_date')}</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={localFilters.start_date || ''}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">{t('admin.end_date')}</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={localFilters.end_date || ''}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="member_id">{t('admin.member')}</Label>
                                    <Select
                                        value={localFilters.member_id || ''}
                                        onValueChange={(value) => handleFilterChange('member_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('admin.all_members')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('admin.all_members')}</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="order_id">{t('admin.order_id')}</Label>
                                    <Input
                                        id="order_id"
                                        type="number"
                                        placeholder={t('admin.order_id')}
                                        value={localFilters.order_id || ''}
                                        onChange={(e) => handleFilterChange('order_id', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={applyFilters} className="flex-1">
                                        <Search className="w-4 h-4 mr-2" />
                                        {t('admin.apply_button')}
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline">
                                        {t('admin.clear_button')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Trail Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.audit_trail_entries', { count: auditTrails.length })}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BaseTable
                                data={auditTrails}
                                columns={columns}
                                keyExtractor={(trail) => trail.id}
                                renderMobileCard={(trail) => <AuditTrailMobileCard trail={trail} t={t} />}
                                emptyState={
                                    <div className="text-center py-12">
                                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_audit_trail_entries')}</h3>
                                        <p className="text-muted-foreground">{t('admin.no_audit_trail_data')}</p>
                                    </div>
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
