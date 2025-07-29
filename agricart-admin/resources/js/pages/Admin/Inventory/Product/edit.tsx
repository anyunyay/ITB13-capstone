import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { OctagonAlert } from 'lucide-react';

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

interface Props {
    product: Product;
}

export default function Edit({product}: Props) {
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const {data, setData, post, processing, errors} = useForm({
        name: product.name,
        price_kilo: product.price_kilo || '',
        price_pc: product.price_pc || '',
        price_tali: product.price_tali || '',
        description: product.description,
        image: null as File | null,
        produce_type: product.produce_type || 'fruit',
        _method: 'put',
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('image', e.target.files[0]);
        }
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.update', product.id), {
            forceFormData: true,
            preserveState: true,
        });
    }

    return (
        <AppLayout>
            <Head title="Update Product"/>
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
                        <Label htmlFor="product name">Name</Label>
                        <Input placeholder="Product Name" value={data.name} onChange={(e) => setData('name', e.target.value)}/>
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_kilo">Price per Kilo</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Kilo" value={data.price_kilo} onChange={(e) => setData('price_kilo', e.target.value)}/>
                        {errors.price_kilo && <p className="text-sm text-red-500 mt-1">{errors.price_kilo}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_pc">Price per Piece</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Piece" value={data.price_pc} onChange={(e) => setData('price_pc', e.target.value)}/>
                        {errors.price_pc && <p className="text-sm text-red-500 mt-1">{errors.price_pc}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_tali">Price per Tali</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Tali" value={data.price_tali} onChange={(e) => setData('price_tali', e.target.value)}/>
                        {errors.price_tali && <p className="text-sm text-red-500 mt-1">{errors.price_tali}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product description">Description</Label>
                        <Textarea placeholder="Product Description" value={data.description} onChange={(e) => setData('description', e.target.value)}/>
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product produce_type">Produce Type</Label>
                        <select
                            id="produce_type"
                            name="produce_type"
                            value={data.produce_type}
                            onChange={e => setData('produce_type', e.target.value)}
                            className="block w-full border rounded px-3 py-2"
                        >
                            <option value="fruit">Fruit</option>
                            <option value="vegetable">Vegetable</option>
                        </select>
                        {errors.produce_type && <p className="text-sm text-red-500 mt-1">{errors.produce_type}</p>}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product image">Current Image</Label>
                        {product.image && (
                            <div className="mb-4">
                                <img src={`/${product.image}`} alt={product.name} className="w-32 h-32 object-cover rounded-lg" />
                            </div>
                        )}
                        <Label htmlFor="product image">Update Image</Label>
                        <Input onChange={handleFileUpload} id='image' name='image' type='file' accept="image/*"/>
                        {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                    </div>
                    <Button disabled={processing} type="submit">Update Product</Button>
                </form>
            </div>
        </AppLayout>
    );
}
