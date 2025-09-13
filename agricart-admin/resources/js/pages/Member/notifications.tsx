import { Head } from '@inertiajs/react';
import { MemberLayout } from '@/layouts/member-layout';
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
    <MemberLayout>
      <Head title="Notifications" />
      <NotificationPage notifications={notifications} userType="member" />
    </MemberLayout>
  );
}
