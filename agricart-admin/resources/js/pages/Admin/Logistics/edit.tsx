import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SharedData } from '@/types';

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

interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    registration_date?: string;
    type: string;
    [key: string]: unknown;
}

interface Props {
    logistic: Logistic;
}

export default function Edit({ logistic }: Props) {

    const { auth } = usePage<SharedData>().props;
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    React.useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, post, processing, errors } = useForm({
        name: logistic.name,
        email: logistic.email,
        contact_number: logistic.contact_number,
        address: logistic.address,
        registration_date: logistic.registration_date,
        document: null as File | null,
        _method: 'put',
    });

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
            pageTitle="Edit Logistics Access Denied"
        >
            <AppLayout>
                <Head title="Update Logistic" />
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
                        <Label htmlFor="logistic name">Name</Label>
                        <Input placeholder="Logistic Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic email">Email</Label>
                        <Input type="email" placeholder="Email Address" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic contact_number">Contact Number</Label>
                        <Input type="tel" placeholder="Contact Number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} />
                        {errors.contact_number && <p className="text-sm text-red-500 mt-1">{errors.contact_number}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic address">Address</Label>
                        <Textarea placeholder="Location Address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic registration_date">Registration Date</Label>
                        <div className="flex flex-col gap-3">
                            <div className="relative flex gap-2">
                                {/*
                                  Set up state for date, value (display string), month, and popover open.
                                  Initialize from logistic.registration_date.
                                */}
                                {(() => {
                                    // Parse initial date from logistic.registration_date (assumed format: YYYY-MM-DD)
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

                                    // Keep value in sync if logistic.registration_date changes
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
                    <Button disabled={processing} type="submit">Update Logistic Details</Button>
                </form>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
