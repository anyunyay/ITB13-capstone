import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, usePage, router } from '@inertiajs/react';
import { MapPin, PlusCircle, Edit, Trash2, Home, CheckCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';

interface Address {
    id: number;
    street: string;
    barangay: string;
    city: string;
    province: string;
    is_default: boolean;
}

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        address?: string;
        barangay?: string;
        city?: string;
        province?: string;
    };
    addresses: Address[];
    flash?: {
        success?: string;
        error?: string;
    };
    autoOpenAddForm?: boolean;
    [key: string]: any;
}

export default function AddressPage() {
    const { user, addresses = [], flash, autoOpenAddForm = false } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(autoOpenAddForm);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        street: '',
        barangay: 'Sala', // Fixed default
        city: 'Cabuyao', // Fixed default
        province: 'Laguna', // Fixed default
        is_default: false as boolean, // Default to false - user must explicitly choose
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
        
        // If editing the main address (id = 0), update user's main address fields
        if (editingAddress && editingAddress.id === 0) {
            router.put('/customer/profile/main-address', {
                address: data.street,
                barangay: data.barangay,
                city: data.city,
                province: data.province,
            }, {
                onSuccess: () => {
                    reset();
                    setIsDialogOpen(false);
                    setEditingAddress(null);
                },
                onError: () => {
                    // Error will be handled by flash messages
                },
            });
            return;
        }
        
        const url = editingAddress ? `/customer/profile/addresses/${editingAddress.id}` : '/customer/profile/addresses';
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
            is_default: address.is_default,
        });
        setOpenDropdown(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            destroy(`/customer/profile/addresses/${id}`, {
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
        if (confirm('Are you sure you want to set this address as your active address?')) {
            router.post(`/customer/profile/addresses/${addressId}/set-default`, {}, {
                onSuccess: () => {
                    // Success message will be handled by flash messages
                },
                onError: () => {
                    // Error will be handled by flash messages
                },
            });
        }
    };

    const getAddressIcon = () => {
        return <Home className="h-4 w-4" />;
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { title: 'Address Management', href: '/customer/profile/address' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Address Management</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your delivery addresses. Existing addresses are preserved unless you explicitly set a new one as default.
                        </p>
                    </div>
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add New Address
                    </Button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            <div className="space-y-6">
                {/* Currently Active Address */}
                {addresses.find(addr => addr.is_default) && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">Currently Active Address</h3>
                        <Card className="border-2 border-blue-200 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            {getAddressIcon()}
                                            <span className="text-sm font-medium">Active Address</span>
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-xs font-medium">Default</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(addresses.find(addr => addr.is_default)!)}
                                            className="flex items-center gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="flex items-center gap-1 text-gray-400 cursor-not-allowed opacity-50"
                                        >
                                            <CheckCircle className="h-3 w-3" />
                                            Currently Active
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(addresses.find(addr => addr.is_default)!.id)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="mt-3 space-y-1">
                                    <p className="font-medium text-gray-900">{addresses.find(addr => addr.is_default)!.street}</p>
                                    <p className="text-gray-600">{addresses.find(addr => addr.is_default)!.barangay}, {addresses.find(addr => addr.is_default)!.city}</p>
                                    <p className="text-gray-600">{addresses.find(addr => addr.is_default)!.province}</p>
                                </div>
                                <div className="mt-2 text-xs text-blue-600">
                                    This address is used for checkout and other operations
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {addresses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses found</h3>
                            <p className="text-gray-500 text-center mb-4">
                                Add your first address to make ordering easier and faster.
                            </p>
                            <Button onClick={handleAddNew} className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add Your First Address
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Other Saved Addresses */}
                        {addresses.filter(addr => !addr.is_default).length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Other Saved Addresses</h3>
                                <div className="grid gap-4">
                                    {addresses.filter(addr => !addr.is_default).map((address) => (
                                        <Card key={address.id} className="border border-gray-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            {getAddressIcon()}
                                                            <span className="text-sm font-medium">Saved Address</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(address)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSetActive(address.id)}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                                        >
                                                            <CheckCircle className="h-3 w-3" />
                                                            Set as Active
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(address.id)}
                                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 space-y-1">
                                                    <p className="font-medium text-gray-900">{address.street}</p>
                                                    <p className="text-gray-600">{address.barangay}, {address.city}</p>
                                                    <p className="text-gray-600">{address.province}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
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
                                    id="is_default"
                                    checked={data.is_default || false}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    disabled={processing}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_default" className="text-sm font-medium">
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
        </div>
        </AppHeaderLayout>
    );
}
