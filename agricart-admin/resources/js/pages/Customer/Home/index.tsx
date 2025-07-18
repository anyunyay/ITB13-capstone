import AppHeaderLayout from '@/layouts/app/app-header-layout';
import Heading from '@/components/heading';
import { UserInfo } from '@/components/user-info';
import { Head, usePage, router } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function CustomerHome() {
    let auth: SharedData['auth'] | undefined;
    try {
        // Defensive: usePage().props may not have auth
        const page = usePage<Partial<SharedData>>();
        auth = page?.props?.auth;
    } catch (e) {
        auth = undefined;
    }

    const handleProfileClick = () => {
        if (auth && auth.user) {
            router.visit('/customer/profile');
        } else {
            router.visit('/login');
        }
    };
    
    return (
        <AppHeaderLayout>
            <Head title="Home" />
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                {auth && auth.user ? (
                    <>
                        <Heading title={`Welcome, ${auth.user.name || 'Customer'}!`} description="This is your home page." />
                        <UserInfo user={auth.user} showEmail />
                        <button
                            className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
                            onClick={handleProfileClick}
                        >
                            Go to Profile
                        </button>
                    </>
                ) : auth ? (
                    <>
                        <Heading title="Welcome to AgriCart!" description="Sign in to access your profile and more features." />
                        <button
                            className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
                            onClick={handleProfileClick}
                        >
                            Login to View Profile
                        </button>
                    </>
                ) : (
                    <div className="text-red-600 text-center">
                        <Heading title="Something went wrong" description="Unable to load user information." />
                        <button
                            className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
                            onClick={() => router.visit('/login')}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}
