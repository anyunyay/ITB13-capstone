import { Head, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function Unauthorized({ message = 'You are not authorized to access this page.' }: { message?: string }) {
    return (
        <AuthLayout title="Access Denied" description="You don't have permission to view this page">
            <Head title="Unauthorized" />

            <div className="mx-auto max-w-md text-center">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900" onClick={() => window.history.back()}>
                        Go Back
                    </button>
                    <Link href={route('home')} className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
                        Go to Home
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}


