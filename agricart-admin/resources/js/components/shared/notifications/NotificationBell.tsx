import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface NotificationBellProps {
  notifications: Notification[];
  userType: string;
  isScrolled?: boolean;
}

export function NotificationBell({ notifications, userType, isScrolled = false }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read_at).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    try {
      // Handle navigation based on user type and notification type
      if (userType === 'customer') {
        // For customer order-related notifications, navigate to order history with hash
        if (notification.data?.order_id && 
            ['order_confirmation', 'order_status_update', 'delivery_status_update'].includes(notification.type)) {
          const targetUrl = `/customer/orders/history#order-${notification.data.order_id}`;
          const currentPath = window.location.pathname;
          
          // Check if already on order history page to prevent glitching
          if (currentPath === '/customer/orders/history') {
            // Already on the page - just update hash smoothly without reload
            window.location.hash = `order-${notification.data.order_id}`;
            // Close the dropdown
            setIsOpen(false);
          } else {
            // Not on the page - navigate with Inertia
            router.visit(targetUrl, {
              preserveScroll: false,
              preserveState: false,
            });
          }
        } else if (notification.action_url) {
          router.visit(notification.action_url);
        }
      } else if (userType === 'member') {
        // For member notifications, navigate to appropriate member pages
        // Use action_url if available (includes highlight parameters)
        if (notification.action_url) {
          router.visit(notification.action_url);
        } else if (notification.type === 'product_sale') {
          router.visit('/member/all-stocks?view=transactions');
        } else if (notification.type === 'stock_added') {
          router.visit('/member/all-stocks?view=stocks');
        } else if (notification.type === 'earnings_update') {
          router.visit('/member/dashboard');
        } else if (notification.type === 'low_stock_alert') {
          router.visit('/member/all-stocks?view=stocks');
        }
      } else if (userType === 'logistic') {
        // For logistic notifications, navigate to specific order details
        if (notification.data?.order_id && 
            ['delivery_task', 'order_status_update', 'delivery_status_update', 'logistic_order_ready', 'logistic_order_picked_up'].includes(notification.type)) {
          router.visit(`/logistic/orders/${notification.data.order_id}`);
        } else if (notification.action_url) {
          router.visit(notification.action_url);
        }
      } else if (userType === 'admin' || userType === 'staff') {
        // For admin/staff notifications, navigate to appropriate admin pages
        if (notification.type === 'password_change_request') {
          router.visit('/admin/membership');
        } else if (notification.action_url) {
          router.visit(notification.action_url);
        }
      } else if (notification.action_url) {
        // Fallback for other user types
        router.visit(notification.action_url);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Fallback to action_url if available
      if (notification.action_url) {
        router.visit(notification.action_url);
      }
    }
  };

  const handleMarkAsRead = (notificationId: string, notification?: Notification) => {
    const routePrefix = userType === 'admin' || userType === 'staff' 
      ? '/admin/notifications'
      : userType === 'member'
      ? '/member/notifications'
      : userType === 'logistic'
      ? '/logistic/notifications'
      : '/customer/notifications';
    
    router.post(`${routePrefix}/mark-read`, {
      ids: [notificationId]
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Navigate after marking as read
        if (notification) {
          handleNotificationClick(notification);
        }
      }
    });
  };

  const handleMarkAllAsRead = () => {
    const routePrefix = userType === 'admin' || userType === 'staff' 
      ? '/admin/notifications'
      : userType === 'member'
      ? '/member/notifications'
      : userType === 'logistic'
      ? '/logistic/notifications'
      : '/customer/notifications';
    
    router.post(`${routePrefix}/mark-all-read`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleClearAll = () => {
    const routePrefix = userType === 'admin' || userType === 'staff' 
      ? '/admin/notifications'
      : userType === 'member'
      ? '/member/notifications'
      : userType === 'logistic'
      ? '/logistic/notifications'
      : '/customer/notifications';
    
    router.post(`${routePrefix}/hide-all-from-header`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDismissNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    const routePrefix = userType === 'admin' || userType === 'staff' 
      ? '/admin/notifications'
      : userType === 'member'
      ? '/member/notifications'
      : userType === 'logistic'
      ? '/logistic/notifications'
      : '/customer/notifications';
    
    router.post(`${routePrefix}/${notificationId}/hide-from-header`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSeeAll = () => {
    const routeName = userType === 'admin' || userType === 'staff' 
      ? '/admin/profile/notifications'
      : userType === 'member'
      ? '/member/profile/notifications'
      : userType === 'logistic'
      ? '/logistic/profile/notifications'
      : '/customer/profile/notifications';
    router.visit(routeName);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return '🛒';
      case 'inventory_update':
        return '📦';
      case 'membership_update':
        return '👥';
      case 'password_change_request':
        return '🔐';
      case 'product_sale':
        return '💰';
      case 'earnings_update':
        return '💵';
      case 'low_stock_alert':
        return '⚠️';
      case 'delivery_task':
        return '🚚';
      case 'logistic_order_ready':
        return '📦';
      case 'logistic_order_picked_up':
        return '🚛';
      case 'order_confirmation':
        return '✅';
      case 'order_status_update':
        return '📋';
      case 'delivery_status_update':
        return '🚛';
      case 'order_rejection':
        return '❌';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_confirmation':
      case 'order_status_update':
        return 'text-emerald-700 dark:text-emerald-200';
      case 'delivery_status_update':
      case 'delivery_task':
      case 'logistic_order_ready':
      case 'logistic_order_picked_up':
        return 'text-teal-700 dark:text-teal-200';
      case 'low_stock_alert':
      case 'order_rejection':
        return 'text-red-600 dark:text-red-300';
      case 'product_sale':
      case 'earnings_update':
        return 'text-amber-700 dark:text-amber-200';
      case 'inventory_update':
      case 'membership_update':
      case 'password_change_request':
        return 'text-blue-700 dark:text-blue-200';
      default:
        return 'text-foreground';
    }
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative transition-all duration-300 ease-in-out hover:bg-green-600 flex-shrink-0",
            isScrolled 
              ? "h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white" 
              : "h-9 w-9 sm:h-11 sm:w-11 text-green-600 hover:text-white"
          )}
        >
          {unreadCount > 0 ? (
            <BellRing className={cn(
              "transition-all duration-300 ease-in-out",
              isScrolled ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"
            )} />
          ) : (
            <Bell className={cn(
              "transition-all duration-300 ease-in-out",
              isScrolled ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"
            )} />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs z-10 bg-green-600"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 sm:w-80 max-w-[calc(100vw-2rem)]" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-green-600">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.slice(0, 4).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-3 cursor-pointer relative group transition-colors rounded-md",
                  !notification.read_at 
                    ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-50"
                    : "text-foreground",
                  "hover:bg-emerald-50/70 dark:hover:bg-emerald-500/25"
                )}
                onClick={() => {
                  if (!notification.read_at) {
                    // Mark as read and navigate in one action
                    handleMarkAsRead(notification.id, notification);
                  } else {
                    // Just navigate if already read
                    handleNotificationClick(notification);
                  }
                }}
              >
                <div className="flex items-start space-x-3 w-full pr-6">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium leading-snug",
                      notification.read_at 
                        ? "text-foreground dark:text-foreground"
                        : "",
                      getNotificationColor(notification.type)
                    )}>
                      {notification.message}
                    </p>
                    {notification.data?.sub_message && (
                      <p className="text-xs text-muted-foreground dark:text-emerald-100/80 mt-1">
                        {notification.data.sub_message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground dark:text-emerald-100/70 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  onClick={(e) => handleDismissNotification(e, notification.id)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSeeAll}
              className="text-center justify-center font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              See All
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
