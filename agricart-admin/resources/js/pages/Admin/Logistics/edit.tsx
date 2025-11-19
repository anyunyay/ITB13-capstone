import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { 
  User, 
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
import { SharedData } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
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
const validatePhoneNumber = (phone: string) => {
    if (!phone) return true;
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

interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    registration_date?: string;
    type: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        full_address: string;
    };
    [key: string]: unknown;
}

interface Props {
    logistic: Logistic;
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function Edit({ logistic, flash }: Props) {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    
    // Check if the user is authenticated
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, post, processing, errors } = useForm({
        name: logistic.name,
        email: logistic.email,
        contact_number: logistic.contact_number || '',
        street: logistic.default_address?.street || '',
        barangay: logistic.default_address?.barangay || '',
        city: logistic.default_address?.city || '',
        province: logistic.default_address?.province || '',
        registration_date: logistic.registration_date,
        _method: 'put',
    });

    // Store original values for change detection
    const originalData = {
        name: logistic.name,
        email: logistic.email,
        contact_number: logistic.contact_number || '',
        street: logistic.default_address?.street || '',
        barangay: logistic.default_address?.barangay || '',
        city: logistic.default_address?.city || '',
        province: logistic.default_address?.province || '',
        registration_date: logistic.registration_date,
    };

    // Validation state
    const [validation, setValidation] = useState({
        phone: validatePhoneNumber(data.contact_number),
        email: validateEmail(data.email),
        name: validateRequired(data.name),
        street: validateRequired(data.street),
        barangay: validateRequired(data.barangay),
        city: validateRequired(data.city),
        province: validateRequired(data.province),
    });

    // Change detection state
    const [hasChanges, setHasChanges] = useState(false);

    // Update validation when data changes
    useEffect(() => {
        setValidation({
            phone: validatePhoneNumber(data.contact_number),
            email: validateEmail(data.email),
            name: validateRequired(data.name),
            street: validateRequired(data.street),
            barangay: validateRequired(data.barangay),
            city: validateRequired(data.city),
            province: validateRequired(data.province),
        });
    }, [data]);

    // Detect changes in form data
    useEffect(() => {
        const hasDataChanged = 
            data.name !== originalData.name ||
            data.email !== originalData.email ||
            data.contact_number !== originalData.contact_number ||
            data.street !== originalData.street ||
            data.barangay !== originalData.barangay ||
            data.city !== originalData.city ||
            data.province !== originalData.province ||
            data.registration_date !== originalData.registration_date;
        
        setHasChanges(hasDataChanged);
    }, [data, originalData]);

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
    const isFormValid = validation.phone && 
                       validation.email &&
                       validation.name && 
                       validation.street && 
                       validation.barangay && 
                       validation.city && 
                       validation.province &&
                       hasChanges; // Only enable if there are changes

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('logistics.update', String(logistic.id)), {
            forceFormData: true,
            preserveState: true,
        });
    }

    return (
        <PermissionGuard 
            permission="edit logistics"
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.update_logistic')} />
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
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.update_logistic')}</h1>
                                        <p className="text-sm text-muted-foreground mt-1">{t('admin.update_member_information')}</p>
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

                        <form onSubmit={handleUpdate} className='space-y-3'>
                            {/* Display Error */}
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertTitle>{t('admin.error_title')}</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {Object.entries(errors).map(([key, value]) => (
                                                <li key={key} className="text-sm">
                                                    {typeof value === 'string' ? value : Array.isArray(value) ? value[0] : t('admin.an_error_occurred')}
                                                </li>
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
                                                const initialDate = React.useMemo(() => {
                                                    if (logistic.registration_date) {
                                                        const d = new Date(logistic.registration_date);
                                                        return isValidDate(d) ? d : undefined;
                                                    }
                                                    return undefined;
                                                }, [logistic.registration_date]);

                                                const [date, setDate] = React.useState<Date | undefined>(initialDate);
                                                const [value, setValue] = React.useState<string>(formatDate(initialDate));
                                                const [month, setMonth] = React.useState<Date>(initialDate ?? new Date());
                                                const [open, setOpen] = React.useState(false);

                                                React.useEffect(() => {
                                                    setValue(formatDate(initialDate));
                                                    setDate(initialDate);
                                                    setMonth(initialDate ?? new Date());
                                                }, [initialDate]);

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
                                                                    onSelect={(date) => {
                                                                        setDate(date);
                                                                        const formatted = formatDate(date);
                                                                        setValue(formatted);
                                                                        setOpen(false);
                                                                        if (date && isValidDate(date)) {
                                                                            setData('registration_date', date.toISOString().split('T')[0]);
                                                                        } else {
                                                                            setData('registration_date', '');
                                                                        }
                                                                    }}
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
                            <Card className="shadow-sm">
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={isFormValid ? "default" : "secondary"}>
                                                {!hasChanges ? t('admin.no_changes') || 'No changes made' : isFormValid ? t('admin.ready_to_submit') : t('admin.incomplete_form')}
                                            </Badge>
                                            {isFormValid && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={route('logistics.index')}>{t('ui.cancel')}</Link>
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={processing || !isFormValid}
                                                className="min-w-[120px]"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {t('admin.updating')}
                                                    </>
                                                ) : (
                                                    t('admin.update_logistic')
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
