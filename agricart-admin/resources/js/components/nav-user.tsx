import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { AvatarDropdown } from '@/components/avatar-dropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

export function NavUser() {
    const page = usePage<SharedData & { notifications?: Array<any> }>();
    const { auth, notifications = [] } = page.props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    // Check if user is admin or staff
    const isAdminOrStaff = auth.user?.type === 'admin' || auth.user?.type === 'staff';

    return (
        <SidebarMenu>
            {/* Add notification bell for admin/staff users */}
            {isAdminOrStaff && (
                <SidebarMenuItem>
                    <div className="flex items-center justify-center">
                        <NotificationBell 
                            notifications={notifications}
                            userType={auth.user?.type || 'admin'}
                        />
                    </div>
                </SidebarMenuItem>
            )}
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <AvatarDropdown user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
