import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, History, BarChart3, Filter, Download, FileText, X, ChevronDown, CalendarIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member/member-header';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';
import { TransactionSummaryCards, StockSummaryCards } from '@/components/member/SummaryCards';
import { PaginationControls } from '@/components/member/PaginationControls';
import { TransactionHistoryCards } from '@/components/member/TransactionHistoryCards';
import { TransactionHistoryTable } from '@/components/member/TransactionHistoryTable';
import { StockOverviewCards } from '@/components/member/StockOverviewCards';
import { StockOverviewTable } from '@/components/member/StockOverviewTable';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
}

interface Stock {
    id: number;
    product_id: number;
    quantity: number | string;
    sold_quantity: number;
    initial_quantity: number;
    member_id: number;
    category: 'Kilo' | 'Pc' | 'Tali';
    status?: string;
    product: Product;
    created_at: string;
    totalRevenue?: number; // For sold stocks
}

interface SalesData {
    totalSales: number;
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    totalQuantitySold: number;
    salesBreakdown: Array<{
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
    }>;
}

interface ComprehensiveStockData {
    product_id: number;
    product_name: string;
    category: string;
    total_quantity: number;
    available_quantity: number;
    sold_quantity: number;
    balance_quantity: number;
    unit_price: number;
    total_revenue: number;
    total_cogs: number;
    total_gross_profit: number;
    product: Product;
}

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Sale {
    id: number;
    customer: Customer;
    delivered_time: string;
    status: string;
    delivery_status: string;
}

interface Transaction {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    created_at: string;
    sale: Sale;
    product: Product;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface TransactionsData {
    data: Transaction[];
    links: any[];
    meta: PaginationData;
}

interface Summary {
    total_transactions: number;
    total_quantity: number;
    total_revenue: number;
    total_member_share: number;
    total_cogs: number;
    total_gross_profit: number;
}

interface SortingState {
    stock_sort_by: string;
    stock_sort_dir: string;
    transaction_sort_by: string;
    transaction_sort_dir: string;
}

interface FilterState {
    stock_category: string;
    stock_status: string;
    transaction_category: string;
    start_date?: string;
    end_date?: string;
}

interface PageProps {
    availableStocks: Stock[];
    salesData: SalesData;
    comprehensiveStockData: ComprehensiveStockData[];
    allComprehensiveStockData: ComprehensiveStockData[];
    transactions: TransactionsData;
    summary: Summary;
    stockPagination: PaginationData;
    sorting: SortingState;
    filters: FilterState;
}

export default function AllStocks({ availableStocks, salesData, comprehensiveStockData, allComprehensiveStockData, transactions, summary, stockPagination, sorting, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const t = useTranslation();

    // Read view state from URL parameters on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view') === 'transactions';
    const highlightStockId = urlParams.get('highlight_stock');
    const highlightTransactionId = urlParams.get('highlight_transaction');
    const highlightProductId = urlParams.get('highlight_product');
    const highlightCategory = urlParams.get('highlight_category');

    const [showTransactions, setShowTransactions] = useState(initialView);
    const [isMobile, setIsMobile] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Date picker states
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.start_date ? new Date(filters.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.end_date ? new Date(filters.end_date) : undefined
    );

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    // Detect viewport size changes and update pagination
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                // Preserve current pagination, view state, sorting, and filters when viewport changes
                router.get(route('member.allStocks'), {
                    stock_page: stockPagination?.current_page || 1,
                    transaction_page: transactions?.meta?.current_page || 1,
                    view: showTransactions ? 'transactions' : 'stocks',
                    stock_sort_by: sorting.stock_sort_by,
                    stock_sort_dir: sorting.stock_sort_dir,
                    transaction_sort_by: sorting.transaction_sort_by,
                    transaction_sort_dir: sorting.transaction_sort_dir,
                    stock_category: filters.stock_category,
                    stock_status: filters.stock_status,
                    transaction_category: filters.transaction_category
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['comprehensiveStockData', 'transactions', 'stockPagination']
                });
            }
        };

        // Initial check
        checkMobile();

