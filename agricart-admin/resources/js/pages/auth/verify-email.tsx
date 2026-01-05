import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';

import { publicStorageUrl } from '@/utils/assets';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email Verification" />
            
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="text-center space-y-6">
                        {/* Logo */}
                        <Link href={route('home')} className="inline-block mb-4">
                            <div className="flex items-center justify-center gap-3">
                                <img
                                    src={publicStorageUrl('logo/SMMC Logo-1.webp')}
                                    alt="SMMC Logo"
                                    className="h-20 w-20 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/storage/logo/SMMC Logo-1.png';
                                    }}
                                />
                                <span className="text-5xl font-semibold text-green-700" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.08em' }}>
                                    SMMC
                                </span>
                            </div>
                        </Link>

                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Mail className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Verify Your Email
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Please verify your email address by clicking on the link we just emailed to you.
                            </p>
                        </div>

                        {/* Success Message */}
                        {status === 'verification-link-sent' && (
                            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    A new verification link has been sent to your email address.
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <Button 
                                type="submit"
                                disabled={processing} 
                                variant="default"
                                className="w-full"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Resend Verification Email
                            </Button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Log out
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
