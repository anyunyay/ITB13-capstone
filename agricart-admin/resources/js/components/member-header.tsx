import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { User, Package, History, TrendingUp, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';

export function MemberHeader() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post(route('logout'));
    };

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt={user?.name} />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal text-white">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                                    <p className="text-xs leading-none text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                                <Link href={route('profile.edit')} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800">
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