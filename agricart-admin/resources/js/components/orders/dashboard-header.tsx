import { Package, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/common/permission-gate';
import { StatsOverview } from './stats-overview';
import { OrderStats } from '@/types/orders';
import { useTranslation } from '@/hooks/use-translation';

interface DashboardHeaderProps {
    orderStats: OrderStats;
}

export const DashboardHeader = ({ orderStats }: DashboardHeaderProps) => {
    const t = useTranslation();
    
    return (
        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-xl p-5 shadow-lg flex flex-col gap-3">
            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <Package className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground m-0 leading-tight">{t('admin.order_management')}</h1>
                            <p className="text-sm text-muted-foreground mt-1 mb-0 leading-snug">
                                {t('admin.order_management_description')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <PermissionGate permission="generate order report">
                        <Button asChild variant="outline" className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                            <Link href={route('admin.orders.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {t('admin.generate_report')}
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview orderStats={orderStats} />
        </div>
    );
};
