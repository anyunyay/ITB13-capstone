import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Users } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import LoginRestrictionPopup from '@/components/LoginRestrictionPopup';
import CountdownTimer from '@/components/CountdownTimer';
import { useLockoutStatus } from '@/hooks/useLockoutStatus';

type MemberLoginForm = {
    member_id: string;
    password: string;
    remember: boolean;
};

interface MemberLoginProps {
    status?: string;
    canResetPassword: boolean;
    restrictionPopup?: {
        userType: string;
        targetPortal: string;
    };
}

export default function MemberLogin({ status, canResetPassword, restrictionPopup }: MemberLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<MemberLoginForm>>({
        member_id: '',
        password: '',
        remember: false,
    });

    const { props } = usePage<{ auth?: { user?: { type?: string } } }>();
    const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);
    
    // Lockout status management
    const { lockoutStatus, refreshLockoutStatus } = useLockoutStatus({
        identifier: data.member_id,
        userType: 'member',
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
        if (errors.member_id || errors.lockout) {
            refreshLockoutStatus();
        }
    }, [errors.member_id, errors.lockout, refreshLockoutStatus]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('member.login.store'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <AuthLayout 
                title="Member Portal Access" 
                description="Welcome back! Sign in to access your member benefits"
                imageUrl="/images/frontpage/pexels-pixabay-265216.jpg"
                imagePosition="left"
                icon={<Users />}
                iconBgColor="bg-accent/10"
                iconColor="text-accent"
            >
                <Head title="Member Login" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="member_id">Member ID</Label>
                        <Input
                            id="member_id"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.member_id}
                            onChange={(e) => setData('member_id', e.target.value)}
                            placeholder="2411001"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        <InputError message={errors.member_id} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('member.password.request')} className="ml-auto text-sm" tabIndex={5}>
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
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                        className="mt-4 w-full bg-green-600 hover:bg-green-700" 
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
                            'Access Member Portal'
                        )}
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2">New to our platform?</p>
                    <p>
                        <TextLink href={route('register')} tabIndex={5}>
                            Become a Member
                        </TextLink>
                        {' '}or{' '}
                        <TextLink href={route('login')} tabIndex={5}>
                            Customer Login
                        </TextLink>
                    </p>
                </div>
            </form>

                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                
                {errors.member_id && (
                    <div className="mb-4 text-center text-sm font-medium text-red-600">
                        {errors.member_id}
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
