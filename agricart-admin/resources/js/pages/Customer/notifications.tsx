import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
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

import { AdaptiveContainer } from '@/components/ui/adaptive-container';

export default function NotificationsPage({ notifications }: NotificationsPageProps) {
  const t = useTranslation();
  
  return (
    <AppHeaderLayout>
      <Head title={t('ui.notifications')} />
      <AdaptiveContainer className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-16 sm:mt-18 lg:mt-20 bg-background" enableScale={true}>
        <NotificationPage notifications={notifications} userType="customer" />
      </AdaptiveContainer>
    </AppHeaderLayout>
  );
} 