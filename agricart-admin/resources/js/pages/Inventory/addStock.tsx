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
        title: 'Add Stock',
        href: '/inventory/{product}/add-stock',
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

    const { members } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        member_id: '',
        quantity: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.storeStock', product.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={data.quantity}
                            onChange={e => setData('quantity', e.target.value)}
                        />
                    </div>

                    <Button disabled={processing} type="submit">Add Stock</Button>
                </form>
            </div>
        </AppLayout>
    );
}
