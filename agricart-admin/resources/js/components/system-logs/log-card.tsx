import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Activity, Calendar, MapPin, FileText, Eye } from 'lucide-react';
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
        [key: string]: any;
    };
    created_at: string;
}

interface LogCardProps {
    log: LogEntry;
    getLevelIcon: (level: string) => React.ReactNode;
    getLevelBadge: (level: string) => React.ReactNode;
    getEventTypeIcon: (eventType: string) => React.ReactNode;
    getEventTypeColor: (eventType: string) => string;
    formatTimestamp: (timestamp: string) => string;
    formatRelativeTime: (timestamp: string) => string;
    onViewDetails: (log: LogEntry) => void;
}

export const LogCard: React.FC<LogCardProps> = ({
    log,
    getLevelIcon,
    getLevelBadge,
    getEventTypeIcon,
    getEventTypeColor,
    formatTimestamp,
    formatRelativeTime,
    onViewDetails
}) => {
    const t = useTranslation();

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
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
                        onClick={() => onViewDetails(log)}
                        className="w-full text-xs"
                    >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        {t('ui.view_technical_details')}
                    </Button>
                </div>
            )}
        </div>
    );
};
