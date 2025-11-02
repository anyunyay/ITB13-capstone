import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/use-permissions';
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
  
  // Sorting state
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  

  
  // Helper to get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Sort sales data
  const sortedSales = [...sales].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
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
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate sorted sales
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when sorting changes
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  return (
    <PermissionGuard 
      permissions={['view sales', 'generate sales report']}
      pageTitle={t('admin.access_denied')}
    >
      <AppLayout>
        <Head title={t('admin.sales_management')} />
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
              <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground leading-tight m-0">{t('admin.sales_management_page_title')}</h1>
                      <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                        {t('admin.sales_management_description')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <PermissionGate permission="view sales">
                    <Button variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.sales.memberSales')}>
                        {t('admin.member_sales_link')}
                      </Link>
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="generate sales report">
                    <Button variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.sales.report')}>
                        {t('admin.view_report')}
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">{t('admin.all_sales')}</TabsTrigger>
              <TabsTrigger value="pending">{t('admin.pending_orders_label')}</TabsTrigger>
              <TabsTrigger value="members">{t('admin.member_sales_tab')}</TabsTrigger>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('id')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.sale_id')}
                            {getSortIcon('id')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('customer')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.customer')}
                            {getSortIcon('customer')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('total_amount')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.total_amount')}
                            {getSortIcon('total_amount')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('coop_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.coop_share')}
                            {getSortIcon('coop_share')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('member_share')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.revenue_column')}
                            {getSortIcon('member_share')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('cogs')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.cogs')}
                            {getSortIcon('cogs')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('gross_profit')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.gross_profit')}
                            {getSortIcon('gross_profit')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('created_at')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.date')}
                            {getSortIcon('created_at')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">{t('admin.processed_by')}</TableHead>
                        <TableHead className="text-center">{t('admin.logistic')}</TableHead>
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

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
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
                  <CardTitle>{t('admin.pending_orders_label')}</CardTitle>
                  <CardDescription>
                    {t('admin.awaiting_approval_or_processing')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">{t('admin.order_id')}</TableHead>
                        <TableHead className="text-center">{t('admin.customer')}</TableHead>
                        <TableHead className="text-center">{t('admin.total_amount')}</TableHead>
                        <TableHead className="text-center">{t('admin.subtotal')}</TableHead>
                        <TableHead className="text-center">{t('admin.coop_share')}</TableHead>
                        <TableHead className="text-center">{t('admin.revenue_column')}</TableHead>
                        <TableHead className="text-center">{t('admin.cogs')}</TableHead>
                        <TableHead className="text-center">{t('admin.gross_profit')}</TableHead>
                        <TableHead className="text-center">{t('admin.date')}</TableHead>
                        <TableHead className="text-center">{t('admin.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer.name}</div>
                              <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="font-medium">₱{Number(order.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium">₱{Number(order.coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium">₱{Number(order.member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-orange-600 font-medium">₱{Number(((order.member_share || 0) / 1.3) * 0.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium">₱{Number((order.member_share || 0) - ((order.member_share || 0) / 1.3) * 0.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'approved' ? 'default' : 'destructive'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground">
                            {t('admin.no_pending_orders_found')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.member_sales_page_title')} ({memberSales.length} {t('admin.members')})</CardTitle>
                  <CardDescription>
                    {t('admin.member_sales_performance_analytics')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          <button onClick={() => handleSort('member')} className="flex items-center justify-center hover:text-foreground transition-colors">
                            {t('admin.member')}
                            {getSortIcon('member')}
                          </button>
                        </TableHead>
                        <TableHead className="text-center">{t('admin.total_orders')}</TableHead>
                        <TableHead className="text-center">{t('admin.total_revenue')}</TableHead>
                        <TableHead className="text-center">{t('admin.coop_share')}</TableHead>
                        <TableHead className="text-center">{t('admin.revenue_column')}</TableHead>
                        <TableHead className="text-center">{t('admin.cogs')}</TableHead>
                        <TableHead className="text-center">{t('admin.gross_profit')}</TableHead>
                        <TableHead className="text-center">{t('admin.quantity_sold')}</TableHead>
                        <TableHead className="text-center">{t('admin.average_revenue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberSales.map((member) => (
                        <TableRow key={member.member_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{member.member_name}</div>
                              <div className="text-sm text-muted-foreground">{member.member_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{member.total_orders}</TableCell>
                          <TableCell className="font-medium">₱{Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium">₱{Number(member.total_coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium">₱{Number(member.total_member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-orange-600 font-medium">₱{Number(member.total_cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-green-600 font-medium">₱{Number(member.total_gross_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{member.total_quantity_sold}</TableCell>
                          <TableCell>₱{member.total_orders > 0 ? (Number(member.total_revenue || 0) / member.total_orders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</TableCell>
                        </TableRow>
                      ))}
                      {memberSales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            {t('admin.no_member_sales_data_found')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
