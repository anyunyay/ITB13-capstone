import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage, router } from '@inertiajs/react';
import { User, Edit, Save, X, Camera, Trash2, Upload, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Email change states
    const [showEmailChange, setShowEmailChange] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailRequestId, setEmailRequestId] = useState<number | null>(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [emailError, setEmailError] = useState('');

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
    });

    // Email change form
    const emailChangeForm = useForm({
        new_email: '',
        request_id: null,
        otp: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/customer/profile', {
            onSuccess: () => {
                setIsEditing(false);
                alert('Profile updated successfully!');
            },
            onError: () => {
                alert('Failed to update profile. Please try again.');
            },
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
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

    // Email change handlers
    const handleRequestEmailChange = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setEmailError('');
        emailChangeForm.setData('new_email', newEmail);
        
        emailChangeForm.post('/customer/profile/email/request-change', {
            onSuccess: (page) => {
                const flash = page.props.flash;
                if (flash?.request_id) {
                    setEmailRequestId(flash.request_id);
                    setShowOtpInput(true);
                    alert(flash.message || 'OTP sent successfully!');
                }
            },
            onError: (errors) => {
                setEmailError(errors.error || 'Failed to send OTP');
            },
        });
    };

    const handleVerifyOTP = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setEmailError('');
        emailChangeForm.setData('request_id', emailRequestId);
        emailChangeForm.setData('otp', otp);

        emailChangeForm.post('/customer/profile/email/verify-otp', {
            onSuccess: (page) => {
                const flash = page.props.flash;
                if (flash?.success) {
                    setShowConfirmation(true);
                    setShowOtpInput(false);
                }
            },
            onError: (errors) => {
                setEmailError(errors.error || 'Invalid OTP');
            },
        });
    };

    const handleConfirmEmailChange = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setEmailError('');
        emailChangeForm.setData('request_id', emailRequestId);

        emailChangeForm.post('/customer/profile/email/confirm-change', {
            onSuccess: (page) => {
                const flash = page.props.flash;
                if (flash?.success) {
                    alert(flash.message || 'Email updated successfully!');
                    router.reload();
                    handleCancelEmailChange();
                }
            },
            onError: (errors) => {
                setEmailError(errors.error || 'Failed to update email');
            },
        });
    };

    const handleCancelEmailChange = () => {
        setShowEmailChange(false);
        setNewEmail('');
        setEmailRequestId(null);
        setShowOtpInput(false);
        setOtp('');
        setShowConfirmation(false);
        setEmailError('');
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Details
                        </CardTitle>
                        <CardDescription>
                            Manage your personal information and account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your contact number"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                {!isEditing ? (
                                    <Button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Email Change Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Change Email Address
                        </CardTitle>
                        <CardDescription>
                            For security, we'll send a verification code to your current email
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Current Email:</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                            
                            {!showEmailChange ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEmailChange(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Request Email Change
                                </Button>
                            ) : (
                                <div className="space-y-4 border rounded-lg p-4">
                                    {emailError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{emailError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {!showOtpInput && !showConfirmation && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new_email">New Email Address</Label>
                                                <Input
                                                    id="new_email"
                                                    type="email"
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    placeholder="Enter new email address"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleRequestEmailChange();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={!newEmail || emailChangeForm.processing}
                                                >
                                                    {emailChangeForm.processing ? 'Sending...' : 'Send OTP'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelEmailChange}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {showOtpInput && (
                                        <div className="space-y-4">
                                            <Alert>
                                                <CheckCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    A 6-digit OTP has been sent to <strong>{user?.email}</strong>. 
                                                    It will expire in 5 minutes.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-2">
                                                <Label htmlFor="otp">Enter OTP</Label>
                                                <Input
                                                    id="otp"
                                                    type="text"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="Enter 6-digit OTP"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleVerifyOTP();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyOTP}
                                                    disabled={otp.length !== 6 || emailChangeForm.processing}
                                                >
                                                    {emailChangeForm.processing ? 'Verifying...' : 'Verify OTP'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelEmailChange}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Email Change Confirmation Dialog */}
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Email Change</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to change your email address?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">From:</span>
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">To:</span>
                                <span className="text-sm font-medium">{newEmail}</span>
                            </div>
                        </div>
                        {emailError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{emailError}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEmailChange}
                                disabled={emailChangeForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmEmailChange}
                                disabled={emailChangeForm.processing}
                            >
                                {emailChangeForm.processing ? 'Updating...' : 'Confirm & Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppHeaderLayout>
    );
}
