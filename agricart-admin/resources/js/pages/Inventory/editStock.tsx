import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert, Terminal } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Product Stock',
        href: '/inventory/{product}/edit-stock',
    },
];

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
    product_id: number;
    quantity: number;
    member_id: number;
}

interface Props {
    product: Product;
    stock: Stock;
    members: Member[];
}

interface PageProps {
    flash: {
        message?: string
    }
    members: Member[];
    [key: string]: unknown;
}

export default function EditStock({ product, stock, members }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        quantity: stock.quantity,
        member_id: String(stock.member_id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('inventory.updateStock', { product: product.id, stock: stock.id }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={data.quantity}
                            onChange={e => setData('quantity', Number(e.target.value))}
                        />
                    </div>
                    <Button disabled={processing} type="submit">Update Stock</Button>
                </form>
            </div>
        </AppLayout>
    );
}
