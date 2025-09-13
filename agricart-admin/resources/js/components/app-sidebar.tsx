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
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';

export function AppSidebar() {
  const { can } = usePermissions();

  // Define the main navigation items based on permissions
  const mainNavItems: NavItem[] = [];

  // Dashboard is always available
  mainNavItems.push({
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  });

  // Inventory - check for any inventory-related permission
  if (can('view inventory') || can('create products') || can('edit products') || 
      can('view archive') || can('view stocks') || can('create stocks') || 
      can('edit stocks') || can('view sold stock') || can('view stock trail')) {
    mainNavItems.push({
      title: 'Inventory',
      href: '/admin/inventory',
      icon: Package,
    });
  }

  // Orders - check for order-related permissions
  if (can('view orders') || can('create orders') || can('edit orders') || 
      can('generate order report')) {
    mainNavItems.push({
      title: 'Orders',
      href: '/admin/orders',
      icon: ClipboardPen,
    });
  }

  // Sales - check for sales-related permissions
  if (can('view sales') || can('generate sales report')) {
    mainNavItems.push({
      title: 'Sales',
      href: '/admin/sales',
      icon: TrendingUp,
    });
  }

  // Operational Expenses - check for sales-related permissions
  if (can('view sales') || can('generate sales report')) {
    mainNavItems.push({
      title: 'Operational Expenses',
      href: '/admin/operational-expenses',
      icon: DollarSign,
    });
  }

  // Membership - check for membership-related permissions
  if (can('view membership') || can('create members') || can('edit members') || 
      can('delete members') || can('generate membership report')) {
    mainNavItems.push({
      title: 'Membership',
      href: '/admin/membership',
      icon: UsersRound,
    });
  }

  // Logistics - check for logistics-related permissions
  if (can('view logistics') || can('create logistics') || can('edit logistics') || 
      can('generate logistics report')) {
    mainNavItems.push({
      title: 'Logistics',
      href: '/admin/logistics',
      icon: IdCard,
    });
  }

  // Staff - check for staff management permissions
  if (can('view staffs') || can('create staffs') || can('edit staffs') || 
      can('delete staffs')) {
    mainNavItems.push({
      title: 'Staff',
      href: '/admin/staff',
      icon: UsersRound,
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
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
