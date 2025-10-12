import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import PasswordValidation from '@/components/ui/password-validation';
import PasswordError from '@/components/ui/password-error';
import AuthLayout from '@/layouts/auth-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UpdateCredentialsForm = {
    email?: string;
    password: string;
    password_confirmation: string;
};

interface UpdateCredentialsProps {
    user: {
        id: number;
        name: string;
        email?: string;
        type: string;
    };
}

export default function UpdateCredentials({ user }: UpdateCredentialsProps) {
    const isMember = user.type === 'member';
    
    const { data, setData, post, processing, errors, reset } = useForm<UpdateCredentialsForm>({
        email: isMember ? undefined : '',
        password: '',
        password_confirmation: '',
    });

    // State to track if user is typing in password fields
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [isTypingPasswordConfirmation, setIsTypingPasswordConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('credentials.update'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setIsTypingPassword(false);
                setIsTypingPasswordConfirmation(false);
            },
        });
    };

    const getAlertMessage = () => {
        if (isMember) {
            return "This is a default member account. For security reasons, you must update your password before accessing the system.";
        }
        return "This is a default account. For security reasons, you must update your email and password before accessing the system.";
    };

    const getTitle = () => {
        if (isMember) {
            return "Update Your Password";
        }
        return "Update Your Credentials";
    };

    const getDescription = () => {
        if (isMember) {
            return "Please update your password to continue";
        }
        return "Please update your email and password to continue";
    };

    const getUserTypeDisplayName = (type: string) => {
        switch (type) {
            case 'admin':
                return 'Administrator';
            case 'staff':
                return 'Staff';
            case 'member':
                return 'Member';
            case 'logistic':
                return 'Logistic';
            case 'customer':
                return 'Customer';
            default:
                return type;
        }
    };

    return (
        <>
            <Head title="Update Credentials" />
            <AuthLayout 
                title={getTitle()}
                description={getDescription()}
            >
                <div className="space-y-6">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {getAlertMessage()}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Welcome, <strong>{user.name}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {getUserTypeDisplayName(user.type)} Account
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {!isMember && (
                                <div className="space-y-2">
                                    <Label htmlFor="email">New Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email || ''}
                                        className="mt-1 block w-full"
                                        autoComplete="email"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your new email address"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        setIsTypingPassword(true);
                                    }}
                                    required
                                />
                                <PasswordError 
                                    error={errors.password} 
                                    showError={!isTypingPassword} 
                                />
                                <PasswordValidation password={data.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => {
                                        setData('password_confirmation', e.target.value);
                                        setIsTypingPasswordConfirmation(true);
                                    }}
                                    required
                                />
                                <PasswordError 
                                    error={errors.password_confirmation} 
                                    showError={!isTypingPasswordConfirmation} 
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isMember ? 'Update Password' : 'Update Credentials'}
                            </Button>
                        </form>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
