import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, ShoppingBasket, Apple, BookUser, Carrot, Bell, History} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { SearchBar } from './search-bar';

const mainNavItems: NavItem[] = [
    {
        title: 'Fruits',
        href: '/customer/fruits',
        icon: Apple,
    },
    {
        title: 'Vegetables',
        href: '/customer/vegetables',
        icon: Carrot,
    },
    {
        title: 'About Us',
        href: '/customer/about',
        icon: BookUser,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Cart',
        href: '/customer/cart',
        icon: ShoppingBasket,
    },
    {
        title: 'Notifications',
        href: '/',
        icon: Bell,
    },
    {
        title: 'Order History',
        href: '/customer/orders/history',
        icon: History,
    },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData & { cart?: Record<string, any>, customerNotifications?: Array<any> }>();
    const { auth, cart = {}, customerNotifications = [] } = page.props;
    const getInitials = useInitials();
    const cartCount = Object.values(cart).reduce((sum, item: any) => sum + (item.quantity || 0), 0);
    const unreadCount = customerNotifications.length;

    const handleNotificationClick = (n: any) => {
        if (!n.read_at) {
            router.post('/customer/notifications/mark-read', { ids: [n.id] }, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(`/customer/orders/history#order-${n.order_id}`);
                },
            });
        } else {
            router.visit(`/customer/orders/history#order-${n.order_id}`);
        }
    };

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {/* Search Bar for Mobile */}
                                            <div className="mb-4">
                                                <SearchBar />
                                            </div>
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                            {rightNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && (
                                                        <span className="relative">
                                                            <Icon iconNode={item.icon} className="h-5 w-5" />
                                                            {item.title === 'Cart' && cartCount > 0 && (
                                                                <span className="absolute -top-2 -right-2">
                                                                    <Badge className="bg-red-500 text-white px-1.5 py-0.5 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                                        {cartCount}
                                                                    </Badge>
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {/* For Footer Links */}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link href='/' className="flex items-center space-x-2">
                            <AppLogo />{/* change Logo as needed */}
                        </Link>
                        {/* Breadcrumbs on top left */}
                        {breadcrumbs.length > 0 && (
                            <div className="hidden lg:block">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url === item.href && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {page.url === item.href && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <SearchBar />
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    item.title === 'Notifications' ? (
                                        <DropdownMenu key={item.title}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                                    <Bell className="size-5 opacity-80 group-hover:opacity-100" />
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-2 -right-2">
                                                            <Badge className="bg-red-500 text-white px-1.5 py-0.5 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                                {unreadCount}
                                                            </Badge>
                                                        </span>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                                                <div className="p-2 font-semibold border-b">Notifications</div>
                                                {unreadCount === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">No new notifications</div>
                                                ) : (
                                                    customerNotifications.slice(0, 10).map((n: any) => (
                                                        <div key={n.id} className={`p-2 border-b last:border-b-0 cursor-pointer transition hover:bg-blue-50 border-l-4
                                                            ${n.status === 'approved' 
                                                                ? 'bg-emerald-100 border-emerald-400 text-emerald-900' 
                                                                : 'bg-rose-100 border-rose-400 text-rose-900'
                                                            }`}
                                                            onClick={() => handleNotificationClick(n)}
                                                        >
                                                            <div className="font-medium text-sm mb-1">Order #{n.order_id}</div>
                                                            <div className="text-xs">{n.message}</div>
                                                            <div className="text-xs text-gray-400 mt-1">{n.created_at && (new Date(n.created_at)).toLocaleString()}</div>
                                                        </div>
                                                    ))
                                                )}
                                                <div className="p-2 text-center border-t">
                                                    <Link href="/customer/notifications" className="text-blue-600 text-xs hover:underline">View all notifications</Link>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <TooltipProvider key={item.title} delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={item.href}
                                                        className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                    >
                                                        <span className="sr-only">{item.title}</span>
                                                        {item.icon && (
                                                            <span className="relative">
                                                                <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />
                                                                {item.title === 'Cart' && cartCount > 0 && (
                                                                    <span className="absolute -top-2 -right-2">
                                                                        <Badge className="bg-red-500 text-white px-1.5 py-0.5 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                                            {cartCount}
                                                                        </Badge>
                                                                    </span>
                                                                )}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{item.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                ))}
                            </div>
                        </div>
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar || ''} alt={auth.user.name || 'User'} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user && auth.user.name ? auth.user.name : '')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="ml-2"
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="outline"
                                    className="ml-2"
                                    onClick={() => window.location.href = '/register'}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
