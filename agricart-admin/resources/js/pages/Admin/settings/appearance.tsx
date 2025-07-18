import { Head, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    return (
        <AppLayout>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
