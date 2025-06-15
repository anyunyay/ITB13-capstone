import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert, Terminal } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Product',
        href: '/inventory/create',
    },
];

export default function Index() {

    const {data, setData, post, processing, errors} = useForm({
        name: '',
        price: '',
        description: '',
        image: null as File | null,
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('image', e.target.files[0]);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a New Product"/>
            <div className='w-8/12 p-4'>
                <form onSubmit={handleSubmit}  className='space-y-4'>

                    {/* Display Error */}
                    {Object.keys(errors).length > 0 &&(
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
                        <Label htmlFor="product name">Name</Label>
                        <Input placeholder="Product Name" value={data.name} onChange={(e) => setData('name', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price">Price</Label>
                        <Input type="number" min="0" placeholder="Product Price" value={data.price} onChange={(e) => setData('price', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product description">Description</Label>
                        <Textarea placeholder="Product Description" value={data.description} onChange={(e) => setData('description', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product image">Image Upload</Label>
                        <Input onChange={handleFileUpload} id='image' name='image' type='file' autoFocus tabIndex={4}/>
                    </div>
                    <Button disabled={processing} type="submit">Create Product</Button>
                </form>
            </div>
        </AppLayout>
    );
}
