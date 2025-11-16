import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Activity, Database, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SummaryCards } from '@/components/system-logs/summary-cards';
import { LogFilters } from '@/components/system-logs/log-filters';
import { LogCard } from '@/components/system-logs/log-card';
import { LogTable } from '@/components/system-logs/log-table';
import { LogPagination } from '@/components/system-logs/log-pagination';
import { LogDetailsModal } from '@/components/system-logs/log-details-modal';
import {
    getLevelIcon,
    getLevelBadge,
    getEventTypeIcon,
    getEventTypeColor,
    formatTimestamp,
    formatRelativeTime,
    truncateMessage
} from '@/components/system-logs/log-helpers';

interface LogEntry {
    id: string;
    level: string;
    message: string;
    context: {
        event_type?: string;
        user_id?: number;
        user_type?: string;
        user_email?: string;
        ip_address?: string;
        timestamp?: string;
        action?: string;
        product_id?: number;
        product_name?: string;
        order_id?: number;
        total_amount?: number;
        status?: string;
        [key: string]: any;
    };
    created_at: string;
}

interface SystemLogsProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            type: string;
        };
    };
    logs: {
        data: LogEntry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        level: string;
        event_type: string;
        user_type: string;
        date_from: string;
        date_to: string;
    };
    summary: {
        total_logs: number;
        error_count: number;
        warning_count: number;
        info_count: number;
        today_logs: number;
        unique_users: number;
    };
}

