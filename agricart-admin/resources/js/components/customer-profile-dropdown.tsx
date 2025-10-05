import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, MapPin, Lock, Palette, HelpCircle, User as UserIcon } from 'lucide-react';

interface CustomerProfileDropdownProps {
    user: User;
}

export function CustomerProfileDropdown({ user }: CustomerProfileDropdownProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        // Clear login session storage when logging out
        const loginSessionId = sessionStorage.getItem('loginSessionId');
        if (loginSessionId) {
            sessionStorage.removeItem('loginSessionId');
            sessionStorage.removeItem(`urgentPopupShown_${loginSessionId}`);
            console.log('Cleared login session data on logout');
        }
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/customer/profile" as="button" prefetch onClick={cleanup}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/customer/profile/address" as="button" prefetch onClick={cleanup}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Add/Edit Address
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/customer/profile/password" as="button" prefetch onClick={cleanup}>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/customer/profile/appearance" as="button" prefetch onClick={cleanup}>
                        <Palette className="mr-2 h-4 w-4" />
                        Appearance
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/customer/profile/help" as="button" prefetch onClick={cleanup}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
