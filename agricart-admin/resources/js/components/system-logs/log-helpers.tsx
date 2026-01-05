import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Info,
    AlertTriangle,
    Shield,
    User,
    ShoppingCart,
    Package,
    Truck,
    Settings,
    Database,
    FileText,
    Download
} from 'lucide-react';

export const getLevelIcon = (level: string) => {
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

export const getLevelBadge = (level: string, t: (key: string) => string) => {
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

export const getEventTypeIcon = (eventType: string) => {
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

export const getEventTypeColor = (eventType: string) => {
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

export const formatTimestamp = (timestamp: string, t: (key: string) => string) => {
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

export const formatRelativeTime = (timestamp: string, t: (key: string) => string) => {
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

export const truncateMessage = (message: string, maxLength: number = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '…';
};
