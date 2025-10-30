import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, MapPin, Lock, Palette, HelpCircle, User as UserIcon, Database } from 'lucide-react';
import { clearSessionData } from '@/lib/csrf-cleanup';
import { useTranslation } from '@/hooks/use-translation';

interface AvatarDropdownProps {
    user: User;
}

export function AvatarDropdown({ user }: AvatarDropdownProps) {
    const cleanup = useMobileNavigation();
    const t = useTranslation();

    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            profile: `${baseRoute}/profile/info`,
            addresses: `${baseRoute}/profile/addresses`,
            password: `${baseRoute}/profile/password`,
            appearance: `${baseRoute}/profile/appearance`,
            help: `${baseRoute}/profile/help`,
        };
    };

    const routes = getProfileRoutes();

    const handleLogout = () => {
        cleanup();
        // Clear all session data including CSRF tokens
        clearSessionData();
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
                            <Link className="block w-full" href={routes.profile} as="button" prefetch onClick={cleanup}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                {t('admin.profile')}
                            </Link>
                        </DropdownMenuItem>
                        {(user.type === 'admin' || user.type === 'staff') && (
                            <DropdownMenuItem asChild>
                                <Link className="block w-full" href="/admin/system-logs" as="button" prefetch onClick={cleanup}>
                                    <Database className="mr-2 h-4 w-4" />
                                    System Logs
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {user.type === 'customer' && (
                            <DropdownMenuItem asChild>
                                <Link className="block w-full" href={routes.addresses} as="button" prefetch onClick={cleanup}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Add/Edit Address
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link className="block w-full" href={routes.password} as="button" prefetch onClick={cleanup}>
                                <Lock className="mr-2 h-4 w-4" />
                                Change Password
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link className="block w-full" href={routes.appearance} as="button" prefetch onClick={cleanup}>
                                <Palette className="mr-2 h-4 w-4" />
                                Appearance
                            </Link>
                        </DropdownMenuItem>
                        {user.type === 'customer' && (
                            <DropdownMenuItem asChild>
                                <Link className="block w-full" href={routes.help} as="button" prefetch onClick={cleanup}>
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Help
                                </Link>
                            </DropdownMenuItem>
                        )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('admin.logout')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
