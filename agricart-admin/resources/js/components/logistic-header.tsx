import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { User, Truck, Package, History, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';
import { NotificationBell } from './NotificationBell';

export function LogisticHeader() {
    const page = usePage<SharedData & { notifications?: Array<any> }>();
    const { auth, notifications = [] } = page.props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo and Navigation */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <Truck className="h-8 w-8 text-blue-400" />
                        <span className="text-xl font-bold text-white">Agricart Logistics</span>
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
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt={user?.name} />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'L'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-800 border-gray-600" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal text-white">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                                    <p className="text-xs leading-none text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <Link href="/settings/profile" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-300 hover:text-white hover:bg-gray-700">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}