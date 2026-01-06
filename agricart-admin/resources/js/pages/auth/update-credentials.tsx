import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle, KeyRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import PasswordValidation from '@/components/ui/password-validation';
import PasswordError from '@/components/ui/password-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { publicStorageUrl } from '@/utils/assets';

type UpdateCredentialsForm = {
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
    const { data, setData, post, processing, errors, reset } = useForm<UpdateCredentialsForm>({
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
            <Head title="Update Password" />
            
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="text-center space-y-6">
                        {/* Logo */}
                        <div className="inline-block mb-4">
                            <div className="flex items-center justify-center gap-3">
                                <img
                                    src={publicStorageUrl('logo/smmc-logo.webp')}
                                    alt="SMMC Logo"
                                    className="h-20 w-20 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/storage/logo/smmc-logo.png';
                                    }}
                                />
                                <span className="text-5xl font-semibold text-green-700" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.08em' }}>
                                    SMMC
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <KeyRound className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Update Your Password
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Welcome, <strong>{user.name}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {getUserTypeDisplayName(user.type)} Account
                            </p>
                        </div>

                        {/* Security Alert */}
                        <Alert className="text-left">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                This is a default account. For security reasons, you must update your password before accessing the system.
                            </AlertDescription>
                        </Alert>

                        {/* Password Update Form */}
                        <form onSubmit={submit} className="space-y-4 pt-2 text-left">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full"
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
                                    className="w-full"
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
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Log out
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
