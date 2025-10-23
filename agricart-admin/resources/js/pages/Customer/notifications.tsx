import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { NotificationPage } from '@/components/NotificationPage';

interface Notification {
  id: string;
  type: string;
  message: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  data: any;
}

interface NotificationsPageProps {
  notifications: Notification[];
}

export default function NotificationsPage({ notifications }: NotificationsPageProps) {
  return (
    <AppHeaderLayout>
      <Head title="Notifications" />
      <div className="max-w-4xl mx-auto p-4 mt-20 bg-background">
        <NotificationPage notifications={notifications} userType="customer" />
      </div>
    </AppHeaderLayout>
  );
} 