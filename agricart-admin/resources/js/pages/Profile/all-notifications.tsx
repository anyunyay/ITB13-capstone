import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Truck,
  CheckCircle,
  FileText,
  TruckIcon,
  X
} from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { PaginationControls } from '@/components/notifications/pagination-controls';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedNotifications {
  data: Notification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: PaginationLinks[];
}

interface AllNotificationsPageProps {
  paginatedNotifications: PaginatedNotifications;
  user: {
    type: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export default function AllNotificationsPage() {
  const { paginatedNotifications, user } = usePage<AllNotificationsPageProps>().props;
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const userType = user?.type || 'customer';

  const notificationData = paginatedNotifications.data;
  const currentPage = paginatedNotifications.current_page;
  const totalPages = paginatedNotifications.last_page;
  const perPage = paginatedNotifications.per_page;
  const totalItems = paginatedNotifications.total;

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unreadIds = notificationData.filter(n => !n.read_at).map(n => n.id);
    setSelectedNotifications(unreadIds);
  };

  const handlePageChange = (page: number) => {
    const routePrefix = userType === 'admin' || userType === 'staff' 
      ? '/admin/profile/notifications'
      : userType === 'member'
      ? '/member/profile/notifications'
      : userType === 'logistic'
      ? '/logistic/profile/notifications'
      : '/customer/profile/notifications';
    
    router.visit(`${routePrefix}?page=${page}`, {
      preserveState: true,
      preserveScroll: false,
    });
  };

  const handleMarkAsRead = (ids?: string[]) => {
    const notificationIds = ids || selectedNotifications;
    if (notificationIds.length > 0) {
      const routePrefix = userType === 'admin' || userType === 'staff' 
        ? '/admin/notifications'
        : userType === 'member'
        ? '/member/notifications'
        : userType === 'logistic'
        ? '/logistic/notifications'
        : '/customer/notifications';
      
      router.post(`${routePrefix}/mark-read`, {
        ids: notificationIds
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => setSelectedNotifications([])
      });
    }
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

  const handleNotificationClick = (notification: Notification) => {
    try {
      // Handle navigation based on user type and notification type
      if (userType === 'customer') {
        // For customer order-related notifications, navigate to order history with hash
        if (notification.data?.order_id && 
            ['order_confirmation', 'order_status_update', 'delivery_status_update', 'order_rejection'].includes(notification.type)) {
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
          router.visit('/member/available-stocks');
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
      } else if (userType === 'admin' || userType === 'staff') {
        // For admin/staff notifications, navigate to appropriate admin pages
        if (notification.type === 'new_order' && notification.data?.order_id) {
          router.visit(`/admin/orders?highlight_order=${notification.data.order_id}&status=pending`);
        } else if (notification.type === 'inventory_update') {
          router.visit('/admin/inventory');
        } else if (notification.type === 'membership_update') {
          router.visit('/admin/membership');
        } else if (notification.type === 'password_change_request') {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'inventory_update':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'membership_update':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'password_change_request':
        return <CheckCircle className="h-5 w-5 text-orange-600" />;
      case 'product_sale':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'earnings_update':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'low_stock_alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'delivery_task':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'order_confirmation':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'order_status_update':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'delivery_status_update':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'order_rejection':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'New Order';
      case 'inventory_update':
        return 'Inventory Update';
      case 'membership_update':
        return 'Membership Update';
      case 'password_change_request':
        return 'Password Change Request';
      case 'product_sale':
        return 'Product Sale';
      case 'earnings_update':
        return 'Earnings Update';
      case 'low_stock_alert':
        return 'Low Stock Alert';
      case 'delivery_task':
        return 'Delivery Task';
      case 'order_confirmation':
        return 'Order Confirmed';
      case 'order_status_update':
        return 'Order Status Update';
      case 'delivery_status_update':
        return 'Delivery Status Update';
      case 'order_rejection':
        return 'Order Declined';
      default:
        return 'Notification';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'delivery_task':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'low_stock_alert':
      case 'order_rejection':
        return 'border-l-red-500 bg-red-50/50';
      case 'product_sale':
      case 'earnings_update':
      case 'order_confirmation':
        return 'border-l-green-500 bg-green-50/50';
      case 'inventory_update':
      case 'membership_update':
      case 'password_change_request':
        return 'border-l-orange-500 bg-orange-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const unreadCount = notificationData.filter(n => !n.read_at).length;

  return (
    <ProfileWrapper title="All Notifications">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : "You're all caught up. You have no unread notifications."}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedNotifications.length === unreadCount}
                className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial min-w-0"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Select All</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead()}
                disabled={selectedNotifications.length === 0}
                className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial min-w-0"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Mark</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial min-w-0"
              >
                <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">All Read</span>
              </Button>
            </div>
          )}
        </div>

        {notificationData.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500 text-center">
                You're all caught up! Check back later for new updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notificationData.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 transition-all hover:shadow-md group ${
                  !notification.read_at ? getNotificationColor(notification.type) : 'bg-white border-l-gray-300'
                } ${
                  notification.action_url || 
                  (notification.data?.order_id && 
                  ['order_confirmation', 'order_status_update', 'delivery_status_update', 'order_rejection'].includes(notification.type))
                    ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={() => {
                  if (!notification.read_at) {
                    handleMarkAsRead([notification.id]);
                  }
                  handleNotificationClick(notification);
                }}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {notification.type === 'order_status_update' && notification.data?.status === 'approved' 
                            ? 'Order Approved - Processing' 
                            : getNotificationTitle(notification.type)}
                        </h3>
                        {!notification.read_at && (
                          <Badge variant="secondary" className="text-xs bg-green-600 text-white shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-2 text-sm sm:text-base break-words">
                        {notification.message}
                      </p>
                      {notification.data?.sub_message && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                          {notification.data.sub_message}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read_at && (
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 sm:w-5 sm:h-5"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={perPage}
            totalItems={totalItems}
          />
        )}
      </div>
    </ProfileWrapper>
  );
}
