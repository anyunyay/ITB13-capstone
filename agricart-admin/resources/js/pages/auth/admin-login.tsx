import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Shield } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/common/forms/input-error';
import TextLink from '@/components/common/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import CountdownTimer from '@/components/common/feedback/CountdownTimer';
import { useLockoutStatus } from '@/hooks/useLockoutStatus';
import DeactivatedAccountModal from '@/components/shared/auth/DeactivatedAccountModal';
import DemoCredentials from '@/components/shared/auth/DemoCredentials';

type AdminLoginForm = {
    email: string;
    password: string;
    remember: boolean;
    lockout?: any;
};

interface AdminLoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function AdminLogin({ status, canResetPassword }: AdminLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<AdminLoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const { props } = usePage<{ auth?: { user?: { type?: string } } }>();
    const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
    
    // Lockout status management
    const { lockoutStatus, refreshLockoutStatus } = useLockoutStatus({
        identifier: data.email,
        userType: 'admin',
    });

    // If user is already authenticated and navigates back to login, redirect them
    useEffect(() => {
        const userType = props.auth?.user?.type;
        if (!userType) return;

        if (userType === 'admin' || userType === 'staff') {
            window.location.replace(route('admin.dashboard'));
        } else if (userType === 'customer') {
            window.location.replace(route('home'));
        } else if (userType === 'member') {
            window.location.replace(route('member.dashboard'));
        } else if (userType === 'logistic') {
            window.location.replace(route('logistic.dashboard'));
        }
    }, [props.auth?.user?.type]);

    // Refresh lockout status when errors change (after failed login)
    useEffect(() => {
        if (errors.email || errors.lockout) {
            refreshLockoutStatus();
        }
    }, [errors.email, errors.lockout, refreshLockoutStatus]);

    // Check for deactivated account error and show modal
    useEffect(() => {
        if (errors.email && errors.email.includes('deactivated')) {
            setShowDeactivatedModal(true);
        }
    }, [errors.email]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <AuthLayout 
                title="Admin Portal Access" 
                description="Enter your credentials to access the administrative dashboard"
                imageUrl="/images/frontpage/pexels-pixabay-265216.jpg"
                imagePosition="right"
                icon={<Shield />}
                iconBgColor="bg-secondary/10"
                iconColor="text-secondary"
            >
                <Head title="Admin Login" />

                {/* Demo Credentials */}
                <DemoCredentials />

            {/* Lockout Warning - Show prominently at the top */}
            {lockoutStatus?.locked && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">Account Temporarily Locked</h3>
                            <p className="mt-1">
                                Too many failed login attempts. Please wait{' '}
                                <span className="font-bold">
                                    <CountdownTimer
                                        lockExpiresAt={lockoutStatus.lock_expires_at}
                                        serverTime={lockoutStatus.server_time}
                                        className="text-red-800"
                                        onComplete={() => refreshLockoutStatus()}
                                    />
                                </span>
                                {' '}before trying again, or use{' '}
                                <TextLink href={route('password.request')} className="text-red-800 underline font-semibold">
                                    forgot password
                                </TextLink>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Failed Attempts Warning - Show when user has failed attempts but not locked yet */}
            {!lockoutStatus?.locked && lockoutStatus && lockoutStatus.failed_attempts > 0 && (
                <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">Login Attempt Warning</h3>
                            <p className="mt-1">
                                {lockoutStatus.failed_attempts === 1 && '1 failed login attempt detected. '}
                                {lockoutStatus.failed_attempts === 2 && '2 failed login attempts detected. One more failed attempt will lock your account. '}
                                {lockoutStatus.failed_attempts >= 3 && `${lockoutStatus.failed_attempts} failed login attempts detected. `}
                                Please ensure you're using the correct credentials.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={submit}>
                <div className="grid gap-4 sm:gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@example.com"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.email && !errors.email.includes('deactivated') ? errors.email : undefined} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700" 
                        tabIndex={4} 
                        disabled={processing || lockoutStatus?.locked}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {lockoutStatus?.locked ? (
                            <>
                                Try again in{' '}
                                <CountdownTimer 
                                    lockExpiresAt={lockoutStatus.lock_expires_at}
                                    serverTime={lockoutStatus.server_time}
                                    className="text-black font-bold"
                                />
                            </>
                        ) : (
                            'Access Admin Portal'
                        )}
                    </Button>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                    <p>Need help? Contact your system administrator</p>
                </div>
            </form>

                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            </AuthLayout>

            <DeactivatedAccountModal 
                isOpen={showDeactivatedModal} 
                onClose={() => {
                    setShowDeactivatedModal(false);
                    setData('password', '');
                }} 
            />
        </>
    );
}
