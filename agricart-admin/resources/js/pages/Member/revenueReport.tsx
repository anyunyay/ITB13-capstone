import { MemberHeader } from '@/components/member-header';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Download, FileText, Search, Filter, X, LayoutGrid, Table, ChevronDown, CalendarIcon, DollarSign, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useState } from 'react';
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useTranslation } from '@/hooks/use-translation';

interface ProductSale {
  product_id: number;
  product_name: string;
  total_quantity: number;
  price_per_unit: number;
  total_revenue: number;
  total_cogs: number;
  total_gross_profit: number;
  category: string;
  sales_count: number;
  customers: string[];
}

interface OrderProduct {
  product_name: string;
  quantity: number;
  category: string;
  price_per_unit: number;
  total_price: number;
  cogs: number;
  gross_profit: number;
}

interface OrderDetail {
  order_id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  total_quantity: number;
  total_cogs: number;
  total_gross_profit: number;
  created_at: string;
  products: OrderProduct[];
}

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  totalQuantitySold: number;
  totalCogs: number;
  totalGrossProfit: number;
  productSales: ProductSale[];
  orderDetails: OrderDetail[];
}

interface ReportSummary {
  total_revenue: number;
  total_orders: number;
  total_quantity_sold: number;
  total_cogs: number;
  total_gross_profit: number;
  average_order_value: number;
  total_products: number;
  date_range: {
    start?: string;
    end?: string;
  };
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

interface ReportPageProps {
  salesData: SalesData;
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function MemberRevenueReport({ salesData, summary, filters }: ReportPageProps) {
  const t = useTranslation();
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );

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
    
    router.get(route('member.revenueReport'), params);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    params.append('format', format);
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('member.revenueReport')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_revenue_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('member.revenueReport')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      displayParams.append('format', format);
      displayParams.append('display', 'true');
      const displayUrl = `${route('member.revenueReport')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_revenue_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
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
      end_date: ''
    });
  };

  const hasActiveFilters = () => {
    return localFilters.start_date || localFilters.end_date;
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <MemberHeader />
      <div className="p-6 pt-25">
        <Head title={t('member.revenue_report')} />
        <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('member.revenue_report')}</h1>
                  <p className="text-muted-foreground mt-1">
                    {t('member.track_stocks_and_activity')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('member.export_csv')}
                </Button>
                <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('member.export_pdf')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.total_revenue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.total_revenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.gross_revenue_earned')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.total_orders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.completed_orders')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.units_sold')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{summary.total_quantity_sold}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.total_quantity_sold')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.gross_profit')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(summary.total_gross_profit)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.revenue_minus_cogs')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.avg_order_value')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{formatCurrency(summary.average_order_value)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.average_per_order')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.total_cogs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{formatCurrency(summary.total_cogs)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.cost_of_goods_sold')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.products_sold')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{summary.total_products}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.unique_products')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('member.profit_margin')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  {summary.total_revenue > 0 ? `${((summary.total_gross_profit / summary.total_revenue) * 100).toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('member.gross_profit_margin')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters - Collapsible */}
          <Card className="shadow-sm">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{t('member.date_range_filter')}</CardTitle>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {t('member.active')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters() && (
                        <Button onClick={clearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          {t('member.clear_filters')}
                        </Button>
                      )}
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {/* Date Range Summary */}
                  {(startDate || endDate) && (
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary mb-1">{t('member.selected_date_range')}</h4>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('member.start_date')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd, yyyy") : t('member.pick_start_date')}
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
                      <Label className="text-sm font-medium">{t('member.end_date')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd, yyyy") : t('member.pick_end_date')}
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

          {/* Product Sales Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Product Sales Breakdown ({salesData.productSales.length} products)</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {salesData.productSales.length > 0 ? `Showing ${salesData.productSales.length} products` : 'No products found'}
                  </div>
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {salesData.productSales.length > 0 ? (
                <>
                  {currentView === 'cards' ? (
                    <div className="space-y-4">
                      {salesData.productSales.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <ProductTable products={salesData.productSales} />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('member.no_sales_data_found')}</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters() 
                        ? t('admin.no_sales_match_filters')
                        : t('admin.no_sales_data_period')
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4">
                        {t('member.clear_filters')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Order Details ({salesData.orderDetails.length} orders)</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.orderDetails.length > 0 ? (
                <OrderDetailsTable orders={salesData.orderDetails} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('member.no_order_details_available')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductSale }) {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const profitMargin = product.total_revenue > 0 ? ((product.total_gross_profit / product.total_revenue) * 100).toFixed(1) : '0';

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{product.product_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Category: {product.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {formatCurrency(product.total_revenue)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Sales Metrics
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Quantity Sold:</span> 
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {product.total_quantity} units
                </Badge>
              </p>
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Price per Unit:</span> 
                <span className="text-muted-foreground">{formatCurrency(product.price_per_unit)}</span>
              </p>
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Sales Count:</span> 
                <span className="text-muted-foreground">{product.sales_count} orders</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Financial Breakdown
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Revenue:</span> 
                <span className="text-green-600 font-semibold">{formatCurrency(product.total_revenue)}</span>
              </p>
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">COGS:</span> 
                <span className="text-orange-600">{formatCurrency(product.total_cogs)}</span>
              </p>
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Gross Profit:</span> 
                <span className="text-blue-600 font-semibold">{formatCurrency(product.total_gross_profit)}</span>
              </p>
              <p className="text-sm flex items-center justify-between">
                <span className="font-medium text-foreground">Profit Margin:</span> 
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {profitMargin}%
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {product.customers.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              Customers ({product.customers.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {product.customers.slice(0, 3).map((customer, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                  {customer}
                </Badge>
              ))}
              {product.customers.length > 3 && (
                <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-muted/20">
                  +{product.customers.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductTable({ products }: { products: ProductSale[] }) {
  const t = useTranslation();
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('member.product')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.category')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.qty_sold')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.price_unit')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.revenue')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.cogs')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.gross_profit')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.margin')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.product_id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{product.product_name}</div>
                  <div className="text-sm text-muted-foreground">{product.sales_count} orders</div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {product.category}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {product.total_quantity}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                {formatCurrency(product.price_per_unit)}
              </td>
              <td className="py-3 px-4 text-center text-sm font-semibold text-green-600">
                {formatCurrency(product.total_revenue)}
              </td>
              <td className="py-3 px-4 text-center text-sm text-orange-600">
                {formatCurrency(product.total_cogs)}
              </td>
              <td className="py-3 px-4 text-center text-sm font-semibold text-blue-600">
                {formatCurrency(product.total_gross_profit)}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {product.total_revenue > 0 ? ((product.total_gross_profit / product.total_revenue) * 100).toFixed(1) : '0'}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailsTable({ orders }: { orders: OrderDetail[] }) {
  const t = useTranslation();
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.order_id')}</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">{t('member.customer')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.products')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.total_qty')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.order_total')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.cogs')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.gross_profit')}</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">{t('member.date')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.order_id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  #{order.order_id}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{order.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {order.products.length} items
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {order.total_quantity}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-sm font-semibold text-green-600">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="py-3 px-4 text-center text-sm text-orange-600">
                {formatCurrency(order.total_cogs)}
              </td>
              <td className="py-3 px-4 text-center text-sm font-semibold text-blue-600">
                {formatCurrency(order.total_gross_profit)}
              </td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                {dayjs(order.created_at).format('MMM DD, YYYY')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}