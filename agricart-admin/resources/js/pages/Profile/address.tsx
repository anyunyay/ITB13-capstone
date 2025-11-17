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
        type: 'edit_main' | 'set_active';
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

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            destroy(`${routes.addressesDestroy}/${id}`, {
                onSuccess: () => {
                    // Success message will be handled by flash messages
                },
                onError: () => {
                    // Error will be handled by flash messages
                },
            });
        }
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
        <div className="space-y-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-semibold text-green-900 dark:text-green-100">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-semibold text-red-900 dark:text-red-100">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-base text-muted-foreground">
                            {t('ui.manage_delivery_addresses')}
                        </p>
                    </div>
                    <Button 
                        onClick={handleAddNew} 
                        className="h-14 px-8 text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        {t('ui.add_new_address')}
                    </Button>
                </div>

                {/* Address Cards Section */}
                <div className="space-y-6">
                    {/* Main Address from Registration */}
                    {(user.address || user.barangay || user.city || user.province) && (
                        <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                            <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                                        <div className="p-2 rounded-lg bg-secondary/10">
                                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg sm:text-xl font-bold text-card-foreground">
                                                {isActiveAddressSameAsMain() ? t('ui.currently_active_address') : t('ui.main_address_registration')}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                    isActiveAddressSameAsMain() 
                                                        ? 'bg-secondary/10 text-secondary'
                                                        : 'bg-primary/10 text-primary'
                                                }`}>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {isActiveAddressSameAsMain() ? t('ui.active') : t('ui.main_address')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                        <Button
                                            onClick={() => handleEdit({ id: 0, street: user.address || '', barangay: user.barangay || '', city: user.city || '', province: user.province || '', is_active: false })}
                                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={mainAddressHasOngoingOrders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            {t('ui.edit')}
                                        </Button>
                                        {isActiveAddressSameAsMain() && (
                                            <div className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-secondary/10 text-secondary">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {t('ui.currently_active')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 py-6">
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 mt-0.5 flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('ui.address_details')}</p>
                                                {user.address && <p className="font-medium text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{user.address}</p>}
                                                {(user.barangay || user.city) && (
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        {user.barangay && user.city ? `${user.barangay}, ${user.city}` : user.barangay || user.city}
                                                    </p>
                                                )}
                                                {user.province && <p className="text-slate-600 dark:text-slate-400">{user.province}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {!isActiveAddressSameAsMain() && (
                                        <div className="text-sm text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/20 p-3 rounded-lg border border-green-200/50 dark:border-green-800/30">
                                            {t('ui.main_address_registration_message')}
                                        </div>
                                    )}
                                    {mainAddressHasOngoingOrders && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {t('ui.main_address_ongoing_orders_message')}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Currently Active Address - Only show if different from main address */}
                    {addresses.find(addr => addr.is_active) && !isActiveAddressSameAsMain() && (
                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
                            <CardHeader className="bg-gradient-to-r from-blue-100/80 to-blue-200/80 dark:from-blue-700/50 dark:to-blue-800/50 backdrop-blur-sm border-b border-blue-200/50 dark:border-blue-600/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                                {t('ui.currently_active_address')}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {t('ui.active')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => handleEdit(addresses.find(addr => addr.is_active)!)}
                                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            {t('ui.edit')}
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(addresses.find(addr => addr.is_active)!.id)}
                                            className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t('ui.delete')}
                                        </Button>
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {t('ui.currently_active')}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 py-6">
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 mt-0.5 flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('ui.address_details')}</p>
                                                <p className="font-medium text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{addresses.find(addr => addr.is_active)!.street}</p>
                                                <p className="text-slate-600 dark:text-slate-400">{addresses.find(addr => addr.is_active)!.barangay}, {addresses.find(addr => addr.is_active)!.city}</p>
                                                <p className="text-slate-600 dark:text-slate-400">{addresses.find(addr => addr.is_active)!.province}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                                        {t('ui.checkout_and_other_operations')}
                                    </div>
                                    
                                    {addresses.find(addr => addr.is_active)?.has_ongoing_orders && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {t('ui.ongoing_orders_restricted_message')}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Other Saved Addresses */}
                    {addresses.filter(addr => !addr.is_active).length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                    <Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                                    {t('ui.other_addresses')}
                                </h3>
                            </div>
                            <div className="grid gap-6">
                                {addresses.filter(addr => !addr.is_active).map((address) => (
                                    <Card key={address.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 group">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 mt-0.5 flex-shrink-0">
                                                            <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('ui.saved_address')}</p>
                                                            <p className="font-medium text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{address.street}</p>
                                                            <p className="text-slate-600 dark:text-slate-400">{address.barangay}, {address.city}</p>
                                                            <p className="text-slate-600 dark:text-slate-400">{address.province}</p>
                                                        </div>
                                                    </div>
                                                    {address.has_ongoing_orders && (
                                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {t('ui.ongoing_orders_restricted_message')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(address)}
                                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        {t('ui.edit')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSetActive(address.id)}
                                                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        {t('ui.set_as_active')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(address.id)}
                                                        className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {t('ui.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? (editingAddress.id === 0 ? t('ui.edit_main_address') : t('ui.edit_address')) : t('ui.add_new_address')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress ? (editingAddress.id === 0 ? t('ui.update_main_address_desc') : t('ui.update_address_info')) : t('ui.add_address_for_deliveries')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">{t('ui.address_line')}</Label>
                            <Input
                                id="street"
                                type="text"
                                required
                                autoComplete="address-line1"
                                value={data.street}
                                onChange={(e) => setData('street', e.target.value)}
                                disabled={processing}
                                placeholder={t('ui.house_number_street_name')}
                            />
                            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                            <p className="text-xs text-muted-foreground">
                                {t('ui.identical_addresses_message')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">{t('ui.province')}</Label>
                                <Select 
                                    value={data.province} 
                                    onValueChange={(value) => setData('province', value)}
                                    disabled={processing}
                                    open={openDropdown === 'province'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'province' : null)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('ui.select_province')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laguna" className="text-green-600 font-medium">
                                            {t('ui.laguna')} ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">{t('ui.city')}</Label>
                                <Select 
                                    value={data.city} 
                                    onValueChange={(value) => setData('city', value)}
                                    disabled={processing}
                                    open={openDropdown === 'city'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'city' : null)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('ui.select_city')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cabuyao" className="text-green-600 font-medium">
                                            {t('ui.cabuyao')} ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barangay">{t('ui.barangay')}</Label>
                            <Select 
                                value={data.barangay} 
                                onValueChange={(value) => setData('barangay', value)}
                                disabled={processing}
                                open={openDropdown === 'barangay'}
                                onOpenChange={(open) => setOpenDropdown(open ? 'barangay' : null)}
                            >
                                <SelectTrigger className="w-full">
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
                            {errors.barangay && <p className="text-sm text-red-500">{errors.barangay}</p>}
                            <p className="text-xs text-muted-foreground">
                                {t('ui.only_sala_available')}
                            </p>
                        </div>

                        {/* Set as Active Address Checkbox */}
                        {!editingAddress && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active || false}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    disabled={processing}
                                    className="rounded border-input bg-background text-primary focus:ring-ring focus:ring-2"
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium">
                                    {t('ui.set_as_active_address')}
                                </Label>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingAddress(null);
                                    setOpenDropdown(null);
                                    reset();
                                }}
                            >
                                {t('ui.cancel')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('ui.saving') : editingAddress ? (editingAddress.id === 0 ? t('ui.update_main_address') : t('ui.update_address')) : t('ui.add_address')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Address Change Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            {t('ui.confirm_address_change')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('ui.review_address_change_impact')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {confirmationData && (
                        <Card className="border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('ui.impact_of_this_change')}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                                <div className="flex items-start gap-3">
                                    <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{t('ui.checkout_orders')}</p>
                                        <p className="text-xs text-muted-foreground">{t('ui.checkout_orders_message')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{t('ui.delivery_address')}</p>
                                        <p className="text-xs text-muted-foreground">{t('ui.delivery_address_message')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{t('ui.address_history')}</p>
                                        <p className="text-xs text-muted-foreground">{t('ui.address_history_message')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowConfirmationModal(false);
                                setConfirmationData(null);
                            }}
                        >
                            {t('ui.cancel')}
                        </Button>
                        <Button
                            onClick={() => {
                                if (confirmationData) {
                                    confirmationData.onConfirm();
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {t('ui.confirm_address_change')}
                        </Button>
                    </DialogFooter>
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('ui.address_management')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('ui.manage_delivery_addresses')}
                                    </p>
                                </div>
                                <Link href="/">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('ui.back')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {pageContent}
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
