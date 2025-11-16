import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Activity, AlertCircle, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface SummaryCardsProps {
    summary: {
        total_logs: number;
        error_count: number;
        warning_count: number;
        info_count: number;
        today_logs: number;
        unique_users: number;
    };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    const t = useTranslation();

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            <Card className="border-l-2 md:border-l-4 border-l-blue-500">
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate pr-1">{t('ui.total_logs')}</p>
                            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-blue-100 flex-shrink-0">
                                <Database className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-none">{summary.total_logs.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{t('ui.all_system_activities')}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-2 md:border-l-4 border-l-green-500">
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate pr-1">{t('ui.todays_activity')}</p>
                            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-green-100 flex-shrink-0">
                                <Activity className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-none">{summary.today_logs.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{t('ui.recent_activity')}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-2 md:border-l-4 border-l-red-500">
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate pr-1">{t('ui.errors')}</p>
                            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-red-100 flex-shrink-0">
                                <AlertCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
                            </div>
                        </div>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600 leading-none">{summary.error_count.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{t('ui.issues_detected')}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-2 md:border-l-4 border-l-purple-500">
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate pr-1">{t('ui.active_users')}</p>
                            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-purple-100 flex-shrink-0">
                                <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-none">{summary.unique_users.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{t('ui.unique_users')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
