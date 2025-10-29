import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/hooks/useTranslation';
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface TranslatedLoginExampleProps {
    status?: string;
    canResetPassword: boolean;
}

/**
 * Example of how to apply translations to existing login form
 * Shows both manual translation and smart component usage
 */
export default function TranslatedLoginExample({ 
    status, 
    canResetPassword 
}: TranslatedLoginExampleProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    // Get translation functions
    const { t, auto, auth } = useTranslation();

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
                title={t('auth.login', 'Customer Login')} 
                description="Welcome back! Sign in to your customer account"
                imageUrl="/images/frontpage/pexels-pixabay-265216.jpg"
                imagePosition="left"
                icon={<User />}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
            >
                <Head title={auth.login()} />

                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-6">
                        {/* Email field with manual translation */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('common.email', 'Email address')}</Label>
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

                        {/* Password field with smart components */}
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <SmartLabel htmlFor="password">Password</SmartLabel>
                                {canResetPassword && (
                                    <TextLink 
                                        href={route('password.request')} 
                                        className="ml-auto text-sm" 
                                        tabIndex={5}
                                    >
                                        {auto('Forgot password?')}
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
                                placeholder={auth.password()}
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember me with auto translation */}
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                            />
                            <SmartLabel htmlFor="remember">Remember me</SmartLabel>
                        </div>

                        {/* Login button with smart component */}
                        <SmartButton 
                            type="submit" 
                            className="mt-4 w-full" 
                            tabIndex={4} 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log in
                        </SmartButton>
                    </div>

                    {/* Links with manual translation */}
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">{t('auth.no_account', "Don't have an account?")}</p>
                        <p>
                            <TextLink href={route('register')} tabIndex={5}>
                                {auto('Sign up')}
                            </TextLink>
                            {' '}or access other portals:{' '}
                            <TextLink href={route('admin.login')} tabIndex={5}>
                                Admin
                            </TextLink>
                            ,{' '}
                            <TextLink href={route('member.login')} tabIndex={5}>
                                {t('nav.members', 'Member')}
                            </TextLink>
                            ,{' '}
                            <TextLink href={route('logistic.login')} tabIndex={5}>
                                {t('nav.logistics', 'Logistics')}
                            </TextLink>
                        </p>
                    </div>
                </form>

                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
                
                {errors.email && (
                    <div className="mb-4 text-center text-sm font-medium text-red-600">
                        {errors.email}
                    </div>
                )}
            </AuthLayout>
        </>
    );
}