import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import PasswordInput from '@/components/ui/password-input';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert, IdCard } from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
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

export default function Index() {
    const t = useTranslation();
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
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.add_logistics_partner')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <IdCard className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-foreground leading-tight m-0">{t('admin.add_logistics_partner')}</h1>
                                            <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                                {t('admin.logistic_management_description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Button asChild variant="outline" className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                                        <Link href={route('logistics.index')}>
                                            <IdCard className="h-4 w-4 mr-2" />
                                            {t('ui.back')} {t('admin.logistics')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
                            <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-3 rounded-lg flex items-center justify-center">
                                        <IdCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">{t('admin.logistic_management')}</h2>
                                        <p className="text-sm text-muted-foreground m-0">
                                            {t('admin.register_new_logistic_partner')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className='space-y-6'>

                    {/* Display Error */}
                    {Object.keys(errors).length > 0 && (
                        <Alert>
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>{t('admin.error_title')}</AlertTitle>
                            <AlertDescription>
                                <ul>
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{message as string}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor="logistic name">{t('admin.logistic_name_label')}</Label>
                        <Input 
                            placeholder={t('admin.logistic_name_label')} 
                            value={data.name} 
                            onChange={(e) => {
                                // Only allow alphabetic characters and spaces
                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                setData('name', value);
                            }} 
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor="logistic email">{t('admin.logistic_email_label')}</Label>
                        <Input placeholder={t('admin.email_address')} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor="logistic password">{t('admin.password')}</Label>
                        <PasswordInput 
                            placeholder={t('admin.password')} 
                            value={data.password} 
                            onChange={(e) => setData('password', e.target.value)} 
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor="logistic contact_number">{t('admin.logistic_contact_number_label')}</Label>
                        <Input 
                            type="tel"
                            placeholder={t('admin.philippine_format_only')} 
                            value={data.contact_number} 
                            onChange={(e) => setData('contact_number', e.target.value)} 
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('admin.format_hint')}
                        </p>
                    </div>
                    {/* Address Fields */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">{t('admin.address_information')}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="street">{t('admin.street')}</Label>
                                <Input 
                                    placeholder={t('admin.street')} 
                                    value={data.street} 
                                    onChange={(e) => setData('street', e.target.value)} 
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="barangay">{t('admin.barangay')}</Label>
                                <Input 
                                    placeholder={t('admin.barangay')} 
                                    value={data.barangay} 
                                    onChange={(e) => setData('barangay', e.target.value)} 
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="city">{t('admin.city')}</Label>
                                <Input 
                                    placeholder={t('admin.city')} 
                                    value={data.city} 
                                    onChange={(e) => setData('city', e.target.value)} 
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="province">{t('admin.province')}</Label>
                                <Input 
                                    placeholder={t('admin.province')} 
                                    value={data.province} 
                                    onChange={(e) => setData('province', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor="registration date">{t('admin.registration_date_label')}</Label>
                        <div className="flex flex-col gap-2">
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
                                <div className="flex justify-end">
                                    <Button 
                                        disabled={processing} 
                                        type="submit" 
                                        className="bg-primary text-primary-foreground border-0 px-5 py-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <IdCard className="h-4 w-4 mr-2" />
                                        {processing ? t('admin.adding') : t('admin.add_logistics_partner')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
