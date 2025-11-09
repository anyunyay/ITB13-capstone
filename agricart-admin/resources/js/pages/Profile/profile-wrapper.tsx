import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import ProfileLayout from '@/layouts/profile/profile-layout';
import type { PropsWithChildren } from 'react';

interface ProfileWrapperProps {
    children: React.ReactNode;
    breadcrumbs?: Array<{ title: string; href: string }>;
    title?: string;
}

export default function ProfileWrapper({ children, breadcrumbs = [], title }: ProfileWrapperProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

    if (!user) {
        return <div>Loading...</div>;
    }

    // Render ProfileLayout content
    const profileContent = (
        <ProfileLayout breadcrumbs={breadcrumbs} title={title}>
            {children}
        </ProfileLayout>
    );

    // Determine which layout to use based on user type
    switch (user.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout breadcrumbs={breadcrumbs}>
                    {profileContent}
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <CustomerHeaderLayout>
                    {profileContent}
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout breadcrumbs={breadcrumbs}>
                    {profileContent}
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout breadcrumbs={breadcrumbs}>
                    {profileContent}
                </MemberLayout>
            );
        default:
            return (
                <CustomerHeaderLayout>
                    {profileContent}
                </AppHeaderLayout>
            );
    }
}
