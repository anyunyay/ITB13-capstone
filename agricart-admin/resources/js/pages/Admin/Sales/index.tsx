import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/common/permission-gate';
import { PermissionGuard } from '@/components/common/permission-guard';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { PaginationControls } from '@/components/inventory/pagination-controls';
import { BaseTable } from '@/components/common/base-table';
import { createSalesTableColumns, SalesMobileCard, Sale } from '@/components/sales/sales-table-columns';
import { createMemberSalesTableColumns, MemberSalesMobileCard, MemberSale } from '@/components/sales/member-sales-table-columns';

interface SalesPageProps {
  sales: Sale[];
  summary: {
    total_revenue: number;
    total_subtotal: number;
    total_coop_share: number;
    total_member_share: number;
    total_cogs: number;
    total_gross_profit: number;
    total_orders: number;
    average_order_value: number;
    average_coop_share: number;
    total_customers: number;
  };
  memberSales: MemberSale[];
  filters: {
    start_date?: string;
    end_date?: string;
  };
}

export default function SalesIndex({ sales, summary, memberSales }: SalesPageProps) {
  const t = useTranslation();
  
  // Sales table sorting and pagination state
  const [salesSortBy, setSalesSortBy] = useState('id');
  const [salesSortOrder, setSalesSortOrder] = useState<'asc' | 'desc'>('desc');
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  
  // Member sales table sorting and pagination state
  const [memberSortBy, setMemberSortBy] = useState('total_revenue');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('desc');
  const [memberCurrentPage, setMemberCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Calculate total revenue for member sales
  const totalRevenue = useMemo(() => {
    return memberSales.reduce((sum, member) => sum + Number(member.total_revenue || 0), 0);
  }, [memberSales]);

  // Create column definitions
  const salesColumns = useMemo(() => createSalesTableColumns(t), [t]);
  const memberSalesColumns = useMemo(() => {
    return createMemberSalesTableColumns(t, totalRevenue);
  }, [t, totalRevenue]);
  
  // Sort and paginate sales data
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      let comparison = 0;
      switch (salesSortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'total_amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'coop_share':
          comparison = (a.coop_share || 0) - (b.coop_share || 0);
          break;
        case 'member_share':
          comparison = a.member_share - b.member_share;
          break;
        case 'cogs':
          comparison = a.cogs - b.cogs;
          break;
        case 'gross_profit':
          comparison = a.gross_profit - b.gross_profit;
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'delivered_at':
          comparison = new Date(a.delivered_at).getTime() - new Date(b.delivered_at).getTime();
          break;
        default:
          return 0;
      }
      return salesSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sales, salesSortBy, salesSortOrder]);

  const salesTotalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    return sortedSales.slice(
      (salesCurrentPage - 1) * itemsPerPage,
      salesCurrentPage * itemsPerPage
    );
  }, [sortedSales, salesCurrentPage, itemsPerPage]);

  // Sort and paginate member sales
  const sortedMemberSales = useMemo(() => {
    return [...memberSales].sort((a, b) => {
      let comparison = 0;
      switch (memberSortBy) {
        case 'member_name':
          comparison = a.member_name.localeCompare(b.member_name);
          break;
        case 'total_orders':
          comparison = a.total_orders - b.total_orders;
          break;
        case 'total_revenue':
          comparison = a.total_revenue - b.total_revenue;
          break;
        case 'total_coop_share':
          comparison = a.total_coop_share - b.total_coop_share;
          break;
        case 'total_member_share':
          comparison = a.total_member_share - b.total_member_share;
          break;
        case 'total_cogs':
          comparison = a.total_cogs - b.total_cogs;
          break;
        case 'total_gross_profit':
          comparison = a.total_gross_profit - b.total_gross_profit;
          break;
        case 'total_quantity_sold':
          comparison = a.total_quantity_sold - b.total_quantity_sold;
          break;
        default:
          return 0;
      }
      return memberSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [memberSales, memberSortBy, memberSortOrder]);

  const memberTotalPages = Math.ceil(sortedMemberSales.length / itemsPerPage);
  const paginatedMemberSales = useMemo(() => {
    return sortedMemberSales.slice(
      (memberCurrentPage - 1) * itemsPerPage,
      memberCurrentPage * itemsPerPage
    );
  }, [sortedMemberSales, memberCurrentPage, itemsPerPage]);

  // Handle page changes for different tables
  const handleSalesPageChange = (page: number) => {
    setSalesCurrentPage(page);
  };

  const handleMemberPageChange = (page: number) => {
    setMemberCurrentPage(page);
  };

  // Handle sorting for different tables
  const handleSalesSort = (field: string) => {
    if (salesSortBy === field) {
      setSalesSortOrder(salesSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSalesSortBy(field);
      setSalesSortOrder('desc');
    }
    setSalesCurrentPage(1);
  };

  const handleMemberSort = (field: string) => {
    if (memberSortBy === field) {
      setMemberSortOrder(memberSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMemberSortBy(field);
      setMemberSortOrder('desc');
    }
    setMemberCurrentPage(1);
  };

  // Reset pagination when data changes
  useEffect(() => {
    setSalesCurrentPage(1);
  }, [sales.length]);

  useEffect(() => {
    setMemberCurrentPage(1);
  }, [memberSales.length]);

  return (
    <PermissionGuard 
      permissions={['view sales', 'generate sales report']}
      pageTitle={t('admin.access_denied')}
    >
      <AppLayout>
        <Head title={t('admin.sales_management')} />
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
              <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">{t('admin.sales_management_page_title')}</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                        {t('admin.sales_management_description')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <PermissionGate permission="view sales">
                    <Button variant="outline" className="bg-background text-foreground border border-border px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.sales.memberSales')} className="flex items-center justify-center w-full">
                        <span className="text-sm sm:text-base">{t('admin.member_sales_link')}</span>
                      </Link>
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="generate sales report">
                    <Button variant="outline" className="bg-background text-foreground border border-border px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.sales.report')} className="flex items-center justify-center w-full">
                        <span className="text-sm sm:text-base">{t('admin.view_report')}</span>
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.total_revenue_label')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{Number(summary.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.from_orders', { orders: summary.total_orders })}
                </p>
              </CardContent>
            </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.coop_share_percent')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_coop_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.added_on_top_product_prices')}
                  </p>
                </CardContent>
              </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.revenue_100_percent')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₱{Number(summary.total_member_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.full_product_revenue_to_members')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.cogs')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₱{Number(summary.total_cogs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.cost_of_goods_sold')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.gross_profit')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_gross_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.revenue_minus_cogs')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.total_orders_label')}</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.orders_label')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.average_order_value_label')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{Number(summary.average_order_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.per_order')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.total_customers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_customers}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.unique_customers')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="sales" className="text-xs sm:text-sm">{t('admin.all_sales')}</TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm">{t('admin.member_sales_tab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.all_sales')} ({sortedSales.length} {t('admin.total')})</CardTitle>
                  <CardDescription>
                    {t('admin.sales_with_sorting_and_pagination')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BaseTable
                    data={paginatedSales}
                    columns={salesColumns}
                    keyExtractor={(sale) => sale.id}
                    sortBy={salesSortBy}
                    sortOrder={salesSortOrder}
                    onSort={handleSalesSort}
                    renderMobileCard={(sale) => <SalesMobileCard sale={sale} t={t} />}
                    emptyState={
                      <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_sales_found')}</h3>
                        <p className="text-muted-foreground">{t('admin.no_sales_data')}</p>
                      </div>
                    }
                  />

                  {/* Pagination Controls */}
                  {salesTotalPages > 1 && (
                    <PaginationControls
                      currentPage={salesCurrentPage}
                      totalPages={salesTotalPages}
                      onPageChange={handleSalesPageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={sortedSales.length}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.member_sales_tab')} ({sortedMemberSales.length} {t('admin.total')})</CardTitle>
                  <CardDescription>
                    {t('admin.member_sales_description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BaseTable
                    data={paginatedMemberSales}
                    columns={memberSalesColumns}
                    keyExtractor={(member) => member.member_id}
                    sortBy={memberSortBy}
                    sortOrder={memberSortOrder}
                    onSort={handleMemberSort}
                    renderMobileCard={(member, index) => (
                      <MemberSalesMobileCard 
                        member={member} 
                        index={index + (memberCurrentPage - 1) * itemsPerPage} 
                        totalRevenue={totalRevenue} 
                        t={t} 
                      />
                    )}
                    emptyState={
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_member_sales_found')}</h3>
                        <p className="text-muted-foreground">{t('admin.no_member_sales_data')}</p>
                      </div>
                    }
                  />

                  {/* Pagination Controls */}
                  {memberTotalPages > 1 && (
                    <PaginationControls
                      currentPage={memberCurrentPage}
                      totalPages={memberTotalPages}
                      onPageChange={handleMemberPageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={sortedMemberSales.length}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  </PermissionGuard>
  );
}
