import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router, usePage, Link } from '@inertiajs/react';
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
  X,
  ArrowLeft
} from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { PaginationControls } from '@/components/inventory/pagination-controls';

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
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      type: 'admin' | 'staff' | 'customer' | 'member' | 'logistic';
      [key: string]: any;
    };
  };
  [key: string]: any;
}

export default function AllNotificationsPage() {
  const page = usePage<AllNotificationsPageProps>();
  const { paginatedNotifications } = page.props;
  // CRITICAL: Always use auth.user from Inertia props, not a separate user prop
  // This ensures we're using the current authenticated user, not a stale/incorrect prop
  const currentUser = page.props.auth?.user;
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  // Local state to track read notifications for immediate UI updates
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(paginatedNotifications.data);
  
  // Get highlighted notification ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const highlightedNotificationId = urlParams.get('highlight_notification');
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Guard: Redirect if no authenticated user
  if (!currentUser) {
    router.visit('/login');
    return null;
  }
  
  const userType = currentUser.type;

  // Update local notifications when props change, but preserve local read states
  useEffect(() => {
    setLocalNotifications(prevLocal => {
      // Create a map of locally read notifications
      const localReadMap = new Map(
        prevLocal
          .filter(n => n.read_at)
          .map(n => [n.id, n.read_at])
      );
      
      // Merge server data with local read states
      return paginatedNotifications.data.map(serverNotif => {
        const localReadAt = localReadMap.get(serverNotif.id);
        // Use server's read_at if it exists, otherwise use local read_at
        return {
          ...serverNotif,
          read_at: serverNotif.read_at || localReadAt
        };
      });
    });
  }, [paginatedNotifications.data]);

  const notificationData = localNotifications;
  const currentPage = paginatedNotifications.current_page;
  const totalPages = paginatedNotifications.last_page;
  const perPage = paginatedNotifications.per_page;
  const totalItems = paginatedNotifications.total;

  // Scroll to and highlight notification if specified in URL
  useEffect(() => {
    if (highlightedNotificationId) {
      const element = notificationRefs.current[highlightedNotificationId];
      
      if (element) {
        // Scroll to the notification with smooth behavior
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // Remove highlight parameter from URL after 3 seconds
        setTimeout(() => {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('highlight_notification');
          window.history.replaceState({}, '', newUrl.toString());
        }, 3000);
      }
    }
  }, [highlightedNotificationId, notificationData]);

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handlePageChange = (page: number) => {
    // Clear selections when changing pages
    setSelectedNotifications([]);
    
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
    if (notificationIds.length === 0) return;
    
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
      onSuccess: () => {
        setSelectedNotifications([]);
      },
      onError: (errors) => {
        console.error('Error marking notifications as read:', errors);
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
      onSuccess: () => {
        setSelectedNotifications([]);
      },
      onError: (errors) => {
        console.error('Error marking all notifications as read:', errors);
      }
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    try {
      // Mark notification as read immediately in local state for instant UI feedback
      if (!notification.read_at) {
        setLocalNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        
        // Mark as read in the backend using Inertia
        const routePrefix = userType === 'admin' || userType === 'staff' 
          ? '/admin/notifications'
          : userType === 'member'
          ? '/member/notifications'
          : userType === 'logistic'
          ? '/logistic/notifications'
          : '/customer/notifications';
        
        // Use Inertia router to mark as read (this ensures proper state management)
        router.post(`${routePrefix}/mark-read`, 
          { ids: [notification.id] },
          {
            preserveState: true,
            preserveScroll: true,
            only: ['paginatedNotifications'], // Only reload notification data
            onError: (errors) => {
              console.error('Error marking notification as read:', errors);
              // Revert local state on error
              setLocalNotifications(prev => 
                prev.map(n => 
                  n.id === notification.id 
                    ? { ...n, read_at: undefined }
                    : n
                )
              );
            }
          }
        );
      }
      
      // Handle navigation based on user type and notification type
      if (userType === 'customer') {
        // For customer order-related notifications, navigate to order history with hash
        if (notification.data?.order_id && 
            ['order_confirmation', 'order_status_update', 'delivery_status_update', 'order_rejection'].includes(notification.type)) {
          router.visit(`/customer/orders/history?highlight_notification=${notification.id}#order-${notification.data.order_id}`);
        } else if (notification.action_url) {
          const separator = notification.action_url.includes('?') ? '&' : '?';
          router.visit(`${notification.action_url}${separator}highlight_notification=${notification.id}`);
        }
      } else if (userType === 'member') {
        // For member notifications, navigate to appropriate member pages
        if (notification.type === 'product_sale') {
          // For product sale, highlight the transaction if available
          const transactionId = notification.data?.audit_trail_id || notification.data?.transaction_id || notification.data?.id;
          const params = new URLSearchParams({ view: 'transactions' });
          if (transactionId) {
            params.append('highlight_transaction', transactionId);
          }
          router.visit(`/member/all-stocks?${params.toString()}`);
        } else if (notification.type === 'earnings_update') {
          // Navigate to dashboard for earnings updates
          router.visit(`/member/dashboard?highlight_notification=${notification.id}`);
        } else if (notification.type === 'low_stock_alert') {
          // For low stock alert, highlight the stock if available
          const stockId = notification.data?.stock_id;
          const productId = notification.data?.product_id;
          const category = notification.data?.stock_type || notification.data?.category;
          const params = new URLSearchParams({ view: 'stocks' });
          if (stockId) {
            params.append('highlight_stock', stockId);
          } else if (productId && category) {
            params.append('highlight_product', productId);
            params.append('highlight_category', category);
          }
          router.visit(`/member/all-stocks?${params.toString()}`);
        } else if (notification.type === 'stock_added') {
          // For stock added, highlight the specific stock/product
          const stockId = notification.data?.stock_id;
          const productId = notification.data?.product_id;
          const category = notification.data?.category;
          const params = new URLSearchParams({ view: 'stocks' });
          if (stockId) {
            params.append('highlight_stock', stockId);
          } else if (productId && category) {
            params.append('highlight_product', productId);
            params.append('highlight_category', category);
          }
          router.visit(`/member/all-stocks?${params.toString()}`);
        } else if (notification.action_url) {
          const separator = notification.action_url.includes('?') ? '&' : '?';
          router.visit(`${notification.action_url}${separator}highlight_notification=${notification.id}`);
        }
      } else if (userType === 'logistic') {
        // For logistic notifications, navigate to appropriate logistic pages
        if (notification.type === 'delivery_task') {
          router.visit(`/logistic/orders?highlight_notification=${notification.id}`);
        } else if (notification.type === 'order_status_update') {
          router.visit(`/logistic/orders?highlight_notification=${notification.id}`);
        } else if (notification.action_url) {
          const separator = notification.action_url.includes('?') ? '&' : '?';
          router.visit(`${notification.action_url}${separator}highlight_notification=${notification.id}`);
        }
      } else if (userType === 'admin' || userType === 'staff') {
        // For admin/staff notifications, navigate to appropriate admin pages
        if (notification.type === 'new_order' && notification.data?.order_id) {
          router.visit(`/admin/orders?highlight_order=${notification.data.order_id}&status=pending&highlight_notification=${notification.id}`);
        } else if (notification.type === 'inventory_update') {
          router.visit(`/admin/inventory?highlight_notification=${notification.id}`);
        } else if (notification.type === 'membership_update') {
          router.visit(`/admin/membership?highlight_notification=${notification.id}`);
        } else if (notification.type === 'password_change_request') {
          router.visit(`/admin/membership?highlight_notification=${notification.id}`);
        } else if (notification.action_url) {
          const separator = notification.action_url.includes('?') ? '&' : '?';
          router.visit(`${notification.action_url}${separator}highlight_notification=${notification.id}`);
        }
      } else if (notification.action_url) {
        // Fallback for other user types
        const separator = notification.action_url.includes('?') ? '&' : '?';
        router.visit(`${notification.action_url}${separator}highlight_notification=${notification.id}`);
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
      case 'stock_added':
        return <Package className="h-5 w-5 text-green-600" />;
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
      case 'stock_added':
        return 'Stock Added';
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
        return 'border-l-blue-500';
      case 'low_stock_alert':
      case 'order_rejection':
        return 'border-l-red-500';
      case 'product_sale':
      case 'earnings_update':
      case 'order_confirmation':
      case 'stock_added':
        return 'border-l-green-500';
      case 'inventory_update':
      case 'membership_update':
      case 'password_change_request':
        return 'border-l-orange-500';
      default:
        return 'border-l-primary';
    }
  };

  const unreadCount = notificationData.filter(n => !n.read_at).length;

  // Customer Design - Clean & Modern
  const customerContent = (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-base text-muted-foreground">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up. You have no unread notifications."}
          </p>
        </div>
        
        {(unreadCount > 0 || selectedNotifications.length > 0) && (
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {selectedNotifications.length > 0 && (
              <Button
                variant="outline"
                size="default"
                onClick={() => handleMarkAsRead()}
                className="h-12 px-6 text-base rounded-xl flex-1 sm:flex-initial"
              >
                <Check className="h-5 w-5 mr-2" />
                Mark Selected as Read
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="default"
                size="default"
                onClick={handleMarkAllAsRead}
                className="h-12 px-6 text-base rounded-xl bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
              >
                <CheckCheck className="h-5 w-5 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>
        )}
      </div>

      {notificationData.length === 0 ? (
        <Card className="border-2 shadow-xl rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-6 bg-muted/50 rounded-full mb-6">
              <Bell className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-3">No notifications</h3>
            <p className="text-base text-muted-foreground text-center max-w-md">
              You're all caught up! Check back later for new updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
            {notificationData.map((notification) => {
              // Determine if notification is clickable
              const isClickable = notification.action_url || 
                (notification.data?.order_id && 
                ['order_confirmation', 'order_status_update', 'delivery_status_update', 'order_rejection'].includes(notification.type));
              
              const isHighlighted = highlightedNotificationId === notification.id;
              
              return (
                <Card 
                  key={notification.id}
                  ref={(el) => {
                    if (el) {
                      notificationRefs.current[notification.id] = el;
                    }
                  }}
                  className={`border-l-4 border-2 rounded-2xl transition-all hover:shadow-xl group ${
                    !notification.read_at ? getNotificationColor(notification.type) : 'bg-white border-l-gray-300'
                  } ${
                    isClickable ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${
                    isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-50 bg-yellow-50 animate-pulse' : ''
                  }`}
                  onClick={() => {
                    // Only navigate if clickable
                    if (!isClickable) {
                      return;
                    }
                    
                    handleNotificationClick(notification);
                  }}
                >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                          {notification.type === 'order_status_update' && notification.data?.status === 'approved' 
                            ? 'Order Approved - Processing' 
                            : getNotificationTitle(notification.type)}
                        </h3>
                        {!notification.read_at && (
                          <Badge variant="secondary" className="text-xs bg-green-600 text-white px-2 py-0.5 shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-2 text-sm break-words leading-snug">
                        {notification.message}
                      </p>
                      {notification.data?.sub_message && (
                        <p className="text-xs text-gray-600 mb-2 break-words leading-snug">
                          {notification.data.sub_message}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
                        <p className="text-xs text-gray-500 font-medium">
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
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
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
  );

  // Admin/Staff/Logistic/Member Design - Professional & Compact
  const adminContent = (
    <div className="space-y-2">
      {(unreadCount > 0 || selectedNotifications.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {selectedNotifications.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
            </div>
          )}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
            {selectedNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead()}
                className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial min-w-0"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Mark Selected as Read</span>
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial min-w-0"
              >
                <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Mark All as Read</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {notificationData.length === 0 ? (
        <Card className="bg-card border border-border rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              You're all caught up! Check back later for new updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notificationData.map((notification) => {
            // Determine if notification is clickable based on user type and notification type
            const isClickable = notification.action_url || 
              (userType === 'customer' && notification.data?.order_id && 
                ['order_confirmation', 'order_status_update', 'delivery_status_update', 'order_rejection'].includes(notification.type)) ||
              (userType === 'member' && 
                ['product_sale', 'earnings_update', 'low_stock_alert', 'stock_added'].includes(notification.type)) ||
              (userType === 'logistic' && 
                ['delivery_task', 'order_status_update'].includes(notification.type)) ||
              ((userType === 'admin' || userType === 'staff') && 
                ['new_order', 'inventory_update', 'membership_update', 'password_change_request'].includes(notification.type));
            
            const isHighlighted = highlightedNotificationId === notification.id;
            
            return (
              <Card 
                key={notification.id}
                ref={(el) => {
                  if (el) {
                    notificationRefs.current[notification.id] = el;
                  }
                }}
                className={`bg-card border border-border rounded-xl shadow-sm transition-all duration-200 ${
                  !notification.read_at ? 'border-l-4 ' + getNotificationColor(notification.type) : 'border-l-4 border-l-border'
                } ${
                  isClickable ? 'cursor-pointer hover:shadow-md hover:bg-muted/30' : ''
                } ${
                  isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-50 bg-yellow-50 animate-pulse' : ''
                }`}
                onClick={(e) => {
                  // Don't trigger if clicking on checkbox
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
                    return;
                  }
                  
                  // Only navigate if clickable
                  if (!isClickable) {
                    return;
                  }
                  
                  handleNotificationClick(notification);
                }}
              >
              <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center gap-1.5 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {notification.type === 'order_status_update' && notification.data?.status === 'approved' 
                          ? 'Order Approved - Processing' 
                          : getNotificationTitle(notification.type)}
                      </h3>
                    </div>
                    
                    <p className="text-foreground mb-1 text-sm break-words leading-snug">
                      {notification.message}
                    </p>
                    {notification.data?.sub_message && (
                      <p className="text-xs text-muted-foreground mb-1 break-words leading-snug">
                        {notification.data.sub_message}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1.5 gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">
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
                            className="rounded border-border text-green-600 focus:ring-green-500 w-4 h-4"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
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
  );

  // Render with appropriate layout based on user type
  switch (userType) {
    case 'admin':
    case 'staff':
      return (
        <AppSidebarLayout>
          <div className="min-h-screen bg-background">
            <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                      <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                        All Notifications
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                        {unreadCount > 0 
                          ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                          : "You're all caught up. You have no unread notifications."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {adminContent}
            </div>
          </div>
        </AppSidebarLayout>
      );
    case 'customer':
      return (
        <AppHeaderLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
            <div className="mb-8">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    All Notifications
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    View and manage all your notifications
                  </p>
                </div>
                <Link href="/">
                  <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                    <ArrowLeft className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </Link>
              </div>
            </div>
            {customerContent}
          </div>
        </AppHeaderLayout>
      );
    case 'logistic':
      return (
        <LogisticLayout>
          <div className="min-h-screen bg-background">
            <div className="w-full flex flex-col gap-2 px-2 pt-22 py-2 lg:px-8 lg:pt-25">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                      All Notifications
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                      {unreadCount > 0 
                        ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                        : "You're all caught up. You have no unread notifications."}
                    </p>
                  </div>
                  <Link href="/logistic/dashboard">
                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                      <ArrowLeft className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Back to Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </div>
              {adminContent}
            </div>
          </div>
        </LogisticLayout>
      );
    case 'member':
      return (
        <MemberLayout>
          <div className="min-h-screen bg-background">
            <div className="w-full flex flex-col gap-2 px-2 pt-15 py-2 lg:px-8 lg:pt-17">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                      All Notifications
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                      {unreadCount > 0 
                        ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                        : "You're all caught up. You have no unread notifications."}
                    </p>
                  </div>
                  <Link href="/member/dashboard">
                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                      <ArrowLeft className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Back to Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </div>
              {adminContent}
            </div>
          </div>
        </MemberLayout>
      );
    default:
      return (
        <AppHeaderLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                All Notifications
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                View and manage all your notifications
              </p>
            </div>
            {customerContent}
          </div>
        </AppHeaderLayout>
      );
  }
}
