import { Breadcrumbs } from '@/components/shared/layout/breadcrumbs';
import { Icon } from '@/components/common/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AvatarDropdown } from '@/components/shared/layout/avatar-dropdown';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, ShoppingBasket, Apple, BookUser, Carrot, Bell, History} from 'lucide-react';
import AppLogo from '@/components/shared/layout/app-logo';
import AppLogoIcon from '@/components/shared/layout/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { SearchBar } from '@/components/common/forms/search-bar';
import { NotificationBell } from '@/components/shared/notifications/NotificationBell';
import { LoginModal } from '@/components/shared/auth/LoginModal';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

const activeItemStyles = 'text-white dark:bg-green-600 dark:text-white';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function CustomerHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const t = useTranslation();
    const page = usePage<SharedData & { cart?: Record<string, any>, notifications?: Array<any> }>();
    const { auth, cart = {}, notifications = [] } = page.props;
    const getInitials = useInitials();
    const cartCount = Object.keys(cart).length;
    const unreadCount = notifications.filter((n: any) => !n.read_at).length;
    const [isScrolled, setIsScrolled] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalConfig, setLoginModalConfig] = useState({ title: '', description: '' });

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 20);
        };

        const handleScrollSnap = (event: CustomEvent) => {
            const scrollTop = event.detail.scrollTop;
            setIsScrolled(scrollTop > 20);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll-snap', handleScrollSnap as EventListener);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll-snap', handleScrollSnap as EventListener);
        };
    }, []);
    const showSearchBar =
        page.url === '/' ||
        page.url.startsWith('/customer/') && !page.url.startsWith('/customer/produce');

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

    const handleProtectedNavigation = (href: string, itemKey: string) => {
        if (!auth?.user) {
            let description = '';
            if (itemKey === 'cart') {
                description = t('customer.login_required_cart');
            } else if (itemKey === 'order_history') {
                description = t('customer.login_required_orders');
            } else if (itemKey === 'notifications') {
                description = t('customer.login_required_notifications');
            }
            setLoginModalConfig({ title: t('customer.login_required'), description });
            setShowLoginModal(true);
        } else {
            router.visit(href);
        }
    };

    return (
        <>
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out mx-auto",
                isScrolled 
                    ? "bg-green-700 shadow-lg rounded-2xl mt-2 sm:mt-4 w-[95%] sm:w-[90%] lg:w-7/10 mx-auto" 
                    : "bg-transparent w-full mx-auto"
            )}>
                <div className={cn(
                    "mx-auto flex items-center px-2 sm:px-3 lg:px-4 md:max-w-7xl transition-all duration-300 ease-in-out mx-auto",
                    isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
                )}>
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn(
                                    "mr-1 sm:mr-2 transition-all duration-300 ease-in-out hover:bg-green-600 hover:text-white",
                                    isScrolled ? "h-[30px] w-[30px] sm:h-[34px] sm:w-[34px] text-white" : "h-[36px] w-[36px] sm:h-[42px] sm:w-[42px] text-green-600"
                                )}>
                                    <Menu className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        isScrolled ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"
                                    )} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 sm:w-72 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">{t('customer.navigation_menu')}</SheetTitle>
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
                                            <Link href="/customer/produce" className="flex items-center space-x-3 font-medium text-green-600 hover:text-green-700 py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                                <Icon iconNode={Apple} className="h-5 w-5" />
                                                <span>{t('customer.produce')}</span>
                                            </Link>
                                            <Link href="/customer/about" className="flex items-center space-x-3 font-medium text-green-600 hover:text-green-700 py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                                <Icon iconNode={BookUser} className="h-5 w-5" />
                                                <span>{t('customer.about_us')}</span>
                                            </Link>
                                            {/* Only show Order History in sidebar - Cart and Notifications are now in header */}
                                            <button 
                                                onClick={() => handleProtectedNavigation('/customer/orders/history', 'order_history')}
                                                className="flex items-center space-x-3 font-medium text-green-600 hover:text-green-700 py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors w-full text-left"
                                            >
                                                <Icon iconNode={History} className="h-5 w-5" />
                                                <span>{t('customer.order_history')}</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {/* For Footer Links */}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                        <Link href='/' className={cn(
                            "flex items-center space-x-2 transition-all duration-300 ease-in-out flex-shrink-0",
                            isScrolled ? "scale-90 sm:scale-100" : "scale-100 sm:scale-110"
                        )}>
                            <AppLogo isScrolled={isScrolled} />{/* change Logo as needed */}
                        </Link>
                        {/* Breadcrumbs on top left */}
                        {breadcrumbs.length > 0 && (
                            <div className="hidden lg:block min-w-0 flex-1">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <Link
                                        href="/customer/produce"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            page.url === '/customer/produce' && activeItemStyles,
                                            'cursor-pointer px-3 transition-all duration-300 ease-in-out',
                                            isScrolled 
                                                ? 'h-9 text-sm text-white hover:text-white hover:bg-green-600 bg-green-700' 
                                                : 'h-11 text-base bg-transparent hover:bg-green-600 hover:text-white text-green-600'
                                        )}
                                    >
                                        <Icon iconNode={Apple} className={cn(
                                            "mr-2 transition-all duration-300 ease-in-out",
                                            isScrolled ? "h-4 w-4 text-white" : "h-5 w-5"
                                        )} />
                                        {t('customer.produce')}
                                    </Link>
                                    {page.url === '/customer/produce' && (
                                        <div className={cn(
                                            "absolute bottom-0 left-0 h-0.5 w-full translate-y-px",
                                            isScrolled ? "bg-white" : "bg-black dark:bg-white"
                                        )}></div>
                                    )}
                                </NavigationMenuItem>
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <Link
                                        href="/customer/about"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            page.url === '/customer/about' && activeItemStyles,
                                            'cursor-pointer px-3 transition-all duration-300 ease-in-out',
                                            isScrolled 
                                                ? 'h-9 text-sm text-white hover:text-white hover:bg-green-600 bg-green-700' 
                                                : 'h-11 text-base bg-transparent hover:bg-green-600 hover:text-white text-green-600'
                                        )}
                                    >
                                        <Icon iconNode={BookUser} className={cn(
                                            "mr-2 transition-all duration-300 ease-in-out",
                                            isScrolled ? "h-4 w-4 text-white" : "h-5 w-5"
                                        )} />
                                        {t('customer.about_us')}
                                    </Link>
                                    {page.url === '/customer/about' && (
                                        <div className={cn(
                                            "absolute bottom-0 left-0 h-0.5 w-full translate-y-px",
                                            isScrolled ? "bg-white" : "bg-black dark:bg-white"
                                        )}></div>
                                    )}
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <div className="relative flex items-center space-x-1">
                            {showSearchBar && <SearchBar isScrolled={isScrolled} />}
                            
                            {/* Mobile Cart and Notification Icons */}
                            <div className="flex lg:hidden items-center space-x-1">
                                {/* Cart Icon for Mobile */}
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handleProtectedNavigation('/customer/cart', 'cart')}
                                                className={cn(
                                                    "group inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                    isScrolled 
                                                        ? "h-8 w-8 text-sm text-white hover:text-white hover:bg-green-600" 
                                                        : "h-9 w-9 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                )}
                                            >
                                                <span className="sr-only">Cart</span>
                                                <Icon iconNode={ShoppingBasket} className={cn(
                                                    "transition-all duration-300 ease-in-out",
                                                    isScrolled 
                                                        ? "size-4 text-white opacity-80 group-hover:opacity-100" 
                                                        : "size-5 opacity-80 group-hover:opacity-100"
                                                )} />
                                                {cartCount > 0 && (
                                                    <Badge 
                                                        variant="destructive" 
                                                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs z-10"
                                                    >
                                                        {cartCount > 9 ? '9+' : cartCount}
                                                    </Badge>
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cart</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Notification Icon for Mobile */}
                                {auth.user ? (
                                    <NotificationBell 
                                        notifications={notifications || []}
                                        userType={(auth.user as any)?.type || 'customer'}
                                        isScrolled={isScrolled}
                                    />
                                ) : (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleProtectedNavigation('/', 'notifications')}
                                                    className={cn(
                                                        "group inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                        isScrolled 
                                                            ? "h-8 w-8 text-sm text-white hover:text-white hover:bg-green-600" 
                                                            : "h-9 w-9 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                    )}
                                                >
                                                    <span className="sr-only">Notifications</span>
                                                    <Icon iconNode={Bell} className={cn(
                                                        "transition-all duration-300 ease-in-out",
                                                        isScrolled 
                                                            ? "size-4 text-white opacity-80 group-hover:opacity-100" 
                                                            : "size-5 opacity-80 group-hover:opacity-100"
                                                    )} />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Notifications</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            {/* Desktop Icons */}
                            <div className="hidden lg:flex">
                                {/* Cart */}
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handleProtectedNavigation('/customer/cart', 'cart')}
                                                className={cn(
                                                    "group ml-1 inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                    isScrolled 
                                                        ? "h-8 w-8 sm:h-9 sm:w-9 text-sm text-white hover:text-white hover:bg-green-600" 
                                                        : "h-9 w-9 sm:h-11 sm:w-11 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                )}
                                            >
                                                <span className="sr-only">{t('customer.cart')}</span>
                                                <Icon iconNode={ShoppingBasket} className={cn(
                                                    "transition-all duration-300 ease-in-out",
                                                    isScrolled 
                                                        ? "size-4 sm:size-5 text-white opacity-80 group-hover:opacity-100" 
                                                        : "size-5 sm:size-6 opacity-80 group-hover:opacity-100"
                                                )} />
                                                {cartCount > 0 && (
                                                    <Badge 
                                                        variant="destructive" 
                                                        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs z-10"
                                                    >
                                                        {cartCount > 9 ? '9+' : cartCount}
                                                    </Badge>
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('customer.cart')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                
                                {/* Notifications */}
                                {auth.user ? (
                                    <NotificationBell 
                                        notifications={notifications || []}
                                        userType={(auth.user as any)?.type || 'customer'}
                                        isScrolled={isScrolled}
                                    />
                                ) : (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleProtectedNavigation('/', 'notifications')}
                                                    className={cn(
                                                        "group ml-1 inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                        isScrolled 
                                                            ? "h-8 w-8 sm:h-9 sm:w-9 text-sm text-white hover:text-white hover:bg-green-600" 
                                                            : "h-9 w-9 sm:h-11 sm:w-11 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                    )}
                                                >
                                                    <span className="sr-only">{t('customer.notifications')}</span>
                                                    <Icon iconNode={Bell} className={cn(
                                                        "transition-all duration-300 ease-in-out",
                                                        isScrolled 
                                                            ? "size-4 sm:size-5 text-white opacity-80 group-hover:opacity-100" 
                                                            : "size-5 sm:size-6 opacity-80 group-hover:opacity-100"
                                                    )} />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('customer.notifications')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                
                                {/* Order History */}
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handleProtectedNavigation('/customer/orders/history', 'order_history')}
                                                className={cn(
                                                    "group ml-1 inline-flex items-center justify-center rounded-md bg-transparent p-0 font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
                                                    isScrolled 
                                                        ? "h-8 w-8 sm:h-9 sm:w-9 text-sm text-white hover:text-white hover:bg-green-600" 
                                                        : "h-9 w-9 sm:h-11 sm:w-11 text-base text-green-600 hover:bg-green-600 hover:text-white"
                                                )}
                                            >
                                                <span className="sr-only">{t('customer.order_history')}</span>
                                                <Icon iconNode={History} className={cn(
                                                    "transition-all duration-300 ease-in-out",
                                                    isScrolled 
                                                        ? "size-4 sm:size-5 text-white opacity-80 group-hover:opacity-100" 
                                                        : "size-5 sm:size-6 opacity-80 group-hover:opacity-100"
                                                )} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('customer.order_history')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={cn(
                                        "rounded-full p-1 transition-all duration-300 ease-in-out",
                                        isScrolled 
                                            ? "size-9 sm:size-10 text-white hover:text-white hover:bg-green-600" 
                                            : "size-10 sm:size-12 hover:bg-green-600 hover:text-white text-green-600"
                                    )}>
                                        <Avatar className={cn(
                                            "overflow-hidden rounded-full transition-all duration-300 ease-in-out",
                                            isScrolled ? "size-7 sm:size-8" : "size-8 sm:size-10"
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
                            <div className="flex space-x-1 sm:space-x-2">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "transition-all duration-300 ease-in-out bg-transparent",
                                        isScrolled 
                                            ? "h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm border-green-600 text-white hover:bg-green-600 hover:text-white" 
                                            : "h-9 px-3 sm:h-11 sm:px-4 text-sm sm:text-base border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    )}
                                    onClick={() => window.location.href = '/login'}
                                >
                                    {t('customer.login')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "transition-all duration-300 ease-in-out bg-transparent",
                                        isScrolled 
                                            ? "h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm border-green-600 text-white hover:bg-green-600 hover:text-white" 
                                            : "h-9 px-3 sm:h-11 sm:px-4 text-sm sm:text-base border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    )}
                                    onClick={() => window.location.href = '/register'}
                                >
                                    {t('customer.register')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title={loginModalConfig.title}
                description={loginModalConfig.description}
            />
        </>
    );
}
