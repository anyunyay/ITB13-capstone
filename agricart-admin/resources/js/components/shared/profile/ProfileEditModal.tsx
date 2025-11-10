import { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, X, Camera, Trash2, Upload, User, Mail, Phone } from 'lucide-react';
import EmailChangeModal from '@/components/shared/profile/change-email-modal';
import PhoneChangeModal from '@/components/shared/profile/change-phone-modal';
import { getDisplayEmail } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
    type: string;
    created_at?: string;
    updated_at?: string;
    email_verified_at?: string;
    member_id?: string;
    registration_date?: string;
    active?: boolean;
    is_default?: boolean;
    // Address fields
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        is_active: boolean;
    };
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

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

export default function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
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

    // Cleanup effect to ensure proper modal state management
    useEffect(() => {
        if (!isOpen) {
            // Reset all modal states when closed
            setIsEmailChangeModalOpen(false);
            setIsPhoneChangeModalOpen(false);
            setSelectedAvatar(null);
            setAvatarPreview(null);
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
        }
    }, [isOpen]);

    const handleClose = () => {
        // Reset form state when closing
        setNameData('name', user?.name || '');
        setSelectedAvatar(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
        // Close any open sub-modals first
        setIsEmailChangeModalOpen(false);
        setIsPhoneChangeModalOpen(false);
        onClose();
    };

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
                if (avatarInputRef.current) {
                    avatarInputRef.current.value = '';
                }
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
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent 
                    className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={handleClose}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Edit Profile Information
                        </DialogTitle>
                        <DialogDescription>
                            Update your profile information and settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Profile Picture Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                <Label className="text-sm font-semibold">Profile Picture</Label>
                            </div>
                            
                            <div className="flex flex-col items-center gap-3 sm:flex-row">
                                <div className="relative group">
                                    <Avatar className="h-16 w-16 border-2 border-white/50 dark:border-slate-600/50 shadow-lg ring-2 ring-slate-200/50 dark:ring-slate-600/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                                        <AvatarImage 
                                            src={avatarPreview || user?.avatar_url || undefined} 
                                            alt={user?.name} 
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                                        <Camera className="h-2.5 w-2.5 text-white" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    {!selectedAvatar ? (
                                        <>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarSelect}
                                                className="hidden"
                                                id="avatar-upload-modal"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="flex items-center gap-2 border-2 border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:scale-105"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                Choose Photo
                                            </Button>
                                            {user?.avatar && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleAvatarDelete}
                                                    className="flex items-center gap-2 border-2 border-red-300/50 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:scale-105"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Remove Photo
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={handleAvatarUpload}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                Save Photo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAvatarCancel}
                                                className="flex items-center gap-2 border-2 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:scale-105"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                        JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                <Label className="text-sm font-semibold">Personal Information</Label>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={nameData.name}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                            setNameData('name', value);
                                        }}
                                        placeholder="Enter your full name"
                                        className="border-2 border-slate-200/50 dark:border-slate-600/50 focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100/50 dark:focus:ring-green-900/30 transition-all duration-300 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm py-2"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.name}</p>}
                                </div>

                                {/* Email Field - Hidden for members */}
                                {user?.type !== 'member' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={displayEmail}
                                            disabled
                                            placeholder="Enter your email"
                                            className="border-2 border-slate-200/50 dark:border-slate-600/50 bg-slate-100/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl text-sm py-2 backdrop-blur-sm"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.email}</p>}
                                    </div>
                                )}

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Number</Label>
                                    <Input
                                        id="phone"
                                        value={displayPhone}
                                        disabled
                                        placeholder="Enter your contact number"
                                        className="border-2 border-slate-200/50 dark:border-slate-600/50 bg-slate-100/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl text-sm py-2 backdrop-blur-sm"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons for Email/Phone Changes */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                            {user?.type !== 'member' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEmailChangeModalOpen(true)}
                                    className="flex items-center gap-1.5 border-2 border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:scale-105"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    Change Email
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPhoneChangeModalOpen(true)}
                                className="flex items-center gap-1.5 border-2 border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:scale-105"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                Change Contact
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={nameProcessing || !isNameModified}
                            onClick={handleNameSubmit}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <Save className="h-3.5 w-3.5" />
                            {nameProcessing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Email and Phone Change Modals */}
            {user?.type !== 'member' && (
                <EmailChangeModal
                    isOpen={isEmailChangeModalOpen}
                    onClose={() => setIsEmailChangeModalOpen(false)}
                    user={user}
                />
            )}
            <PhoneChangeModal
                isOpen={isPhoneChangeModalOpen}
                onClose={() => setIsPhoneChangeModalOpen(false)}
                user={user}
            />
        </>
    );
}
