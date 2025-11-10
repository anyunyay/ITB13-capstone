import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/common/forms/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import PasswordValidation from '@/components/ui/password-validation';
import PasswordError from '@/components/ui/password-error';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/hooks/use-translation';

type ChangePasswordForm = {
    password: string;
    password_confirmation: string;
};

interface ChangePasswordProps {
    requestId: number;
    member: {
        id: number;
        name: string;
        member_id: string;
    };
}

export default function ChangePassword({ requestId, member }: ChangePasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ChangePasswordForm>({
        password: '',
        password_confirmation: '',
    });
    const t = useTranslation();

    // State to track if user is typing in password fields
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [isTypingPasswordConfirmation, setIsTypingPasswordConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('member.password.change', { requestId }), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setIsTypingPassword(false);
                setIsTypingPasswordConfirmation(false);
            },
        });
    };

    return (
        <AuthLayout 
            title={t('member.change_password')} 
            description={t('member.set_new_password')}
        >
            <Head title={t('member.change_password')} />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Lock className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('member.change_password')}</h2>
                <p className="text-sm text-gray-600">
                    {t('member.hello_member', { name: member.name, id: member.member_id })}
                </p>
                <p className="text-sm text-gray-500">
                    {t('member.enter_new_password')}
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('member.new_password')}</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={1}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => {
                                setData('password', e.target.value);
                                setIsTypingPassword(true);
                            }}
                            disabled={processing}
                            placeholder={t('member.enter_new_password_placeholder')}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        <PasswordError 
                            error={errors.password} 
                            showError={!isTypingPassword} 
                        />
                        <PasswordValidation password={data.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('member.confirm_new_password')}</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={2}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => {
                                setData('password_confirmation', e.target.value);
                                setIsTypingPasswordConfirmation(true);
                            }}
                            disabled={processing}
                            placeholder={t('member.confirm_new_password_placeholder')}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        <PasswordError 
                            error={errors.password_confirmation} 
                            showError={!isTypingPasswordConfirmation} 
                        />
                    </div>

                    <Button type="submit" className="mt-4 w-full bg-green-600 hover:bg-green-700" tabIndex={3} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('member.change_password')}
                    </Button>
                </div>

            </form>
        </AuthLayout>
    );
}
