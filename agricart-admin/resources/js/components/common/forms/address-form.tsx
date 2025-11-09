import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/common/forms/input-error';
import { useTranslation } from '@/hooks/use-translation';

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
    const t = useTranslation();
    return (
        <>
            {showContactNumber && (
                <div className="grid gap-2">
                    <Label htmlFor="contact_number">{t('ui.phone')} Number</Label>
                    <Input
                        id="contact_number"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={data.contact_number || ''}
                        onChange={(e) => setData('contact_number', e.target.value)}
                        disabled={processing}
                        placeholder={t('ui.phone_format_placeholder')}
                    />
                    <InputError message={errors.contact_number} />
                    <p className="text-xs text-muted-foreground">
                        {t('ui.phone_format_help')}
                    </p>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="address">{t('ui.address_line')}</Label>
                {useTextarea ? (
                    <Textarea
                        id="address"
                        required
                        value={data.address || ''}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={processing}
                        placeholder={t('ui.house_number_street_name')}
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
                        placeholder={t('ui.house_number_street_name')}
                    />
                )}
                <InputError message={errors.address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="province">{t('ui.province')}</Label>
                    <Select 
                        value={data.province || 'Laguna'} 
                        onValueChange={(value) => setData('province', value)}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('ui.select_province')} />
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
                    <Label htmlFor="city">{t('ui.city')}</Label>
                    <Select 
                        value={data.city || 'Cabuyao'} 
                        onValueChange={(value) => setData('city', value)}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('ui.select_city')} />
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
                <Label htmlFor="barangay">{t('ui.barangay')}</Label>
                <Select 
                    value={data.barangay || 'Sala'} 
                    onValueChange={(value) => setData('barangay', value)}
                    disabled={processing}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('ui.select_barangay')} />
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
                    {t('ui.only_sala_available')}
                </p>
            </div>
        </>
    );
}
