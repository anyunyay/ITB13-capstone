import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { UsersRound, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from './stats-overview';
import { MemberStats } from '../../types/membership';

interface DashboardHeaderProps {
    memberStats: MemberStats;
}

export const DashboardHeader = ({ memberStats }: DashboardHeaderProps) => {
    return (
        <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-5 mb-3 shadow-lg flex flex-col gap-3">
            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 text-primary bg-primary/10 p-2.5 rounded-lg flex items-center justify-center">
                            <UsersRound className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground m-0 leading-tight">Membership Management</h1>
                            <p className="text-xs text-muted-foreground mt-0.5 m-0 leading-snug">
                                Manage member accounts, track registrations, and handle member requests
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2.5 items-center">
                    <PermissionGate permission="create members">
                        <Button asChild className="bg-primary text-primary-foreground border-0 px-5 py-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md">
                            <Link href={route('membership.add')}>
                                <UsersRound className="h-4 w-4 mr-2" />
                                Add Member
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="generate membership report">
                        <Button asChild variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-md">
                            <Link href={route('membership.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            <StatsOverview memberStats={memberStats} />
        </div>
    );
};
