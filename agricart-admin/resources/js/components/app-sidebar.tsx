import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  BookOpen,
  Folder,
  LayoutDashboard,
  Package,
  UsersRound,
  IdCard,
  ClipboardPen,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
  const { props } = usePage<SharedData>();

  // Extract permissions from props, providing defaults if not defined
  const {
    viewInventory: canViewInventory = false,
    viewOrders: canViewOrders = false,
    viewMembership: canViewMembership = false,
    viewLogistics: canViewLogistics = false,
  } = props.permissions || {};

  // Define the main navigation items based on permissions
  const mainNavItems: NavItem[] = [];

  if (true) {
    mainNavItems.push({
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    });
  }
  if (canViewInventory) {
    mainNavItems.push({
      title: 'Inventory',
      href: '/inventory',
      icon: Package,
    });
  }
  if (canViewOrders) {
    mainNavItems.push({
      title: 'Orders',
      href: '/orders',
      icon: ClipboardPen,
    });
  }
  if (canViewMembership) {
    mainNavItems.push({
      title: 'Membership',
      href: '/membership',
      icon: UsersRound,
    });
  }
  if (canViewLogistics) {
    mainNavItems.push({
      title: 'Logistics',
      href: '/logistics',
      icon: IdCard,
    });
  }

  const footerNavItems: NavItem[] = [
    {
      title: 'Repository',
      href: 'https://github.com/laravel/react-starter-kit',
      icon: Folder,
    },
    {
      title: 'Documentation',
      href: 'https://laravel.com/docs/starter-kits#react',
      icon: BookOpen,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
