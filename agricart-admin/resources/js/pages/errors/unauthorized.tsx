import { Head, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/hooks/use-translation';

export default function Unauthorized({ message }: { message?: string }) {
    const t = useTranslation();
    const defaultMessage = message || t('ui.not_authorized_message');
    
    return (
        <AuthLayout title={t('ui.access_denied')} description={t('ui.no_permission_message')}>
            <Head title={t('ui.unauthorized')} />

            <div className="mx-auto max-w-md text-center px-4">
                <div className="mb-4 sm:mb-6">
                    <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('ui.access_denied')}</h1>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 px-2">{defaultMessage}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <button className="w-full sm:w-auto rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 text-sm" onClick={() => window.history.back()}>
                        {t('ui.go_back')}
                    </button>
                    <Link href={route('home')} className="w-full sm:w-auto rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 text-sm text-center">
                        {t('ui.go_to_home')}
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}


