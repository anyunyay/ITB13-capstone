import AppHeaderLayout from '@/layouts/app/app-header-layout';
import Heading from '@/components/heading';
import { UserInfo } from '@/components/user-info';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import type { SharedData } from '@/types';

export default function CustomerProfile() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    return (
        <AppHeaderLayout>
            <Head title="Profile" />
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <Heading title="Your Profile" description="View your account information." />
                {auth.user && <UserInfo user={auth.user} showEmail />}
            </div>
        </AppHeaderLayout>
    );
} 