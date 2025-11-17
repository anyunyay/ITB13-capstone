import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, usePage, router, Link } from '@inertiajs/react';
import { MapPin, PlusCircle, Edit, Trash2, Home, CheckCircle, AlertCircle, CheckCircle2, ShoppingCart, Package, Clock, ArrowLeft } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { useTranslation } from '@/hooks/use-translation';
import { getProfileRoutes } from '@/lib/utils';

interface Address {
    id: number;
    street: string;
    barangay: string;
    city: string;
    province: string;
    is_active: boolean;
    has_ongoing_orders?: boolean;
}

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
        address?: string;
        barangay?: string;
        city?: string;
        province?: string;
    };
    addresses: Address[];
    mainAddressHasOngoingOrders?: boolean;
    flash?: {
        success?: string;
        error?: string;
    };
    autoOpenAddForm?: boolean;
    [key: string]: any;
}

export default function AddressPage() {
    const { user, addresses = [], flash, autoOpenAddForm = false, mainAddressHasOngoingOrders = false } = usePage<PageProps>().props;
    
    const t = useTranslation();

    // Generate dynamic routes based on user type
    const profileRoutes = getProfileRoutes(user.type);
    const routes = {
        mainAddress: `${profileRoutes.addresses.replace('/addresses', '/main-address')}`,
        addresses: profileRoutes.addresses,
        addressesStore: profileRoutes.addresses,
        addressesUpdate: profileRoutes.addresses,
        addressesDestroy: profileRoutes.addresses,
        addressesSetActive: profileRoutes.addresses,
    };
    const [isDialogOpen, setIsDialogOpen] = useState(autoOpenAddForm);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationData, setConfirmationData] = useState<{
        type: 'edit_main' | 'set_active' | 'delete';
        address: Address | null;
        newAddress?: any;
        onConfirm: () => void;
    } | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        street: '',
        barangay: 'Sala', // Fixed default
        city: 'Cabuyao', // Fixed default
        province: 'Laguna', // Fixed default
        is_active: false as boolean, // Default to false - user must explicitly choose
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // List of all barangays in Cabuyao, Laguna (only Sala is selectable)
    const cabuyaoBarangays = [
        'Banaybanay',
        'Bigaa',
        'Butong',
        'Diezmo',
        'Gulod',
        'Mamatid',
        'Marinig',
        'Niugan',
        'Pittland',
        'Pulo',
        'Puntod',
        'Sala',
        'San Isidro'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If editing the main address (id = 0), show confirmation
        if (editingAddress && editingAddress.id === 0) {
            setConfirmationData({
                type: 'edit_main',
                address: editingAddress,
                newAddress: data,
                onConfirm: () => {
                    router.put(routes.mainAddress, {
                        address: data.street,
                        barangay: data.barangay,
                        city: data.city,
                        province: data.province,
                    }, {
                        onSuccess: () => {
                            reset();
                            setIsDialogOpen(false);
                            setEditingAddress(null);
                            setShowConfirmationModal(false);
                            setConfirmationData(null);
                        },
                        onError: () => {
                            // Error will be handled by flash messages
                        },
                    });
                }
            });
            setShowConfirmationModal(true);
            return;
        }
        
        // Check if this is a new address being set as active
        if (!editingAddress && data.is_active) {
            setConfirmationData({
                type: 'set_active',
                address: null,
                newAddress: data,
                onConfirm: () => {
                    const url = routes.addresses;
                    post(url, {
                        onSuccess: () => {
                            reset();
                            setIsDialogOpen(false);
                            setEditingAddress(null);
                            setShowConfirmationModal(false);
                            setConfirmationData(null);
                        },
                        onError: () => {
                            // Error will be handled by flash messages
                        },
                    });
                }
            });
            setShowConfirmationModal(true);
            return;
        }

        // Check if this is an existing address being set as active
        if (editingAddress && data.is_active && !editingAddress.is_active) {
            setConfirmationData({
                type: 'set_active',
                address: editingAddress,
                newAddress: data,
                onConfirm: () => {
                    const url = `${routes.addressesUpdate}/${editingAddress.id}`;
                    put(url, {
                        onSuccess: () => {
                            reset();
                            setIsDialogOpen(false);
                            setEditingAddress(null);
                            setShowConfirmationModal(false);
                            setConfirmationData(null);
                        },
                        onError: () => {
                            // Error will be handled by flash messages
                        },
                    });
                }
            });
            setShowConfirmationModal(true);
            return;
        }
        
        // Regular address operations (no confirmation needed)
        const url = editingAddress ? `${routes.addressesUpdate}/${editingAddress.id}` : routes.addresses;
        const method = editingAddress ? put : post;

        method(url, {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
                setEditingAddress(null);
            },
            onError: () => {
                // Error will be handled by flash messages
            },
        });
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setData({
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            province: address.province,
            is_active: address.is_active,
        });
        setOpenDropdown(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (address: Address) => {
        setConfirmationData({
            type: 'delete',
            address: address,
            onConfirm: () => {
                destroy(`${routes.addressesDestroy}/${address.id}`, {
                    onSuccess: () => {
                        setShowConfirmationModal(false);
                        setConfirmationData(null);
                    },
                    onError: () => {
                        // Error will be handled by flash messages
                    },
                });
            }
        });
        setShowConfirmationModal(true);
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        reset();
        setOpenDropdown(null);
        setIsDialogOpen(true);
    };

    const handleSetActive = (addressId: number) => {
        const address = addresses.find(addr => addr.id === addressId);
        if (!address) return;

        setConfirmationData({
            type: 'set_active',
            address: address,
            onConfirm: () => {
                router.post(`${routes.addressesSetActive}/${addressId}/set-active`, {}, {
                    onSuccess: () => {
                        setShowConfirmationModal(false);
                        setConfirmationData(null);
                    },
                    onError: () => {
                        // Error will be handled by flash messages
                    },
                });
            }
        });
        setShowConfirmationModal(true);
    };

    const getAddressIcon = () => {
        return <Home className="h-4 w-4" />;
    };

    // Check if the currently active address matches the main address from registration
    const isActiveAddressSameAsMain = () => {
        const activeAddress = addresses.find(addr => addr.is_active);
        if (!activeAddress || !user.address) return false;
        
        return activeAddress.street === user.address &&
               activeAddress.barangay === user.barangay &&
               activeAddress.city === user.city &&
               activeAddress.province === user.province;
    };

    const pageContent = user.type === 'customer' ? (
        // Customer Design - Clean & Modern
        <div className="space-y-4 sm:space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1 sm:p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 leading-relaxed">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1 sm:p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200 leading-relaxed">
                                {flash.error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Address Cards Section */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Main Address from Registration */}
                    {(user.address || user.barangay || user.city || user.province) && (
                        <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b-2 border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 min-w-0">
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                                                {isActiveAddressSameAsMain() ? t('ui.currently_active_address') : t('ui.main_address_registration')}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                        <Button
                                            onClick={() => handleEdit({ id: 0, street: user.address || '', barangay: user.barangay || '', city: user.city || '', province: user.province || '', is_active: false })}
                                            className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={mainAddressHasOngoingOrders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            {t('ui.edit')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1 sm:p-1.5 rounded-md bg-background mt-0.5 flex-shrink-0">
                                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground mb-1 sm:mb-1.5 font-medium">{t('ui.address_details')}</p>
                                                {user.address && <p className="font-medium text-sm sm:text-base text-foreground leading-relaxed mb-1 break-words">{user.address}</p>}
                                                {(user.barangay || user.city) && (
                                                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                                        {user.barangay && user.city ? `${user.barangay}, ${user.city}` : user.barangay || user.city}
                                                    </p>
                                                )}
                                                {user.province && <p className="text-xs sm:text-sm text-muted-foreground">{user.province}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {!isActiveAddressSameAsMain() && (
                                        <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800/30 flex items-start gap-2 sm:gap-3">
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                                            <p className="leading-relaxed">{t('ui.main_address_registration_message')}</p>
                                        </div>
                                    )}
                                    {mainAddressHasOngoingOrders && (
                                        <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800/30 flex items-start gap-2 sm:gap-3">
                                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                                            <p className="leading-relaxed">{t('ui.main_address_ongoing_orders_message')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Currently Active Address - Only show if different from main address */}
                    {addresses.find(addr => addr.is_active) && !isActiveAddressSameAsMain() && (
                        <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b-2 border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 min-w-0">
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                                                {t('ui.currently_active_address')}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                        <Button
                                            onClick={() => handleEdit(addresses.find(addr => addr.is_active)!)}
                                            className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            {t('ui.edit')}
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(addresses.find(addr => addr.is_active)!)}
                                            className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t('ui.delete')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1 sm:p-1.5 rounded-md bg-background mt-0.5 flex-shrink-0">
                                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground mb-1 sm:mb-1.5 font-medium">{t('ui.address_details')}</p>
                                                <p className="font-medium text-sm sm:text-base text-foreground leading-relaxed mb-1 break-words">{addresses.find(addr => addr.is_active)!.street}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground break-words">{addresses.find(addr => addr.is_active)!.barangay}, {addresses.find(addr => addr.is_active)!.city}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">{addresses.find(addr => addr.is_active)!.province}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800/30 flex items-start gap-2 sm:gap-3">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                                        <p className="leading-relaxed">{t('ui.checkout_and_other_operations')}</p>
                                    </div>
                                    
                                    {addresses.find(addr => addr.is_active)?.has_ongoing_orders && (
                                        <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800/30 flex items-start gap-2 sm:gap-3">
                                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                                            <p className="leading-relaxed">{t('ui.ongoing_orders_restricted_message')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Saved Addresses */}
                    {addresses.filter(addr => !addr.is_active).length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                                    {t('ui.other_addresses')}
                                </h3>
                            </div>
                            <div className="grid gap-3 sm:gap-4">
                                {addresses.filter(addr => !addr.is_active).map((address) => (
                                    <div key={address.id} className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-border hover:border-green-200 dark:hover:border-green-700 transition-all duration-300 overflow-hidden">
                                        <div className="p-4 sm:p-5 md:p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                                                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="p-1 sm:p-1.5 rounded-md bg-muted mt-0.5 flex-shrink-0">
                                                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-muted-foreground mb-1 sm:mb-1.5 font-medium">{t('ui.saved_address')}</p>
                                                            <p className="font-medium text-sm sm:text-base text-foreground leading-relaxed mb-1 break-words">{address.street}</p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground break-words">{address.barangay}, {address.city}</p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground">{address.province}</p>
                                                        </div>
                                                    </div>
                                                    {address.has_ongoing_orders && (
                                                        <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800/30 flex items-start gap-2 sm:gap-3">
                                                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                                                            <p className="leading-relaxed">{t('ui.ongoing_orders_restricted_message')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                                                    <Button
                                                        onClick={() => handleEdit(address)}
                                                        className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        {t('ui.edit')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSetActive(address.id)}
                                                        className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t('ui.set_as_active')}</span>
                                                        <span className="sm:hidden">Active</span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(address)}
                                                        className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {t('ui.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                            {editingAddress ? (editingAddress.id === 0 ? t('ui.edit_main_address') : t('ui.edit_address')) : t('ui.add_new_address')}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                            {editingAddress ? (editingAddress.id === 0 ? t('ui.update_main_address_desc') : t('ui.update_address_info')) : t('ui.add_address_for_deliveries')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="street" className="text-xs sm:text-sm md:text-base font-semibold text-foreground">{t('ui.address_line')}</Label>
                            <Input
                                id="street"
                                type="text"
                                required
                                autoComplete="address-line1"
                                value={data.street}
                                onChange={(e) => setData('street', e.target.value)}
                                disabled={processing}
                                placeholder={t('ui.house_number_street_name')}
                                className="h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-green-500 focus:ring-green-500"
                            />
                            {errors.street && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.street}</p>}
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {t('ui.identical_addresses_message')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="province" className="text-xs sm:text-sm md:text-base font-semibold text-foreground">{t('ui.province')}</Label>
                                <Select 
                                    value={data.province} 
                                    onValueChange={(value) => setData('province', value)}
                                    disabled={processing}
                                    open={openDropdown === 'province'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'province' : null)}
                                >
                                    <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-green-500 focus:ring-green-500">
                                        <SelectValue placeholder={t('ui.select_province')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laguna" className="text-green-600 font-medium">
                                            {t('ui.laguna')} ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.province && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.province}</p>}
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="city" className="text-xs sm:text-sm md:text-base font-semibold text-foreground">{t('ui.city')}</Label>
                                <Select 
                                    value={data.city} 
                                    onValueChange={(value) => setData('city', value)}
                                    disabled={processing}
                                    open={openDropdown === 'city'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'city' : null)}
                                >
                                    <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-green-500 focus:ring-green-500">
                                        <SelectValue placeholder={t('ui.select_city')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cabuyao" className="text-green-600 font-medium">
                                            {t('ui.cabuyao')} ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.city}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="barangay" className="text-xs sm:text-sm md:text-base font-semibold text-foreground">{t('ui.barangay')}</Label>
                            <Select 
                                value={data.barangay} 
                                onValueChange={(value) => setData('barangay', value)}
                                disabled={processing}
                                open={openDropdown === 'barangay'}
                                onOpenChange={(open) => setOpenDropdown(open ? 'barangay' : null)}
                            >
                                <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-green-500 focus:ring-green-500">
                                    <SelectValue placeholder={t('ui.select_barangay')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {cabuyaoBarangays.map((barangay) => (
                                        <SelectItem 
                                            key={barangay} 
                                            value={barangay}
                                            disabled={barangay !== 'Sala'}
                                            className={barangay !== 'Sala' ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {barangay}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barangay && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.barangay}</p>}
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {t('ui.only_sala_available')}
                            </p>
                        </div>

                        {/* Set as Active Address Checkbox */}
                        {!editingAddress && (
                            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800/30">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active || false}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    disabled={processing}
                                    className="rounded border-green-600 bg-background text-green-600 focus:ring-green-600 focus:ring-2 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
                                />
                                <Label htmlFor="is_active" className="text-xs sm:text-sm md:text-base font-semibold cursor-pointer text-green-700 dark:text-green-300">
                                    {t('ui.set_as_active_address')}
                                </Label>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingAddress(null);
                                    setOpenDropdown(null);
                                    reset();
                                }}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold border-2 border-border hover:bg-muted transition-all duration-300"
                            >
                                {t('ui.cancel')}
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? t('ui.saving') : editingAddress ? (editingAddress.id === 0 ? t('ui.update_main_address') : t('ui.update_address')) : t('ui.add_address')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal - Address Change or Delete */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    {confirmationData?.type === 'delete' ? (
                        // Delete Confirmation
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-red-700 dark:text-red-300">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                                        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="break-words">Delete Address</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                                    Are you sure you want to delete this address? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            
                            {confirmationData.address && (
                                <div className="border-2 border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20 rounded-lg sm:rounded-xl overflow-hidden">
                                    <div className="p-3 sm:p-4 md:p-5 border-b border-red-200 dark:border-red-800/30">
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-red-700 dark:text-red-300">Address to be deleted</h3>
                                    </div>
                                    <div className="p-3 sm:p-4 md:p-5">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/30 mt-0.5 flex-shrink-0">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm sm:text-base text-foreground leading-relaxed mb-1 break-words">{confirmationData.address.street}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground break-words">{confirmationData.address.barangay}, {confirmationData.address.city}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">{confirmationData.address.province}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                                            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                                <strong>Warning:</strong> This address will be permanently removed from your account. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowConfirmationModal(false);
                                        setConfirmationData(null);
                                    }}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold border-2 border-border hover:bg-muted transition-all duration-300"
                                >
                                    {t('ui.cancel')}
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (confirmationData) {
                                            confirmationData.onConfirm();
                                        }
                                    }}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('ui.delete')}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        // Address Change Confirmation
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-300">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <span className="break-words">{t('ui.confirm_address_change')}</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                                    {t('ui.review_address_change_impact')}
                                </DialogDescription>
                            </DialogHeader>
                            
                            {confirmationData && (
                                <div className="border-2 border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20 rounded-lg sm:rounded-xl overflow-hidden">
                                    <div className="p-3 sm:p-4 md:p-5 border-b border-amber-200 dark:border-amber-800/30">
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-amber-700 dark:text-amber-300">{t('ui.impact_of_this_change')}</h3>
                                    </div>
                                    <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5 flex-shrink-0">
                                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground mb-0.5 sm:mb-1">{t('ui.checkout_orders')}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('ui.checkout_orders_message')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5 flex-shrink-0">
                                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground mb-0.5 sm:mb-1">{t('ui.delivery_address')}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('ui.delivery_address_message')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5 flex-shrink-0">
                                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground mb-0.5 sm:mb-1">{t('ui.address_history')}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('ui.address_history_message')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowConfirmationModal(false);
                                        setConfirmationData(null);
                                    }}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold border-2 border-border hover:bg-muted transition-all duration-300"
                                >
                                    {t('ui.cancel')}
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (confirmationData) {
                                            confirmationData.onConfirm();
                                        }
                                    }}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    {t('ui.confirm_address_change')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    ) : (
        // Admin/Staff/Logistic/Member Design - Professional & Compact (fallback, typically not used)
        <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {flash.error}
                            </p>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-green-600 dark:text-green-400">
                                    {t('ui.address_management')}
                                </CardTitle>
                                <CardDescription>
                                    {t('ui.manage_delivery_addresses')}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Address management is primarily available for customers.
                        </p>
                    </CardContent>
                </Card>
        </div>
    );

    // Render with appropriate layout based on user type
    switch (user?.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.address_management')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_delivery_addresses')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="min-h-[90vh] py-4 sm:py-6 lg:py-8 mt-16 sm:mt-18 lg:mt-20">
                        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
                                        {t('ui.address_management')}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-green-600 dark:text-green-400">
                                        {t('ui.manage_delivery_addresses')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                                    <Link href="/">
                                        <Button 
                                            variant="outline" 
                                            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-base lg:text-lg font-semibold border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
                                        >
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline ml-2">{t('ui.back')}</span>
                                        </Button>
                                    </Link>
                                    <Button 
                                        onClick={handleAddNew} 
                                        className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-base lg:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
                                    >
                                        <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('ui.add_new_address')}</span>
                                        <span className="sm:hidden ml-1">Add</span>
                                    </Button>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="px-2 pt-22 py-2 lg:px-8 lg:pt-25">
                        <div className="mb-6">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('ui.address_management')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('ui.manage_delivery_addresses')}
                                    </p>
                                </div>
                                <Link href="/logistic/dashboard">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('logistic.back_to_dashboard')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {pageContent}
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="px-2 pt-15 py-2 lg:px-8 lg:pt-17">
                        <div className="mb-6">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('ui.address_management')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('ui.manage_delivery_addresses')}
                                    </p>
                                </div>
                                <Link href="/member/dashboard">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('member.back_to_dashboard')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {pageContent}
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.address_management')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_delivery_addresses')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
