import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shield, User, Edit } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface ProfileHeaderProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
        avatar_url?: string;
        created_at?: string;
    };
    onEditClick: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
    const t = useTranslation();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getUserTypeLabel = (type: string) => {
        switch (type) {
            case 'admin':
                return t('admin.administrator');
            case 'staff':
                return t('staff.staff_member');
            case 'customer':
                return t('customer.customer');
            case 'logistic':
                return t('logistic.logistics');
            case 'member':
                return t('member.member');
            default:
                return t('ui.user');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('ui.not_available');
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
            <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-card/50 shadow-2xl ring-4 ring-border/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
                                <AvatarImage 
                                    src={user?.avatar_url || undefined} 
                                    alt={user?.name} 
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-muted to-muted/60 text-card-foreground font-bold">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full border-4 border-card shadow-lg flex items-center justify-center">
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                            </div>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">
                                {user?.name || 'No Name'}
                            </h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-secondary/10 text-secondary">
                                    <User className="h-3 w-3 mr-1" />
                                    {getUserTypeLabel(user?.type || '')}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {t('ui.member_since')} {formatDate(user?.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                        <Button
                            onClick={onEditClick}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                        >
                            <Edit className="h-4 w-4" />
                            {t('ui.edit_profile')}
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
