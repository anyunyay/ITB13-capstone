import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AvatarDropdown } from '@/components/avatar-dropdown';
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
import { NotificationBell } from './NotificationBell';
import { useEffect, useState } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Produce',
        href: '/customer/produce',
        icon: Apple,
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

const activeItemStyles = 'text-white dark:bg-green-600 dark:text-white';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData & { cart?: Record<string, any>, notifications?: Array<any> }>();
    const { auth, cart = {}, notifications = [] } = page.props;
    const getInitials = useInitials();
    const cartCount = Object.keys(cart).length;
    const unreadCount = notifications.filter((n: any) => !n.read_at).length;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const showSearchBar =
        page.url === '/' ||
        page.url.startsWith('/customer/produce') ||
        page.url.startsWith('/customer/product');

    const handleNotificationClick = (n: any) => {
        const orderId = n.data?.order_id;
        if (!n.read_at) {
            router.post('/customer/notifications/mark-read', { ids: [n.id] }, {
                preserveScroll: true,
                onSuccess: () => {
                    if (orderId) {
                        router.visit(`/customer/orders/history#order-${orderId}`);
                    }
                },
            });
        } else {
            if (orderId) {
                router.visit(`/customer/orders/history#order-${orderId}`);
            }
        }
    };

    return (
        <>
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out mx-auto",
                isScrolled 
                    ? "bg-green-700 shadow-lg rounded-2xl mt-4 w-7/10 mx-auto" 
                    : "bg-transparent w-full mx-auto"
            )}>
                <div className={cn(
                    "mx-auto flex items-center px-4 md:max-w-7xl transition-all duration-300 ease-in-out mx-auto",
                    isScrolled ? "h-16" : "h-20"
                )}>
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn(
                                    "mr-2 transition-all duration-300 ease-in-out hover:bg-green-600 hover:text-white",
                                    isScrolled ? "h-[34px] w-[34px] text-white" : "h-[42px] w-[42px] text-green-600"
                                )}>
                                    <Menu className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        isScrolled ? "h-5 w-5" : "h-6 w-6"
                                    )} />
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
                                            {showSearchBar && (
                                                <div className="mb-4">
                                                    <SearchBar isScrolled={false} />
                                                </div>
                                            )}
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium text-green-600 hover:text-green-700">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                            {rightNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium text-green-600 hover:text-green-700">
                                                    {item.icon && (
                                                        <span className="relative">
                                                            <Icon iconNode={item.icon} className="h-5 w-5" />
                                                            {item.title === 'Cart' && cartCount > 0 && (
                                                                <span className="absolute -top-2 -right-2">
                                                                    <Badge className="bg-green-600 text-white px-1.5 py-0.5 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
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
                        <Link href='/' className={cn(
                            "flex items-center space-x-2 transition-all duration-300 ease-in-out",
                            isScrolled ? "scale-100" : "scale-110"
                        )}>
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
                                                'cursor-pointer px-3 transition-all duration-300 ease-in-out',
                                                isScrolled 
                                                    ? 'h-9 text-sm text-white hover:text-white hover:bg-green-600 bg-green-700' 
                                                    : 'h-11 text-base bg-transparent hover:bg-green-600 hover:text-white text-green-600'
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className={cn(
                                                "mr-2 transition-all duration-300 ease-in-out",
                                                isScrolled ? "h-4 w-4 text-white" : "h-5 w-5"
                                            )} />}
                                            {item.title}
                                        </Link>
                                        {page.url === item.href && (
                                            <div className={cn(
                                                "absolute bottom-0 left-0 h-0.5 w-full translate-y-px",
                                                isScrolled ? "bg-white" : "bg-black dark:bg-white"
                                            )}></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            {showSearchBar && <SearchBar isScrolled={isScrolled} />}
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    item.title === 'Notifications' && auth.user ? (
                                        <NotificationBell 
                                            key={item.title}
                                            notifications={notifications || []}
                                            userType={(auth.user as any)?.type || 'customer'}
                                            isScrolled={isScrolled}
                                        />
                                    ) : (
                                        <TooltipProvider key={item.title} delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "group ml-1 inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                isScrolled 
                                                    ? "h-9 w-9 text-sm text-white hover:text-white hover:bg-green-600" 
                                                    : "h-11 w-11 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                        )}
                                                    >
                                                        <span className="sr-only">{item.title}</span>
                                                        {item.icon && (
                                                            <>
                                                                <Icon iconNode={item.icon} className={cn(
                                                                    "transition-all duration-300 ease-in-out",
                                                                    isScrolled 
                                                                        ? "size-5 text-white opacity-80 group-hover:opacity-100" 
                                                                        : "size-6 opacity-80 group-hover:opacity-100"
                                                                )} />
                                                                {item.title === 'Cart' && cartCount > 0 && (
                                                                    <Badge 
                                                                        variant="destructive" 
                                                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs z-10"
                                                                    >
                                                                        {cartCount > 9 ? '9+' : cartCount}
                                                                    </Badge>
                                                                )}
                                                            </>
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
                                    <Button variant="ghost" className={cn(
                                        "rounded-full p-1 transition-all duration-300 ease-in-out",
                                        isScrolled 
                                            ? "size-10 text-white hover:text-white hover:bg-green-600" 
                                            : "size-12 hover:bg-green-600 hover:text-white text-green-600"
                                    )}>
                                        <Avatar className={cn(
                                            "overflow-hidden rounded-full transition-all duration-300 ease-in-out",
                                            isScrolled ? "size-8" : "size-10"
                                        )}>
                                            <AvatarImage src={(auth.user as any).avatar_url || ''} alt={auth.user.name || 'User'} />
                                            <AvatarFallback className="rounded-lg bg-green-100 text-green-600 dark:bg-green-700 dark:text-white">
                                                {getInitials(auth.user && auth.user.name ? auth.user.name : '')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <AvatarDropdown user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "ml-2 transition-all duration-300 ease-in-out bg-transparent",
                                        isScrolled 
                                            ? "h-9 px-3 text-sm border-green-600 text-white hover:bg-green-600 hover:text-white" 
                                            : "h-11 px-4 text-base border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    )}
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "ml-2 transition-all duration-300 ease-in-out bg-transparent",
                                        isScrolled 
                                            ? "h-9 px-3 text-sm border-green-600 text-white hover:bg-green-600 hover:text-white" 
                                            : "h-11 px-4 text-base border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    )}
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
