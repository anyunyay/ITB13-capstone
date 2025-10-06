import { useState, useRef, useEffect } from 'react';
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
    [key: string]: unknown;
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
    const [emailError, setEmailError] = useState('');
    const [emailValidationStatus, setEmailValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorClearKey, setErrorClearKey] = useState(0);
    const [isProcessingEmailChange, setIsProcessingEmailChange] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
    });

    // Email change form
    const emailChangeForm = useForm({
        new_email: '',
        error: '',
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

    // Email validation helper
    const isValidEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email.trim());
    };

    // Real-time email validation
    const validateEmailInput = (email: string) => {
        if (!email.trim()) {
            setEmailValidationStatus('idle');
            return;
        }
        
        if (isValidEmail(email) && email.toLowerCase() !== user?.email?.toLowerCase()) {
            setEmailValidationStatus('valid');
        } else {
            setEmailValidationStatus('invalid');
        }
    };

    // Debounced validation effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (newEmail) {
                validateEmailInput(newEmail);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [newEmail]);

    // Clear errors when email becomes valid
    useEffect(() => {
        if (emailValidationStatus === 'valid' && (emailError || emailChangeForm.errors.new_email)) {
            setEmailError('');
            emailChangeForm.clearErrors();
            setErrorClearKey(prev => prev + 1);
        }
    }, [emailValidationStatus, emailError, emailChangeForm]);

    // Email change handlers
    const handleRequestEmailChange = (e?: React.MouseEvent) => {
        e?.preventDefault();
        
        console.log('handleRequestEmailChange called with newEmail:', newEmail);
        
        // Clear all errors first
        setEmailError('');
        emailChangeForm.clearErrors();
        
        // Trim and validate email
        const trimmedEmail = newEmail.trim();
        
        // Basic email validation
        if (!trimmedEmail) {
            setEmailError('Please enter an email address');
            return;
        }
        
        if (!isValidEmail(trimmedEmail)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        
        if (trimmedEmail.toLowerCase() === user?.email?.toLowerCase()) {
            setEmailError('The new email must be different from your current email');
            return;
        }
        
        // Update the trimmed email
        setNewEmail(trimmedEmail);
        
        // Set processing state
        setIsProcessingEmailChange(true);
        
        // Debug logging
        console.log('Frontend - Sending email change request:', {
            trimmedEmail,
            newEmailState: newEmail,
            userEmail: user?.email
        });
        
        // Use router.post to ensure proper data transmission
        router.post('/customer/profile/email/request-change', {
            new_email: trimmedEmail
        }, {
            onSuccess: (page: any) => {
                // Backend will handle redirection to OTP verification page
                console.log('Email change request successful, redirecting to OTP page');
                console.log('Page props:', page.props);
                console.log('Flash data:', page.props.flash);
                
                // Force redirect to OTP page as backup
                const flash = page.props.flash as any;
                const requestId = flash?.request_id;
                
                if (requestId) {
                    router.visit('/customer/profile/email/verify', {
                        data: { 
                            request_id: requestId,
                            new_email: trimmedEmail 
                        }
                    });
                } else {
                    // Fallback redirect if no request_id
                    window.location.href = `/customer/profile/email/verify?request_id=${requestId}&new_email=${encodeURIComponent(trimmedEmail)}`;
                }
            },
            onError: (errors: any) => {
                setIsProcessingEmailChange(false);
                console.log('Frontend - Email change request failed:', {
                    errors,
                    trimmedEmail,
                    newEmailState: newEmail
                });
                
                if (errors.new_email) {
                    setEmailError(errors.new_email[0]);
                } else if (errors.error) {
                    setEmailError(errors.error);
                } else {
                    setEmailError('Failed to send OTP. Please try again.');
                }
            },
        });
    };

    const handleCancelEmailChange = () => {
        setShowEmailChange(false);
        setNewEmail('');
        setEmailError('');
        setEmailValidationStatus('idle');
        setIsProcessingEmailChange(false);
        setErrorClearKey(prev => prev + 1);
        emailChangeForm.clearErrors();
    };



    return (
        <AppHeaderLayout breadcrumbs={[
            { title: 'Profile Information', href: '/customer/profile/info' }
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
                                        autoComplete="name"
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
                                        autoComplete="email"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your contact number"
                                        autoComplete="tel"
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
                            For security, we'll send a verification code to your new email address
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
                                    {(emailError || (emailChangeForm.errors as any).error) && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{emailError || (emailChangeForm.errors as any).error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Test success message */}
                                    {(usePage().props.flash as any)?.test_success && (
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Test successful! Received email: {(usePage().props.flash as any).new_email}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new_email">New Email Address</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enter a valid email address different from your current one
                                            </p>
                                                <Input
                                                    id="new_email"
                                                    type="email"
                                                    value={newEmail}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    console.log('Input onChange - Raw value:', value);
                                                    
                                                    // Allow only valid email characters and prevent multiple @ symbols
                                                    const sanitizedValue = value
                                                        .replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\-@]/g, '')
                                                        .replace(/@+/g, '@')
                                                        .replace(/\.+/g, '.');
                                                    
                                                    console.log('Input onChange - Sanitized value:', sanitizedValue);
                                                    setNewEmail(sanitizedValue);
                                                    
                                                    // Clear errors when user starts typing
                                                    if (emailError) {
                                                        setEmailError('');
                                                    }
                                                    // Clear all form errors when user types
                                                    emailChangeForm.clearErrors();
                                                    setErrorClearKey(prev => prev + 1);
                                                }}
                                                onBlur={() => {
                                                    // Trim whitespace on blur
                                                    const trimmed = newEmail.trim();
                                                    if (trimmed !== newEmail) {
                                                        setNewEmail(trimmed);
                                                    }
                                                }}
                                                    placeholder="Enter new email address"
                                                autoComplete="email"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleRequestEmailChange();
                                                        }
                                                    }}
                                                disabled={isProcessingEmailChange}
                                                className={
                                                    emailValidationStatus === 'valid' 
                                                        ? 'border-green-500 focus:border-green-500' 
                                                        : emailValidationStatus === 'invalid' || emailChangeForm.errors.new_email || emailError
                                                        ? 'border-red-500 focus:border-red-500' 
                                                        : ''
                                                }
                                            />
                                            {/* Real-time validation feedback */}
                                            {newEmail && emailValidationStatus === 'valid' && !emailChangeForm.errors.new_email && !emailError && (
                                                <p className="text-sm text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Valid email address
                                                </p>
                                            )}
                                            {newEmail && emailValidationStatus === 'invalid' && !emailError && !emailChangeForm.errors.new_email && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    {newEmail.toLowerCase() === user?.email?.toLowerCase() 
                                                        ? 'Must be different from current email' 
                                                        : 'Please enter a valid email address'}
                                                </p>
                                            )}
                                            {(emailChangeForm.errors.new_email || emailError) && (
                                                <p key={errorClearKey} className="text-sm text-red-500">
                                                    {emailChangeForm.errors.new_email || emailError}
                                                </p>
                                            )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                disabled={
                                                    !newEmail.trim() || 
                                                    isProcessingEmailChange || 
                                                    emailValidationStatus !== 'valid' || 
                                                    Boolean(emailError)
                                                }
                                            >
                                                {isProcessingEmailChange ? 'Sending...' : 'Send OTP'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    console.log('Testing email input with:', newEmail);
                                                    router.post('/customer/profile/email/test-input', {
                                                        new_email: newEmail
                                                    }, {
                                                        onSuccess: (page: any) => {
                                                            console.log('Test response:', page.props.flash);
                                                            const flash = page.props.flash as any;
                                                            if (flash?.test_success) {
                                                                alert(`Test successful!\nReceived email: ${flash.new_email}\nData: ${JSON.stringify(flash.received_data)}`);
                                                            }
                                                        },
                                                        onError: (errors: any) => {
                                                            console.log('Test errors:', errors);
                                                            alert('Test failed: ' + JSON.stringify(errors));
                                                        }
                                                    });
                                                }}
                                                disabled={!newEmail.trim()}
                                            >
                                                Test Input
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelEmailChange}
                                                disabled={isProcessingEmailChange}
                                                >
                                                    Cancel
                                                </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>


            </div>
        </AppHeaderLayout>
    );
}
