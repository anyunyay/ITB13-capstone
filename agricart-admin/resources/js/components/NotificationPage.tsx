import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  ExternalLink,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Truck,
  CheckCircle,
  FileText,
  TruckIcon
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface NotificationPageProps {
  notifications: Notification[];
  userType: string;
}

export function NotificationPage({ notifications, userType }: NotificationPageProps) {
  const t = useTranslation();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    setSelectedNotifications(unreadIds);
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
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_order':
        return t('ui.new_order');
      case 'inventory_update':
        return t('ui.inventory_update');
      case 'membership_update':
        return t('ui.membership_update');
      case 'password_change_request':
        return t('ui.password_change_request');
      case 'product_sale':
        return t('ui.product_sale');
      case 'earnings_update':
        return t('ui.earnings_update');
      case 'low_stock_alert':
        return t('ui.low_stock_alert');
      case 'delivery_task':
        return t('ui.delivery_task');
      case 'order_confirmation':
        return t('ui.order_confirmed');
      case 'order_status_update':
        return t('ui.order_status_update');
      case 'delivery_status_update':
        return t('ui.delivery_status_update');
      default:
        return t('ui.notification');
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'delivery_task':
        return 'border-l-primary bg-primary/5';
      case 'low_stock_alert':
        return 'border-l-destructive bg-destructive/5';
      case 'product_sale':
      case 'earnings_update':
      case 'order_confirmation':
        return 'border-l-primary bg-primary/5';
      case 'inventory_update':
      case 'membership_update':
      case 'password_change_request':
        return 'border-l-secondary bg-secondary/5';
      default:
        return 'border-l-muted-foreground bg-muted';
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('ui.notifications')}</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? t('ui.unread_notifications_count', { count: unreadCount }) : t('ui.all_caught_up')}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedNotifications.length === unreadCount}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('ui.select_all_unread')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsRead()}
              disabled={selectedNotifications.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('ui.mark_selected_read')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {t('ui.mark_all_read')}
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('ui.no_notifications')}</h3>
            <p className="text-gray-500 text-center">
              {t('ui.all_caught_up_message')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-l-4 transition-all hover:shadow-md ${
                !notification.read_at ? getNotificationColor(notification.type) : 'bg-white'
              } ${
                (notification.data?.order_id && 
                ['order_confirmation', 'order_status_update', 'delivery_status_update'].includes(notification.type)) ||
                (userType === 'admin' || userType === 'staff') && notification.action_url
                  ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => {
                // Handle navigation based on user type and notification type
                if (userType === 'customer') {
                  // For customer order-related notifications, navigate to order history with hash
                  if (notification.data?.order_id && 
                      ['order_confirmation', 'order_status_update', 'delivery_status_update'].includes(notification.type)) {
                    router.visit(`/customer/orders/history#order-${notification.data.order_id}`);
                  }
                } else if (userType === 'admin' || userType === 'staff') {
                  // For admin/staff notifications, navigate to appropriate admin pages
                  if (notification.type === 'new_order' && notification.data?.order_id) {
                    // Navigate to orders index with the specific order highlighted
                    router.visit(`/admin/orders?highlight_order=${notification.data.order_id}&status=pending`);
                  } else if (notification.type === 'inventory_update') {
                    router.visit('/admin/inventory');
                  } else if (notification.type === 'membership_update') {
                    router.visit('/admin/membership');
                  } else if (notification.action_url) {
                    router.visit(notification.action_url);
                  }
                } else if (notification.action_url) {
                  // Fallback for other user types
                  router.visit(notification.action_url);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.type === 'order_status_update' && notification.data?.status === 'approved' 
                          ? t('ui.order_approved_processing') 
                          : getNotificationTitle(notification.type)}
                      </h3>
                      {!notification.read_at && (
                        <Badge variant="secondary" className="text-xs">
                          {t('ui.new')}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    {notification.data?.sub_message && (
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.data.sub_message}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        {notification.action_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Handle navigation based on user type and notification type
                              if (userType === 'customer') {
                                // For customer order-related notifications, navigate to order history with hash
                                if (notification.data?.order_id && 
                                    ['order_confirmation', 'order_status_update', 'delivery_status_update'].includes(notification.type)) {
                                  router.visit(`/customer/orders/history#order-${notification.data.order_id}`);
                                } else {
                                  router.visit(notification.action_url!);
                                }
                              } else if (userType === 'admin' || userType === 'staff') {
                                // For admin/staff notifications, navigate to appropriate admin pages
                                if (notification.type === 'new_order' && notification.data?.order_id) {
                                  // Navigate to orders index with the specific order highlighted
                                  router.visit(`/admin/orders?highlight_order=${notification.data.order_id}&status=pending`);
                                } else if (notification.type === 'inventory_update') {
                                  router.visit('/admin/inventory');
                                } else if (notification.type === 'membership_update') {
                                  router.visit('/admin/membership');
                                } else if (notification.action_url) {
                                  router.visit(notification.action_url);
                                }
                              } else if (notification.action_url) {
                                // Fallback for other user types
                                router.visit(notification.action_url);
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t('ui.view')}
                          </Button>
                        )}
                        
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead([notification.id])}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t('ui.mark_read')}
                          </Button>
                        )}
                        
                        {!notification.read_at && (
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="rounded border-gray-300"
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
    </div>
  );
}
