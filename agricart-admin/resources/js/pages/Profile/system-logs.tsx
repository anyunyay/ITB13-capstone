import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import ProfileWrapper from './profile-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Component not available
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
    AlertCircle
} from 'lucide-react';

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
        per_page: number;
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
    const [search, setSearch] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || 'all');
    const [eventType, setEventType] = useState(filters.event_type || 'all');
    const [userType, setUserType] = useState(filters.user_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || 25);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const eventTypes = [
        { value: 'all', label: 'All Events' },
        { value: 'authentication', label: 'Authentication' },
        { value: 'security_event', label: 'Security Events' },
        { value: 'checkout', label: 'Checkout' },
        { value: 'order_status_change', label: 'Order Status' },
        { value: 'stock_update', label: 'Stock Updates' },
        { value: 'user_management', label: 'User Management' },
        { value: 'product_management', label: 'Product Management' },
        { value: 'member_activity', label: 'Member Activity' },
        { value: 'admin_activity', label: 'Admin Activity' },
        { value: 'customer_activity', label: 'Customer Activity' },
        { value: 'logistic_activity', label: 'Logistic Activity' },
        { value: 'delivery_status_change', label: 'Delivery Status' },
        { value: 'report_generation', label: 'Report Generation' },
        { value: 'data_export', label: 'Data Export' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'critical_error', label: 'Critical Errors' }
    ];

    const userTypes = [
        { value: 'all', label: 'All Users' },
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staff' },
        { value: 'customer', label: 'Customer' },
        { value: 'member', label: 'Member' },
        { value: 'logistic', label: 'Logistic' }
    ];

    const levels = [
        { value: 'all', label: 'All Levels' },
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' }
    ];

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
        if (!level) return <Badge variant="default">UNKNOWN</Badge>;
        
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
        if (!timestamp) return 'Unknown time';
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
            return 'Invalid time';
        }
    };

    const formatRelativeTime = (timestamp: string) => {
        if (!timestamp) return 'Unknown time';
        try {
            const now = new Date();
            const logTime = new Date(timestamp);
            const diffInSeconds = Math.floor((now.getTime() - logTime.getTime()) / 1000);

            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        } catch (e) {
            return 'Unknown time';
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
                label: 'Action',
                value: log.context.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                icon: <Settings className="h-4 w-4" />
            });
        }
        
        // Admin ID
        if (log.context.admin_id) {
            details.push({
                label: 'Admin ID',
                value: log.context.admin_id.toString(),
                icon: <User className="h-4 w-4" />
            });
        }
        
        // User Type
        if (log.context.user_type) {
            details.push({
                label: 'User Type',
                value: log.context.user_type.charAt(0).toUpperCase() + log.context.user_type.slice(1),
                icon: <Users className="h-4 w-4" />
            });
        }
        
        // Event Type
        if (log.context.event_type) {
            details.push({
                label: 'Event Type',
                value: log.context.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                icon: <Activity className="h-4 w-4" />
            });
        }
        
        // IP Address
        if (log.context.ip_address) {
            details.push({
                label: 'IP Address',
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
                label: 'Filters Applied',
                value: filters || 'None',
                icon: <Filter className="h-4 w-4" />
            });
        }
        
        // Total Logs Viewed
        if (log.context.total_logs_viewed !== undefined) {
            details.push({
                label: 'Total Logs Viewed',
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

    return (
        <ProfileWrapper
            breadcrumbs={[
                { title: 'Profile', href: route('admin.profile.info') },
                { title: 'System Logs', href: route('admin.system-logs') }
            ]}
            title="System Logs"
        >
            <Head title="System Logs" />

            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">System Logs</h2>
                    <p className="text-sm text-muted-foreground">Monitor system activities and user actions</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
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
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Logs</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.total_logs.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">All system activities</p>
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
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Today's Activity</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.today_logs.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
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
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Errors</p>
                                    <p className="text-3xl font-bold text-red-600">{summary.error_count.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Issues detected</p>
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
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
                                    <p className="text-3xl font-bold text-foreground">{summary.unique_users.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Unique users</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    placeholder="Search logs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="level">Log Level</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((levelOption) => (
                                            <SelectItem key={levelOption.value} value={levelOption.value}>
                                                {levelOption.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="event_type">Event Type</Label>
                                <Select value={eventType} onValueChange={setEventType}>
                                    <SelectTrigger>
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

                            <div>
                                <Label htmlFor="user_type">User Type</Label>
                                <Select value={userType} onValueChange={setUserType}>
                                    <SelectTrigger>
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

                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="per_page">Per Page</Label>
                                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full">
                                    <Search className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Display */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    System Logs
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Showing {logs.data.length} of {logs.total} logs
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {logs.data.length} entries
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[600px] w-full overflow-y-auto">
                            <div className="space-y-3">
                                {logs.data.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">No logs found</h3>
                                        <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
                                    </div>
                                ) : (
                                    logs.data.map((log) => (
                                        <div key={log.id} className="border rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-white">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getLevelIcon(log.level)}
                                                    {getLevelBadge(log.level)}
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`flex items-center gap-2 ${getEventTypeColor(log.context.event_type || '')}`}
                                                    >
                                                        {getEventTypeIcon(log.context.event_type)}
                                                        <span className="font-medium">
                                                            {log.context.event_type?.replace('_', ' ') || 'Unknown Event'}
                                                        </span>
                                                    </Badge>
                                                    {log.context.user_type && (
                                                        <Badge variant="secondary">
                                                            {log.context.user_type}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-right text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="font-medium">{formatRelativeTime(log.context.timestamp || log.created_at)}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatTimestamp(log.context.timestamp || log.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="font-semibold text-foreground text-lg mb-2">
                                                    {log.message || 'No message'}
                                                </h4>
                                            </div>

                                            {/* Admin Activity Logs - Special Formatting */}
                                            {log.context.event_type === 'admin_activity' ? (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Settings className="h-5 w-5 text-blue-600" />
                                                        <h5 className="font-semibold text-blue-900">Admin Activity Details</h5>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {formatAdminActivityDetails(log).map((detail, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
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
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : formatActionDetails(log).length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    {formatActionDetails(log).map((detail, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <span className="text-foreground">{detail}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}

                                            {Object.keys(log.context).length > 6 && (
                                                <div className="mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLog(log);
                                                            setShowDetails(true);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Full Details
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {logs.current_page} of {logs.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {logs.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/admin/system-logs', {
                                                ...filters,
                                                page: logs.current_page - 1
                                            })}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {logs.current_page < logs.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/admin/system-logs', {
                                                ...filters,
                                                page: logs.current_page + 1
                                            })}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Log Details Modal */}
                {showDetails && selectedLog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold">Log Details</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDetails(false)}
                                >
                                    Close
                                </Button>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto">
                                <div className="p-6 space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Level</label>
                                            <div className="mt-1">
                                                {getLevelBadge(selectedLog.level)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                                            <div className="mt-1">
                                                <Badge 
                                                    variant="outline" 
                                                    className={`${getEventTypeColor(selectedLog.context.event_type || '')}`}
                                                >
                                                    {selectedLog.context.event_type?.replace('_', ' ') || 'Unknown Event'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                                <p className="mt-1 text-sm text-foreground">
                                                {formatTimestamp(selectedLog.context.timestamp || selectedLog.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">User Type</label>
                                                <p className="mt-1 text-sm text-foreground">
                                                {selectedLog.context.user_type || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Message</label>
                                        <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-lg">
                                            {selectedLog.message || 'No message'}
                                        </p>
                                    </div>

                                    {/* Admin Activity Details - Special Formatting */}
                                    {selectedLog.context.event_type === 'admin_activity' ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Settings className="h-5 w-5 text-blue-600" />
                                                <h5 className="font-semibold text-blue-900">Admin Activity Details</h5>
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
                                            <label className="text-sm font-medium text-muted-foreground">Context Data</label>
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
        </ProfileWrapper>
    );
};

export default SystemLogs;
