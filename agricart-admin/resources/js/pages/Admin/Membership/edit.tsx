import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
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

interface Member {
    id: number;
    name: string;
    email?: string;
    member_id?: string;
    contact_number?: string;
    registration_date?: string;
    document?: string;
    document_marked_for_deletion?: boolean;
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
    member: Member;
}

// Validation functions
const validatePhoneNumber = (phone: string) => {
  if (!phone) return true;
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

export default function Edit({member}: Props) {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    
    // Check if the user is authenticated
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const {data, setData, post, processing, errors} = useForm({
        name: member.name || '',
        contact_number: member.contact_number || '',
        street: member.default_address?.street || '',
        barangay: member.default_address?.barangay || '',
        city: member.default_address?.city || '',
        province: member.default_address?.province || '',
        registration_date: member.registration_date || '',
        document: null as File | null,
        member_id: member.member_id || '',
        _method: 'put',
    });

    // Store original values for comparison
    const originalData = React.useRef({
        name: member.name || '',
        contact_number: member.contact_number || '',
        street: member.default_address?.street || '',
        barangay: member.default_address?.barangay || '',
        city: member.default_address?.city || '',
        province: member.default_address?.province || '',
        registration_date: member.registration_date || '',
    });

    // Track if a new file has been uploaded
    const [hasNewFile, setHasNewFile] = useState(false);
    
    // Track if any field has been modified
    const [hasChanges, setHasChanges] = useState(false);

    // Duplicate check states
    const [isDuplicateName, setIsDuplicateName] = useState(false);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isDuplicateContact, setIsDuplicateContact] = useState(false);
    const [isCheckingContact, setIsCheckingContact] = useState(false);

    // Validation state
    const [validation, setValidation] = useState({
        phone: validatePhoneNumber(data.contact_number),
        name: validateRequired(data.name),
        street: validateRequired(data.street),
        barangay: validateRequired(data.barangay),
        city: validateRequired(data.city),
        province: validateRequired(data.province),
    });

    // Update validation when data changes
    useEffect(() => {
        setValidation({
            phone: validatePhoneNumber(data.contact_number),
            name: validateRequired(data.name),
            street: validateRequired(data.street),
            barangay: validateRequired(data.barangay),
            city: validateRequired(data.city),
            province: validateRequired(data.province),
        });
    }, [data]);

    // Check if any field has been modified
    useEffect(() => {
        const isModified = 
            data.name !== originalData.current.name ||
            data.contact_number !== originalData.current.contact_number ||
            data.street !== originalData.current.street ||
            data.barangay !== originalData.current.barangay ||
            data.city !== originalData.current.city ||
            data.province !== originalData.current.province ||
            data.registration_date !== originalData.current.registration_date ||
            hasNewFile;
        
        setHasChanges(isModified);
    }, [data, hasNewFile]);

    // Debounced duplicate check for name (excluding current member)
    const checkDuplicateName = useCallback(
        debounce(async (name: string) => {
            if (!name.trim() || name === member.name) {
                setIsDuplicateName(false);
                setIsCheckingName(false);
                return;
            }

            setIsCheckingName(true);
            try {
                const response = await axios.post(route('membership.checkDuplicateName'), { name, exclude_id: member.id });
                setIsDuplicateName(response.data.exists);
            } catch (error) {
                console.error('Error checking duplicate name:', error);
                setIsDuplicateName(false);
            } finally {
                setIsCheckingName(false);
            }
        }, 500),
        [member.name, member.id]
    );

    // Debounced duplicate check for contact number (excluding current member)
    const checkDuplicateContact = useCallback(
        debounce(async (contactNumber: string) => {
            if (!contactNumber.trim() || contactNumber === member.contact_number) {
                setIsDuplicateContact(false);
                setIsCheckingContact(false);
                return;
            }

            setIsCheckingContact(true);
            try {
                const response = await axios.post(route('membership.checkDuplicateContact'), { contact_number: contactNumber, exclude_id: member.id });
                setIsDuplicateContact(response.data.exists);
            } catch (error) {
                console.error('Error checking duplicate contact:', error);
                setIsDuplicateContact(false);
            } finally {
                setIsCheckingContact(false);
            }
        }, 500),
        [member.contact_number, member.id]
    );

    // Handle name change with sanitization and duplicate check
    const handleNameChange = (value: string) => {
        const sanitizedValue = value.replace(/[^a-zA-Z\s\-'.]/g, '');
        setData('name', sanitizedValue);
        checkDuplicateName(sanitizedValue);
    };

    // Handle contact number change with sanitization and duplicate check
    const handleContactChange = (value: string) => {
        const sanitizedValue = value.replace(/[^0-9+]/g, '');
        setData('contact_number', sanitizedValue);
        checkDuplicateContact(sanitizedValue);
    };

    // Check if form is valid
    const isUpdateDisabled = Boolean(member.document_marked_for_deletion) && !hasNewFile;
    
    const isFormValid = validation.phone && 
                       validation.name && 
                       validation.street && 
                       validation.barangay && 
                       validation.city && 
                       validation.province && 
                       !isDuplicateName &&
                       !isDuplicateContact &&
                       !isCheckingName &&
                       !isCheckingContact &&
                       !isUpdateDisabled &&
                       hasChanges; // Only enable if there are changes

    const handleFileUpload = (file: File | null) => {
        setData('document', file);
        setHasNewFile(!!file);
    }

    const handleFileRemove = () => {
        setData('document', null);
        setHasNewFile(false);
    }

    const handleFileDelete = async (filePath: string) => {
        try {
            const response = await fetch(route('membership.delete-document', member.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                router.reload();
            } else {
                throw new Error('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isUpdateDisabled) {
            return;
        }
        
        post(route('membership.update', String(member.id)), {
            forceFormData: true,
            preserveState: true,
        });
    }

    return (
        <PermissionGuard 
            permission="edit members"
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.update_member')}/>
                <div className="bg-background">
                    <div className="w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8">
                        {/* Page Header */}
                        <div className="mb-2 sm:mb-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.update_member')}</h1>
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

                            {/* Two Column Layout on Large Screens */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                {/* Left Column - Main Information */}
                                <div className="lg:col-span-2 space-y-3">
                                    {/* Basic Information Card */}
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">{t('admin.product_information')}</CardTitle>
                                            <CardDescription>{t('admin.fill_product_details')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className='space-y-2'>
                                                <Label htmlFor="member_id" className="text-sm font-medium">{t('admin.member_id')}</Label>
                                                <Input 
                                                    id="member_id"
                                                    placeholder={t('admin.member_id_placeholder')} 
                                                    value={data.member_id || t('admin.not_assigned')} 
                                                    disabled
                                                    className="bg-gray-50 text-gray-500"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t('admin.member_id_description')}
                                                </p>
                                            </div>

                                            <div className='space-y-2'>
                                                <Label htmlFor="name" className="text-sm font-medium">
                                                    {t('admin.name')} <span className="text-destructive">*</span>
                                                    {validation.name && !isDuplicateName && !isCheckingName ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                                                    )}
                                                </Label>
                                                <Input 
                                                    id="name"
                                                    placeholder={t('admin.member_name_placeholder')} 
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
                                                        {t('admin.member_name_exists') || 'This member name already exists.'}
                                                    </p>
                                                )}
                                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className='space-y-2'>
                                                <Label htmlFor="contact_number" className="text-sm font-medium">
                                                    <Phone className="h-4 w-4 inline mr-1" />
                                                    {t('admin.contact_number')} <span className="text-destructive">*</span>
                                                    {validation.phone && !isDuplicateContact && !isCheckingContact ? (
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
                                                        {t('admin.contact_number_exists') || 'This contact number is already registered.'}
                                                    </p>
                                                )}
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
                                                            if (member.registration_date) {
                                                                const d = new Date(member.registration_date);
                                                                return isValidDate(d) ? d : undefined;
                                                            }
                                                            return undefined;
                                                        }, [member.registration_date]);

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
                                                                    id="registration_date"
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
                                </div>

                                {/* Right Column - Document Upload & Actions */}
                                <div className="lg:col-span-1 space-y-3">
                                    {/* File Upload Warning */}
                                    {isUpdateDisabled && (
                                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>{t('admin.file_upload_required')}</AlertTitle>
                                            <AlertDescription>
                                                {t('admin.file_upload_required_description')}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Document Upload Card */}
                                    <Card className="shadow-sm lg:sticky lg:top-4">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                {t('admin.document_upload')}
                                            </CardTitle>
                                            <CardDescription>{t('admin.upload_valid_id_document')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className='space-y-2'>
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    {t('admin.document_upload')}
                                                    {(data.document || member.document) && !member.document_marked_for_deletion ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </Label>
                                                <FileUpload
                                                    label=""
                                                    currentFile={member.document}
                                                    onFileChange={handleFileUpload}
                                                    onFileRemove={handleFileRemove}
                                                    onFileDelete={handleFileDelete}
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    memberId={member.id}
                                                    documentMarkedForDeletion={Boolean(member.document_marked_for_deletion)}
                                                />
                                                <p className="text-xs text-muted-foreground">{t('admin.supported_formats')}: JPG, PNG, PDF (Max 2MB)</p>
                                                {errors.document && <p className="text-sm text-red-500">{errors.document}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Action Buttons */}
                                    <Card className="shadow-sm">
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={isFormValid ? "default" : "secondary"}>
                                                        {!hasChanges 
                                                            ? t('admin.no_changes') || 'No Changes'
                                                            : isFormValid 
                                                                ? t('admin.ready_to_submit') 
                                                                : t('admin.incomplete_form')
                                                        }
                                                    </Badge>
                                                    {isFormValid && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <Button 
                                                    type="submit" 
                                                    disabled={processing || !isFormValid}
                                                    className="w-full"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            {t('ui.updating')}
                                                        </>
                                                    ) : (
                                                        t('admin.update_member_details')
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                    className="w-full"
                                                    disabled={processing}
                                                >
                                                    <Link href={route('membership.index')}>{t('ui.cancel')}</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
