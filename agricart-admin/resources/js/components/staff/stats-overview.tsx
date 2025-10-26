import { UsersRound, UserPlus, UserMinus, Shield, Clock } from 'lucide-react';
import { StaffStats } from '../../types/staff';

interface StatsOverviewProps {
    staffStats: StaffStats;
}

export const StatsOverview = ({ staffStats }: StatsOverviewProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <UsersRound className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{staffStats.totalStaff}</div>
                    <div className="text-sm text-muted-foreground mt-2">Total Staff</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{staffStats.activeStaff}</div>
                    <div className="text-sm text-muted-foreground mt-2">Active Staff</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{staffStats.inactiveStaff}</div>
                    <div className="text-sm text-muted-foreground mt-2">Inactive Staff</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{staffStats.totalPermissions}</div>
                    <div className="text-sm text-muted-foreground mt-2">Total Permissions</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary">
                <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2.5 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{staffStats.recentStaff}</div>
                    <div className="text-sm text-muted-foreground mt-2">Recent Additions</div>
                </div>
            </div>
        </div>
    );
};