const SystemLogs: React.FC<SystemLogsProps> = ({ auth, logs, filters, summary }) => {
    const t = useTranslation();
    const user = auth.user;

    // Check if user has access to system logs
    if (user.type !== 'admin' && user.type !== 'staff') {
        return (
            <AppSidebarLayout>
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-card-foreground mb-2">{t('ui.access_denied')}</h2>
                            <p className="text-muted-foreground">{t('ui.admin_staff_only_page')}</p>
                        </div>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    const [search, setSearch] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || 'all');
    const [eventType, setEventType] = useState(filters.event_type || 'all');
    const [userType, setUserType] = useState(filters.user_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    );
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Initialize view based on backend per_page value
    const initialView = logs.per_page === 10 ? 'table' : 'cards';
    const [currentView, setCurrentView] = useState<'cards' | 'table'>(initialView);
    const [isMobile, setIsMobile] = useState(false);
    const [previousMobile, setPreviousMobile] = useState(false);

    // Dynamic items per page based on view type and screen size
    const perPage = currentView === 'cards' ? 4 : 10;

    // Detect mobile screen size and handle view changes
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            const wasDesktop = !previousMobile;
            const isNowMobile = mobile;

            setIsMobile(mobile);
            setPreviousMobile(mobile);

            if (wasDesktop && isNowMobile && currentView === 'table') {
                setCurrentView('cards');
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile && currentView === 'table') {
            setCurrentView('cards');
        }
    }, [isMobile]);

    // Date handling functions
    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
        setDateFrom(date ? format(date, 'yyyy-MM-dd') : '');
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setEndDate(date);
        setDateTo(date ? format(date, 'yyyy-MM-dd') : '');
    };

    const hasActiveFilters = () => {
        return search !== '' ||
            level !== 'all' ||
            eventType !== 'all' ||
            userType !== 'all' ||
            dateFrom !== '' ||
            dateTo !== '';
    };

    const clearFilters = () => {
        setSearch('');
        setLevel('all');
        setEventType('all');
        setUserType('all');
        setDateFrom('');
        setDateTo('');
        setStartDate(undefined);
        setEndDate(undefined);
        router.get('/admin/system-logs', {
            per_page: perPage
        });
    };

    const handleFilter = () => {
        setIsLoading(true);
        router.get('/admin/system-logs', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleExport = () => {
        router.get('/admin/system-logs/export', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo
        });
    };

    const handleRefresh = () => {
        setIsLoading(true);
        router.get('/admin/system-logs', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleViewChange = (view: 'cards' | 'table') => {
        setCurrentView(view);
        const newPerPage = view === 'cards' ? 4 : 10;
        setIsLoading(true);
        
        const scrollPosition = window.scrollY;
        
        router.get('/admin/system-logs', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: newPerPage,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsLoading(false);
                window.scrollTo(0, scrollPosition);
            }
        });
    };

    const handleViewDetails = (log: LogEntry) => {
        setSelectedLog(log);
        setShowDetails(true);
    };

    const pageContent = (
        <>
            <Head title={t('ui.system_logs')} />

            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{t('ui.system_logs')}</h2>
                    <p className="text-sm text-muted-foreground">{t('ui.monitor_system_activities')}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t('ui.refresh')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t('ui.export')}
                    </Button>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                {/* Summary Cards */}
                <SummaryCards summary={summary} />

                {/* Advanced Filters */}
                <LogFilters
                    search={search}
                    level={level}
                    eventType={eventType}
                    userType={userType}
                    startDate={startDate}
                    endDate={endDate}
                    filtersOpen={filtersOpen}
                    hasActiveFilters={hasActiveFilters()}
                    onSearchChange={setSearch}
                    onLevelChange={setLevel}
                    onEventTypeChange={setEventType}
                    onUserTypeChange={setUserType}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                    onFiltersOpenChange={setFiltersOpen}
                    onClearFilters={clearFilters}
                    onApplyFilters={handleFilter}
                />

                {/* Logs Display */}
                <Card className="gap-2">
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    {t('ui.system_logs_title')}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('ui.showing')} {logs.data.length} {t('ui.of')} {logs.total} {t('ui.logs')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                {/* View Toggle - Desktop Only */}
                                <div className="hidden md:flex gap-1 bg-muted p-1 rounded-lg border border-border">
                                    <Button
                                        variant={currentView === 'cards' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleViewChange('cards')}
                                        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
                                        disabled={isLoading}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={currentView === 'table' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleViewChange('table')}
                                        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
                                        disabled={isLoading}
                                    >
                                        <TableIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">{t('ui.no_logs_found')}</h3>
                                <p className="text-muted-foreground">{t('ui.try_adjusting_filters')}</p>
                            </div>
                        ) : currentView === 'cards' || isMobile ? (
                            /* Card View */
                            <div className="space-y-2">
                                {logs.data.map((log) => (
                                    <LogCard
                                        key={log.id}
                                        log={log}
                                        getLevelIcon={getLevelIcon}
                                        getLevelBadge={(level) => getLevelBadge(level, t)}
                                        getEventTypeIcon={getEventTypeIcon}
                                        getEventTypeColor={getEventTypeColor}
                                        formatTimestamp={(timestamp) => formatTimestamp(timestamp, t)}
                                        formatRelativeTime={(timestamp) => formatRelativeTime(timestamp, t)}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Table View - Desktop Only */
                            <LogTable
                                logs={logs.data}
                                getLevelIcon={getLevelIcon}
                                getLevelBadge={(level) => getLevelBadge(level, t)}
                                getEventTypeIcon={getEventTypeIcon}
                                getEventTypeColor={getEventTypeColor}
                                formatTimestamp={(timestamp) => formatTimestamp(timestamp, t)}
                                formatRelativeTime={(timestamp) => formatRelativeTime(timestamp, t)}
                                truncateMessage={truncateMessage}
                                onViewDetails={handleViewDetails}
                            />
                        )}

                        {/* Pagination */}
                        <LogPagination
                            currentPage={logs.current_page}
                            lastPage={logs.last_page}
                            perPage={perPage}
                            total={logs.total}
                            search={search}
                            level={level}
                            eventType={eventType}
                            userType={userType}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                        />
                    </CardContent>
                </Card>

                {/* Log Details Modal */}
                <LogDetailsModal
                    log={selectedLog}
                    isOpen={showDetails}
                    onClose={() => setShowDetails(false)}
                    getLevelBadge={(level) => getLevelBadge(level, t)}
                    getEventTypeColor={getEventTypeColor}
                    formatTimestamp={(timestamp) => formatTimestamp(timestamp, t)}
                />
            </div>
        </>
    );

    // System logs is admin/staff only, so we only need AppSidebarLayout
    return (
        <AppSidebarLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                {pageContent}
            </div>
        </AppSidebarLayout>
    );
};

export default SystemLogs;
