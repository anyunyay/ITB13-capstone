import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const { props } = usePage<{ auth?: { user?: { type?: string } } }>();

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
        post(route('login'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Customer Login" description="Welcome back! Sign in to your customer account">
            <Head title="Customer Login" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Customer Access</h2>
                <p className="text-sm text-gray-600">Shop and manage your orders</p>
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
                        <Input
                            id="password"
                            type="password"
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

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2">Don't have an account?</p>
                    <p>
                        <TextLink href={route('register')} tabIndex={5}>
                            Sign up
                        </TextLink>
                        {' '}or access other portals:{' '}
                        <TextLink href={route('admin.login')} tabIndex={5}>
                            Admin
                        </TextLink>
                        ,{' '}
                        <TextLink href={route('member.login')} tabIndex={5}>
                            Member
                        </TextLink>
                        ,{' '}
                        <TextLink href={route('logistic.login')} tabIndex={5}>
                            Logistics
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
    );
}
