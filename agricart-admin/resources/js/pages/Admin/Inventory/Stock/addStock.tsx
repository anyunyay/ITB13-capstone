import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { OctagonAlert, Terminal } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from '@/hooks/use-translation';


interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
}

interface Member {
    id: number;
    name: string;
}

interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    category: string;
}

interface Props {
    product: Product;
}

interface PageProps {
    stocks: Stock[];
    members: Member[];
    availableCategories: string[];
    defaultCategory?: string;
    [key: string]: unknown;
}

export default function AddStock({product}: Props) {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { members, availableCategories, defaultCategory } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        quantity: '',
        category: defaultCategory || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.storeStock', product.id));
    }

    return (
        <AppLayout>
            <Head title={t('admin.add_stock_to_product')} />
            <div className='w-8/12 p-4'>
                <form onSubmit={handleSubmit} className='space-y-4'>

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

                    {/* Adjust Design */}
                    <div className='gap-1.5'>
                        <Label htmlFor='name'>{t('admin.product_label')}</Label>
                        <div>
                            <Label>{product.name}</Label>
                        </div>
                    </div>

                    <div className='gap-1.5'>
                        <Label htmlFor="member_id">{t('admin.assign_to_member')}</Label>
                        <Select
                            value={data.member_id}
                            onValueChange={value => setData('member_id', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('admin.select_a_member')} />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member: Member) => (
                                    <SelectItem key={member.id} value={String(member.id)}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='gap-1.5'>
                        <Label htmlFor="category">{t('admin.category')}</Label>
                        <Select
                            value={data.category}
                            onValueChange={value => setData('category', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('admin.select_a_category')} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {data.category === "Kilo" && (
                        <div className='gap-1.5'>
                            <Label htmlFor="quantity">{t('admin.quantity')}</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                            />
                        </div>
                    )}

                    {data.category !== "Kilo" && (
                        <div className='gap-1.5'>
                            <Label htmlFor="quantity">{t('admin.quantity')}</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                            />
                        </div>
                    )}

                    <Button disabled={processing} type="submit">{t('admin.add_stock_to_product')}</Button>
                </form>
            </div>
        </AppLayout>
    );
}
