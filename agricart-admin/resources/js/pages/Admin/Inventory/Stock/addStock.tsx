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
    flash: {
        message?: string
    }
    stocks: Stock[];
    members: Member[];
    [key: string]: unknown;
}

export default function AddStock({product}: Props) {
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { members } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        member_id: '',
        quantity: '',
        category: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.storeStock', product.id));
    }

    return (
        <AppLayout>
            <Head title="Add Stock to Product" />
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

                    {/* Adjust Design */}
                    <div className='gap-1.5'>
                        <Label htmlFor='name'>Product</Label>
                        <div>
                            <Label>{data.name}</Label>
                        </div>
                    </div>

                    <div className='gap-1.5'>
                        <Label htmlFor="member_id">Assign to Member</Label>
                        <Select
                            value={data.member_id}
                            onValueChange={value => setData('member_id', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a member" />
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
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={data.category}
                            onValueChange={value => setData('category', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Kilo">Kilo</SelectItem>
                                <SelectItem value="Pc">Pc</SelectItem>
                                <SelectItem value="Tali">Tali</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {data.category === "Kilo" && (
                        <div className='gap-1.5'>
                            <Label htmlFor="quantity">Quantity</Label>
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
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                            />
                        </div>
                    )}

                    <Button disabled={processing} type="submit">Add Stock</Button>
                </form>
            </div>
        </AppLayout>
    );
}
