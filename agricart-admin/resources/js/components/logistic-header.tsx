import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Truck, User, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';
import { NotificationBell } from './NotificationBell';
import { AvatarDropdown } from '@/components/avatar-dropdown';

export function LogisticHeader() {
    const page = usePage<SharedData & { notifications?: Array<any> }>();
    const { auth, notifications = [] } = page.props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Logo and Navigation */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-foreground">Agricart Logistics</span>
                            <p className="text-xs text-muted-foreground">Delivery Management</p>
                        </div>
                    </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                    <NotificationBell 
                        notifications={notifications}
                        userType="logistic"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={(user as any)?.avatar_url || ''} alt={user?.name} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'L'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <AvatarDropdown user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}