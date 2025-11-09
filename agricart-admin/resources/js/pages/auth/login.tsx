import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, User } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/common/forms/input-error';
import TextLink from '@/components/common/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import LoginRestrictionPopup from '@/components/shared/auth/LoginRestrictionPopup';
import CountdownTimer from '@/components/common/feedback/CountdownTimer';
import { useLockoutStatus } from '@/hooks/useLockoutStatus';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    lockout?: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    restrictionPopup?: {
        userType: string;
        targetPortal: string;
    };
}

export default function Login({ status, canResetPassword, restrictionPopup }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const { props } = usePage<{ auth?: { user?: { type?: string } } }>();
    const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);
    
    // Lockout status management
    const { lockoutStatus, refreshLockoutStatus } = useLockoutStatus({
        identifier: data.email,
        userType: 'customer',
    });

    // Show restriction popup if needed
    useEffect(() => {
        if (restrictionPopup) {
            setShowRestrictionPopup(true);
        }
    }, [restrictionPopup]);

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <AuthLayout 
                title="Customer Login" 
                description="Welcome back! Sign in to your customer account"
                imageUrl="/images/frontpage/pexels-pixabay-265216.jpg"
                imagePosition="left"
                icon={<User />}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
            >
                <Head title="Customer Login" />

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
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
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
                        className="mt-4 w-full" 
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
                            'Log in'
                        )}
                    </Button>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                    <p className="mb-2">Don't have an account?</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-0">
                        <TextLink href={route('register')} tabIndex={5} className="font-medium">
                            Sign up
                        </TextLink>
                        <span className="hidden sm:inline">{' '}or access other portals:{' '}</span>
                        <span className="sm:hidden">Other portals:</span>
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-0">
                            <TextLink href={route('admin.login')} tabIndex={5} className="text-xs sm:text-sm">
                                Admin
                            </TextLink>
                            <span className="hidden sm:inline">,{' '}</span>
                            <TextLink href={route('member.login')} tabIndex={5} className="text-xs sm:text-sm">
                                Member
                            </TextLink>
                            <span className="hidden sm:inline">,{' '}</span>
                            <TextLink href={route('logistic.login')} tabIndex={5} className="text-xs sm:text-sm">
                                Logistics
                            </TextLink>
                        </div>
                    </div>
                </div>
            </form>

                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                
                {errors.email && (
                    <div className="mb-4 text-center text-sm font-medium text-red-600">
                        {errors.email}
                    </div>
                )}

                {lockoutStatus?.locked && (
                    <div className="mb-4 text-center text-sm font-medium text-red-600">
                        Account temporarily locked. You can try using{' '}
                        <TextLink href={route('password.request')} className="text-red-600 underline font-semibold">
                            forgot password
                        </TextLink>
                        {' '}or wait{' '}
                        <CountdownTimer 
                            lockExpiresAt={lockoutStatus.lock_expires_at}
                            serverTime={lockoutStatus.server_time}
                            className="text-black font-bold"
                        />
                        {' '}before trying again.
                    </div>
                )}
            </AuthLayout>

            {restrictionPopup && (
                <LoginRestrictionPopup
                    isOpen={showRestrictionPopup}
                    userType={restrictionPopup.userType}
                    targetPortal={restrictionPopup.targetPortal}
                />
            )}
        </>
    );
}