        // Add resize listener with debounce
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkMobile, 300);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [isMobile, showTransactions]);

    // Highlight and scroll to specific stock or transaction from notification
    useEffect(() => {
        if ((highlightStockId || (highlightProductId && highlightCategory)) || highlightTransactionId) {
            console.log('Highlight params:', {
                highlightStockId,
                highlightProductId,
                highlightCategory,
                highlightTransactionId,
                showTransactions
            });

            // Wait for the page to render
            setTimeout(() => {
                let targetElement: HTMLElement | null = null;

                if ((highlightStockId || (highlightProductId && highlightCategory)) && !showTransactions) {
                    // Try to find by product_id and category (for comprehensive view)
                    if (highlightProductId && highlightCategory) {
                        const selector = `[data-product-id="${highlightProductId}"][data-category="${highlightCategory}"]`;
                        console.log('Looking for stock with selector:', selector);
                        targetElement = document.querySelector(selector);
                        console.log('Stock element found:', targetElement);
                    }
                    // Fallback to stock_id if available
                    if (!targetElement && highlightStockId) {
                        const selector = `[data-stock-id="${highlightStockId}"]`;
                        console.log('Looking for stock with selector:', selector);
                        targetElement = document.querySelector(selector);
                        console.log('Stock element found:', targetElement);
                    }
                } else if (highlightTransactionId && showTransactions) {
                    // Find transaction row by data attribute
                    const selector = `[data-transaction-id="${highlightTransactionId}"]`;
                    console.log('Looking for transaction with selector:', selector);
                    targetElement = document.querySelector(selector);
                    console.log('Transaction element found:', targetElement);
                }

                if (targetElement) {
                    console.log('Applying highlight to element:', targetElement);
                    // Add highlight class
                    targetElement.classList.add('highlight-row');

                    // Scroll to element with offset for header
                    const rect = targetElement.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offset = window.innerWidth < 768 ? 120 : 140;
                    const targetPosition = rect.top + scrollTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Remove highlight after animation
                    setTimeout(() => {
                        targetElement?.classList.remove('highlight-row');
                    }, 3000);
                } else {
                    console.log('No target element found for highlighting');
                }
            }, 500);
        }
    }, [highlightStockId, highlightProductId, highlightCategory, highlightTransactionId, showTransactions, comprehensiveStockData, transactions]);

    // Calculate summary statistics from ALL comprehensive data (not paginated)
    const totalProducts = allComprehensiveStockData.length;
    const totalSold = allComprehensiveStockData.reduce((sum, item) => sum + item.sold_quantity, 0);
    const totalAvailable = allComprehensiveStockData.reduce((sum, item) => sum + item.balance_quantity, 0);
    const totalRevenue = allComprehensiveStockData.reduce((sum, item) => sum + item.total_revenue, 0);

    // Calculate totals by category from ALL data
    const totalKilo = allComprehensiveStockData
        .filter(item => item.category === 'Kilo')
        .reduce((sum, item) => sum + item.total_quantity, 0);
    const totalPiece = allComprehensiveStockData
        .filter(item => item.category === 'Pc')
        .reduce((sum, item) => sum + item.total_quantity, 0);
    const totalTali = allComprehensiveStockData
        .filter(item => item.category === 'Tali')
        .reduce((sum, item) => sum + item.total_quantity, 0);

    // Pagination handler for stock overview
    const handleStockPageChange = (page: number) => {
        router.get(route('member.allStocks'), {
            stock_page: page,
            transaction_page: transactions?.meta?.current_page || 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                setTimeout(() => {
                    const stockSection = document.querySelector('[data-stock-overview]');
                    if (stockSection) {
                        const rect = stockSection.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const offset = window.innerWidth < 768 ? 100 : 120;
                        const targetPosition = rect.top + scrollTop - offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        });
    };

    // Pagination handler for transaction view
    const handleTransactionPageChange = (page: number) => {
        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: page,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                setTimeout(() => {
                    const tableElement = document.querySelector('[data-transactions-table]');
                    if (tableElement) {
                        const rect = tableElement.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const offset = window.innerWidth < 768 ? 100 : 120;
                        const targetPosition = rect.top + scrollTop - offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        });
    };

    // Handle view toggle change
    const handleViewToggle = (checked: boolean) => {
        setShowTransactions(checked);
        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: checked ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Handle stock sorting
    const handleStockSort = (column: string) => {
        const newSortDir = sorting.stock_sort_by === column && sorting.stock_sort_dir === 'asc' ? 'desc' : 'asc';

        router.get(route('member.allStocks'), {
            stock_page: 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: column,
            stock_sort_dir: newSortDir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Handle transaction sorting
    const handleTransactionSort = (column: string) => {
        const newSortDir = sorting.transaction_sort_by === column && sorting.transaction_sort_dir === 'asc' ? 'desc' : 'asc';

        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: column,
            transaction_sort_dir: newSortDir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Handle stock category filter
    const handleStockCategoryFilter = (value: string) => {
        router.get(route('member.allStocks'), {
            stock_page: 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: value,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Handle stock status filter
    const handleStockStatusFilter = (value: string) => {
        router.get(route('member.allStocks'), {
            stock_page: 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: value,
            transaction_category: filters.transaction_category
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Handle transaction category filter
    const handleTransactionCategoryFilter = (value: string) => {
        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: value,
            start_date: filters.start_date,
            end_date: filters.end_date
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Date handling functions
    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setEndDate(date);
    };

    const getDateRangeDisplay = () => {
        if (!startDate && !endDate) return t('member.no_date_range_selected') || 'No date range selected';
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

    const applyDateFilters = () => {
        router.get(route('member.allStocks'), {
            stock_page: 1,
            transaction_page: 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category,
            start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
            end_date: endDate ? format(endDate, 'yyyy-MM-dd') : ''
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const clearDateFilters = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: filters.stock_category,
            stock_status: filters.stock_status,
            transaction_category: filters.transaction_category,
            start_date: '',
            end_date: ''
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const hasActiveDateFilters = () => {
        return filters.start_date || filters.end_date;
    };

    const hasActiveFilters = () => {
        if (showTransactions) {
            return filters.start_date || filters.end_date || filters.transaction_category !== 'all';
        } else {
            return filters.start_date || filters.end_date || filters.stock_category !== 'all' || filters.stock_status !== 'all';
        }
    };

    const clearAllFilters = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        router.get(route('member.allStocks'), {
            stock_page: 1,
            transaction_page: 1,
            view: showTransactions ? 'transactions' : 'stocks',
            stock_sort_by: sorting.stock_sort_by,
            stock_sort_dir: sorting.stock_sort_dir,
            transaction_sort_by: sorting.transaction_sort_by,
            transaction_sort_dir: sorting.transaction_sort_dir,
            stock_category: 'all',
            stock_status: 'all',
            transaction_category: 'all',
            start_date: '',
            end_date: ''
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Transaction helper functions
    const calculateMemberRevenue = (transaction: Transaction): number => {
        // Get the appropriate price based on category
        // This matches the backend logic in AuditTrail::getSalePrice()
        let price = 0;
        switch (transaction.category) {
            case 'Kilo':
                price = transaction.price_kilo ?? 0;
                break;
            case 'Pc':
                price = transaction.price_pc ?? 0;
                break;
            case 'Tali':
                price = transaction.price_tali ?? 0;
                break;
            default:
                price = transaction.unit_price ?? 0;
        }

        // Member gets 100% of product revenue (no co-op share deduction from member view)
        // This matches the backend calculation: quantity * getSalePrice()
        return transaction.quantity * price;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDateTime = (dateString: string): string => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    // Export handlers - Stock overview only
    const handleExportClick = (format: 'csv' | 'pdf') => {
        // Export stocks directly (no modal needed)
        handleExport(format);
    };

    const handleExport = (exportFormat: 'csv' | 'pdf') => {
        const params = new URLSearchParams();

        // Add current pagination
        params.append('stock_page', String(stockPagination?.current_page || 1));

        // Add sorting
        params.append('stock_sort_by', sorting.stock_sort_by);
        params.append('stock_sort_dir', sorting.stock_sort_dir);

        // Add filters
        params.append('stock_category', filters.stock_category);
        params.append('stock_status', filters.stock_status);

        // Add date filters
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

        // Add view and format
        params.append('view', 'stocks');
        params.append('format', exportFormat);

        if (exportFormat === 'csv') {
            // CSV: Just download
            const downloadUrl = `${route('member.allStocks')}?${params.toString()}`;
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `member_stocks_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            // PDF: Download first, then open in new tab with display=true
            const downloadUrl = `${route('member.allStocks')}?${params.toString()}`;

            // Create display URL with display=true parameter
            const displayParams = new URLSearchParams(params);
            displayParams.append('display', 'true');
            const displayUrl = `${route('member.allStocks')}?${displayParams.toString()}`;

            // Download the PDF
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `member_stocks_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Open in new tab for viewing
            setTimeout(() => {
                window.open(displayUrl, '_blank');
            }, 500);
        }
    };



    return (
        <div className="min-h-screen bg-background scroll-pt-24 lg:scroll-pt-32">
            <MemberHeader />
            <Head title={t('member.all_stocks')} />
            <div className="p-4 pt-20 lg:p-6 lg:pt-25">
                <div className="w-full flex flex-col gap-4">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-4 sm:p-6 shadow-lg">
                        {/* Mobile Layout */}
                        <div className="flex md:hidden items-center gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg shrink-0">
                                    {showTransactions ? <History className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                                </div>
                                <h1 className="text-lg font-bold text-foreground truncate">
                                    {showTransactions ? t('member.transaction_history') : t('member.all_stocks')}
                                </h1>
                            </div>
                            <Link href={route('member.dashboard')}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg shrink-0">
                                    {showTransactions ? <History className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                                        {showTransactions ? t('member.transaction_history') : t('member.all_stocks')}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {showTransactions
                                            ? t('member.transaction_history_description')
                                            : t('member.all_stocks_description')
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Link href={route('member.dashboard')}>
                                    <Button variant="outline" className="flex items-center gap-2 shrink-0">
                                        <ArrowLeft className="h-4 w-4" />
                                        {t('member.back_to_dashboard') || 'Back to Dashboard'}
                                    </Button>
                                </Link>
                                {!showTransactions && (
                                    <>
                                        <Button onClick={() => handleExportClick('csv')} variant="outline" className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            {t('member.export_csv') || 'Export CSV'}
                                        </Button>
                                        <Button onClick={() => handleExportClick('pdf')} variant="outline" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {t('member.export_pdf') || 'Export PDF'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Export Buttons */}
                        <div className="flex md:hidden gap-2 mt-2">
                            {!showTransactions && (
                                <>
                                    <Button onClick={() => handleExportClick('csv')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                                        <Download className="h-3.5 w-3.5" />
                                        <span>CSV</span>
                                    </Button>
                                    <Button onClick={() => handleExportClick('pdf')} variant="outline" className="flex items-center justify-center gap-1.5 flex-1 text-xs px-3">
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>PDF</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Toggle Switch - Between Header and Summary Cards */}
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-sm text-foreground whitespace-nowrap cursor-pointer">
                                    {t('member.stock_overview')}
                                </Label>
                            </div>
                            <Switch
                                id="view-toggle"
                                checked={showTransactions}
                                onCheckedChange={handleViewToggle}
                            />
                            <div className="flex items-center gap-1.5">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-sm text-foreground whitespace-nowrap cursor-pointer">
                                    {t('member.show_transactions')}
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className={`grid gap-2 ${showTransactions ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'}`}>
                        {showTransactions ? (
                            <TransactionSummaryCards
                                summary={summary}
                                formatCurrency={formatCurrency}
                            />
                        ) : (
                            <StockSummaryCards
                                totalAvailable={totalAvailable}
                                totalRevenue={totalRevenue}
                                totalCogs={allComprehensiveStockData.reduce((sum, item) => sum + (item.total_cogs || 0), 0)}
                                totalGrossProfit={allComprehensiveStockData.reduce((sum, item) => sum + (item.total_gross_profit || 0), 0)}
                                totalStock={allComprehensiveStockData.reduce((sum, item) => sum + item.total_quantity, 0)}
                                availableStock={allComprehensiveStockData.filter(item => item.balance_quantity > 0).length}
                                soldOutStock={allComprehensiveStockData.filter(item => item.balance_quantity === 0 && item.sold_quantity > 0).length}
                                totalSold={totalSold}
                                formatCurrency={formatCurrency}
                            />
                        )}
                    </div>

                    {/* Advanced Filters - Collapsible */}
                    <Card className="shadow-sm">
                        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg lg:text-xl">{t('member.advanced_filters') || 'Advanced Filters'}</CardTitle>
                                            {hasActiveFilters() && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                                    {t('member.active') || 'Active'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasActiveFilters() && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearAllFilters();
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 h-8 text-xs"
                                                >
                                                    <X className="h-3 w-3" />
                                                    {t('member.clear_filters') || 'Clear'}
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
                                        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-primary text-sm mb-1">{t('member.selected_date_range') || 'Selected Date Range'}</h4>
                                                    <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                                                    {getDurationDisplay() && (
                                                        <p className="text-xs text-primary/70 mt-1">
                                                            {t('member.duration') || 'Duration'}: {getDurationDisplay()}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setStartDate(undefined);
                                                        setEndDate(undefined);
                                                    }}
                                                    className="text-xs h-7"
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    {t('member.clear') || 'Clear'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Filter Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t('member.start_date') || 'Start Date'}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal h-9 text-sm"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "MMM dd, yyyy") : t('member.pick_start_date') || 'Pick start date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={handleStartDateChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t('member.end_date') || 'End Date'}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal h-9 text-sm"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "MMM dd, yyyy") : t('member.pick_end_date') || 'Pick end date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={handleEndDateChange}
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date < new Date("1900-01-01") ||
                                                            (startDate ? date < startDate : false)
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Conditional filters based on view */}
                                        {showTransactions ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">{t('member.category') || 'Category'}</Label>
                                                    <Select value={filters.transaction_category} onValueChange={handleTransactionCategoryFilter}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Categories</SelectItem>
                                                            <SelectItem value="Kilo">Kilo</SelectItem>
                                                            <SelectItem value="Pc">Piece</SelectItem>
                                                            <SelectItem value="Tali">Tali</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="lg:col-span-2 flex items-end">
                                                    <Button onClick={applyDateFilters} className="w-full h-9 text-sm">
                                                        {t('member.apply_filters') || 'Apply Filters'}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">{t('member.category') || 'Category'}</Label>
                                                    <Select value={filters.stock_category} onValueChange={handleStockCategoryFilter}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Categories</SelectItem>
                                                            <SelectItem value="Kilo">Kilo</SelectItem>
                                                            <SelectItem value="Pc">Piece</SelectItem>
                                                            <SelectItem value="Tali">Tali</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">{t('member.status') || 'Status'}</Label>
                                                    <Select value={filters.stock_status} onValueChange={handleStockStatusFilter}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Status</SelectItem>
                                                            <SelectItem value="available">Available</SelectItem>
                                                            <SelectItem value="sold_out">Sold Out</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-end">
                                                    <Button onClick={applyDateFilters} className="w-full h-9 text-sm">
                                                        {t('member.apply_filters') || 'Apply Filters'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>

                    {/* Main Content Area */}
                    {showTransactions ? (
                        /* Transaction View */
                        <Card className="shadow-sm" data-transactions-table>
                            <CardHeader>
                                <div>
                                    <CardTitle className="text-foreground">{t('member.transaction_history_table')}</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1.5">
                                        {transactions?.meta ?
                                            t('member.showing_entries', {
                                                from: transactions.meta.from,
                                                to: transactions.meta.to,
                                                total: transactions.meta.total
                                            }) :
                                            t('member.showing_transactions', {
                                                from: 0,
                                                to: 0,
                                                total: 0
                                            })
                                        }
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!transactions?.data || transactions.data.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">
                                            {filters.transaction_category !== 'all'
                                                ? 'No transactions match your filter'
                                                : t('member.no_transactions_found')}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {filters.transaction_category !== 'all'
                                                ? `No ${filters.transaction_category} transactions found. Try adjusting your filter.`
                                                : t('member.no_transactions_match_filters')}
                                        </p>
                                        {filters.transaction_category !== 'all' && (
                                            <Button
                                                onClick={() => {
                                                    router.get(route('member.allStocks'), {
                                                        stock_page: stockPagination?.current_page || 1,
                                                        transaction_page: 1,
                                                        view: 'transactions',
                                                        stock_sort_by: sorting.stock_sort_by,
                                                        stock_sort_dir: sorting.stock_sort_dir,
                                                        transaction_sort_by: sorting.transaction_sort_by,
                                                        transaction_sort_dir: sorting.transaction_sort_dir,
                                                        stock_category: filters.stock_category,
                                                        stock_status: filters.stock_status,
                                                        transaction_category: 'all'
                                                    }, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true
                                                    });
                                                }}
                                                className="mt-4 bg-green-600 hover:bg-green-700"
                                            >
                                                Clear Filter
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <TransactionHistoryCards
                                            transactions={transactions.data}
                                            formatCurrency={formatCurrency}
                                            formatDateTime={formatDateTime}
                                            calculateMemberRevenue={calculateMemberRevenue}
                                        />
                                        <TransactionHistoryTable
                                            transactions={transactions.data}
                                            formatCurrency={formatCurrency}
                                            formatDateTime={formatDateTime}
                                            calculateMemberRevenue={calculateMemberRevenue}
                                            sortBy={sorting.transaction_sort_by}
                                            sortDir={sorting.transaction_sort_dir}
                                            onSort={handleTransactionSort}
                                        />
                                    </div>
                                )}

                                {/* Transaction Pagination */}
                                {transactions?.data && transactions.data.length > 0 && transactions.meta && (
                                    <PaginationControls
                                        pagination={transactions.meta}
                                        onPageChange={handleTransactionPageChange}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        /* Stock Overview */
                        <Card className="shadow-sm" data-stock-overview>
                            <CardHeader>
                                <div>
                                    <CardTitle className="text-foreground">{t('member.stock_quantity_overview')}</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1.5">
                                        {t('member.complete_breakdown')}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {comprehensiveStockData.length > 0 ? (
                                    <div className="space-y-4">
                                        <StockOverviewCards data={comprehensiveStockData} />
                                        <StockOverviewTable
                                            data={comprehensiveStockData}
                                            sortBy={sorting.stock_sort_by}
                                            sortDir={sorting.stock_sort_dir}
                                            onSort={handleStockSort}
                                        />

                                        {/* Pagination Controls */}
                                        {stockPagination && (
                                            <PaginationControls
                                                pagination={stockPagination}
                                                onPageChange={handleStockPageChange}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                        <h3 className="text-lg font-medium mb-2">
                                            {filters.stock_category !== 'all' || filters.stock_status !== 'all'
                                                ? 'No stocks match your filters'
                                                : t('member.no_stocks_found')}
                                        </h3>
                                        <p className="text-sm">
                                            {filters.stock_category !== 'all' || filters.stock_status !== 'all'
                                                ? `No ${filters.stock_status !== 'all' ? filters.stock_status.replace('_', ' ') : ''} ${filters.stock_category !== 'all' ? filters.stock_category : ''} stocks found. Try adjusting your filters.`
                                                : t('member.no_stocks_message')}
                                        </p>
                                        {filters.stock_category === 'all' && filters.stock_status === 'all' ? (
                                            <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                                <Link href={route('member.dashboard')}>{t('member.back_to_dashboard')}</Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    router.get(route('member.allStocks'), {
                                                        stock_page: 1,
                                                        transaction_page: transactions?.meta?.current_page || 1,
                                                        view: 'stocks',
                                                        stock_sort_by: sorting.stock_sort_by,
                                                        stock_sort_dir: sorting.stock_sort_dir,
                                                        transaction_sort_by: sorting.transaction_sort_by,
                                                        transaction_sort_dir: sorting.transaction_sort_dir,
                                                        stock_category: 'all',
                                                        stock_status: 'all',
                                                        transaction_category: filters.transaction_category
                                                    }, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true
                                                    });
                                                }}
                                                className="mt-4 bg-green-600 hover:bg-green-700"
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 