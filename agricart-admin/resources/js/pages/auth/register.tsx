import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import PasswordValidation from '@/components/ui/password-validation';
import PasswordError from '@/components/ui/password-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    address: string;
    barangay: string;
    city: string;
    province: string;
};

export default function Register() {
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
        'San Isidro',
        'Tulo',
        'Ulong Tubig'
    ];

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        address: '',
        barangay: 'Sala', // Default to Sala
        city: 'Cabuyao', // Default to Cabuyao
        province: 'Laguna', // Default to Laguna
    });

    // State to track if user is typing in password fields
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [isTypingPasswordConfirmation, setIsTypingPasswordConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setIsTypingPassword(false);
                setIsTypingPasswordConfirmation(false);
            },
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => {
                                setData('password', e.target.value);
                                setIsTypingPassword(true);
                            }}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <PasswordError 
                            error={errors.password} 
                            showError={!isTypingPassword} 
                        />
                        <PasswordValidation password={data.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => {
                                setData('password_confirmation', e.target.value);
                                setIsTypingPasswordConfirmation(true);
                            }}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <PasswordError 
                            error={errors.password_confirmation} 
                            showError={!isTypingPasswordConfirmation} 
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_number">Contact Number</Label>
                        <Input
                            id="contact_number"
                            type="tel"
                            required
                            tabIndex={5}
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
                        <Label htmlFor="address">Address Line</Label>
                        <Input
                            id="address"
                            type="text"
                            required
                            tabIndex={6}
                            autoComplete="address-line1"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                            placeholder="House number, street name"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="province">Province</Label>
                            <Select 
                                value={data.province} 
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
                                value={data.city} 
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
                            value={data.barangay} 
                            onValueChange={(value) => setData('barangay', value)}
                            disabled={processing}
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
                        <InputError message={errors.barangay} />
                        <p className="text-xs text-muted-foreground">
                            Only Barangay Sala is currently available
                        </p>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={10} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={11}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}