import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PasswordInput from '@/components/ui/password-input';
import { FileUpload } from '@/components/ui/file-upload';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
    OctagonAlert, 
    User, 
    Lock, 
    Phone, 
    MapPin, 
    Calendar as CalendarIcon, 
    FileText, 
    CheckCircle, 
    AlertCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { Calendar } from "@/components/ui/calendar"
import { useTranslation } from '@/hooks/use-translation';

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

const validateRequired = (value: string) => {
  return value.trim().length > 0;
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function Index() {
    const t = useTranslation();
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        contact_number: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        registration_date: formattedToday,
        document: null as File | null,
    });

    // Calendar state
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date>(today)
    const [month, setMonth] = useState<Date>(today)
    const [value, setValue] = useState(formatDate(today))

    // Duplicate check states
    const [isDuplicateName, setIsDuplicateName] = useState(false);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isDuplicateContact, setIsDuplicateContact] = useState(false);
    const [isCheckingContact, setIsCheckingContact] = useState(false);

    // Validation state
    const [validation, setValidation] = useState({
        password: validatePassword(data.password),
        phone: validatePhoneNumber(data.contact_number),
        name: validateRequired(data.name),
        street: validateRequired(data.street),
        barangay: validateRequired(data.barangay),
        city: validateRequired(data.city),
        province: validateRequired(data.province),
    })

    // Update validation when data changes
    useEffect(() => {
        setValidation({
            password: validatePassword(data.password),
            phone: validatePhoneNumber(data.contact_number),
            name: validateRequired(data.name),
            street: validateRequired(data.street),
            barangay: validateRequired(data.barangay),
            city: validateRequired(data.city),
            province: validateRequired(data.province),
        });
    }, [data]);

    // Debounced duplicate check for name
    const checkDuplicateName = useCallback(
        debounce(async (name: string) => {
            if (!name.trim()) {
                setIsDuplicateName(false);
                setIsCheckingName(false);
                return;
            }

            setIsCheckingName(true);
            try {
                const response = await axios.post(route('membership.checkDuplicateName'), { name });
                setIsDuplicateName(response.data.exists);
            } catch (error) {
                console.error('Error checking duplicate name:', error);
                setIsDuplicateName(false);
            } finally {
                setIsCheckingName(false);
            }
        }, 500),
        []
    );

    // Debounced duplicate check for contact number
    const checkDuplicateContact = useCallback(
        debounce(async (contactNumber: string) => {
            if (!contactNumber.trim()) {
                setIsDuplicateContact(false);
                setIsCheckingContact(false);
                return;
            }

            setIsCheckingContact(true);
            try {
                const response = await axios.post(route('membership.checkDuplicateContact'), { contact_number: contactNumber });
                setIsDuplicateContact(response.data.exists);
            } catch (error) {
                console.error('Error checking duplicate contact:', error);
                setIsDuplicateContact(false);
            } finally {
                setIsCheckingContact(false);
            }
        }, 500),
        []
    );

    // Handle name change with sanitization and duplicate check
    const handleNameChange = (value: string) => {
        // Allow letters, spaces, and common name characters (hyphens, apostrophes, periods)
        const sanitizedValue = value.replace(/[^a-zA-Z\s\-'.]/g, '');
        setData('name', sanitizedValue);
        checkDuplicateName(sanitizedValue);
    };

    // Handle contact number change with sanitization and duplicate check
    const handleContactChange = (value: string) => {
        // Only allow numbers and + sign
        const sanitizedValue = value.replace(/[^0-9+]/g, '');
        setData('contact_number', sanitizedValue);
        checkDuplicateContact(sanitizedValue);
    };

    // Check if form is valid
    const isFormValid = validation.password.isValid && 
                       validation.phone && 
                       validation.name && 
                       validation.street && 
                       validation.barangay && 
                       validation.city && 
                       validation.province && 
                       data.document &&
                       !isDuplicateName &&
                       !isDuplicateContact &&
                       !isCheckingName &&
                       !isCheckingContact;

    const handleDocumentUpload = (file: File | null) => {
        setData('document', file);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure registration_date is set before submitting
        if (!data.registration_date) {
            setData('registration_date', formattedToday);
        }
        post(route('membership.store'));
    }

    return (
        <PermissionGuard 
            permission="create members"
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.add_member')} />
                <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.add_new_member')}</h1>
                                    <p className="text-sm text-muted-foreground mt-1">{t('admin.create_member_account')}</p>
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
                                <Link href={route('membership.index')}>
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
                                <Link href={route('membership.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('admin.back_to_members')}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t('admin.fix_errors')}:</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{typeof message === 'string' ? message : t('admin.an_error_occurred')}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {t('admin.basic_information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.enter_member_basic_details')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        {t('admin.full_name')} <span className="text-destructive">*</span>
                                        {validation.name && !isDuplicateName && !isCheckingName ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder={t('admin.enter_full_name')}
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className={`${validation.name && !isDuplicateName ? 'border-green-500' : ''} ${isDuplicateName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        required
                                    />
                                    {isCheckingName && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin.checking_member_name') || 'Checking member name...'}
                                        </p>
                                    )}
                                    {isDuplicateName && !isCheckingName && (
                                        <p className="text-xs text-destructive">
                                            {t('admin.member_name_exists') || 'This member name already exists. Please use a different name.'}
                                        </p>
                                    )}
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        {t('admin.password')}
                                        {validation.password.isValid ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : data.password ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : null}
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        placeholder={t('admin.create_secure_password')}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={validation.password.isValid ? 'border-green-500' : errors.password ? 'border-red-500' : ''}
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
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_number" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {t('admin.contact_number')} <span className="text-destructive">*</span>
                                        {validation.phone && !isDuplicateContact && !isCheckingContact ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : data.contact_number ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : null}
                                    </Label>
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        placeholder={t('admin.philippine_format_only')}
                                        value={data.contact_number}
                                        onChange={(e) => handleContactChange(e.target.value)}
                                        className={`${validation.phone && !isDuplicateContact ? 'border-green-500' : ''} ${isDuplicateContact ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.format_hint')}
                                    </p>
                                    {isCheckingContact && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin.checking_contact_number') || 'Checking contact number...'}
                                        </p>
                                    )}
                                    {isDuplicateContact && !isCheckingContact && (
                                        <p className="text-xs text-destructive">
                                            {t('admin.contact_number_exists') || 'This contact number is already registered. Please use a different number.'}
                                        </p>
                                    )}
                                    {errors.contact_number && (
                                        <p className="text-sm text-red-500">{errors.contact_number}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {t('admin.address_information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.enter_member_address_details')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="street" className="flex items-center gap-2">
                                            {t('admin.street')}
                                            {validation.street ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="street"
                                            placeholder={t('admin.street')}
                                            value={data.street}
                                            onChange={(e) => setData('street', e.target.value)}
                                            className={validation.street ? 'border-green-500' : errors.street ? 'border-red-500' : ''}
                                        />
                                        {errors.street && (
                                            <p className="text-sm text-red-500">{errors.street}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="barangay" className="flex items-center gap-2">
                                            {t('admin.barangay')}
                                            {validation.barangay ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="barangay"
                                            placeholder={t('admin.barangay')}
                                            value={data.barangay}
                                            onChange={(e) => setData('barangay', e.target.value)}
                                            className={validation.barangay ? 'border-green-500' : errors.barangay ? 'border-red-500' : ''}
                                        />
                                        {errors.barangay && (
                                            <p className="text-sm text-red-500">{errors.barangay}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="flex items-center gap-2">
                                            {t('admin.city')}
                                            {validation.city ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="city"
                                            placeholder={t('admin.city')}
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className={validation.city ? 'border-green-500' : errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province" className="flex items-center gap-2">
                                            {t('admin.province')}
                                            {validation.province ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="province"
                                            placeholder={t('admin.province')}
                                            value={data.province}
                                            onChange={(e) => setData('province', e.target.value)}
                                            className={validation.province ? 'border-green-500' : errors.province ? 'border-red-500' : ''}
                                        />
                                        {errors.province && (
                                            <p className="text-sm text-red-500">{errors.province}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Registration Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    {t('admin.registration_details')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.set_registration_date_upload_documents')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="registration_date">{t('admin.registration_date_label')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="registration_date"
                                            value={value}
                                            placeholder={t('admin.select_registration_date')}
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
                                                <Button 
                                                    id="date-picker" 
                                                    variant="ghost" 
                                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                                >
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
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        {t('admin.document_upload')}
                                        {data.document ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </Label>
                                    <FileUpload
                                        onFileChange={handleDocumentUpload}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.upload_valid_id_document')}
                                    </p>
                                    {errors.document && (
                                        <p className="text-sm text-red-500">{errors.document}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Badge variant={isFormValid ? "default" : "secondary"}>
                                    {isFormValid ? t('admin.ready_to_submit') : t('admin.incomplete_form')}
                                </Badge>
                                {isFormValid && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('membership.index')}>
                                        {t('ui.cancel')}
                                    </Link>
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing || !isFormValid}
                                    className="min-w-[120px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t('ui.creating')}
                                        </>
                                    ) : (
                                        t('admin.create_member')
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
