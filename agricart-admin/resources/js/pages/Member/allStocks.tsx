import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package, ArrowLeft, History, BarChart3 } from 'lucide-react';
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

interface PageProps {
    availableStocks: Stock[];
    salesData: SalesData;
    comprehensiveStockData: ComprehensiveStockData[];
    allComprehensiveStockData: ComprehensiveStockData[];
    transactions: TransactionsData;
    summary: Summary;
    stockPagination: PaginationData;
}

export default function AllStocks({ availableStocks, salesData, comprehensiveStockData, allComprehensiveStockData, transactions, summary, stockPagination }: PageProps) {
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
                // Preserve current pagination and view state when viewport changes
                router.get(route('member.allStocks'), {
                    stock_page: stockPagination?.current_page || 1,
                    transaction_page: transactions?.meta?.current_page || 1,
                    view: showTransactions ? 'transactions' : 'stocks'
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
            view: showTransactions ? 'transactions' : 'stocks'
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Replace history to maintain URL state on refresh
            onSuccess: () => {
                // Smooth scroll to stock overview section with proper padding
                setTimeout(() => {
                    const stockSection = document.querySelector('[data-stock-overview]');
                    if (stockSection) {
                        const rect = stockSection.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        // Add 100px offset on mobile (screens < 768px), 120px on desktop for better visibility
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
            view: showTransactions ? 'transactions' : 'stocks'
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Replace history to maintain URL state on refresh
            onSuccess: () => {
                // Smooth scroll to transactions table with proper padding
                setTimeout(() => {
                    const tableElement = document.querySelector('[data-transactions-table]');
                    if (tableElement) {
                        const rect = tableElement.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        // Add 100px offset on mobile (screens < 768px), 120px on desktop for better visibility
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
        // Update URL to persist view state on refresh
        router.get(route('member.allStocks'), {
            stock_page: stockPagination?.current_page || 1,
            transaction_page: transactions?.meta?.current_page || 1,
            view: checked ? 'transactions' : 'stocks'
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
                            <CardTitle className="text-foreground">{t('member.transaction_history_table')}</CardTitle>
                            <CardDescription className="text-muted-foreground">
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
                        </CardHeader>
                        <CardContent>
                            {!transactions?.data || transactions.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">{t('member.no_transactions_found')}</h3>
                                    <p className="text-muted-foreground">{t('member.no_transactions_match_filters')}</p>
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
                            <CardTitle className="text-foreground">{t('member.stock_quantity_overview')}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {t('member.complete_breakdown')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {comprehensiveStockData.length > 0 ? (
                                <div className="space-y-4">
                                    <StockOverviewCards data={comprehensiveStockData} />
                                    <StockOverviewTable data={comprehensiveStockData} />

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
                                    <h3 className="text-lg font-medium mb-2">{t('member.no_stocks_found')}</h3>
                                    <p className="text-sm">{t('member.no_stocks_message')}</p>
                                    <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                                        <Link href={route('member.dashboard')}>{t('member.back_to_dashboard')}</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 