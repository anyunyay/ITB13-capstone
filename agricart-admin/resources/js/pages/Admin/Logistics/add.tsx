import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import PasswordInput from '@/components/ui/password-input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { router } from '@inertiajs/react';

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

export default function Index() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

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

    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date>(today)
    const [month, setMonth] = React.useState<Date>(today)
    const [value, setValue] = React.useState(formatDate(today))

    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

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
            pageTitle="Create Logistics Access Denied"
        >
            <AppLayout>
                <Head title="Add Logistic" />
                <div className='w-8/12 p-4'>
                <form onSubmit={handleSubmit} className='space-y-4'>

                    {/* Display Error */}
                    {Object.keys(errors).length > 0 && (
                        <Alert>
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>Error!</AlertTitle>
                            <AlertDescription>
                                <ul>
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{message as string}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='gap-1.5'>
                        <Label htmlFor="logistic name">Name</Label>
                        <Input placeholder="Logistic Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic email">Email</Label>
                        <Input placeholder="Email Address" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic password">Password</Label>
                        <PasswordInput 
                            placeholder="Password (minimum 8 characters)" 
                            value={data.password} 
                            onChange={(e) => setData('password', e.target.value)} 
                        />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="logistic contact_number">Contact Number</Label>
                        <Input 
                            type="tel"
                            placeholder="+63 9XX XXX XXXX (Philippine format only)" 
                            value={data.contact_number} 
                            onChange={(e) => setData('contact_number', e.target.value)} 
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: +639XXXXXXXXX or 09XXXXXXXXX
                        </p>
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
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="barangay">Barangay</Label>
                                <Input 
                                    placeholder="Enter barangay" 
                                    value={data.barangay} 
                                    onChange={(e) => setData('barangay', e.target.value)} 
                                />
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="city">City</Label>
                                <Input 
                                    placeholder="Enter city" 
                                    value={data.city} 
                                    onChange={(e) => setData('city', e.target.value)} 
                                />
                            </div>
                            <div className='gap-1.5'>
                                <Label htmlFor="province">Province</Label>
                                <Input 
                                    placeholder="Enter province" 
                                    value={data.province} 
                                    onChange={(e) => setData('province', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="registration date">Registration Date</Label>
                        <div className="flex flex-col gap-3">
                            <div className="relative flex gap-2">
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
                                            setData('registration_date', date.toISOString().split('T')[0]); // set as YYYY-MM-DD
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
                    </div>
                    <Button disabled={processing} type="submit">Add Logistic</Button>
                </form>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}
