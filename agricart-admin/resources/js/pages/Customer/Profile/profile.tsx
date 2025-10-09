import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage, router } from '@inertiajs/react';
import { User, Edit, Save, X, Camera, Trash2, Upload, Mail } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmailChangeOtpModal from '@/components/EmailChangeOtpModal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
}

interface PageProps {
    user: User;
}

export default function ProfilePage() {
    const { user } = usePage<PageProps>().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isLoadingEmailChange, setIsLoadingEmailChange] = useState(false);
    const [emailChangeErrors, setEmailChangeErrors] = useState<Record<string, string>>({});
    const [emailChangeSuccess, setEmailChangeSuccess] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpData, setOtpData] = useState<{
        requestId: number;
        newEmail: string;
        currentEmail: string;
    } | null>(null);

    const { data, setData, patch, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
    });

    // Track if name has been modified
    const isNameModified = data.name !== (user?.name || '');

    const handleNameSubmit = () => {
        patch('/customer/profile', {
            onSuccess: () => {
                alert('Name updated successfully!');
            },
            onError: () => {
                alert('Failed to update name. Please try again.');
            },
        });
    };

    const handleEmailChangeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingEmailChange(true);
        setEmailChangeErrors({});
        setEmailChangeSuccess('');

        try {
            const response = await fetch('/customer/profile/email-change/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    new_email: newEmail,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setOtpData({
                    requestId: data.requestId,
                    newEmail: data.newEmail,
                    currentEmail: data.currentEmail,
                });
                setShowEmailChangeModal(false);
                setShowOtpModal(true);
                setEmailChangeSuccess(data.message);
            } else {
                if (data.errors) {
                    setEmailChangeErrors(data.errors);
                } else {
                    setEmailChangeErrors({ general: data.message || 'Failed to send verification code.' });
                }
            }
        } catch (error) {
            setEmailChangeErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsLoadingEmailChange(false);
        }
    };

    const handleOtpSuccess = () => {
        // Update the user's email in the form data and user object
        setData('email', otpData?.newEmail || '');
        
        // Refresh the page to show updated email
        router.reload();
    };

    const handleOtpModalClose = () => {
        setShowOtpModal(false);
        setOtpData(null);
        setEmailChangeSuccess('');
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = () => {
        if (!selectedAvatar) return;

        const formData = new FormData();
        formData.append('avatar', selectedAvatar);

        router.post('/customer/profile/avatar/upload', formData, {
            onSuccess: () => {
                setSelectedAvatar(null);
                setAvatarPreview(null);
                alert('Profile picture updated successfully!');
            },
            onError: () => {
                alert('Failed to update profile picture. Please try again.');
            },
        });
    };

    const handleAvatarCancel = () => {
        setSelectedAvatar(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const handleAvatarDelete = () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            router.delete('/customer/profile/avatar/delete', {
                onSuccess: () => {
                    alert('Profile picture removed successfully!');
                },
                onError: () => {
                    alert('Failed to remove profile picture. Please try again.');
                },
            });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { label: 'Profile Information', href: '/customer/profile/info' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Profile Information</h2>
                </div>

                {/* Profile Picture Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Profile Picture
                        </CardTitle>
                        <CardDescription>
                            Upload and manage your profile photo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                            <Avatar className="h-32 w-32">
                                <AvatarImage 
                                    src={avatarPreview || user?.avatar_url || undefined} 
                                    alt={user?.name} 
                                />
                                <AvatarFallback className="text-3xl">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-3 w-full sm:w-auto">
                                {!selectedAvatar ? (
                                    <>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarSelect}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Choose Photo
                                        </Button>
                                        {user?.avatar && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={handleAvatarDelete}
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove Photo
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            onClick={handleAvatarUpload}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save New Photo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAvatarCancel}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    JPG, PNG or GIF. Max size 2MB.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Full Name Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Full Name
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        disabled={processing || !isNameModified}
                                        onClick={handleNameSubmit}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Address Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        disabled
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowEmailChangeModal(true);
                                            setNewEmail('');
                                            setEmailChangeErrors({});
                                            setEmailChangeSuccess('');
                                        }}
                                        className="flex items-center gap-1"
                                    >
                                        <Mail className="h-3 w-3" />
                                        Change Email
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Number Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Number
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        disabled
                                        placeholder="Enter your contact number"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <p className="text-sm text-muted-foreground">Contact support to update</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Email Change Modal */}
            <Dialog open={showEmailChangeModal} onOpenChange={setShowEmailChangeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Change Email Address
                        </DialogTitle>
                        <DialogDescription>
                            Enter your new email address. We'll send you a verification code to your current email address to confirm the change.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-email-modal">Current Email</Label>
                            <Input
                                id="current-email-modal"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-email-modal">New Email Address</Label>
                            <Input
                                id="new-email-modal"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter your new email address"
                                required
                                disabled={isLoadingEmailChange}
                            />
                            {emailChangeErrors.new_email && (
                                <p className="text-sm text-red-500">{emailChangeErrors.new_email}</p>
                            )}
                        </div>

                        {emailChangeErrors.general && (
                            <Alert variant="destructive">
                                <AlertDescription>{emailChangeErrors.general}</AlertDescription>
                            </Alert>
                        )}

                        {emailChangeSuccess && (
                            <Alert>
                                <AlertDescription>{emailChangeSuccess}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEmailChangeModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoadingEmailChange || !newEmail.trim()}
                                className="flex-1 flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                {isLoadingEmailChange ? 'Sending...' : 'Send Verification Code'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* OTP Modal */}
            {otpData && (
                <EmailChangeOtpModal
                    isOpen={showOtpModal}
                    onClose={handleOtpModalClose}
                    onSuccess={handleOtpSuccess}
                    requestId={otpData.requestId}
                    newEmail={otpData.newEmail}
                    currentEmail={otpData.currentEmail}
                    allowClose={false}
                />
            )}
        </AppHeaderLayout>
    );
}
