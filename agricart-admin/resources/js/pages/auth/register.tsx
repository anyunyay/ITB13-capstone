import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, UserPlus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { FormEventHandler, useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';

import InputError from '@/components/common/forms/input-error';
import TextLink from '@/components/common/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import PasswordValidation from '@/components/ui/password-validation';
import PasswordError from '@/components/ui/password-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

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
    terms_accepted: boolean;
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
        'San Isidro'
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
        terms_accepted: false,
    });

    // State to track if user is typing in password fields
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [isTypingPasswordConfirmation, setIsTypingPasswordConfirmation] = useState(false);

    // Email duplicate checking state
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Debounced duplicate check for email
    const checkDuplicateEmail = useCallback(
        debounce(async (email: string) => {
            if (!email.trim() || !emailRegex.test(email)) {
                setIsDuplicateEmail(false);
                setIsCheckingEmail(false);
                return;
            }

            setIsCheckingEmail(true);
            try {
                const response = await axios.post(route('register.checkDuplicateEmail'), { email });
                setIsDuplicateEmail(response.data.exists);
            } catch (error) {
                console.error('Error checking duplicate email:', error);
                setIsDuplicateEmail(false);
            } finally {
                setIsCheckingEmail(false);
            }
        }, 500),
        []
    );

    // Check email when it changes
    useEffect(() => {
        if (data.email) {
            checkDuplicateEmail(data.email);
        } else {
            setIsDuplicateEmail(false);
            setIsCheckingEmail(false);
        }
    }, [data.email]);

    // Comprehensive validation for all required fields
    const isFormValid = useMemo(() => {
        // Check if name is filled (at least 1 character after trim)
        if (!data.name || data.name.trim().length === 0) return false;

        // Check if email is filled and has basic email format
        if (!data.email || !emailRegex.test(data.email)) return false;

        // Check if email is being checked or is duplicate
        if (isCheckingEmail || isDuplicateEmail) return false;

        // Check password requirements (min 8 chars, uppercase, lowercase, number, symbol)
        if (!data.password || data.password.length < 8) return false;
        if (!/[a-z]/.test(data.password)) return false; // lowercase
        if (!/[A-Z]/.test(data.password)) return false; // uppercase
        if (!/[0-9]/.test(data.password)) return false; // number
        if (!/[^A-Za-z0-9]/.test(data.password)) return false; // symbol
        if (/\s/.test(data.password)) return false; // no spaces

        // Check password confirmation matches
        if (!data.password_confirmation || data.password !== data.password_confirmation) return false;

        // Check contact number (must be exactly 10 digits starting with 9)
        if (!data.contact_number || !/^9\d{9}$/.test(data.contact_number)) return false;

        // Check address is filled (at least 1 character after trim)
        if (!data.address || data.address.trim().length === 0) return false;

        // Check barangay, city, province are filled (they have defaults but verify)
        if (!data.barangay || data.barangay !== 'Sala') return false;
        if (!data.city || data.city !== 'Cabuyao') return false;
        if (!data.province || data.province !== 'Laguna') return false;

        // Check terms accepted
        if (!data.terms_accepted) return false;

        return true;
    }, [data]);

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
        <AuthLayout 
            title="Create an account" 
            description="Enter your details below to create your account"
            imageUrl="/images/frontpage/Regis.jpg"
            imagePosition="left"
            icon={<UserPlus />}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
        >
            <Head title="Register" />
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={submit}>
                <div className="grid gap-4 sm:gap-6">
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
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                setData('name', value);
                            }}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
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
                                className={
                                    data.email && emailRegex.test(data.email)
                                        ? isDuplicateEmail
                                            ? 'pr-10 border-red-500 focus-visible:ring-red-500'
                                            : isCheckingEmail
                                            ? 'pr-10'
                                            : 'pr-10 border-green-500 focus-visible:ring-green-500'
                                        : ''
                                }
                            />
                            {data.email && emailRegex.test(data.email) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isCheckingEmail ? (
                                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                                    ) : isDuplicateEmail ? (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            )}
                        </div>
                        {data.email && emailRegex.test(data.email) && !isCheckingEmail && (
                            <>
                                {isDuplicateEmail ? (
                                    <p className="text-xs text-red-500">This email is already registered</p>
                                ) : (
                                    <p className="text-xs text-green-600">Email is available</p>
                                )}
                            </>
                        )}
                        {data.email && !emailRegex.test(data.email) && (
                            <p className="text-xs text-red-500">Please enter a valid email address</p>
                        )}
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
                        <div className="flex gap-2">
                            <div className="w-16 sm:w-20">
                                <Select disabled value="+63">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="+63">+63</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input
                                id="contact_number"
                                type="tel"
                                required
                                tabIndex={5}
                                autoComplete="tel"
                                value={data.contact_number}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    // Remove any non-digit characters
                                    value = value.replace(/\D/g, '');
                                    
                                    // Remove leading 0 if present
                                    if (value.startsWith('0')) {
                                        value = value.substring(1);
                                    }
                                    
                                    // Limit to 10 digits
                                    if (value.length > 10) {
                                        value = value.substring(0, 10);
                                    }
                                    
                                    setData('contact_number', value);
                                }}
                                disabled={processing}
                                placeholder="9XX XXX XXXX"
                                className="flex-1"
                            />
                        </div>
                        <InputError message={errors.contact_number} />
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid gap-2">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="terms_accepted"
                                checked={data.terms_accepted}
                                onCheckedChange={(checked) => setData('terms_accepted', checked === true)}
                                disabled={processing}
                                tabIndex={7}
                                aria-invalid={!!errors.terms_accepted}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <Label 
                                    htmlFor="terms_accepted" 
                                    className="text-sm font-normal cursor-pointer leading-relaxed"
                                >
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => window.open('/terms-of-service', '_blank')}
                                        className="text-primary hover:underline font-medium"
                                        tabIndex={8}
                                    >
                                        Terms of Service
                                    </button>
                                </Label>
                                <InputError message={errors.terms_accepted} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-2 w-full" 
                        tabIndex={10} 
                        disabled={processing || !isFormValid}
                        title={!isFormValid ? "Please fill all required fields correctly" : ""}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                    
                    {/* Debug helper - shows which validation is failing */}
                    {!isFormValid && (
                        <div className="text-xs text-muted-foreground mt-2">
                            <p className="font-medium mb-1">Please ensure:</p>
                            <ul className="space-y-0.5 list-disc list-inside">
                                {(!data.name || data.name.trim().length === 0) && <li>Name is filled</li>}
                                {(!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) && <li>Email is valid</li>}
                                {isDuplicateEmail && <li>Email is not already registered</li>}
                                {isCheckingEmail && <li>Checking email availability...</li>}
                                {(!data.password || data.password.length < 8) && <li>Password is at least 8 characters</li>}
                                {data.password && !/[a-z]/.test(data.password) && <li>Password has lowercase letter</li>}
                                {data.password && !/[A-Z]/.test(data.password) && <li>Password has uppercase letter</li>}
                                {data.password && !/[0-9]/.test(data.password) && <li>Password has number</li>}
                                {data.password && !/[^A-Za-z0-9]/.test(data.password) && <li>Password has symbol (!@#$%^&*)</li>}
                                {data.password && /\s/.test(data.password) && <li>Password has no spaces</li>}
                                {(!data.password_confirmation || data.password !== data.password_confirmation) && <li>Passwords match</li>}
                                {(!data.contact_number || !/^9\d{9}$/.test(data.contact_number)) && <li>Contact number is valid (10 digits starting with 9)</li>}
                                {(!data.address || data.address.trim().length === 0) && <li>Address is filled</li>}
                                {!data.terms_accepted && <li>Terms of Service is accepted</li>}
                            </ul>
                        </div>
                    )}
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