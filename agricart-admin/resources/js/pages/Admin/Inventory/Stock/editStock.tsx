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
}

interface Member {
    id: number;
    name: string;
}

interface Stock {
    id: number;
    quantity: number;
    member_id: number;
    product_id: number;
    sell_category_id?: number;
}

interface Category {
    id: number;
    sell_category: string;
}

interface Props {
    product: Product;
    stock: Stock;
    members: Member[];
    categories: Category[];
}

interface PageProps {
    flash: {
        message?: string
    }
    members: Member[];
    [key: string]: unknown;
}

export default function EditStock({ product, stock, members, categories }: Props) {
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { data, setData, put, processing, errors } = useForm({
        quantity: stock.quantity,
        member_id: String(stock.member_id),
        sell_category_id: stock.sell_category_id ? String(stock.sell_category_id) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('inventory.updateStock', { product: product.id, stock: stock.id }));
    }

    // Helper to get selected category label
    const selectedCategory = categories.find(cat => String(cat.id) === data.sell_category_id)?.sell_category || '';

    return (
        <AppLayout>
            <Head title="Edit Stock" />
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
                        <Label htmlFor='product'>Product</Label>
                        <div>
                            <Label>{product.name}</Label>
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
                            value={data.sell_category_id}
                            onValueChange={value => setData('sell_category_id', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.sell_category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCategory === "Kilo" && (
                        <div className='gap-1.5'>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                min={0.01}
                                step={0.01}
                                value={data.quantity}
                                onChange={e => setData('quantity', Number(e.target.value))}
                            />
                        </div>
                    )}
                    {selectedCategory !== "Kilo" && selectedCategory !== '' && (
                        <div className='gap-1.5'>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={data.quantity}
                                onChange={e => setData('quantity', Number(e.target.value))}
                            />
                        </div>
                    )}
                    <Button disabled={processing} type="submit">Update Stock</Button>
                </form>
            </div>
        </AppLayout>
    );
}
