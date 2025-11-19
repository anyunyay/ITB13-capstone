import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PasswordInput from '@/components/ui/password-input';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Mail
} from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from '@/hooks/use-translation';
import axios from 'axios';
import * as React from "react";

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

// Validation functions
const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    checks: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber
    }
  };
};

const validatePhoneNumber = (phone: string) => {
  const philippineFormat = /^(\+639|09)\d{9}$/;
  return philippineFormat.test(phone);
};

const validateEmail = (email: string) => {
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailFormat.test(email);
};

const validateRequired = (value: string) => {
  return value.trim().length > 0;
};

export default function Index() {
    const t = useTranslation();
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    const { auth, flash } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        contact_number: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        registration_date: formattedToday,
    });

    // Validation state
    const [validation, setValidation] = useState({
        password: validatePassword(data.password),
        phone: validatePhoneNumber(data.contact_number),
        email: validateEmail(data.email),
        name: validateRequired(data.name),
        street: validateRequired(data.street),
        barangay: validateRequired(data.barangay),
        city: validateRequired(data.city),
        province: validateRequired(data.province),
    });

    // Update validation when data changes
    useEffect(() => {
        setValidation({
            password: validatePassword(data.password),
            phone: validatePhoneNumber(data.contact_number),
            email: validateEmail(data.email),
            name: validateRequired(data.name),
            street: validateRequired(data.street),
            barangay: validateRequired(data.barangay),
            city: validateRequired(data.city),
            province: validateRequired(data.province),
        });
    }, [data]);

    // Handle name change with sanitization
    const handleNameChange = (value: string) => {
        const sanitizedValue = value.replace(/[^a-zA-Z\s\-'.]/g, '');
        setData('name', sanitizedValue);
    };

    // Handle contact number change with sanitization
    const handleContactChange = (value: string) => {
        const sanitizedValue = value.replace(/[^0-9+]/g, '');
        setData('contact_number', sanitizedValue);
    };

    // Check if form is valid
    const isFormValid = validation.password.isValid && 
                       validation.phone && 
                       validation.email &&
                       validation.name && 
                       validation.street && 
                       validation.barangay && 
                       validation.city && 
                       validation.province;

    const  handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure registration_date is set before submitting
        if (!data.registration_date) {
            setData('registration_date', formattedToday);
        }
        post(route('logistics.store'));
    }

    return (
        <PermissionGuard 
            permission="create logistics"
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.add_logistics_partner')} />
                <div className="bg-background">
                    <div className="w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8">
                        {/* Flash Messages */}
                        <FlashMessage flash={flash} />
                        
                        {/* Page Header */}
                        <div className="mb-2 sm:mb-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.add_logistics_partner')}</h1>
                                        <p className="text-sm text-muted-foreground mt-1">{t('admin.logistic_management_description')}</p>
                                    </div>
                                </div>
                                {/* Mobile: Icon only */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    asChild
                                    className="sm:hidden"
                                >
                                    <Link href={route('logistics.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                {/* Desktop: Full button with text */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="hidden sm:flex items-center gap-2"
                                >
                                    <Link href={route('logistics.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                        {t('ui.back')} {t('admin.logistics')}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-3'>

                            {/* Display Error */}
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertTitle>{t('admin.error_title')}</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {Object.entries(errors).map(([key, message]) => (
                                                <li key={key} className="text-sm">{message as string}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Information Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{t('admin.product_information')}</CardTitle>
                                    <CardDescription>{t('admin.fill_product_details')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className='space-y-2'>
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            {t('admin.logistic_name_label')} <span className="text-destructive">*</span>
                                            {validation.name ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                            )}
                                        </Label>
                                        <Input 
                                            id="name"
                                            placeholder={t('admin.logistic_name_label')} 
                                            value={data.name} 
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className={validation.name ? 'border-green-500' : errors.name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            <Mail className="h-4 w-4 inline mr-1" />
                                            {t('admin.logistic_email_label')} <span className="text-destructive">*</span>
                                            {validation.email ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                            )}
                                        </Label>
                                        <Input 
                                            id="email"
                                            type="email"
                                            placeholder={t('admin.email_address')} 
                                            value={data.email} 
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={validation.email ? 'border-green-500' : errors.email ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            <Lock className="h-4 w-4 inline mr-1" />
                                            {t('admin.password')} <span className="text-destructive">*</span>
                                            {validation.password.isValid ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                            ) : data.password ? (
                                                <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                            ) : null}
                                        </Label>
                                        <PasswordInput 
                                            id="password"
                                            placeholder={t('admin.create_secure_password')} 
                                            value={data.password} 
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={validation.password.isValid ? 'border-green-500' : errors.password ? 'border-red-500' : ''}
                                            required
                                        />
                                        {data.password && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {validation.password.checks.minLength ? (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={validation.password.checks.minLength ? 'text-green-600' : 'text-red-600'}>
                                                        {t('admin.at_least_8_characters')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {validation.password.checks.hasUpperCase ? (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={validation.password.checks.hasUpperCase ? 'text-green-600' : 'text-red-600'}>
                                                        {t('admin.one_uppercase_letter')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {validation.password.checks.hasLowerCase ? (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={validation.password.checks.hasLowerCase ? 'text-green-600' : 'text-red-600'}>
                                                        {t('admin.one_lowercase_letter')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {validation.password.checks.hasNumber ? (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={validation.password.checks.hasNumber ? 'text-green-600' : 'text-red-600'}>
                                                        {t('admin.one_number')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor="contact_number" className="text-sm font-medium">
                                            <Phone className="h-4 w-4 inline mr-1" />
                                            {t('admin.logistic_contact_number_label')} <span className="text-destructive">*</span>
                                            {validation.phone ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                            ) : data.contact_number ? (
                                                <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                            ) : null}
                                        </Label>
                                        <Input 
                                            id="contact_number"
                                            type="tel"
                                            placeholder={t('admin.philippine_format_only')} 
                                            value={data.contact_number} 
                                            onChange={(e) => handleContactChange(e.target.value)}
                                            className={validation.phone ? 'border-green-500' : errors.contact_number ? 'border-red-500' : ''}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin.format_hint')}
                                        </p>
                                        {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Address Information Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        {t('admin.address_information')}
                                    </CardTitle>
                                    <CardDescription>{t('admin.enter_member_address_details')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className='space-y-2'>
                                            <Label htmlFor="street" className="text-sm font-medium">
                                                {t('admin.street')} <span className="text-destructive">*</span>
                                                {validation.street ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                                )}
                                            </Label>
                                            <Input 
                                                id="street"
                                                placeholder={t('admin.street')} 
                                                value={data.street} 
                                                onChange={(e) => setData('street', e.target.value)}
                                                className={validation.street ? 'border-green-500' : errors.street ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor="barangay" className="text-sm font-medium">
                                                {t('admin.barangay')} <span className="text-destructive">*</span>
                                                {validation.barangay ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                                )}
                                            </Label>
                                            <Input 
                                                id="barangay"
                                                placeholder={t('admin.barangay')} 
                                                value={data.barangay} 
                                                onChange={(e) => setData('barangay', e.target.value)}
                                                className={validation.barangay ? 'border-green-500' : errors.barangay ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.barangay && <p className="text-sm text-red-500">{errors.barangay}</p>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor="city" className="text-sm font-medium">
                                                {t('admin.city')} <span className="text-destructive">*</span>
                                                {validation.city ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                                )}
                                            </Label>
                                            <Input 
                                                id="city"
                                                placeholder={t('admin.city')} 
                                                value={data.city} 
                                                onChange={(e) => setData('city', e.target.value)}
                                                className={validation.city ? 'border-green-500' : errors.city ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor="province" className="text-sm font-medium">
                                                {t('admin.province')} <span className="text-destructive">*</span>
                                                {validation.province ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                                )}
                                            </Label>
                                            <Input 
                                                id="province"
                                                placeholder={t('admin.province')} 
                                                value={data.province} 
                                                onChange={(e) => setData('province', e.target.value)}
                                                className={validation.province ? 'border-green-500' : errors.province ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Registration Date Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        {t('admin.registration_date')}
                                    </CardTitle>
                                    <CardDescription>{t('admin.set_registration_date_upload_documents')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className='space-y-2'>
                                        <Label htmlFor="registration_date" className="text-sm font-medium">{t('admin.registration_date_label')}</Label>
                                        <div className="relative">
                                            {(() => {
                                                const [date, setDate] = React.useState<Date>(today);
                                                const [value, setValue] = React.useState<string>(formatDate(today));
                                                const [month, setMonth] = React.useState<Date>(today);
                                                const [open, setOpen] = React.useState(false);

                                                return (
                                                    <>
                                                        <Input
                                                            id="date"
                                                            value={value}
                                                            placeholder={t('admin.date_placeholder')}
                                                            className="bg-background pr-10"
                                                            onChange={(e) => {
                                                                setValue(e.target.value);
                                                                const date = new Date(e.target.value);
                                                                if (isValidDate(date)) {
                                                                    setDate(date);
                                                                    setMonth(date);
                                                                    setData('registration_date', date.toISOString().split('T')[0]);
                                                                } else {
                                                                    setData('registration_date', '');
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "ArrowDown") {
                                                                    e.preventDefault();
                                                                    setOpen(true);
                                                                }
                                                            }}
                                                        />
                                                        <Popover open={open} onOpenChange={setOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button id="date-picker" variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2" >
                                                                    <CalendarIcon className="size-3.5" />
                                                                    <span className="sr-only">{t('admin.select_date')}</span>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    captionLayout="dropdown"
                                                                    month={month}
                                                                    onMonthChange={setMonth}
                                                                    onSelect={(newDate) => {
                                                                        if (newDate) {
                                                                            setDate(newDate);
                                                                            const formatted = formatDate(newDate);
                                                                            setValue(formatted);
                                                                            setOpen(false);
                                                                            setData('registration_date', newDate.toISOString().split('T')[0]);
                                                                        }
                                                                    }}
                                                                    defaultMonth={new Date()}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3">
                                <Button 
                                    disabled={processing || !isFormValid} 
                                    type="submit"
                                >
                                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {processing ? t('admin.adding') : t('admin.add_logistics_partner')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
