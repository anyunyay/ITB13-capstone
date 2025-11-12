import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Download, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useState, useMemo, useEffect } from 'react';
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { ReportSummaryCards } from '@/components/inventory/report-summary-cards';
import { ReportFilters } from '@/components/inventory/report-filters';
import { StockCard } from '@/components/inventory/stock-card';
import { StockTable } from '@/components/inventory/stock-table';
import { PaginationControls } from '@/components/inventory/pagination-controls';
import { exportReport } from '@/utils/report-export';
import { Stock, ReportSummary, ReportFilters as ReportFiltersType, Member } from '@/types/inventory-report';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ReportPageProps {
  stocks: Stock[];
  summary: ReportSummary;
  members: Member[];
  productTypes: string[];
  filters: ReportFiltersType;
}

export default function InventoryReport({ stocks, summary, members, productTypes, filters }: ReportPageProps) {
  const t = useTranslation();
  const normalizedFilters: ReportFiltersType = {
    ...filters,
    member_ids: Array.isArray(filters.member_ids) ? filters.member_ids : []
  };

  const [localFilters, setLocalFilters] = useState<ReportFiltersType>(normalizedFilters);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = currentView === 'cards' ? 4 : (isMobile ? 4 : 10);

  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return stocks.slice(startIndex, endIndex);
  }, [stocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(stocks.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [stocks.length, currentView]);

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.category !== 'all') params.category = localFilters.category;
    if (localFilters.status !== 'all') params.status = localFilters.status;
    if (localFilters.member_ids.length > 0) params.member_ids = localFilters.member_ids;
    if (localFilters.product_type !== 'all') params.product_type = localFilters.product_type;
    if (localFilters.min_quantity) params.min_quantity = localFilters.min_quantity;
    if (localFilters.max_quantity) params.max_quantity = localFilters.max_quantity;
    if (localFilters.search) params.search = localFilters.search;

    router.get(route('inventory.report'), params, {
      preserveScroll: true,
      only: ['stocks', 'filters'], // Only reload stocks and filters, keep summary cards unchanged
      onSuccess: () => {
        // Scroll to Stock Report section after filters are applied
        setTimeout(() => {
          const stockReportElement = document.getElementById('stock-report-section');
          if (stockReportElement) {
            const offset = 80; // Offset for fixed headers/navbar
            const elementPosition = stockReportElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    });
  };

  const clearFilters = () => {
    // Reset local state
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      category: 'all',
      status: 'all',
      member_ids: [],
      product_type: 'all',
      min_quantity: '',
      max_quantity: '',
      search: ''
    });

    // Navigate to report page without any query parameters to show all data
    router.get(route('inventory.report'), {}, {
      preserveScroll: true,
      only: ['stocks', 'filters'], // Only reload stocks and filters, keep summary cards unchanged
      onSuccess: () => {
        // Scroll to Stock Report section to show refreshed unfiltered data
        setTimeout(() => {
          const stockReportElement = document.getElementById('stock-report-section');
          if (stockReportElement) {
            const offset = 80; // Offset for fixed headers/navbar
            const elementPosition = stockReportElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    });
  };

  const hasActiveFilters = (): boolean => {
    return !!(localFilters.start_date || localFilters.end_date ||
      localFilters.category !== 'all' || localFilters.status !== 'all' ||
      localFilters.member_ids.length > 0 || localFilters.product_type !== 'all' ||
      localFilters.min_quantity || localFilters.max_quantity || localFilters.search);
  };

  return (
    <AppSidebarLayout>
      <Head title={t('admin.inventory_report')} />
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('admin.inventory_report')}</h1>
                  <p className="text-muted-foreground mt-1">{t('admin.inventory_report_description')}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => exportReport('csv', localFilters, route)} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('admin.export_csv')}
                </Button>
                <Button onClick={() => exportReport('pdf', localFilters, route)} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('admin.export_pdf')}
                </Button>
              </div>
            </div>
          </div>

          <ReportSummaryCards summary={summary} />

          <ReportFilters
            localFilters={localFilters}
            setLocalFilters={setLocalFilters}
            members={members}
            productTypes={productTypes}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            onApply={applyFilters}
            onClear={clearFilters}
            hasActiveFilters={!!hasActiveFilters()}
          />

          <Card id="stock-report-section" className="shadow-sm scroll-mt-20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{t('admin.stock_report')}</CardTitle>
                <div className="flex items-center gap-2">
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stocks.length > 0 ? (
                <>
                  {currentView === 'cards' ? (
                    <div className="space-y-4">
                      {paginatedStocks.map((stock) => (
                        <StockCard key={stock.id} stock={stock} />
                      ))}
                    </div>
                  ) : (
                    <StockTable stocks={paginatedStocks} />
                  )}

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={stocks.length}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_stocks_found')}</h3>
                    <p className="text-muted-foreground max-w-md">
                      {hasActiveFilters()
                        ? t('admin.no_stocks_match_filters')
                        : t('admin.no_stock_data_for_period')
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4">
                        {t('admin.clear_filters')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarLayout>
  );
}
