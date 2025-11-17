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
    const [shouldShowProfileModal, setShouldShowProfileModal] = useState(true);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Check if user is admin or staff (should see full phone number)
    const isAdminOrStaff = user?.type === 'admin' || user?.type === 'staff';
    
    // Check if user is customer for styling
    const isCustomer = user?.type === 'customer';

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
            setShouldShowProfileModal(true);
            setSelectedAvatar(null);
            setAvatarPreview(null);
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
        }
    }, [isOpen]);

    // Hide profile modal when sub-modals are open
    useEffect(() => {
        if (isEmailChangeModalOpen || isPhoneChangeModalOpen) {
            setShouldShowProfileModal(false);
        } else if (isOpen) {
            setShouldShowProfileModal(true);
        }
    }, [isEmailChangeModalOpen, isPhoneChangeModalOpen, isOpen]);

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
        setShouldShowProfileModal(true);
        onClose();
    };

    const handleEmailChangeClose = (completed?: boolean) => {
        setIsEmailChangeModalOpen(false);
        // Profile modal will automatically show again due to useEffect
        if (completed) {
            // Optionally refresh data or show success message
        }
    };

    const handlePhoneChangeClose = (completed?: boolean) => {
        setIsPhoneChangeModalOpen(false);
        // Profile modal will automatically show again due to useEffect
        if (completed) {
            // Optionally refresh data or show success message
        }
    };

    const handleOpenEmailChange = () => {
        setIsEmailChangeModalOpen(true);
    };

    const handleOpenPhoneChange = () => {
        setIsPhoneChangeModalOpen(true);
    };

    const handleSwitchToPhone = () => {
        setIsEmailChangeModalOpen(false);
        setIsPhoneChangeModalOpen(true);
    };

    const handleSwitchToEmail = () => {
        setIsPhoneChangeModalOpen(false);
        setIsEmailChangeModalOpen(true);
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
            <Dialog open={isOpen && shouldShowProfileModal} onOpenChange={handleClose}>
                <DialogContent 
                    className={`sm:max-w-lg max-h-[85vh] overflow-y-auto ${isCustomer ? 'border-2 border-green-200 dark:border-green-700' : ''}`}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={handleClose}
                >
                    <DialogHeader className={isCustomer ? 'border-b-2 border-green-200 dark:border-green-700 pb-4' : ''}>
                        <DialogTitle className={`flex items-center gap-2 ${isCustomer ? 'text-green-700 dark:text-green-300 text-xl' : ''}`}>
                            <div className={isCustomer ? 'p-2 rounded-lg bg-green-100 dark:bg-green-900/30' : ''}>
                                <User className={`h-5 w-5 ${isCustomer ? 'text-green-600 dark:text-green-400' : ''}`} />
                            </div>
                            Edit Profile Information
                        </DialogTitle>
                        <DialogDescription className={isCustomer ? 'text-green-600 dark:text-green-400' : ''}>
                            Update your profile information and settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Profile Picture Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Camera className={`h-4 w-4 ${isCustomer ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`} />
                                <Label className={`text-sm font-semibold ${isCustomer ? 'text-green-700 dark:text-green-300' : ''}`}>Profile Picture</Label>
                            </div>
                            
                            <div className="flex flex-col items-center gap-3 sm:flex-row">
                                <div className="relative group">
                                    <Avatar className={`h-16 w-16 border-4 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${
                                        isCustomer 
                                            ? 'border-green-600 dark:border-green-400' 
                                            : 'border-white/50 dark:border-slate-600/50 ring-2 ring-slate-200/50 dark:ring-slate-600/50'
                                    }`}>
                                        <AvatarImage 
                                            src={avatarPreview || user?.avatar_url || undefined} 
                                            alt={user?.name} 
                                            className="object-cover"
                                        />
                                        <AvatarFallback className={`text-lg font-bold ${
                                            isCustomer 
                                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center ${
                                        isCustomer 
                                            ? 'bg-green-600 dark:bg-green-500 border-white dark:border-slate-800' 
                                            : 'bg-green-500 border-white dark:border-slate-800'
                                    }`}>
                                        <Camera className="h-3 w-3 text-white" />
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
                                                className={`flex items-center gap-2 border-2 transition-all duration-300 px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 ${
                                                    isCustomer 
                                                        ? 'border-green-600 text-green-700 dark:text-green-300 hover:bg-green-600 hover:text-white dark:hover:bg-green-600' 
                                                        : 'border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50'
                                                }`}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Choose Photo
                                            </Button>
                                            {user?.avatar && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleAvatarDelete}
                                                    className={`flex items-center gap-2 border-2 transition-all duration-300 px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 ${
                                                        isCustomer 
                                                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600' 
                                                            : 'border-red-300/50 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50'
                                                    }`}
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
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Photo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAvatarCancel}
                                                className={`flex items-center gap-2 border-2 transition-all duration-300 px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 ${
                                                    isCustomer 
                                                        ? 'border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600' 
                                                        : 'border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50'
                                                }`}
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    <p className={`text-xs text-center sm:text-left ${isCustomer ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className={`h-4 w-4 ${isCustomer ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`} />
                                <Label className={`text-sm font-semibold ${isCustomer ? 'text-green-700 dark:text-green-300' : ''}`}>Personal Information</Label>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className={isCustomer ? 'text-green-700 dark:text-green-300' : ''}>Full Name</Label>
                                    <Input
                                        id="name"
                                        value={nameData.name}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                            setNameData('name', value);
                                        }}
                                        placeholder="Enter your full name"
                                        className={`border-2 transition-all duration-300 rounded-lg text-sm py-2 ${
                                            isCustomer 
                                                ? 'border-green-200 dark:border-green-700 focus:border-green-600 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100/50 dark:focus:ring-green-900/30 bg-green-50/30 dark:bg-green-900/10' 
                                                : 'border-slate-200/50 dark:border-slate-600/50 focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100/50 dark:focus:ring-green-900/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'
                                        }`}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.name}</p>}
                                </div>

                                {/* Email Field - Hidden for members */}
                                {user?.type !== 'member' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className={isCustomer ? 'text-green-700 dark:text-green-300' : ''}>Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={displayEmail}
                                            disabled
                                            placeholder="Enter your email"
                                            className={`border-2 rounded-lg text-sm py-2 ${
                                                isCustomer 
                                                    ? 'border-green-200 dark:border-green-700 bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                                                    : 'border-slate-200/50 dark:border-slate-600/50 bg-slate-100/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 backdrop-blur-sm'
                                            }`}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.email}</p>}
                                    </div>
                                )}

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className={isCustomer ? 'text-green-700 dark:text-green-300' : ''}>Contact Number</Label>
                                    <Input
                                        id="phone"
                                        value={displayPhone}
                                        disabled
                                        placeholder="Enter your contact number"
                                        className={`border-2 rounded-lg text-sm py-2 ${
                                            isCustomer 
                                                ? 'border-green-200 dark:border-green-700 bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                                                : 'border-slate-200/50 dark:border-slate-600/50 bg-slate-100/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 backdrop-blur-sm'
                                        }`}
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons for Email/Phone Changes */}
                        <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${isCustomer ? 'border-green-200 dark:border-green-700' : ''}`}>
                            {user?.type !== 'member' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleOpenEmailChange}
                                    className={`w-full flex items-center justify-center gap-1.5 border-2 transition-all duration-300 px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 ${
                                        isCustomer 
                                            ? 'border-green-600 text-green-700 dark:text-green-300 hover:bg-green-600 hover:text-white dark:hover:bg-green-600' 
                                            : 'border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50'
                                    }`}
                                >
                                    <Mail className="h-4 w-4" />
                                    Change Email
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleOpenPhoneChange}
                                className={`w-full flex items-center justify-center gap-1.5 border-2 transition-all duration-300 px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 ${
                                    isCustomer 
                                        ? 'border-green-600 text-green-700 dark:text-green-300 hover:bg-green-600 hover:text-white dark:hover:bg-green-600' 
                                        : 'border-green-300/50 dark:border-green-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50'
                                } ${user?.type === 'member' ? 'col-span-2' : ''}`}
                            >
                                <Phone className="h-4 w-4" />
                                Change Contact
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className={`gap-2 ${isCustomer ? 'border-t-2 border-green-200 dark:border-green-700 pt-4' : ''}`}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${
                                isCustomer 
                                    ? 'border-2 border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-600 hover:text-white' 
                                    : ''
                            }`}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={nameProcessing || !isNameModified}
                            onClick={handleNameSubmit}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <Save className="h-4 w-4" />
                            {nameProcessing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Email and Phone Change Modals */}
            {user?.type !== 'member' && (
                <EmailChangeModal
                    isOpen={isEmailChangeModalOpen}
                    onClose={handleEmailChangeClose}
                    onSwitchToPhone={handleSwitchToPhone}
                    user={user}
                />
            )}
            <PhoneChangeModal
                isOpen={isPhoneChangeModalOpen}
                onClose={handlePhoneChangeClose}
                onSwitchToEmail={user?.type !== 'member' ? handleSwitchToEmail : undefined}
                user={user}
            />
        </>
    );
}
