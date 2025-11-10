import { NavFooter } from '@/components/shared/layout/nav-footer';
import { NavMain } from '@/components/shared/layout/nav-main';
import { NavUser } from '@/components/shared/layout/nav-user';
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
  TrendingUp,
  LineChart,
} from 'lucide-react';
import AppLogo from '@/components/shared/layout/app-logo';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslation } from '@/hooks/use-translation';

export function AppSidebar() {
  const { can } = usePermissions();
  const t = useTranslation();

  // Define the main navigation items based on permissions
  const mainNavItems: NavItem[] = [];

  // Dashboard is always available
  mainNavItems.push({
    title: t('admin.dashboard'),
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  });

  // Inventory - check for any inventory-related permission
  if (can('view inventory') || can('create products') || can('edit products') || 
      can('view archive') || can('view stocks') || can('create stocks') || 
      can('edit stocks') || can('view sold stock') || can('view stock trail')) {
    mainNavItems.push({
      title: t('admin.inventory'),
      href: '/admin/inventory',
      icon: Package,
    });
  }

  // Orders - check for order-related permissions
          if (can('view orders') || can('manage orders') || 
      can('generate order report')) {
    mainNavItems.push({
      title: t('admin.orders'),
      href: '/admin/orders',
      icon: ClipboardPen,
    });
  }

  // Sales - check for sales-related permissions
  if (can('view sales') || can('generate sales report')) {
    mainNavItems.push({
      title: t('admin.sales'),
      href: '/admin/sales',
      icon: TrendingUp,
    });
  }

  // Trend Analysis - requires inventory view
  if (can('view inventory')) {
    mainNavItems.push({
      title: t('admin.trends'),
      href: '/admin/trends',
      icon: LineChart,
    });
  }

  // Membership - check for membership-related permissions
  if (can('view membership') || can('create members') || can('edit members') || 
      can('delete members') || can('generate membership report')) {
    mainNavItems.push({
      title: t('admin.members'),
      href: '/admin/membership',
      icon: UsersRound,
    });
  }

  // Logistics - check for logistics-related permissions
  if (can('view logistics') || can('create logistics') || can('edit logistics') || 
      can('generate logistics report')) {
    mainNavItems.push({
      title: t('admin.logistics'),
      href: '/admin/logistics',
      icon: IdCard,
    });
  }

  // Staff - check for staff management permissions
  if (can('view staffs') || can('create staffs') || can('edit staffs') || 
      can('delete staffs')) {
    mainNavItems.push({
      title: t('admin.staff'),
      href: '/admin/staff',
      icon: UsersRound,
    });
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard" prefetch>
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
