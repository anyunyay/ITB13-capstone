import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { IdCard, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { LogisticStats } from '../../types/logistics';
import { useTranslation } from '@/hooks/use-translation';

interface DashboardHeaderProps {
    logisticStats: LogisticStats;
}

export const DashboardHeader = ({ logisticStats }: DashboardHeaderProps) => {
    const t = useTranslation();
    
    return (
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-3">
            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <IdCard className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground leading-tight m-0">{t('admin.logistic_management')}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                {t('admin.manage_logistics_partners')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <PermissionGate permission="create logistics">
                        <Button asChild className="bg-primary text-primary-foreground border-0 px-5 py-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md">
                            <Link href={route('logistics.add')}>
                                <IdCard className="h-4 w-4 mr-2" />
                                {t('admin.add_logistic')}
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="generate logistics report">
                        <Button asChild variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                            <Link href={route('logistics.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {t('admin.generate_report')}
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview logisticStats={logisticStats} />
        </div>
    );
};
