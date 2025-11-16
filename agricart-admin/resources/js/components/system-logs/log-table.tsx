import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BaseTable } from '@/components/common/base-table';
import { Clock, Eye } from 'lucide-react';
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

interface LogTableProps {
    logs: LogEntry[];
    getLevelIcon: (level: string) => React.ReactNode;
    getLevelBadge: (level: string) => React.ReactNode;
    getEventTypeIcon: (eventType: string) => React.ReactNode;
    getEventTypeColor: (eventType: string) => string;
    formatTimestamp: (timestamp: string) => string;
    formatRelativeTime: (timestamp: string) => string;
    truncateMessage: (message: string, maxLength?: number) => string;
    onViewDetails: (log: LogEntry) => void;
}

export const LogTable: React.FC<LogTableProps> = ({
    logs,
    getLevelIcon,
    getLevelBadge,
    getEventTypeIcon,
    getEventTypeColor,
    formatTimestamp,
    formatRelativeTime,
    truncateMessage,
    onViewDetails
}) => {
    const t = useTranslation();

    return (
        <BaseTable<LogEntry>
            data={logs}
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
                    className: 'min-w-[180px] max-w-[250px]',
                    render: (log) => {
                        const message = log.message || t('ui.no_details_available');
                        const truncated = truncateMessage(message, 50);
                        const needsTooltip = message.length > 50;

                        return needsTooltip ? (
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <div className="text-sm text-foreground cursor-help hover:text-primary transition-colors">
                                            {truncated}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-md p-3">
                                        <p className="text-sm whitespace-pre-wrap">{message}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <div className="text-sm text-foreground">
                                {message}
                            </div>
                        );
                    }
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
                                onClick={() => onViewDetails(log)}
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
    );
};
