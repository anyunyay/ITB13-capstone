import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Download, FileText, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { ReportSummaryCards } from '@/components/orders/report-summary-cards';
import { ReportFilters } from '@/components/orders/report-filters';
import { PaginationControls } from '@/components/orders/pagination-controls';
import { BaseTable } from '@/components/common/base-table';
import { createReportOrderTableColumns, ReportOrderMobileCard } from '@/components/orders/report-order-table-columns';
import { Link } from '@inertiajs/react';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  total_amount: number;
  subtotal: number;
  coop_share: number;
  member_share: number;
  status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | 'ready_to_pickup';
  delivery_packed_time?: string;
  delivered_time?: string;
  delivery_timeline?: {
    packed_at?: string;
    delivered_at?: string;
    packing_duration?: number;
    delivery_duration?: number;
    total_duration?: number;
  };
  created_at: string;
  admin?: {
    name: string;
  };
  admin_notes?: string;
  logistic?: {
    id: number;
    name: string;
    contact_number?: string;
  };
  audit_trail: Array<{
    id: number;
    product: {
      id: number;
      name: string;
    };
    category: string;
    quantity: number;
  }>;
}

interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  total_subtotal: number;
  total_coop_share: number;
  total_member_share: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  delivered_orders: number;
}

interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

interface AdminStaff {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'staff';
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
  delivery_status: string;
  logistic_ids: string[];
  admin_ids: string[];
  search?: string;
  min_amount?: string;
  max_amount?: string;
}

interface ReportPageProps {
  orders: Order[];
  summary: ReportSummary;
  logistics: Logistic[];
  admins: AdminStaff[];
  filters: ReportFilters;
}

