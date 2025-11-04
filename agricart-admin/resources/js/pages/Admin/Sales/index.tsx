import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

import { PermissionGate } from '@/components/permission-gate';
import { PermissionGuard } from '@/components/permission-guard';
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { PaginationControls } from '@/components/inventory/pagination-controls';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  subtotal?: number;
  coop_share?: number;
  member_share: number;
  cogs: number;
  gross_profit: number;
  status?: string;
  created_at: string;
  admin?: {
    name: string;
  };
  logistic?: {
    name: string;
  };
}

interface MemberSale {
  member_id: number;
  member_name: string;
  member_email: string;
  total_orders: number;
  total_revenue: number;
  total_coop_share: number;
  total_member_share: number;
  total_cogs: number;
  total_gross_profit: number;
  total_quantity_sold: number;
}

interface SalesPageProps {
  sales: Sale[];
  pendingOrders: Sale[];
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

export default function SalesIndex({ sales, pendingOrders, summary, memberSales }: SalesPageProps) {
  const t = useTranslation();
  
  // Sales table sorting and pagination state
  const [salesSortBy, setSalesSortBy] = useState('id');
  const [salesSortOrder, setSalesSortOrder] = useState<'asc' | 'desc'>('desc');
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  
  // Pending orders table sorting and pagination state
  const [pendingSortBy, setPendingSortBy] = useState('id');
  const [pendingSortOrder, setPendingSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  
  // Member sales table sorting and pagination state
  const [memberSortBy, setMemberSortBy] = useState('total_revenue');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('desc');
  const [memberCurrentPage, setMemberCurrentPage] = useState(1);
  
  const itemsPerPage = 10;
  

  
  // Helper to get sort icon for different tables
  const getSalesSortIcon = (field: string) => {
    if (salesSortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return salesSortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getPendingSortIcon = (field: string) => {
    if (pendingSortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return pendingSortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getMemberSortIcon = (field: string) => {
    if (memberSortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return memberSortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Sort and paginate sales data
  const sortedSales = [...sales].sort((a, b) => {
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
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    return salesSortOrder === 'asc' ? comparison : -comparison;
  });

  const salesTotalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice(
    (salesCurrentPage - 1) * itemsPerPage,
    salesCurrentPage * itemsPerPage
  );

  // Sort and paginate pending orders
  const sortedPendingOrders = [...pendingOrders].sort((a, b) => {
    let comparison = 0;
    switch (pendingSortBy) {
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
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      default:
        return 0;
    }
    return pendingSortOrder === 'asc' ? comparison : -comparison;
  });

  const pendingTotalPages = Math.ceil(sortedPendingOrders.length / itemsPerPage);
  const paginatedPendingOrders = sortedPendingOrders.slice(
    (pendingCurrentPage - 1) * itemsPerPage,
    pendingCurrentPage * itemsPerPage
  );

  // Sort and paginate member sales
  const sortedMemberSales = [...memberSales].sort((a, b) => {
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

  const memberTotalPages = Math.ceil(sortedMemberSales.length / itemsPerPage);
  const paginatedMemberSales = sortedMemberSales.slice(
    (memberCurrentPage - 1) * itemsPerPage,
    memberCurrentPage * itemsPerPage
  );

  // Handle page changes for different tables
  const handleSalesPageChange = (page: number) => {
    setSalesCurrentPage(page);
  };

  const handlePendingPageChange = (page: number) => {
    setPendingCurrentPage(page);
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

  const handlePendingSort = (field: string) => {
    if (pendingSortBy === field) {
      setPendingSortOrder(pendingSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setPendingSortBy(field);
      setPendingSortOrder('desc');
    }
    setPendingCurrentPage(1);
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
    setPendingCurrentPage(1);
  }, [pendingOrders.length]);

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
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="sales" className="text-xs sm:text-sm">{t('admin.all_sales')}</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">{t('admin.pending_orders_label')}</TabsTrigger>
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
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('id')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.sale_id')}
                              {getSalesSortIcon('id')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('customer')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.customer')}
                              {getSalesSortIcon('customer')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('total_amount')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.total_amount')}
                              {getSalesSortIcon('total_amount')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('coop_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.coop_share')}
                              {getSalesSortIcon('coop_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('member_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.revenue_column')}
                              {getSalesSortIcon('member_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('cogs')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.cogs')}
                              {getSalesSortIcon('cogs')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('gross_profit')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.gross_profit')}
                              {getSalesSortIcon('gross_profit')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleSalesSort('created_at')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.date')}
                              {getSalesSortIcon('created_at')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.processed_by')}</TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.logistic')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">#{sale.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sale.customer.name}</div>
                              <div className="text-sm text-muted-foreground">{sale.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-right">₱{Number(sale.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number(sale.coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium text-right">₱{Number(sale.member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-orange-600 font-medium text-right">₱{Number(sale.cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number(sale.gross_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>{sale.admin?.name || t('admin.not_available')}</TableCell>
                          <TableCell>{sale.logistic?.name || t('admin.not_available')}</TableCell>
                        </TableRow>
                      ))}
                      {paginatedSales.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                              {t('admin.no_sales_found')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

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

            <TabsContent value="pending" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.pending_orders_label')} ({sortedPendingOrders.length} {t('admin.total')})</CardTitle>
                  <CardDescription>
                    {t('admin.awaiting_approval_or_processing')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('id')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.order_id')}
                              {getPendingSortIcon('id')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('customer')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.customer')}
                              {getPendingSortIcon('customer')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('total_amount')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.total_amount')}
                              {getPendingSortIcon('total_amount')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.subtotal')}</TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('coop_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.coop_share')}
                              {getPendingSortIcon('coop_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('member_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.revenue_column')}
                              {getPendingSortIcon('member_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.cogs')}</TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.gross_profit')}</TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('created_at')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.date')}
                              {getPendingSortIcon('created_at')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handlePendingSort('status')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.status')}
                              {getPendingSortIcon('status')}
                            </button>
                          </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer.name}</div>
                              <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-right">₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="font-medium text-right">₱{Number(order.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number(order.coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium text-right">₱{Number(order.member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-orange-600 font-medium text-right">₱{Number(((order.member_share || 0) / 1.3) * 0.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number((order.member_share || 0) - ((order.member_share || 0) / 1.3) * 0.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'approved' ? 'default' : 'destructive'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedPendingOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                              {t('admin.no_pending_orders_found')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {pendingTotalPages > 1 && (
                    <PaginationControls
                      currentPage={pendingCurrentPage}
                      totalPages={pendingTotalPages}
                      onPageChange={handlePendingPageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={sortedPendingOrders.length}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.member_sales_page_title')} ({sortedMemberSales.length} {t('admin.members')})</CardTitle>
                  <CardDescription>
                    {t('admin.member_sales_performance_analytics')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-[1000px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('member_name')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.member')}
                              {getMemberSortIcon('member_name')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_orders')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.total_orders')}
                              {getMemberSortIcon('total_orders')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_revenue')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.total_revenue')}
                              {getMemberSortIcon('total_revenue')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_coop_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.coop_share')}
                              {getMemberSortIcon('total_coop_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_member_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.revenue_column')}
                              {getMemberSortIcon('total_member_share')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_cogs')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.cogs')}
                              {getMemberSortIcon('total_cogs')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_gross_profit')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.gross_profit')}
                              {getMemberSortIcon('total_gross_profit')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            <button onClick={() => handleMemberSort('total_quantity_sold')} className="flex items-center justify-center hover:text-foreground transition-colors">
                              {t('admin.quantity_sold')}
                              {getMemberSortIcon('total_quantity_sold')}
                            </button>
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">{t('admin.average_revenue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMemberSales.map((member) => (
                        <TableRow key={member.member_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{member.member_name}</div>
                              <div className="text-sm text-muted-foreground">{member.member_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{member.total_orders}</TableCell>
                          <TableCell className="font-medium text-right">₱{Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number(member.total_coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium text-right">₱{Number(member.total_member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-orange-600 font-medium text-right">₱{Number(member.total_cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium text-right">₱{Number(member.total_gross_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-center">{member.total_quantity_sold}</TableCell>
                          <TableCell className="text-right">₱{member.total_orders > 0 ? (Number(member.total_revenue || 0) / member.total_orders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</TableCell>
                        </TableRow>
                      ))}
                      {paginatedMemberSales.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                              {t('admin.no_member_sales_data_found')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

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
