import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    AlertTriangle,
    CheckCircle,
    Info,
    Shield,
    User,
    ShoppingCart,
    Package,
    Truck,
    Settings,
    Database,
    FileText,
    Calendar,
    Clock,
    Activity,
    TrendingUp,
    Users,
    AlertCircle,
    MapPin,
    X,
    ChevronDown,
    CalendarIcon,
    LayoutGrid,
    Table as TableIcon
} from 'lucide-react';
import { format } from 'date-fns';

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
    const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dynamic items per page based on view type and screen size
    const perPage = currentView === 'cards' 
        ? (isMobile ? 4 : 8) 
        : (isMobile ? 5 : 10);

    // Date handling functions
    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
        setDateFrom(date ? format(date, 'yyyy-MM-dd') : '');
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setEndDate(date);
        setDateTo(date ? format(date, 'yyyy-MM-dd') : '');
    };

    const getDateRangeDisplay = () => {
        if (!startDate && !endDate) return t('ui.no_date_range');
        if (startDate && !endDate) return `${t('ui.from')} ${format(startDate, 'MMM dd, yyyy')}`;
        if (!startDate && endDate) return `${t('ui.until')} ${format(endDate, 'MMM dd, yyyy')}`;
        return `${format(startDate!, 'MMM dd, yyyy')} - ${format(endDate!, 'MMM dd, yyyy')}`;
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
        router.get('/admin/system-logs');
    };

    const eventTypes = [
        { value: 'all', label: t('ui.all_events') },
        { value: 'authentication', label: t('ui.authentication') },
        { value: 'security_event', label: t('ui.security_events') },
        { value: 'checkout', label: t('ui.checkout') },
        { value: 'order_status_change', label: t('ui.order_status') },
        { value: 'stock_update', label: t('ui.stock_updates') },
        { value: 'user_management', label: t('ui.user_management') },
        { value: 'product_management', label: t('ui.product_management') },
        { value: 'member_activity', label: t('ui.member_activity') },
        { value: 'admin_activity', label: t('ui.admin_activity') },
        { value: 'customer_activity', label: t('ui.customer_activity') },
        { value: 'logistic_activity', label: t('ui.logistic_activity') },
        { value: 'delivery_status_change', label: t('ui.delivery_status') },
        { value: 'report_generation', label: t('ui.report_generation') },
        { value: 'data_export', label: t('ui.data_export') },
        { value: 'maintenance', label: t('ui.maintenance') },
        { value: 'critical_error', label: t('ui.critical_errors') }
    ];

    const userTypes = [
        { value: 'all', label: t('ui.all_users') },
        { value: 'admin', label: t('admin.admin') },
        { value: 'staff', label: t('staff.staff') },
        { value: 'customer', label: t('customer.customer') },
        { value: 'member', label: t('member.member') },
        { value: 'logistic', label: t('logistic.logistic') }
    ];

    const levels = [
        { value: 'all', label: t('ui.all_levels') },
        { value: 'info', label: t('ui.info') },
        { value: 'warning', label: t('ui.warning') },
        { value: 'error', label: t('ui.error') }
    ];

    const handleFilter = () => {
        setIsLoading(true);
        router.get('/admin/system-logs', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo
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
        router.reload({
            onFinish: () => setIsLoading(false)
        });
    };

    const getLevelIcon = (level: string) => {
        if (!level) return <Info className="h-4 w-4 text-muted-foreground" />;

        switch (level.toLowerCase()) {
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getLevelBadge = (level: string) => {
        if (!level) return <Badge variant="default">{t('ui.unknown')}</Badge>;

        const variants = {
            error: 'destructive',
            warning: 'secondary',
            info: 'default'
        } as const;

        return (
            <Badge variant={variants[level.toLowerCase() as keyof typeof variants] || 'default'}>
                {level.toUpperCase()}
            </Badge>
        );
    };

    const getEventTypeIcon = (eventType: string) => {
        if (!eventType) return <Database className="h-4 w-4" />;

        switch (eventType) {
            case 'authentication':
                return <Shield className="h-4 w-4" />;
            case 'security_event':
                return <Shield className="h-4 w-4" />;
            case 'checkout':
                return <ShoppingCart className="h-4 w-4" />;
            case 'order_status_change':
                return <Package className="h-4 w-4" />;
            case 'stock_update':
                return <Package className="h-4 w-4" />;
            case 'user_management':
                return <User className="h-4 w-4" />;
            case 'product_management':
                return <Package className="h-4 w-4" />;
            case 'delivery_status_change':
                return <Truck className="h-4 w-4" />;
            case 'report_generation':
                return <FileText className="h-4 w-4" />;
            case 'data_export':
                return <Download className="h-4 w-4" />;
            case 'maintenance':
                return <Settings className="h-4 w-4" />;
            case 'critical_error':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Database className="h-4 w-4" />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return t('ui.unknown_time');
        try {
            return new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (e) {
            return t('ui.invalid_time');
        }
    };

    const formatRelativeTime = (timestamp: string) => {
        if (!timestamp) return t('ui.unknown_time');
        try {
            const now = new Date();
            const logTime = new Date(timestamp);
            const diffInSeconds = Math.floor((now.getTime() - logTime.getTime()) / 1000);

            if (diffInSeconds < 60) return t('ui.just_now');
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('ui.minutes_ago')}`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('ui.hours_ago')}`;
            return `${Math.floor(diffInSeconds / 86400)}${t('ui.days_ago')}`;
        } catch (e) {
            return t('ui.unknown_time');
        }
    };

    const formatActionDetails = (log: LogEntry) => {
        const details = [];

        if (log.context.user_id) {
            details.push(`User ID: ${log.context.user_id}`);
        }
        if (log.context.user_email) {
            details.push(`Email: ${log.context.user_email}`);
        }
        if (log.context.ip_address) {
            details.push(`IP: ${log.context.ip_address}`);
        }
        if (log.context.action) {
            details.push(`Action: ${log.context.action}`);
        }
        if (log.context.product_name) {
            details.push(`Product: ${log.context.product_name}`);
        }
        if (log.context.order_id) {
            details.push(`Order ID: ${log.context.order_id}`);
        }
        if (log.context.total_amount) {
            details.push(`Amount: ₱${log.context.total_amount.toFixed(2)}`);
        }
        if (log.context.status) {
            details.push(`Status: ${log.context.status}`);
        }

        return details;
    };

    const formatAdminActivityDetails = (log: LogEntry) => {
        const details = [];

        // Action
        if (log.context.action) {
            details.push({
                label: t('ui.action'),
                value: log.context.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                icon: <Settings className="h-4 w-4" />
            });
        }

        // Admin ID
        if (log.context.admin_id) {
            details.push({
                label: t('ui.admin_id'),
                value: log.context.admin_id.toString(),
                icon: <User className="h-4 w-4" />
            });
        }

        // User Type
        if (log.context.user_type) {
            details.push({
                label: t('ui.user_type'),
                value: log.context.user_type.charAt(0).toUpperCase() + log.context.user_type.slice(1),
                icon: <Users className="h-4 w-4" />
            });
        }

        // Event Type
        if (log.context.event_type) {
            details.push({
                label: t('ui.event_type'),
                value: log.context.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                icon: <Activity className="h-4 w-4" />
            });
        }

        // IP Address
        if (log.context.ip_address) {
            details.push({
                label: t('ui.ip_address'),
                value: log.context.ip_address,
                icon: <Shield className="h-4 w-4" />
            });
        }

        // Filters Applied
        if (log.context.filters_applied) {
            const filters = Object.entries(log.context.filters_applied)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            details.push({
                label: t('ui.filters_applied'),
                value: filters || t('ui.none'),
                icon: <Filter className="h-4 w-4" />
            });
        }

        // Total Logs Viewed
        if (log.context.total_logs_viewed !== undefined) {
            details.push({
                label: t('ui.total_logs_viewed'),
                value: log.context.total_logs_viewed.toString(),
                icon: <Database className="h-4 w-4" />
            });
        }

        return details;
    };

    const getEventTypeColor = (eventType: string) => {
        switch (eventType) {
            case 'authentication':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'security_event':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'checkout':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'order_status_change':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'stock_update':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'user_management':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'product_management':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'admin_activity':
                return 'bg-muted text-foreground border-border';
            default:
                return 'bg-muted text-foreground border-border';
        }
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

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('ui.total_logs')}</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.total_logs.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('ui.all_system_activities')}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <Database className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('ui.todays_activity')}</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.today_logs.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('ui.recent_activity')}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100">
                                    <Activity className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('ui.errors')}</p>
                                    <p className="text-3xl font-bold text-red-600">{summary.error_count.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('ui.issues_detected')}</p>
                                </div>
                                <div className="p-3 rounded-full bg-red-100">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('ui.active_users')}</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.unique_users.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('ui.unique_users')}</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
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
                                        <CardTitle className="text-xl">{t('ui.advanced_filters')}</CardTitle>
                                        {hasActiveFilters() && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                                {t('ui.active')}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasActiveFilters() && (
                                            <Button onClick={clearFilters} variant="outline" size="sm" className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                {t('ui.clear_filters')}
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
                                            placeholder={t('ui.search_logs')}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 pr-4 py-3 border-border rounded-lg bg-background text-foreground focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                                        />
                                    </div>
                                </div>

                                {/* Date Range Summary */}
                                {(startDate || endDate) && (
                                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-primary mb-1">{t('ui.selected_date_range')}</h4>
                                                <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setStartDate(undefined);
                                                    setEndDate(undefined);
                                                    setDateFrom('');
                                                    setDateTo('');
                                                }}
                                                className="text-xs"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                {t('ui.clear')}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Filter Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{t('ui.start_date')}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "MMM dd, yyyy") : t('ui.pick_start_date')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={handleStartDateChange}
                                                    initialFocus
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{t('ui.end_date')}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal border-border rounded-lg bg-background text-foreground focus:border-primary"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "MMM dd, yyyy") : t('ui.pick_end_date')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={handleEndDateChange}
                                                    initialFocus
                                                    disabled={(date) => {
                                                        if (date > new Date()) return true;
                                                        if (startDate && date < startDate) return true;
                                                        return false;
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Event Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="event_type" className="text-sm font-medium">{t('ui.event_type')}</Label>
                                        <Select value={eventType} onValueChange={setEventType}>
                                            <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eventTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* User Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user_type" className="text-sm font-medium">{t('ui.user_type')}</Label>
                                        <Select value={userType} onValueChange={setUserType}>
                                            <SelectTrigger className="border-border rounded-lg bg-background text-foreground focus:border-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>

                                {/* Apply Filters Button */}
                                <div className="flex justify-end">
                                    <Button onClick={handleFilter} className="px-6">
                                        <Search className="h-4 w-4 mr-2" />
                                        {t('ui.apply_filters')}
                                    </Button>
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Logs Display */}
                <Card>
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
                                        onClick={() => setCurrentView('cards')}
                                        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={currentView === 'table' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentView('table')}
                                        className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
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
                            <div className="space-y-3">
                                {logs.data.map((log) => (
                                        <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                                            {/* Header with badges and time */}
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                                                <div className="flex items-center space-x-2">
                                                    {getLevelIcon(log.level)}
                                                    {getLevelBadge(log.level)}
                                                    <Badge
                                                        variant="outline"
                                                        className={`flex items-center gap-1 ${getEventTypeColor(log.context.event_type || '')}`}
                                                    >
                                                        {getEventTypeIcon(log.context.event_type || '')}
                                                        <span className="text-xs font-medium">
                                                            {log.context.event_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('ui.unknown_event')}
                                                        </span>
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatRelativeTime(log.context.timestamp || log.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Two-column layout for compact display */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                {/* Column 1: User and Action */}
                                                <div className="space-y-3">
                                                    {/* User */}
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex-shrink-0">
                                                            <User className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                                                                {t('ui.user')}
                                                            </div>
                                                            <div className="text-sm font-medium text-foreground truncate">
                                                                {log.context.user_email || (log.context.user_id ? `${t('ui.user')} #${log.context.user_id}` : t('ui.system'))}
                                                            </div>
                                                            {log.context.user_type && (
                                                                <Badge variant="secondary" className="mt-1 text-xs">
                                                                    {log.context.user_type.charAt(0).toUpperCase() + log.context.user_type.slice(1)}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action */}
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-100 text-green-600 flex-shrink-0">
                                                            <Activity className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                                                                {t('ui.action')}
                                                            </div>
                                                            <div className="text-sm font-medium text-foreground">
                                                                {log.context.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('ui.unknown_action')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 2: Date & Time and Location */}
                                                <div className="space-y-3">
                                                    {/* Date & Time */}
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-100 text-purple-600 flex-shrink-0">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                                                                {t('ui.date_time')}
                                                            </div>
                                                            <div className="text-sm font-medium text-foreground">
                                                                {formatTimestamp(log.context.timestamp || log.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Location (IP Address) */}
                                                    {log.context.ip_address && (
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex-shrink-0">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                                                                    {t('ui.location_ip')}
                                                                </div>
                                                                <div className="text-sm font-medium text-foreground font-mono">
                                                                    {log.context.ip_address}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Full-width Details section */}
                                            <div className="pt-3 border-t">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600 flex-shrink-0">
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                            {t('ui.details')}
                                                        </div>
                                                        <div className="text-sm text-foreground leading-relaxed">
                                                            {log.message || t('ui.no_details_available')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Technical Details Button */}
                                            {Object.keys(log.context).length > 6 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLog(log);
                                                            setShowDetails(true);
                                                        }}
                                                        className="w-full text-xs"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                        {t('ui.view_technical_details')}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                ))}
                            </div>
                        ) : (
                            /* Table View - Desktop Only */
                            <BaseTable<LogEntry>
                                data={logs.data}
                                columns={[
                                    {
                                        key: 'level',
                                        label: t('ui.level'),
                                        align: 'center',
                                        className: 'w-24',
                                        render: (log) => (
                                            <div className="flex items-center justify-center gap-2">
                                                {getLevelIcon(log.level)}
                                                {getLevelBadge(log.level)}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'event_type',
                                        label: t('ui.event_type'),
                                        align: 'left',
                                        className: 'min-w-[180px]',
                                        render: (log) => (
                                            <Badge
                                                variant="outline"
                                                className={`flex items-center gap-1 w-fit ${getEventTypeColor(log.context.event_type || '')}`}
                                            >
                                                {getEventTypeIcon(log.context.event_type || '')}
                                                <span className="text-xs font-medium">
                                                    {log.context.event_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('ui.unknown_event')}
                                                </span>
                                            </Badge>
                                        )
                                    },
                                    {
                                        key: 'user',
                                        label: t('ui.user'),
                                        align: 'left',
                                        className: 'min-w-[200px]',
                                        render: (log) => (
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-foreground truncate">
                                                    {log.context.user_email || (log.context.user_id ? `${t('ui.user')} #${log.context.user_id}` : t('ui.system'))}
                                                </div>
                                                {log.context.user_type && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {log.context.user_type.charAt(0).toUpperCase() + log.context.user_type.slice(1)}
                                                    </Badge>
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'action',
                                        label: t('ui.action'),
                                        align: 'left',
                                        className: 'min-w-[150px]',
                                        render: (log) => (
                                            <div className="text-sm font-medium text-foreground">
                                                {log.context.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('ui.unknown_action')}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'message',
                                        label: t('ui.message'),
                                        align: 'left',
                                        className: 'min-w-[250px] max-w-[400px]',
                                        render: (log) => (
                                            <div className="text-sm text-foreground line-clamp-2">
                                                {log.message || t('ui.no_details_available')}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'timestamp',
                                        label: t('ui.timestamp'),
                                        align: 'center',
                                        className: 'min-w-[180px]',
                                        render: (log) => (
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">
                                                    {formatTimestamp(log.context.timestamp || log.created_at)}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatRelativeTime(log.context.timestamp || log.created_at)}
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'ip_address',
                                        label: t('ui.ip_address'),
                                        align: 'center',
                                        className: 'min-w-[130px]',
                                        hideOnMobile: true,
                                        render: (log) => (
                                            <div className="text-xs font-mono text-foreground">
                                                {log.context.ip_address || '-'}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'actions',
                                        label: t('ui.actions'),
                                        align: 'center',
                                        className: 'w-32',
                                        render: (log) => (
                                            Object.keys(log.context).length > 6 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setShowDetails(true);
                                                    }}
                                                    className="text-xs"
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                    {t('ui.view')}
                                                </Button>
                                            )
                                        )
                                    }
                                ]}
                                keyExtractor={(log) => log.id}
                                getRowClassName={(log) => 
                                    log.level === 'error' ? 'bg-red-50/50' : 
                                    log.level === 'warning' ? 'bg-yellow-50/50' : ''
                                }
                            />
                        )}

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    {t('ui.showing')} <span className="font-medium">{((logs.current_page - 1) * logs.per_page) + 1}</span>-
                                    <span className="font-medium">{Math.min(logs.current_page * logs.per_page, logs.total)}</span> {t('ui.of')}{' '}
                                    <span className="font-medium">{logs.total}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get('/admin/system-logs', {
                                            search,
                                            level,
                                            event_type: eventType,
                                            user_type: userType,
                                            date_from: dateFrom,
                                            date_to: dateTo,
                                            page: 1
                                        })}
                                        disabled={logs.current_page === 1}
                                        className="h-9 px-3"
                                    >
                                        {t('ui.first')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get('/admin/system-logs', {
                                            search,
                                            level,
                                            event_type: eventType,
                                            user_type: userType,
                                            date_from: dateFrom,
                                            date_to: dateTo,
                                            page: logs.current_page - 1
                                        })}
                                        disabled={logs.current_page === 1}
                                        className="h-9 px-3"
                                    >
                                        {t('ui.previous')}
                                    </Button>
                                    
                                    {/* Page numbers - hidden on mobile */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, logs.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (logs.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (logs.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (logs.current_page >= logs.last_page - 2) {
                                                pageNum = logs.last_page - 4 + i;
                                            } else {
                                                pageNum = logs.current_page - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={logs.current_page === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => router.get('/admin/system-logs', {
                                                        search,
                                                        level,
                                                        event_type: eventType,
                                                        user_type: userType,
                                                        date_from: dateFrom,
                                                        date_to: dateTo,
                                                        page: pageNum
                                                    })}
                                                    className="h-9 w-9 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Current page indicator - visible on mobile */}
                                    <div className="sm:hidden px-3 py-1.5 text-sm font-medium">
                                        {logs.current_page} / {logs.last_page}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get('/admin/system-logs', {
                                            search,
                                            level,
                                            event_type: eventType,
                                            user_type: userType,
                                            date_from: dateFrom,
                                            date_to: dateTo,
                                            page: logs.current_page + 1
                                        })}
                                        disabled={logs.current_page === logs.last_page}
                                        className="h-9 px-3"
                                    >
                                        {t('ui.next')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get('/admin/system-logs', {
                                            search,
                                            level,
                                            event_type: eventType,
                                            user_type: userType,
                                            date_from: dateFrom,
                                            date_to: dateTo,
                                            page: logs.last_page
                                        })}
                                        disabled={logs.current_page === logs.last_page}
                                        className="h-9 px-3"
                                    >
                                        {t('ui.last')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Log Details Modal */}
                {showDetails && selectedLog && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold">{t('ui.log_details')}</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDetails(false)}
                                >
                                    {t('ui.close')}
                                </Button>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto">
                                <div className="p-6 space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('ui.level')}</label>
                                            <div className="mt-1">
                                                {getLevelBadge(selectedLog.level)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('ui.event_type')}</label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`${getEventTypeColor(selectedLog.context.event_type || '')}`}
                                                >
                                                    {selectedLog.context.event_type?.replace('_', ' ') || t('ui.unknown_event')}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('ui.timestamp')}</label>
                                            <p className="mt-1 text-sm text-foreground">
                                                {formatTimestamp(selectedLog.context.timestamp || selectedLog.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('ui.user_type')}</label>
                                            <p className="mt-1 text-sm text-foreground">
                                                {selectedLog.context.user_type || t('ui.not_available')}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('ui.message')}</label>
                                        <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-lg">
                                            {selectedLog.message || t('ui.no_message')}
                                        </p>
                                    </div>

                                    {/* Admin Activity Details - Special Formatting */}
                                    {selectedLog.context.event_type === 'admin_activity' ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Settings className="h-5 w-5 text-blue-600" />
                                                <h5 className="font-semibold text-blue-900">{t('ui.admin_activity_details')}</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {formatAdminActivityDetails(selectedLog).map((detail, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-blue-600">{detail.icon}</div>
                                                            <div className="flex-1">
                                                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                                                    {detail.label}
                                                                </div>
                                                                <div className="text-sm font-semibold text-foreground mt-1">
                                                                    {detail.value}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('ui.context_data')}</label>
                                            <div className="mt-1 bg-muted p-4 rounded-lg">
                                                <pre className="text-xs text-foreground whitespace-pre-wrap overflow-x-auto">
                                                    {JSON.stringify(selectedLog.context, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
