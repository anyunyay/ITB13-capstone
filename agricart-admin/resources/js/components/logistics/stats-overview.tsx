import { IdCard, UserPlus, UserMinus, Clock, Star } from 'lucide-react';
import { LogisticStats } from '../../types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface StatsOverviewProps {
    logisticStats: LogisticStats;
}

export const StatsOverview = ({ logisticStats }: StatsOverviewProps) => {
    const t = useTranslation();
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <IdCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{logisticStats.totalLogistics}</div>
                    <div className="text-sm text-muted-foreground mt-2">{t('admin.total_logistics')}</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{logisticStats.activeLogistics}</div>
                    <div className="text-sm text-muted-foreground mt-2">{t('admin.active_logistics')}</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{logisticStats.deactivatedLogistics}</div>
                    <div className="text-sm text-muted-foreground mt-2">{t('admin.deactivated')}</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{logisticStats.pendingRequests}</div>
                    <div className="text-sm text-muted-foreground mt-2">{t('admin.pending_requests')}</div>
                </div>
            </div>

            {/* Overall Rating Card */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    {logisticStats.overallRating ? (
                        <>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-foreground leading-none">
                                    {logisticStats.overallRating.toFixed(1)}
                                </span>
                                <span className="text-sm text-muted-foreground">/ 5</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">{t('admin.overall_rating')}</div>
                        </>
                    ) : (
                        <>
                            <div className="text-xl font-bold text-foreground leading-none">—</div>
                            <div className="text-sm text-muted-foreground mt-2">{t('admin.overall_rating')}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
