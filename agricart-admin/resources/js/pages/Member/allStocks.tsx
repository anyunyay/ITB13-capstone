import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ArrowLeft, History, BarChart3, Filter } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { MemberHeader } from '@/components/member/member-header';
import { format } from 'date-fns';
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

    const [showTransactions, setShowTransactions] = useState(initialView);
    const [isMobile, setIsMobile] = useState(false);

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
            transaction_category: value
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

    return (
        <div className="min-h-screen bg-background scroll-pt-24 lg:scroll-pt-32">
            <MemberHeader />
            <div className="p-4 pt-20 lg:p-6  lg:pt-25">
                <Head title={t('member.all_stocks')} />

                {/* Header */}
                <div className="mb-8">
                    {/* Single Row with Back Button and Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('member.dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                <span className="md:hidden">Back</span>
                                <span className="hidden md:inline">Back to Dashboard</span>
                            </Link>
                        </Button>

                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="view-toggle" className="text-xs sm:text-sm text-foreground whitespace-nowrap">
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
                                <Label htmlFor="view-toggle" className="text-xs sm:text-sm text-foreground whitespace-nowrap">
                                    {t('member.show_transactions')}
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Title and Description */}
                    <h1 className="text-3xl font-bold text-foreground">
                        {showTransactions ? t('member.transaction_history') : t('member.all_stocks')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {showTransactions
                            ? t('member.transaction_history_description')
                            : t('member.all_stocks_description')
                        }
                    </p>
                </div>

                {/* Summary Cards */}
                <div className={`grid gap-2 mb-4 ${showTransactions ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'}`}>
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

                {/* Main Content Area */}
                {showTransactions ? (
                    /* Transaction View */
                    <Card className="" data-transactions-table>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                
                                {/* Transaction Filters */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    <Select value={filters.transaction_category} onValueChange={handleTransactionCategoryFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
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
                    <Card className="" data-stock-overview>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-foreground">{t('member.stock_quantity_overview')}</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1.5">
                                        {t('member.complete_breakdown')}
                                    </CardDescription>
                                </div>
                                
                                {/* Stock Filters */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    <Select value={filters.stock_category} onValueChange={handleStockCategoryFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="Kilo">Kilo</SelectItem>
                                            <SelectItem value="Pc">Piece</SelectItem>
                                            <SelectItem value="Tali">Tali</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filters.stock_status} onValueChange={handleStockStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="sold_out">Sold Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
    );
} 