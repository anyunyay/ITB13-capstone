import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Truck } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LogisticLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LogisticLoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function LogisticLogin({ status, canResetPassword }: LogisticLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LogisticLoginForm>>({
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
        post(route('logistic.login'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Logistics Portal Access" 
            description="Sign in to manage deliveries and track shipments"
        >
            <Head title="Logistics Login" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <Truck className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Logistics Access</h2>
                <p className="text-sm text-gray-600">Manage deliveries and track shipments</p>
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
                            placeholder="logistic@example.com"
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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

                    <Button type="submit" className="mt-4 w-full bg-orange-600 hover:bg-orange-700" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Access Logistics Portal
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2">Need assistance? Contact logistics support</p>
                    <p>
                        Regular user?{' '}
                        <TextLink href={route('login')} tabIndex={5}>
                            Customer Login
                        </TextLink>
                    </p>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
