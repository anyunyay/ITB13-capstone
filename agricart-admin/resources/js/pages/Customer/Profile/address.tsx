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

interface Address {
    id: number;
    type: 'home' | 'work' | 'other';
    label?: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    postal_code: string;
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
        barangay: '',
        city: '',
        province: '',
        postal_code: '',
        is_default: false,
        label: '',
    });

    const provinces = [
        'Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon',
        'Bulacan', 'Pampanga', 'Tarlac', 'Nueva Ecija', 'Bataan', 'Zambales',
        'Aurora', 'Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan',
        'Abra', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province', 'Apayao',
        'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino', 'Batanes'
    ];

    const cities = {
        'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'San Juan', 'Marikina', 'Caloocan', 'Malabon', 'Navotas', 'Las Piñas', 'Muntinlupa', 'Parañaque', 'Pasay', 'Pateros', 'Valenzuela'],
        'Cavite': ['Bacoor', 'Cavite City', 'Dasmariñas', 'Imus', 'Tagaytay', 'Trece Martires', 'General Trias', 'Kawit', 'Noveleta', 'Rosario', 'Silang', 'Alfonso', 'Amadeo', 'Carmona', 'General Emilio Aguinaldo', 'General Mariano Alvarez', 'Indang', 'Magallanes', 'Maragondon', 'Mendez', 'Naic', 'Tanza', 'Ternate'],
        'Laguna': ['Calamba', 'San Pablo', 'Santa Rosa', 'Biñan', 'Cabuyao', 'Los Baños', 'San Pedro', 'Alaminos', 'Bay', 'Calauan', 'Cavinti', 'Famy', 'Kalayaan', 'Liliw', 'Luisiana', 'Lumban', 'Mabitac', 'Magdalena', 'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 'Pakil', 'Pangil', 'Pila', 'Rizal', 'Santa Cruz', 'Santa Maria', 'Siniloan', 'Victoria'],
        'Batangas': ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas', 'Bauan', 'Calaca', 'Lemery', 'Nasugbu', 'Balayan', 'Calatagan', 'Cuenca', 'Ibaan', 'Laurel', 'Lian', 'Lobo', 'Mabini', 'Malvar', 'Mataasnakahoy', 'Padre Garcia', 'Rosario', 'San Jose', 'San Juan', 'San Luis', 'San Nicolas', 'San Pascual', 'Santa Teresita', 'Taal', 'Talisay', 'Taysan', 'Tingloy', 'Tuy']
    };

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

                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                                id="street"
                                value={data.street}
                                onChange={(e) => setData('street', e.target.value)}
                                placeholder="Enter street address"
                                required
                            />
                            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="barangay">Barangay</Label>
                                <Input
                                    id="barangay"
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    placeholder="Enter barangay"
                                    required
                                />
                                {errors.barangay && <p className="text-sm text-red-500">{errors.barangay}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    placeholder="Enter postal code"
                                    required
                                />
                                {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">Province</Label>
                                <Select value={data.province} onValueChange={(value) => setData('province', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province} value={province}>
                                                {province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="city">City/Municipality</Label>
                                <Select 
                                    value={data.city} 
                                    onValueChange={(value) => setData('city', value)}
                                    disabled={!data.province}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.province && cities[data.province as keyof typeof cities]?.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                            </div>
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
