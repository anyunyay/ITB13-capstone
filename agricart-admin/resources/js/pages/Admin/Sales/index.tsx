import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionGate } from '@/components/common/permission-gate';
import { PermissionGuard } from '@/components/common/permission-guard';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Download, FileText, BarChart3, Search, Filter } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { PaginationControls } from '@/components/inventory/pagination-controls';
import { BaseTable } from '@/components/common/base-table';
import { createSalesTableColumns, SalesMobileCard, Sale } from '@/components/sales/sales-table-columns';
import { createMemberSalesTableColumns, MemberSalesMobileCard, MemberSale } from '@/components/sales/member-sales-table-columns';
import { format } from 'date-fns';
import animations from './animations.module.css';

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

export default function SalesIndex({ sales, summary, memberSales, filters }: SalesPageProps) {
  const t = useTranslation();

  // Sales table sorting and pagination state
  const [salesSortBy, setSalesSortBy] = useState('id');
  const [salesSortOrder, setSalesSortOrder] = useState<'asc' | 'desc'>('desc');
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);

  // Member sales table sorting and pagination state
  const [memberSortBy, setMemberSortBy] = useState('total_revenue');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('desc');
  const [memberCurrentPage, setMemberCurrentPage] = useState(1);

  // Search state
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showSalesSearch, setShowSalesSearch] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  // Filter state for sales
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [selectedLogistic, setSelectedLogistic] = useState('all');

  // Filter state for member sales
  const [selectedRevenueRange, setSelectedRevenueRange] = useState('all');
  const [selectedOrderRange, setSelectedOrderRange] = useState('all');

  // Track mobile state for responsive pagination
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic items per page based on screen size
  const itemsPerPage = isMobile ? 4 : 10;

  // Extract unique admins and logistics from sales data
  const uniqueAdmins = useMemo(() => {
    const admins = sales
      .filter(sale => sale.admin?.name)
      .map(sale => sale.admin!.name);
    return ['all', ...Array.from(new Set(admins))];
  }, [sales]);

  const uniqueLogistics = useMemo(() => {
    const logistics = sales
      .filter(sale => sale.logistic?.name)
      .map(sale => sale.logistic!.name);
    return ['all', ...Array.from(new Set(logistics))];
  }, [sales]);

  // Calculate total revenue and other member sales statistics
  const totalRevenue = useMemo(() => {
    return memberSales.reduce((sum, member) => sum + Number(member.total_revenue || 0), 0);
  }, [memberSales]);

  const memberSalesStats = useMemo(() => {
    return {
      totalRevenue: memberSales.reduce((sum, member) => sum + Number(member.total_revenue || 0), 0),
      totalCoopShare: memberSales.reduce((sum, member) => sum + Number(member.total_coop_share || 0), 0),
      totalMemberShare: memberSales.reduce((sum, member) => sum + Number(member.total_member_share || 0), 0),
      totalCogs: memberSales.reduce((sum, member) => sum + Number(member.total_cogs || 0), 0),
      totalGrossProfit: memberSales.reduce((sum, member) => sum + Number(member.total_gross_profit || 0), 0),
      totalOrders: memberSales.reduce((sum, member) => sum + Number(member.total_orders || 0), 0),
      averageRevenue: memberSales.length > 0 ? memberSales.reduce((sum, member) => sum + Number(member.total_revenue || 0), 0) / memberSales.length : 0,
    };
  }, [memberSales]);

  // Create column definitions
  const salesColumns = useMemo(() => createSalesTableColumns(t), [t]);
  const memberSalesColumns = useMemo(() => {
    return createMemberSalesTableColumns(t, totalRevenue);
  }, [t, totalRevenue]);

  // Filter and sort sales data
  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Apply search filter
    if (salesSearchTerm) {
      const searchLower = salesSearchTerm.toLowerCase();
      filtered = filtered.filter(sale => {
        // Search by order ID
        if (sale.id.toString().includes(salesSearchTerm)) return true;
        
        // Search by customer name
        if (sale.customer.name.toLowerCase().includes(searchLower)) return true;
        
        // Search by customer email
        if (sale.customer.email.toLowerCase().includes(searchLower)) return true;
        
        // Search by delivered date (formatted)
        if (sale.delivered_at) {
          const formattedDate = format(new Date(sale.delivered_at), 'MMM dd, yyyy').toLowerCase();
          if (formattedDate.includes(searchLower)) return true;
        }
        
        // Search by admin name
        if (sale.admin?.name && sale.admin.name.toLowerCase().includes(searchLower)) return true;
        
        // Search by logistic name
        if (sale.logistic?.name && sale.logistic.name.toLowerCase().includes(searchLower)) return true;
        
        return false;
      });
    }

    // Apply admin filter
    if (selectedAdmin !== 'all') {
      filtered = filtered.filter(sale => sale.admin?.name === selectedAdmin);
    }

    // Apply logistic filter
    if (selectedLogistic !== 'all') {
      filtered = filtered.filter(sale => sale.logistic?.name === selectedLogistic);
    }

    return filtered;
  }, [sales, salesSearchTerm, selectedAdmin, selectedLogistic]);

  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
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
  }, [filteredSales, salesSortBy, salesSortOrder]);

  const salesTotalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    return sortedSales.slice(
      (salesCurrentPage - 1) * itemsPerPage,
      salesCurrentPage * itemsPerPage
    );
  }, [sortedSales, salesCurrentPage, itemsPerPage]);

  // Filter and sort member sales
  const filteredMemberSales = useMemo(() => {
    let filtered = memberSales;

    // Apply search filter
    if (memberSearchTerm) {
      const searchLower = memberSearchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.member_name.toLowerCase().includes(searchLower) ||
        member.member_id.toString().includes(memberSearchTerm)
      );
    }

    // Apply revenue range filter
    if (selectedRevenueRange !== 'all') {
      filtered = filtered.filter(member => {
        const revenue = member.total_revenue;
        switch (selectedRevenueRange) {
          case 'under_1000':
            return revenue < 1000;
          case '1000_5000':
            return revenue >= 1000 && revenue < 5000;
          case '5000_10000':
            return revenue >= 5000 && revenue < 10000;
          case '10000_plus':
            return revenue >= 10000;
          default:
            return true;
        }
      });
    }

    // Apply order count range filter
    if (selectedOrderRange !== 'all') {
      filtered = filtered.filter(member => {
        const orders = member.total_orders;
        switch (selectedOrderRange) {
          case '1_5':
            return orders >= 1 && orders <= 5;
          case '6_10':
            return orders >= 6 && orders <= 10;
          case '11_20':
            return orders >= 11 && orders <= 20;
          case '20_plus':
            return orders > 20;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [memberSales, memberSearchTerm, selectedRevenueRange, selectedOrderRange]);

  const sortedMemberSales = useMemo(() => {
    return [...filteredMemberSales].sort((a, b) => {
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
  }, [filteredMemberSales, memberSortBy, memberSortOrder]);

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

  // Export report function
  const exportReport = (format: 'csv' | 'pdf', exportType: 'sales' | 'members' = 'sales') => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    params.append('format', format);
    params.append('export_type', exportType);

    const filename = exportType === 'members' ? 'member_sales_report' : 'sales_report';

    if (format === 'csv') {
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;

      const displayParams = new URLSearchParams();
      if (filters.start_date) displayParams.append('start_date', filters.start_date);
      if (filters.end_date) displayParams.append('end_date', filters.end_date);
      displayParams.append('format', format);
      displayParams.append('export_type', exportType);
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.sales.report')}?${displayParams.toString()}`;

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  // Reset pagination when data, search, or filters change
  useEffect(() => {
    setSalesCurrentPage(1);
  }, [sales.length, salesSearchTerm, selectedAdmin, selectedLogistic]);

  useEffect(() => {
    setMemberCurrentPage(1);
  }, [memberSales.length, memberSearchTerm, selectedRevenueRange, selectedOrderRange]);

  // Reset pagination when switching between mobile and desktop
  useEffect(() => {
    setSalesCurrentPage(1);
    setMemberCurrentPage(1);
  }, [isMobile]);

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
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex flex-col gap-3 mb-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                    <div>
                      <h1 className="text-2xl font-bold text-foreground m-0 leading-tight">{t('admin.sales_management_page_title')}</h1>
                      <p className="text-sm text-muted-foreground mt-1 mb-0 leading-snug">
                        {t('admin.sales_management_description')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <PermissionGate permission="generate sales report">
                    <Button asChild variant="outline" className="w-full md:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg">
                      <Link href={route('admin.sales.report')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {t('admin.view_report')}
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>

            {/* Key Financial Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
            </div>

            <Tabs defaultValue="sales" className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="sales" className="text-xs sm:text-sm">{t('admin.all_sales')}</TabsTrigger>
                <TabsTrigger value="members" className="text-xs sm:text-sm">{t('admin.member_sales_tab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className={`mt-2 ${animations.tabSlideIn}`}>
                {/* Additional Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">

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

                <Card>
                  <CardHeader>
                    <div className="pb-3 border-b border-border">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <ShoppingCart className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg flex items-center justify-center flex-shrink-0" />
                          <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-foreground m-0 mb-1 leading-tight">{t('admin.all_sales')}</h2>
                            <p className="text-sm text-muted-foreground m-0 leading-snug hidden sm:block">
                              {t('admin.sales_with_sorting_and_pagination')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 items-center">
                          <Button
                            variant={showSalesSearch ? "default" : "outline"}
                            onClick={() => {
                              if (showSalesSearch) {
                                setSalesSearchTerm('');
                              }
                              setShowSalesSearch(!showSalesSearch);
                            }}
                            size="sm"
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{showSalesSearch ? t('ui.hide_search') : t('ui.search')}</span>
                            <span className="inline sm:hidden">{showSalesSearch ? t('ui.hide') : t('ui.search')}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className={`bg-card rounded-xl shadow-sm ${animations.searchToggleContainer} ${
                      showSalesSearch ? animations.expanded : animations.collapsed
                    }`}>
                      <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                        <div className="relative flex-1 flex items-center">
                          <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                          <Input
                            type="text"
                            placeholder={t('admin.search_sales_placeholder') || 'Search by order ID, customer, date, admin, or logistic...'}
                            value={salesSearchTerm}
                            onChange={(e) => setSalesSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                          />
                          {salesSearchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSalesSearchTerm('')}
                              className="absolute right-2 p-1 min-w-auto h-6 w-6 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm h-9">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder={t('admin.all_admins') || 'All Admins'} />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueAdmins.map((admin) => (
                                <SelectItem key={admin} value={admin}>
                                  {admin === 'all' ? t('admin.all_admins') || 'All Admins' : admin}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select value={selectedLogistic} onValueChange={setSelectedLogistic}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm h-9">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder={t('admin.all_logistics') || 'All Logistics'} />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueLogistics.map((logistic) => (
                                <SelectItem key={logistic} value={logistic}>
                                  {logistic === 'all' ? t('admin.all_logistics') || 'All Logistics' : logistic}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                        <span className="text-sm text-muted-foreground font-medium">
                          {sortedSales.length} {t('admin.of')} {sales.length} {t('admin.sales')}
                        </span>
                      </div>
                    </div>
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

              <TabsContent value="members" className={`mt-2 ${animations.tabSlideIn}`}>
                {/* Member Sales Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('admin.total_orders_label')}</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{memberSalesStats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">{t('admin.across_all_members')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('admin.total_revenue_label')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₱{Number(memberSalesStats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <p className="text-xs text-muted-foreground">{t('admin.across_all_members')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('admin.average_revenue')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₱{Number(memberSalesStats.averageRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <p className="text-xs text-muted-foreground">{t('admin.per_member')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('admin.active_members')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{memberSales.length}</div>
                      <p className="text-xs text-muted-foreground">{t('admin.with_sales_activity')}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="pb-3 border-b border-border">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Users className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg flex items-center justify-center flex-shrink-0" />
                          <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-foreground m-0 mb-1 leading-tight">{t('admin.member_sales_tab')}</h2>
                            <p className="text-sm text-muted-foreground m-0 leading-snug hidden sm:block">
                              {t('admin.member_sales_description')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 items-center flex-wrap">
                          <Button
                            variant={showMemberSearch ? "default" : "outline"}
                            onClick={() => {
                              if (showMemberSearch) {
                                setMemberSearchTerm('');
                              }
                              setShowMemberSearch(!showMemberSearch);
                            }}
                            size="sm"
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{showMemberSearch ? t('ui.hide_search') : t('ui.search')}</span>
                            <span className="inline sm:hidden">{showMemberSearch ? t('ui.hide') : t('ui.search')}</span>
                          </Button>
                          <PermissionGate permission="generate sales report">
                            <Button onClick={() => exportReport('csv', 'members')} variant="outline" size="sm" className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('admin.export_csv')}</span>
                            </Button>
                            <Button onClick={() => exportReport('pdf', 'members')} variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('admin.export_pdf')}</span>
                            </Button>
                          </PermissionGate>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className={`bg-card rounded-xl shadow-sm ${animations.searchToggleContainer} ${
                      showMemberSearch ? animations.expanded : animations.collapsed
                    }`}>
                      <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                        <div className="relative flex-1 flex items-center">
                          <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                          <Input
                            type="text"
                            placeholder={t('admin.search_members_placeholder') || 'Search by member name or ID...'}
                            value={memberSearchTerm}
                            onChange={(e) => setMemberSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                          />
                          {memberSearchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberSearchTerm('')}
                              className="absolute right-2 p-1 min-w-auto h-6 w-6 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <Select value={selectedRevenueRange} onValueChange={setSelectedRevenueRange}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm h-9">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder={t('admin.revenue_range') || 'Revenue'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('admin.all_revenue') || 'All Revenue'}</SelectItem>
                              <SelectItem value="under_1000">{t('admin.under_1000') || 'Under ₱1,000'}</SelectItem>
                              <SelectItem value="1000_5000">{t('admin.1000_5000') || '₱1,000 - ₱5,000'}</SelectItem>
                              <SelectItem value="5000_10000">{t('admin.5000_10000') || '₱5,000 - ₱10,000'}</SelectItem>
                              <SelectItem value="10000_plus">{t('admin.10000_plus') || '₱10,000+'}</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={selectedOrderRange} onValueChange={setSelectedOrderRange}>
                            <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm h-9">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder={t('admin.order_count') || 'Orders'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('admin.all_orders') || 'All Orders'}</SelectItem>
                              <SelectItem value="1_5">{t('admin.1_5_orders') || '1-5 Orders'}</SelectItem>
                              <SelectItem value="6_10">{t('admin.6_10_orders') || '6-10 Orders'}</SelectItem>
                              <SelectItem value="11_20">{t('admin.11_20_orders') || '11-20 Orders'}</SelectItem>
                              <SelectItem value="20_plus">{t('admin.20_plus_orders') || '20+ Orders'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                        <span className="text-sm text-muted-foreground font-medium">
                          {sortedMemberSales.length} {t('admin.of')} {memberSales.length} {t('admin.members')}
                        </span>
                      </div>
                    </div>
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

                {/* Performance Insights */}
                {memberSales.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('admin.top_performers')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {sortedMemberSales.slice(0, 3).map((member, index) => (
                            <div key={member.member_id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                                  #{index + 1}
                                </Badge>
                                <div>
                                  <div className="font-medium">{member.member_name}</div>
                                  <div className="text-sm text-muted-foreground">₱{Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t('admin.revenue_distribution')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {sortedMemberSales.slice(0, 5).map((member) => {
                            const memberRevenue = Number(member.total_revenue || 0);
                            const percentage = totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0;
                            return (
                              <div key={member.member_id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{member.member_name}</span>
                                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
}
