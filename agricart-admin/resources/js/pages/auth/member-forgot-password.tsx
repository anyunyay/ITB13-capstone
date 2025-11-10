import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Users } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/common/forms/input-error';
import TextLink from '@/components/common/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type MemberForgotPasswordForm = {
    member_id: string;
};

interface MemberForgotPasswordProps {
    status?: string;
}

export default function MemberForgotPassword({ status }: MemberForgotPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<MemberForgotPasswordForm>({
        member_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('member.password.request.store'), {
            onFinish: () => reset('member_id'),
        });
    };

    return (
        <AuthLayout 
            title="Member Password Reset" 
            description="Request a password change for your member account"
        >
            <Head title="Member Forgot Password" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Password Reset Request</h2>
                <p className="text-sm text-gray-600">Enter your Member ID to request a password change</p>
            </div>

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

                    <Button type="submit" className="mt-4 w-full bg-green-600 hover:bg-green-700" tabIndex={2} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Request Password Change
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2">Remember your password?</p>
                    <p>
                        <TextLink href={route('member.login')} tabIndex={3}>
                            Back to Member Login
                        </TextLink>
                    </p>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
