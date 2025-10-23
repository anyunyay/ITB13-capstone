import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, usePage, router } from '@inertiajs/react';
import { MapPin, PlusCircle, Edit, Trash2, Home, CheckCircle, AlertCircle, CheckCircle2, ShoppingCart, Package, Clock } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';

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
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            mainAddress: `${baseRoute}/profile/main-address`,
            addresses: `${baseRoute}/profile/addresses`,
            addressesStore: `${baseRoute}/profile/addresses`,
            addressesUpdate: `${baseRoute}/profile/addresses`,
            addressesDestroy: `${baseRoute}/profile/addresses`,
            addressesSetActive: `${baseRoute}/profile/addresses`,
        };
    };

    const routes = getProfileRoutes();
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

    return (
        <ProfileWrapper 
            title="Address Management"
        >
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Manage your delivery addresses. Existing addresses are preserved unless you explicitly set a new one as default.
                        </p>
                    </div>
                    <Button 
                        onClick={handleAddNew} 
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add New Address
                    </Button>
                </div>

                {/* Address Cards Section */}
                <div className="space-y-6">
                    {/* Main Address from Registration */}
                    {(user.address || user.barangay || user.city || user.province) && (
                        <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                            <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="p-2 rounded-lg bg-secondary/10">
                                            <MapPin className="h-6 w-6 text-secondary" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-card-foreground">
                                                {isActiveAddressSameAsMain() ? 'Currently Active Address' : 'Main Address (Registration)'}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    isActiveAddressSameAsMain() 
                                                        ? 'bg-secondary/10 text-secondary'
                                                        : 'bg-primary/10 text-primary'
                                                }`}>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {isActiveAddressSameAsMain() ? 'Active' : 'Main Address'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => handleEdit({ id: 0, street: user.address || '', barangay: user.barangay || '', city: user.city || '', province: user.province || '', is_active: false })}
                                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={mainAddressHasOngoingOrders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        {isActiveAddressSameAsMain() && (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Currently Active
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
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Address Details</p>
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
                                            This is your main address from registration. You can edit it or add additional addresses below.
                                        </div>
                                    )}
                                    {mainAddressHasOngoingOrders && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            This address has ongoing orders - editing is restricted
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
                                                Currently Active Address
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => handleEdit(addresses.find(addr => addr.is_active)!)}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(addresses.find(addr => addr.is_active)!.id)}
                                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                            disabled={addresses.find(addr => addr.is_active)?.has_ongoing_orders}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Currently Active
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
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Address Details</p>
                                                <p className="font-medium text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{addresses.find(addr => addr.is_active)!.street}</p>
                                                <p className="text-slate-600 dark:text-slate-400">{addresses.find(addr => addr.is_active)!.barangay}, {addresses.find(addr => addr.is_active)!.city}</p>
                                                <p className="text-slate-600 dark:text-slate-400">{addresses.find(addr => addr.is_active)!.province}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                                        This address is used for checkout and other operations
                                    </div>
                                    
                                    {addresses.find(addr => addr.is_active)?.has_ongoing_orders && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            This address has ongoing orders - editing/deleting is restricted
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
                                    Other Addresses
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
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Saved Address</p>
                                                            <p className="font-medium text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{address.street}</p>
                                                            <p className="text-slate-600 dark:text-slate-400">{address.barangay}, {address.city}</p>
                                                            <p className="text-slate-600 dark:text-slate-400">{address.province}</p>
                                                        </div>
                                                    </div>
                                                    {address.has_ongoing_orders && (
                                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4" />
                                                            This address has ongoing orders - editing/deleting is restricted
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(address)}
                                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSetActive(address.id)}
                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Set as Active
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(address.id)}
                                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                                        disabled={address.has_ongoing_orders}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
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
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? (editingAddress.id === 0 ? 'Edit Main Address' : 'Edit Address') : 'Add New Address'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress ? 
                                (editingAddress.id === 0 ? 
                                    'Update your main address that is automatically used for checkout' : 
                                    'Update your address information'
                                ) : 
                                'Add a new address for deliveries'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Address Line</Label>
                            <Input
                                id="street"
                                type="text"
                                required
                                autoComplete="address-line1"
                                value={data.street}
                                onChange={(e) => setData('street', e.target.value)}
                                disabled={processing}
                                placeholder="House number, street name"
                            />
                            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                            <p className="text-xs text-muted-foreground">
                                Note: Identical addresses will not be saved to prevent duplicates
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">Province</Label>
                                <Select 
                                    value={data.province} 
                                    onValueChange={(value) => setData('province', value)}
                                    disabled={processing}
                                    open={openDropdown === 'province'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'province' : null)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laguna" className="text-green-600 font-medium">
                                            Laguna ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Select 
                                    value={data.city} 
                                    onValueChange={(value) => setData('city', value)}
                                    disabled={processing}
                                    open={openDropdown === 'city'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'city' : null)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cabuyao" className="text-green-600 font-medium">
                                            Cabuyao ✓
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barangay">Barangay</Label>
                            <Select 
                                value={data.barangay} 
                                onValueChange={(value) => setData('barangay', value)}
                                disabled={processing}
                                open={openDropdown === 'barangay'}
                                onOpenChange={(open) => setOpenDropdown(open ? 'barangay' : null)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select barangay" />
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
                                Only Barangay Sala is currently available
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
                                    Set as active address (used for checkout)
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editingAddress ? (editingAddress.id === 0 ? 'Update Main Address' : 'Update Address') : 'Add Address'}
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
                            Confirm Address Change
                        </DialogTitle>
                        <DialogDescription>
                            Please review the impact of this address change before proceeding.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {confirmationData && (
                        <Card className="border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Impact of This Change</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                                <div className="flex items-start gap-3">
                                    <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Checkout & Orders</p>
                                        <p className="text-xs text-muted-foreground">This address will be used for all future orders and checkout processes</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Delivery Address</p>
                                        <p className="text-xs text-muted-foreground">All deliveries will be sent to this new address</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Address History</p>
                                        <p className="text-xs text-muted-foreground">Your current address will be saved in your address list for future use</p>
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
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (confirmationData) {
                                    confirmationData.onConfirm();
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Confirm Address Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ProfileWrapper>
    );
}
