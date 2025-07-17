import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { OctagonAlert } from 'lucide-react';
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Member',
        href: '/membership/add',
    },
];

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

    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        contact_number: '',
        address: '',
        registration_date: formattedToday,
        document: null as File | null,
    });

    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date>(today)
    const [month, setMonth] = React.useState<Date>(today)
    const [value, setValue] = React.useState(formatDate(today))

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('document', e.target.files[0]);
        }
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Member" />
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
                        <Label htmlFor="member name">Name</Label>
                        <Input placeholder="Member Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member email">Email</Label>
                        <Input placeholder="Email Address" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member contact_number">Contact Number</Label>
                        <Input placeholder="Contact Number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} />
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="member address">Address</Label>
                        <Textarea placeholder="Location Address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
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
                    <div className='gap-1.5'>
                        <Label htmlFor="member document">Document Upload</Label>
                        <Input onChange={handleDocumentUpload} id='document' name='document' type='file' autoFocus tabIndex={4} />
                    </div>
                    <Button disabled={processing} type="submit">Add Member</Button>
                </form>
            </div>
        </AppLayout>
    );
}
