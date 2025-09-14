import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

export function NotificationBell({ notifications, userType }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read_at).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    try {
      // Handle navigation based on user type and notification type
      if (userType === 'customer') {
        // For customer order-related notifications, navigate to order history with hash
        if (notification.data?.order_id && 
            ['order_confirmation', 'order_status_update', 'delivery_status_update'].includes(notification.type)) {
          router.visit(`/customer/orders/history#order-${notification.data.order_id}`);
        } else if (notification.action_url) {
          router.visit(notification.action_url);
        }
      } else if (userType === 'member') {
        // For member notifications, navigate to appropriate member pages
        if (notification.type === 'product_sale') {
          router.visit('/member/sold-stocks');
        } else if (notification.type === 'earnings_update') {
          router.visit('/member/dashboard');
        } else if (notification.type === 'low_stock_alert') {
          // Navigate based on stock type (partial or available)
          if (notification.data?.stock_type === 'partial') {
            router.visit('/member/assigned-stocks');
          } else {
            router.visit('/member/available-stocks');
          }
        } else if (notification.action_url) {
          router.visit(notification.action_url);
        }
      } else if (userType === 'logistic') {
        // For logistic notifications, navigate to appropriate logistic pages
        if (notification.type === 'delivery_task') {
          router.visit('/logistic/orders');
        } else if (notification.type === 'order_status_update') {
          router.visit('/logistic/orders');
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return '🛒';
      case 'inventory_update':
        return '📦';
      case 'membership_update':
        return '👥';
      case 'product_sale':
        return '💰';
      case 'earnings_update':
        return '💵';
      case 'low_stock_alert':
        return '⚠️';
      case 'delivery_task':
        return '🚚';
      case 'order_confirmation':
        return '✅';
      case 'order_status_update':
        return '📋';
      case 'delivery_status_update':
        return '🚛';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'delivery_task':
        return 'text-blue-600';
      case 'low_stock_alert':
        return 'text-red-600';
      case 'product_sale':
      case 'earnings_update':
        return 'text-green-600';
      case 'inventory_update':
      case 'membership_update':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read_at ? 'bg-blue-50' : ''}`}
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
                <div className="flex items-start space-x-3 w-full">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                      {notification.message}
                    </p>
                    {notification.data?.sub_message && (
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.data.sub_message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const routeName = userType === 'admin' || userType === 'staff' 
                  ? 'admin.notifications.index'
                  : userType === 'member'
                  ? 'member.notifications.index'
                  : userType === 'logistic'
                  ? 'logistic.notifications.index'
                  : 'notifications.index';
                router.visit(route(routeName));
              }}
              className="text-center justify-center"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
