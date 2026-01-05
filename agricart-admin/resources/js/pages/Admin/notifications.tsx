import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { NotificationPage } from '@/components/shared/notifications/NotificationPage';
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

interface NotificationsPageProps {
  notifications: Notification[];
}

export default function NotificationsPage({ notifications }: NotificationsPageProps) {
  const t = useTranslation();
  
  return (
    <AppSidebarLayout>
      <Head title={t('admin.notifications')} />
      <NotificationPage notifications={notifications} userType="admin" />
    </AppSidebarLayout>
  );
}
