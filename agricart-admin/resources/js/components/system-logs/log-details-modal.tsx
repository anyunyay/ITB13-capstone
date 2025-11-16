import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Users, Activity, Filter, Database } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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
        admin_id?: number;
        filters_applied?: Record<string, any>;
        total_logs_viewed?: number;
        [key: string]: any;
    };
    created_at: string;
}

interface LogDetailsModalProps {
    log: LogEntry | null;
    isOpen: boolean;
    onClose: () => void;
    getLevelBadge: (level: string) => React.ReactNode;
    getEventTypeColor: (eventType: string) => string;
    formatTimestamp: (timestamp: string) => string;
}

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({
    log,
    isOpen,
    onClose,
    getLevelBadge,
    getEventTypeColor,
    formatTimestamp
}) => {
    const t = useTranslation();

    if (!isOpen || !log) return null;

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
                icon: <Settings className="h-4 w-4" />
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

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">{t('ui.log_details')}</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
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
                                    {getLevelBadge(log.level)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('ui.event_type')}</label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={`${getEventTypeColor(log.context.event_type || '')}`}
                                    >
                                        {log.context.event_type?.replace('_', ' ') || t('ui.unknown_event')}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('ui.timestamp')}</label>
                                <p className="mt-1 text-sm text-foreground">
                                    {formatTimestamp(log.context.timestamp || log.created_at)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('ui.user_type')}</label>
                                <p className="mt-1 text-sm text-foreground">
                                    {log.context.user_type || t('ui.not_available')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('ui.message')}</label>
                            <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-lg">
                                {log.message || t('ui.no_message')}
                            </p>
                        </div>

                        {/* Admin Activity Details - Special Formatting */}
                        {log.context.event_type === 'admin_activity' ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings className="h-5 w-5 text-blue-600" />
                                    <h5 className="font-semibold text-blue-900">{t('ui.admin_activity_details')}</h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formatAdminActivityDetails(log).map((detail, index) => (
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
                                        {JSON.stringify(log.context, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
