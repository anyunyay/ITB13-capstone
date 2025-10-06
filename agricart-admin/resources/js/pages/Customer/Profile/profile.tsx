import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage, router } from '@inertiajs/react';
import { User, Edit, Save, X, Camera, Trash2, Upload } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
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
            </div>
        </AppHeaderLayout>
    );
}
