import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Settings, LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export interface ProfileTool {
    id: string;
    icon: LucideIcon;
    label: string;
    description: string;
    route: string;
    variant?: 'default' | 'destructive';
    iconColor?: string;
    hoverColor?: string;
}

interface ProfileToolsCardProps {
    userType: string;
    tools: ProfileTool[];
    title?: string;
    description?: string;
}

export function ProfileToolsCard({ userType, tools, title, description }: ProfileToolsCardProps) {
    const t = useTranslation();

    const getDefaultTitle = () => {
        if (userType === 'admin' || userType === 'staff') return t('ui.admin_tools');
        if (userType === 'customer') return t('ui.account_tools');
        if (userType === 'logistic') return t('ui.logistics_tools');
        if (userType === 'member') return t('ui.member_tools');
        return t('ui.profile_tools');
    };

    const getDefaultDescription = () => {
        if (userType === 'admin' || userType === 'staff') return t('ui.access_admin_features');
        if (userType === 'customer') return t('ui.manage_account_settings');
        if (userType === 'logistic') return t('ui.access_logistics_features');
        if (userType === 'member') return t('ui.access_member_features');
        return t('ui.manage_profile_settings');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                    </div>
                    {title || getDefaultTitle()}
                </CardTitle>
                <CardDescription>
                    {description || getDefaultDescription()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        const isDestructive = tool.variant === 'destructive';
                        
                        return (
                            <Button
                                key={tool.id}
                                variant="outline"
                                className={`h-auto p-3 sm:p-4 flex flex-col items-start gap-2 sm:gap-3 transition-all duration-200 ${
                                    isDestructive 
                                        ? 'hover:bg-destructive/5 hover:border-destructive/20' 
                                        : tool.hoverColor || 'hover:bg-primary/5 hover:border-primary/20'
                                }`}
                                onClick={() => router.visit(tool.route)}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                        tool.iconColor || (isDestructive ? 'text-destructive' : 'text-primary')
                                    }`} />
                                    <span className="text-sm sm:text-base font-medium">{tool.label}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground text-left">
                                    {tool.description}
                                </p>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
