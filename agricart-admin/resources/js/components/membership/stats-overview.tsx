import { UsersRound, UserPlus, UserMinus, Clock } from 'lucide-react';
import { MemberStats } from '../../types/membership';

interface StatsOverviewProps {
    memberStats: MemberStats;
}

export const StatsOverview = ({ memberStats }: StatsOverviewProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-primary/10 text-primary p-2.5 rounded-md flex items-center justify-center">
                    <UsersRound className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{memberStats.totalMembers}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Members</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-primary/10 text-primary p-2.5 rounded-md flex items-center justify-center">
                    <UserPlus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{memberStats.activeMembers}</div>
                    <div className="text-xs text-muted-foreground mt-1">Active Members</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-primary/10 text-primary p-2.5 rounded-md flex items-center justify-center">
                    <UserMinus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{memberStats.deactivatedMembers}</div>
                    <div className="text-xs text-muted-foreground mt-1">Deactivated</div>
                </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="bg-primary/10 text-primary p-2.5 rounded-md flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-xl font-bold text-foreground leading-none">{memberStats.pendingRequests}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pending Requests</div>
                </div>
            </div>
        </div>
    );
};