export default function OrderReport({ orders, summary, logistics, admins, filters }: ReportPageProps) {
  const t = useTranslation();
  const normalizedFilters: ReportFilters = {
    ...filters,
    logistic_ids: Array.isArray(filters.logistic_ids) ? filters.logistic_ids : [],
    admin_ids: Array.isArray(filters.admin_ids) ? filters.admin_ids : []
  };

  const [localFilters, setLocalFilters] = useState<ReportFilters>(normalizedFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>(
    localFilters.start_date ? new Date(localFilters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    localFilters.end_date ? new Date(localFilters.end_date) : undefined
  );
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 5 : 10;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'total_amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'delivery_status':
          comparison = a.delivery_status.localeCompare(b.delivery_status);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'admin':
          const adminA = a.admin?.name || '';
          const adminB = b.admin?.name || '';
          comparison = adminA.localeCompare(adminB);
          break;
        case 'logistic':
          const logisticA = a.logistic?.name || '';
          const logisticB = b.logistic?.name || '';
          comparison = logisticA.localeCompare(logisticB);
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [orders, sortBy, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedOrders.slice(startIndex, endIndex);
  }, [sortedOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedOrders.length]);

  const columns = useMemo(() => createReportOrderTableColumns(t), [t]);

  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (localFilters.start_date) params.start_date = localFilters.start_date;
    if (localFilters.end_date) params.end_date = localFilters.end_date;
    if (localFilters.status !== 'all') params.status = localFilters.status;
    if (localFilters.delivery_status !== 'all') params.delivery_status = localFilters.delivery_status;
    if (localFilters.logistic_ids.length > 0) params.logistic_ids = localFilters.logistic_ids;
    if (localFilters.admin_ids.length > 0) params.admin_ids = localFilters.admin_ids;
    if (localFilters.search) params.search = localFilters.search;
    if (localFilters.min_amount) params.min_amount = localFilters.min_amount;
    if (localFilters.max_amount) params.max_amount = localFilters.max_amount;

    router.get(route('admin.orders.report'), params, {
      preserveScroll: true,
      only: ['orders', 'filters'],
      onSuccess: () => {
        setTimeout(() => {
          const orderReportElement = document.getElementById('order-report-section');
          if (orderReportElement) {
            const offset = 80;
            const elementPosition = orderReportElement.getBoundingClientRect().top;
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
    setStartDate(undefined);
    setEndDate(undefined);
    setLocalFilters({
      start_date: '',
      end_date: '',
      status: 'all',
      delivery_status: 'all',
      logistic_ids: [],
      admin_ids: [],
      search: '',
      min_amount: '',
      max_amount: ''
    });

    router.get(route('admin.orders.report'), {}, {
      preserveScroll: true,
      only: ['orders', 'filters'],
      onSuccess: () => {
        setTimeout(() => {
          const orderReportElement = document.getElementById('order-report-section');
          if (orderReportElement) {
            const offset = 80;
            const elementPosition = orderReportElement.getBoundingClientRect().top;
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
      localFilters.status !== 'all' || localFilters.delivery_status !== 'all' ||
      localFilters.logistic_ids.length > 0 || localFilters.admin_ids.length > 0 ||
      localFilters.min_amount || localFilters.max_amount || localFilters.search);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.status !== 'all') params.append('status', localFilters.status);
    if (localFilters.delivery_status !== 'all') params.append('delivery_status', localFilters.delivery_status);
    if (localFilters.logistic_ids.length > 0) {
      localFilters.logistic_ids.forEach(id => params.append('logistic_ids[]', id));
    }
    if (localFilters.admin_ids.length > 0) {
      localFilters.admin_ids.forEach(id => params.append('admin_ids[]', id));
    }
    if (localFilters.search) params.append('search', localFilters.search);
    if (localFilters.min_amount) params.append('min_amount', localFilters.min_amount);
    if (localFilters.max_amount) params.append('max_amount', localFilters.max_amount);
    params.append('format', format);

    if (format === 'csv') {
      const downloadUrl = `${route('admin.orders.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      const downloadUrl = `${route('admin.orders.report')}?${params.toString()}`;
      const displayParams = new URLSearchParams(params);
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.orders.report')}?${displayParams.toString()}`;

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `orders_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  return (
    <AppSidebarLayout>
      <Head title={t('admin.order_report')} />
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-4 flex flex-col gap-2 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
            {/* Mobile Layout */}
            <div className="flex md:hidden items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h1 className="text-lg font-bold text-foreground truncate">{t('admin.order_report')}</h1>
              </div>
              <Link href={route('admin.orders.index')}>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex md:flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg shrink-0">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t('admin.order_report')}</h1>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t('admin.order_report_description')}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={route('admin.orders.index')}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t('admin.back_to_orders')}
                    </Button>
                  </Link>
                  <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t('admin.export_csv')}
                  </Button>
                  <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t('admin.export_pdf')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Export Buttons */}
            <div className="flex md:hidden gap-2 mt-2">
              <Button onClick={() => exportReport('csv')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </Button>
              <Button onClick={() => exportReport('pdf')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                <FileText className="h-3.5 w-3.5" />
                <span>PDF</span>
              </Button>
            </div>
          </div>

          <ReportSummaryCards summary={summary} />

          <ReportFilters
            localFilters={localFilters}
            setLocalFilters={setLocalFilters}
            logistics={logistics}
            admins={admins}
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

          <Card id="order-report-section" className="shadow-sm scroll-mt-20">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg md:text-xl truncate">{t('admin.order_report')}</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedOrders.length > 0 ? (
                <>
                  <BaseTable
                    data={paginatedOrders}
                    columns={columns}
                    keyExtractor={(order) => order.id}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    renderMobileCard={(order) => <ReportOrderMobileCard order={order} t={t} />}
                  />

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={sortedOrders.length}
                  />
                </>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">{t('admin.no_orders_found')}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md px-4">
                      {hasActiveFilters()
                        ? t('admin.no_orders_match_filters')
                        : t('admin.no_order_data_for_period')
                      }
                    </p>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} variant="outline" className="mt-4 text-sm">
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
