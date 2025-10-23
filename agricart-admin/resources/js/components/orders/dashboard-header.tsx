import { Package, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { OrderStats } from '@/types/orders';

interface DashboardHeaderProps {
    orderStats: OrderStats;
}

export const DashboardHeader = ({ orderStats }: DashboardHeaderProps) => {
    return (
        <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 mb-3 shadow-lg flex flex-col gap-3">
            <div className="flex flex-col gap-3 mb-1 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground leading-tight">Order Management</h1>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                Monitor and manage customer orders, track delivery status, and process order requests efficiently
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <PermissionGate permission="generate order report">
                        <Button asChild variant="outline" className="bg-background text-foreground border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                            <Link href={route('admin.orders.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview orderStats={orderStats} />
        </div>
    );
};
