import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage, router } from '@inertiajs/react';
import { User, Edit, Save, X, Camera, Trash2, Upload, Mail, Phone } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmailChangeModal from '@/components/change-email-modal';
import PhoneChangeModal from '@/components/change-phone-modal';
import { getDisplayEmail } from '@/lib/utils';

// Utility function to mask phone numbers for security (show only last 3 digits)
const maskPhone = (phone: string): string => {
    if (!phone) return phone;
    
    // Remove any non-digit characters for consistent masking
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length <= 3) {
        return '*'.repeat(digitsOnly.length);
    } else {
        return '*'.repeat(digitsOnly.length - 3) + digitsOnly.slice(-3);
    }
};

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
    type: string;
}

interface PageProps {
    user: User;
    [key: string]: any;
}

export default function ProfilePage() {
    const { user } = usePage<PageProps>().props;
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            profile: `${baseRoute}/profile`,
            profileInfo: `${baseRoute}/profile/info`,
            profileName: `${baseRoute}/profile/name`,
            avatarUpload: `${baseRoute}/profile/avatar/upload`,
            avatarDelete: `${baseRoute}/profile/avatar/delete`,
        };
    };

    const routes = getProfileRoutes();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);
    const [isPhoneChangeModalOpen, setIsPhoneChangeModalOpen] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Check if user is admin or staff (should see full phone number)
    const isAdminOrStaff = user?.type === 'admin' || user?.type === 'staff';

    const { data, setData, patch, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
    });

    // Separate form for name-only updates
    const { data: nameData, setData: setNameData, patch: patchName, processing: nameProcessing } = useForm({
        name: user?.name || '',
    });

    // Get display phone number (masked for non-admin/staff users)
    const displayPhone = isAdminOrStaff ? (user?.contact_number || '') : maskPhone(user?.contact_number || '');
    
    // Get display email (masked for non-admin/staff users)
    const displayEmail = getDisplayEmail(user?.email || '', user?.type);

    // Track if name has been modified
    const isNameModified = nameData.name !== (user?.name || '');

    const handleNameSubmit = () => {
        patchName(routes.profileName, {
            onSuccess: () => {
                alert('Name updated successfully!');
            },
            onError: () => {
                alert('Failed to update name. Please try again.');
            },
        });
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

        router.post(routes.avatarUpload, formData, {
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
            router.delete(routes.avatarDelete, {
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
        <ProfileWrapper 
            breadcrumbs={[
                { title: 'Profile Information', href: routes.profileInfo }
            ]}
            title="Profile Information"
        >

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
                                        value={nameData.name}
                                        onChange={(e) => setNameData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        disabled={nameProcessing || !isNameModified}
                                        onClick={handleNameSubmit}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {nameProcessing ? 'Saving...' : 'Save'}
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
                                        value={displayEmail}
                                        disabled
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEmailChangeModalOpen(true)}
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
                                        value={displayPhone}
                                        disabled
                                        placeholder="Enter your contact number"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsPhoneChangeModalOpen(true)}
                                        className="flex items-center gap-1"
                                    >
                                        <Phone className="h-3 w-3" />
                                        Change Contact
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            <EmailChangeModal
                isOpen={isEmailChangeModalOpen}
                onClose={() => setIsEmailChangeModalOpen(false)}
                user={user}
            />
            <PhoneChangeModal
                isOpen={isPhoneChangeModalOpen}
                onClose={() => setIsPhoneChangeModalOpen(false)}
                user={user}
            />
        </ProfileWrapper>
    );
}
