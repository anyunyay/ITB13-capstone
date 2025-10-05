import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Shield } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import LoginRestrictionPopup from '@/components/LoginRestrictionPopup';

type AdminLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface AdminLoginProps {
    status?: string;
    canResetPassword: boolean;
    restrictionPopup?: {
        userType: string;
        targetPortal: string;
    };
}

export default function AdminLogin({ status, canResetPassword, restrictionPopup }: AdminLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<AdminLoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const { props } = usePage<{ auth?: { user?: { type?: string } } }>();
    const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);

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
            >
                <Head title="Admin Login" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Administrative Access</h2>
                <p className="text-sm text-gray-600">Restricted area for authorized personnel only</p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
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
                        <Input
                            id="password"
                            type="password"
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

                    <Button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Access Admin Portal
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2">Need help? Contact your system administrator</p>
                    <p>
                        Regular user?{' '}
                        <TextLink href={route('login')} tabIndex={5}>
                            Customer Login
                        </TextLink>
                    </p>
                </div>
            </form>

                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                
                {errors.email && (
                    <div className="mb-4 text-center text-sm font-medium text-red-600">
                        {errors.email}
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
