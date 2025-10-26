import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Download, FileText, Filter, X, ChevronDown, CalendarIcon, DollarSign, ShoppingCart, TrendingUp, Users, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState } from 'react';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  coop_share: number;
  member_share: number;
  cogs: number;
  gross_profit: number;
  created_at: string;
  admin?: {
    name: string;
    id: number;
  };
  logistic?: {
    name: string;
    id: number;
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

interface ReportSummary {
  total_revenue: number;
  total_coop_share: number;
  total_member_share: number;
  total_cogs: number;
  total_gross_profit: number;
  total_orders: number;
  average_order_value: number;
  average_coop_share: number;
  total_customers: number;
}


interface ReportFilters {
  start_date?: string;
  end_date?: string;
  min_amount?: string;
  max_amount?: string;
  search?: string;
}

interface ReportPageProps {
  sales: Sale[];
  memberSales: MemberSale[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function SalesReport({ sales, memberSales, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };


  // Date handling functions
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setLocalFilters(prev => ({
      ...prev,
      start_date: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setLocalFilters(prev => ({
      ...prev,
      end_date: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const getDateRangeDisplay = () => {
    if (!startDate && !endDate) return 'No date range selected';
    if (startDate && !endDate) return `From ${format(startDate, 'MMM dd, yyyy')}`;
    if (!startDate && endDate) return `Until ${format(endDate, 'MMM dd, yyyy')}`;
    return `${format(startDate!, 'MMM dd, yyyy')} - ${format(endDate!, 'MMM dd, yyyy')}`;
  };

  const getDurationDisplay = () => {
    if (!startDate || !endDate) return '';
    const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    if (diffInDays === 1) return '1 day';
    if (diffInDays === 7) return '1 week';
    if (diffInDays === 30) return '1 month';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.round(diffInDays / 7)} weeks`;
    return `${Math.round(diffInDays / 30)} months`;
  };

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.min_amount) params.min_amount = localFilters.min_amount;
    if (localFilters.max_amount) params.max_amount = localFilters.max_amount;
    if (localFilters.search) params.search = localFilters.search;
    
    router.get(route('admin.sales.report'), params);
  };

  const exportReport = (format: 'csv' | 'pdf', exportType: 'sales' | 'members' = 'sales') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
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
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
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

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      search: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date || 
           localFilters.min_amount || localFilters.max_amount ||
           localFilters.search;
  };

  return (
    <AppLayout>
      <Head title="Sales Report" />
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-4 flex flex-col gap-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                  <h1 className="text-3xl font-bold text-foreground">Sales Report</h1>
                  <p className="text-muted-foreground mt-1">
                    Generate comprehensive sales reports and analytics
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Button onClick={() => exportReport('csv', 'sales')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={() => exportReport('pdf', 'sales')} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_revenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">From {summary.total_orders} orders</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Co-op Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_coop_share).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">10% added on prices</p>
          </CardContent>
        </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Revenue (100%)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">₱{Number(summary.total_member_share).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Full product revenue</p>
            </CardContent>
          </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  COGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₱{Number(summary.total_cogs).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Cost of Goods Sold</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Gross Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₱{Number(summary.total_gross_profit).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Revenue - COGS</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₱{Number(summary.average_order_value).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per order</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-secondary">{summary.total_customers}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique buyers</p>
            </CardContent>
          </Card>
        </div>

          {/* Advanced Filters - Collapsible */}
          <Card className="shadow-sm">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">Advanced Filters</CardTitle>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {hasActiveFilters() && (
                        <Button onClick={clearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Clear Filters
                        </Button>
                      )}
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by customer name, email, or sale ID..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 pr-4 py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                      />
                    </div>
                  </div>

                  {/* Date Range Summary */}
                  {(startDate || endDate) && (
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Selected Date Range</h4>
                          <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                          {getDurationDisplay() && (
                            <p className="text-xs text-primary/70 mt-1">
                              Duration: {getDurationDisplay()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStartDate(undefined);
                            setEndDate(undefined);
                            setLocalFilters(prev => ({
                              ...prev,
                              start_date: '',
                              end_date: ''
                            }));
                          }}
                          className="text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd, yyyy") : "Pick an end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                            disabled={(date) => 
                              date > new Date() || 
                              date < new Date("1900-01-01") || 
                              (startDate ? date < startDate : false)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Min Amount (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Minimum"
                        value={localFilters.min_amount || ''}
                        onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Max Amount (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Maximum"
                        value={localFilters.max_amount || ''}
                        onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                        className="border-border rounded-lg bg-background text-foreground focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={applyFilters} className="bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] px-6 py-2">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

        {/* Sales Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Sales Report ({sales.length} transactions)</CardTitle>
          </CardHeader>
          <CardContent>
              {sales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Total Amount</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Co-op Share</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">COGS</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Gross Profit</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, index) => (
                        <tr key={sale.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono">
                              #{sale.id}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-foreground">{sale.customer.name}</div>
                              <div className="text-sm text-muted-foreground">{sale.customer.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            ₱{Number(sale.total_amount).toFixed(2)}
                          </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            ₱{Number(sale.coop_share || 0).toFixed(2)}
                          </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            ₱{Number(sale.member_share || 0).toFixed(2)}
                          </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                            ₱{Number(sale.cogs || 0).toFixed(2)}
                          </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            ₱{Number(sale.gross_profit || 0).toFixed(2)}
                          </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-foreground">{dayjs(sale.created_at).format('MMM DD, YYYY')}</div>
                          <div className="text-xs text-muted-foreground">{dayjs(sale.created_at).format('HH:mm')}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No sales found</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters() 
                        ? 'No sales match your current filter criteria. Try adjusting your filters to see more results.'
                        : 'No sales data available for the selected time period.'
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4">
                        Clear Filters
                      </Button>
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Sales */}
        {memberSales.length > 0 && (
            <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Member Sales Performance ({memberSales.length} members)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberSales.map((member, index) => (
                  <MemberSaleCard key={member.member_id} member={member} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </AppLayout>
  );
}

function MemberSaleCard({ member, index }: { member: MemberSale; index: number }) {
  const averageRevenue = member.total_orders > 0 ? member.total_revenue / member.total_orders : 0;

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={index < 3 ? "default" : "secondary"} className={index < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
              #{index + 1}
            </Badge>
            <div>
              <CardTitle className="text-lg text-foreground">{member.member_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{member.member_email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₱{Number(member.total_revenue).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{member.total_orders} orders</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Performance Metrics
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Total Orders:</span> 
                <span className="text-muted-foreground ml-2">{member.total_orders}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Total Revenue:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(member.total_revenue).toFixed(2)}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Average Revenue:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(averageRevenue).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Financial Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Revenue (100%):</span> 
                <span className="text-muted-foreground ml-2">₱{Number(member.total_member_share || 0).toFixed(2)}</span>
              </p>
              <p>
                <span className="font-medium text-orange-600">COGS:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(member.total_cogs || 0).toFixed(2)}</span>
              </p>
              <p>
                <span className="font-medium text-green-600">Gross Profit:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(member.total_gross_profit || 0).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Additional Info
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Total Quantity:</span> 
                <span className="text-muted-foreground ml-2">{member.total_quantity_sold}</span>
              </p>
              <p>
                <span className="font-medium text-green-600">Co-op Share:</span> 
                <span className="text-muted-foreground ml-2">₱{Number(member.total_coop_share || 0).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
