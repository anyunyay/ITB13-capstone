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
import { useEffect, useState } from 'react';
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
import { PermissionGuard } from '@/components/permission-guard';
import { Calendar } from "@/components/ui/calendar"

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

export default function Index() {
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

    // Check if form is valid
    const isFormValid = validation.password.isValid && 
                       validation.phone && 
                       validation.name && 
                       validation.street && 
                       validation.barangay && 
                       validation.city && 
                       validation.province && 
                       data.document;

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
            pageTitle="Create Member Access Denied"
        >
            <AppLayout>
                <Head title="Add Member" />
                <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('membership.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Members
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Add New Member</h1>
                            <p className="text-muted-foreground">Create a new member account with complete information</p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Please fix the following errors:</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{message as string}</li>
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
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the member's basic account details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        Full Name
                                        {validation.name ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={validation.name ? 'border-green-500' : errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Password
                                        {validation.password.isValid ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : data.password ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : null}
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        placeholder="Create a secure password"
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
                                                    At least 8 characters
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {validation.password.checks.hasUpperCase ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                                <span className={validation.password.checks.hasUpperCase ? 'text-green-600' : 'text-red-600'}>
                                                    One uppercase letter
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {validation.password.checks.hasLowerCase ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                                <span className={validation.password.checks.hasLowerCase ? 'text-green-600' : 'text-red-600'}>
                                                    One lowercase letter
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {validation.password.checks.hasNumber ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                                <span className={validation.password.checks.hasNumber ? 'text-green-600' : 'text-red-600'}>
                                                    One number
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
                                        Contact Number
                                        {validation.phone ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : data.contact_number ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : null}
                                    </Label>
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        placeholder="+63 9XX XXX XXXX or 09XXXXXXXXX"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        className={validation.phone ? 'border-green-500' : errors.contact_number ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Philippine format only: +639XXXXXXXXX or 09XXXXXXXXX
                                    </p>
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
                                    Address Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the member's complete address details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="street" className="flex items-center gap-2">
                                            Street Address
                                            {validation.street ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="street"
                                            placeholder="Enter street address"
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
                                            Barangay
                                            {validation.barangay ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="barangay"
                                            placeholder="Enter barangay"
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
                                            City
                                            {validation.city ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="city"
                                            placeholder="Enter city"
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
                                            Province
                                            {validation.province ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </Label>
                                        <Input
                                            id="province"
                                            placeholder="Enter province"
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
                                    Registration Details
                                </CardTitle>
                                <CardDescription>
                                    Set the registration date and upload required documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="registration_date">Registration Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="registration_date"
                                            value={value}
                                            placeholder="Select registration date"
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
                                                    <span className="sr-only">Select date</span>
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
                                        Document Upload
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
                                        Upload a valid ID or document (JPG, PNG, or PDF, max 2MB)
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
                                    {isFormValid ? "Ready to Submit" : "Incomplete Form"}
                                </Badge>
                                {isFormValid && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('membership.index')}>
                                        Cancel
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
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Member"
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
