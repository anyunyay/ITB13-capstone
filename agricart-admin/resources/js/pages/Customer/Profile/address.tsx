import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, usePage } from '@inertiajs/react';
import { MapPin, PlusCircle, Edit, Trash2, Home, Briefcase, Tag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import InputError from '@/components/input-error';

// List of all barangays in Cabuyao, Laguna (only Sala is selectable)
const CABUYAO_BARANGAYS = [
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
    'San Isidro',
    'Tulo',
    'Ulong Tubig'
];

interface Address {
    id: number;
    type: 'home' | 'work' | 'other';
    label?: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    postal_code: string;
    contact_number: string;
    is_default: boolean;
}

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    addresses: Address[];
}

export default function AddressPage() {
    const { user, addresses = [] } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        type: 'home' as 'home' | 'work' | 'other',
        street: '',
        barangay: 'Sala', // Default to Sala
        city: 'Cabuyao', // Default to Cabuyao
        province: 'Laguna', // Default to Laguna
        postal_code: '',
        contact_number: '',
        is_default: false,
        label: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingAddress ? `/customer/profile/addresses/${editingAddress.id}` : '/customer/profile/addresses';
        const method = editingAddress ? put : post;

        method(url, {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
                setEditingAddress(null);
                alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
            },
            onError: () => {
                alert('Failed to save address. Please try again.');
            },
        });
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setData({
            type: address.type,
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,
            contact_number: address.contact_number,
            is_default: address.is_default,
            label: address.label || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            destroy(`/customer/profile/addresses/${id}`, {
                onSuccess: () => {
                    alert('Address deleted successfully!');
                },
                onError: () => {
                    alert('Failed to delete address. Please try again.');
                },
            });
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        reset();
        setIsDialogOpen(true);
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home className="h-4 w-4" />;
            case 'work': return <Briefcase className="h-4 w-4" />;
            default: return <Tag className="h-4 w-4" />;
        }
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { label: 'Address Management', href: '/customer/profile/address' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Address Management</h2>
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add New Address
                    </Button>
                </div>

            <div className="grid gap-4">
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
                    addresses.map((address) => (
                        <Card key={address.id} className={`${address.is_default ? 'ring-2 ring-blue-500' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {getAddressIcon(address.type)}
                                            <span className="text-sm font-medium capitalize">{address.type}</span>
                                            {address.is_default && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Default</span>
                                                </div>
                                            )}
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
                                    <p className="text-gray-600">{address.province} {address.postal_code}</p>
                                    {address.contact_number && (
                                        <p className="text-sm text-gray-500">Contact: {address.contact_number}</p>
                                    )}
                                    {address.label && (
                                        <p className="text-sm text-gray-500">Label: {address.label}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress ? 'Update your address information' : 'Add a new address for deliveries'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Address Type</Label>
                                <Select value={data.type} onValueChange={(value: 'home' | 'work' | 'other') => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="home">Home</SelectItem>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="label">Label (Optional)</Label>
                                <Input
                                    id="label"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder="e.g., Main Office, Weekend Home"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input
                                id="contact_number"
                                type="tel"
                                required
                                autoComplete="tel"
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                                disabled={processing}
                                placeholder="+63 9XX XXX XXXX (Philippine format only)"
                            />
                            <InputError message={errors.contact_number} />
                            <p className="text-xs text-muted-foreground">
                                Format: +639XXXXXXXXX or 09XXXXXXXXX
                            </p>
                        </div>

                        <div className="grid gap-2">
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
                            <InputError message={errors.street} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="province">Province</Label>
                                <Select 
                                    value={data.province || 'Laguna'} 
                                    onValueChange={(value) => setData('province', value)}
                                    disabled={processing}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laguna">
                                            Laguna
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.province} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Select 
                                    value={data.city || 'Cabuyao'} 
                                    onValueChange={(value) => setData('city', value)}
                                    disabled={processing}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cabuyao">
                                            Cabuyao
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.city} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="barangay">Barangay</Label>
                            <Select 
                                value={data.barangay || 'Sala'} 
                                onValueChange={(value) => setData('barangay', value)}
                                disabled={processing}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CABUYAO_BARANGAYS.map((barangay) => (
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
                            <InputError message={errors.barangay} />
                            <p className="text-xs text-muted-foreground">
                                Only Barangay Sala is currently available
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value)}
                                placeholder="Enter postal code"
                                required
                            />
                            <InputError message={errors.postal_code} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="is_default" className="text-sm">
                                Set as default address
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingAddress(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        </AppHeaderLayout>
    );
}
