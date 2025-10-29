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
import { useTranslation } from '@/hooks/use-translation';

export default function Create() {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const {data, setData, post, processing, errors} = useForm({
        name: '',
        price_kilo: '',
        price_pc: '',
        price_tali: '',
        description: '',
        image: null as File | null,
        produce_type: 'fruit',
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
        <AppLayout>
            <Head title={t('admin.create_new_product')}/>
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
                        <p className="text-sm text-gray-600 mb-2">* At least one price must be provided</p>
                        <Label htmlFor="product price_kilo">Price per Kilo</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Kilo" value={data.price_kilo} onChange={(e) => setData('price_kilo', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_pc">Price per Piece</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Piece" value={data.price_pc} onChange={(e) => setData('price_pc', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_tali">Price per Tali</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Price per Tali" value={data.price_tali} onChange={(e) => setData('price_tali', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product description">Description</Label>
                        <Textarea placeholder="Product Description" value={data.description} onChange={(e) => setData('description', e.target.value)}/>
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
