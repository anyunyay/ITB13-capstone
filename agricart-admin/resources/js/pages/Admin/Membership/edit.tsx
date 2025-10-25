import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { OctagonAlert } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import * as React from "react"
import { CalendarIcon } from "lucide-react"
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

interface Member {
    id: number;
    name: string;
    email?: string;
    member_id?: string;
    contact_number?: string;
    registration_date?: string;
    document?: string;
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

export default function Edit({member}: Props) {
    const { auth } = usePage<SharedData>().props;
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
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

    // Track if a new file has been uploaded
    const [hasNewFile, setHasNewFile] = React.useState(false);

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
                // Update the member data to reflect the deletion
                const updatedMember = { ...member, document: null };
                // You might want to update the page data here
                router.reload();
            } else {
                throw new Error('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Check if update should be disabled
    const isUpdateDisabled = Boolean(member.document_marked_for_deletion) && !hasNewFile;

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent submission if document is marked for deletion but no new file is uploaded
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
            pageTitle="Edit Member Access Denied"
        >
            <AppLayout>
                <Head title="Update Member"/>
                <div className='w-8/12 p-4'>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    {/* Display Error */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>Error!</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key} className="text-sm">
                                            {typeof value === 'string' ? value : Array.isArray(value) ? value[0] : 'An error occurred'}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='gap-1.5'>
                        <Label htmlFor="member_id">Member ID</Label>
                        <Input 
                            placeholder="2411001" 
                            value={data.member_id || 'Not assigned'} 
                            disabled
                            className="bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-muted-foreground">
                            Unique identifier for the member (auto-generated)
                        </p>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member name">Name</Label>
                        <Input placeholder="Member Name" value={data.name} onChange={(e) => setData('name', e.target.value)}/>
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member contact_number">Contact Number</Label>
                        <Input 
                            type="tel" 
                            placeholder="+63 9XX XXX XXXX (Philippine format only)" 
                            value={data.contact_number} 
                            onChange={(e) => setData('contact_number', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: +639XXXXXXXXX or 09XXXXXXXXX
                        </p>
                        {errors.contact_number && <p className="text-sm text-red-500 mt-1">{errors.contact_number}</p>}
                    </div>
                    {/* Address Fields */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Address Information</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className='gap-1.5'>
                                <Label htmlFor="street">Street Address</Label>
                                <Input 
                                    placeholder="Enter street address" 
                                    value={data.street} 
                                    onChange={(e) => setData('street', e.target.value)} 
                                />
                                {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="barangay">Barangay</Label>
                                <Input 
                                    placeholder="Enter barangay" 
                                    value={data.barangay} 
                                    onChange={(e) => setData('barangay', e.target.value)} 
                                />
                                {errors.barangay && <p className="text-sm text-red-500 mt-1">{errors.barangay}</p>}
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="city">City</Label>
                                <Input 
                                    placeholder="Enter city" 
                                    value={data.city} 
                                    onChange={(e) => setData('city', e.target.value)} 
                                />
                                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="province">Province</Label>
                                <Input 
                                    placeholder="Enter province" 
                                    value={data.province} 
                                    onChange={(e) => setData('province', e.target.value)} 
                                />
                                {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
                            </div>
                        </div>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member registration_date">Registration Date</Label>
                        <div className="flex flex-col gap-3">
                            <div className="relative flex gap-2">
                                {/*
                                  Set up state for date, value (display string), month, and popover open.
                                  Initialize from member.registration_date.
                                */}
                                {(() => {
                                    // Parse initial date from member.registration_date (assumed format: YYYY-MM-DD)
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

                                    // Keep value in sync if member.registration_date changes
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
                                                placeholder="June 01, 2025"
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
                    </div>
                    <FileUpload
                        label="Document Upload"
                        currentFile={member.document}
                        onFileChange={handleFileUpload}
                        onFileRemove={handleFileRemove}
                        onFileDelete={handleFileDelete}
                        accept=".jpg,.jpeg,.png,.pdf"
                        memberId={member.id}
                        documentMarkedForDeletion={Boolean(member.document_marked_for_deletion)}
                    />
                    {errors.document && <p className="text-sm text-red-500 mt-1">{errors.document}</p>}
                    
                    {/* File Upload Warning */}
                    {isUpdateDisabled && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>File Upload Required</AlertTitle>
                            <AlertDescription>
                                Please upload a new document before updating. The current document is marked for deletion and must be replaced.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <Button 
                        disabled={processing || isUpdateDisabled} 
                        type="submit"
                        className={isUpdateDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        Update Member Details
                    </Button>
                </form>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
