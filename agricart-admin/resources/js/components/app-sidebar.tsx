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
import { type NavItem } from '@/types';
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
  const { props } = usePage();

  // Define the expected shape for permissions
  type Permissions = {
    manageUsers?: boolean;
    [key: string]: unknown;
  };
  // Type assertion for props
  const permissions = (props.permissions ?? {}) as Permissions;
  const canManageUsers = permissions.manageUsers ?? false;

  // Define items normally
  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Inventory',
      href: '/inventory',
      icon: Package,
    },
    {
      title: 'Orders',
      href: '/orders',
      icon: ClipboardPen,
    },
    {
      title: 'Logistics',
      href: '/logistics',
      icon: IdCard,
    },
  ];

  // Conditionally push Membership after
  if (canManageUsers) {
    mainNavItems.splice(3, 0, {
      title: 'Membership',
      href: '/membership',
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
