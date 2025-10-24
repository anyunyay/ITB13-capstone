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
// import { ScrollArea } from '@/components/ui/scroll-area';
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
    Clock
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
        if (!level) return <Info className="h-4 w-4 text-gray-500" />;
        
        switch (level.toLowerCase()) {
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
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
                    <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
                    <p className="text-sm text-gray-600">Monitor system activities and user actions</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Logs</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_logs.toLocaleString()}</p>
                                </div>
                                <Database className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today's Logs</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.today_logs.toLocaleString()}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Errors</p>
                                    <p className="text-2xl font-bold text-red-600">{summary.error_count.toLocaleString()}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.unique_users.toLocaleString()}</p>
                                </div>
                                <User className="h-8 w-8 text-purple-500" />
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
                        <CardTitle>System Logs</CardTitle>
                        <p className="text-sm text-gray-600">
                            Showing {logs.data.length} of {logs.total} logs
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[600px] overflow-y-auto">
                            <div className="space-y-4">
                                {logs.data.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getLevelIcon(log.level)}
                                                {getLevelBadge(log.level)}
                                                <Badge variant="outline" className="flex items-center">
                                                    {getEventTypeIcon(log.context.event_type)}
                                                    <span className="ml-1">{log.context.event_type?.replace('_', ' ') || 'Unknown Event'}</span>
                                                </Badge>
                                                {log.context.user_type && (
                                                    <Badge variant="secondary">
                                                        {log.context.user_type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatRelativeTime(log.context.timestamp || log.created_at)}
                                                </div>
                                                <div className="text-xs">
                                                    {formatTimestamp(log.context.timestamp || log.created_at)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <h4 className="font-medium text-gray-900">{log.message || 'No message'}</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                            {log.context.user_id && (
                                                <div>
                                                    <span className="font-medium">User ID:</span> {log.context.user_id}
                                                </div>
                                            )}
                                            {log.context.user_email && (
                                                <div>
                                                    <span className="font-medium">Email:</span> {log.context.user_email}
                                                </div>
                                            )}
                                            {log.context.ip_address && (
                                                <div>
                                                    <span className="font-medium">IP:</span> {log.context.ip_address}
                                                </div>
                                            )}
                                            {log.context.action && (
                                                <div>
                                                    <span className="font-medium">Action:</span> {log.context.action}
                                                </div>
                                            )}
                                            {log.context.product_name && (
                                                <div>
                                                    <span className="font-medium">Product:</span> {log.context.product_name}
                                                </div>
                                            )}
                                            {log.context.order_id && (
                                                <div>
                                                    <span className="font-medium">Order ID:</span> {log.context.order_id}
                                                </div>
                                            )}
                                            {log.context.total_amount && (
                                                <div>
                                                    <span className="font-medium">Amount:</span> ₱{log.context.total_amount.toFixed(2)}
                                                </div>
                                            )}
                                            {log.context.status && (
                                                <div>
                                                    <span className="font-medium">Status:</span> {log.context.status}
                                                </div>
                                            )}
                                        </div>

                                        {Object.keys(log.context).length > 6 && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                                    View Additional Details
                                                </summary>
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                    <pre className="whitespace-pre-wrap">
                                                        {JSON.stringify(log.context, null, 2)}
                                                    </pre>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-600">
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
            </div>
        </ProfileWrapper>
    );
};

export default SystemLogs;
