import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Package } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { AvatarDropdown } from '@/components/avatar-dropdown';

export function MemberHeader() {
    const page = usePage<SharedData & { notifications?: Array<any> }>();
    const { auth, notifications = [] } = page.props;
    const user = auth?.user;


    return (
        <header className="bg-black border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo and Navigation */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-green-500" />
                        <span className="text-xl font-bold text-white">Agricart</span>
                    </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                    <NotificationBell 
                        notifications={notifications}
                        userType="member"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={(user as any)?.avatar_url || ''} alt={user?.name} />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'M'}
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