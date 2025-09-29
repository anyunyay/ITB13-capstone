import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

interface AddressFormProps {
    data: {
        contact_number?: string;
        address?: string;
        barangay?: string;
        city?: string;
        province?: string;
    };
    setData: (key: string, value: string) => void;
    errors: Record<string, string>;
    processing?: boolean;
    showContactNumber?: boolean;
    useTextarea?: boolean;
}

export default function AddressForm({ 
    data, 
    setData, 
    errors, 
    processing = false, 
    showContactNumber = true,
    useTextarea = false 
}: AddressFormProps) {
    return (
        <>
            {showContactNumber && (
                <div className="grid gap-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                        id="contact_number"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={data.contact_number || ''}
                        onChange={(e) => setData('contact_number', e.target.value)}
                        disabled={processing}
                        placeholder="+63 9XX XXX XXXX (Philippine format only)"
                    />
                    <InputError message={errors.contact_number} />
                    <p className="text-xs text-muted-foreground">
                        Format: +639XXXXXXXXX or 09XXXXXXXXX
                    </p>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="address">Address Line</Label>
                {useTextarea ? (
                    <Textarea
                        id="address"
                        required
                        value={data.address || ''}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={processing}
                        placeholder="House number, street name"
                        rows={3}
                    />
                ) : (
                    <Input
                        id="address"
                        type="text"
                        required
                        autoComplete="address-line1"
                        value={data.address || ''}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={processing}
                        placeholder="House number, street name"
                    />
                )}
                <InputError message={errors.address} />
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
        </>
    );
}
