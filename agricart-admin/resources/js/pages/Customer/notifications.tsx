import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';

interface Notification {
  id: string;
  order_id: number;
  status: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface NotificationsPageProps {
  notifications: Notification[];
}

export default function NotificationsPage({ notifications }: NotificationsPageProps) {
  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleNotificationClick = (n: Notification) => {
    if (!n.read_at) {
      router.post('/customer/notifications/mark-read', { ids: [n.id] }, {
        preserveScroll: true,
        onSuccess: () => {
          // Optionally, redirect to order details or order history
          router.visit(`/customer/orders/history#order-${n.order_id}`);
        },
      });
    } else {
      router.visit(`/customer/orders/history#order-${n.order_id}`);
    }
  };

  return (
    <AppHeaderLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No notifications found.</div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded flex flex-col gap-1 cursor-pointer transition hover:bg-blue-50 border-l-4
                  ${n.read_at
                    ? 'bg-gray-50 border-gray-200 text-gray-500'
                    : n.status === 'approved'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-400 text-rose-900'}
                `}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Order #{n.order_id}</span>
                  <Badge variant={n.status === 'approved' ? 'default' : 'destructive'}>{n.status === 'approved' ? 'Approved' : 'Declined'}</Badge>
                  {!n.read_at && <span className="ml-2 text-xs text-blue-600">Unread</span>}
                </div>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppHeaderLayout>
  );
} 