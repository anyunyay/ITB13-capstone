import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { OctagonAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    image_url?: string; // Added for Inertia.js imageUrl accessor
    produce_type: string;
}

interface Props {
    product: Product;
}

export default function Edit({product}: Props) {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // Helper function to handle image error with cascading fallback
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, productName: string) => {
        const target = e.target as HTMLImageElement;
        const fallbackPath = '/images/products/fallback-photo.png';
        
        // If current src is not the fallback, try fallback first
        if (target.src !== window.location.origin + fallbackPath) {
            target.src = fallbackPath;
        } else {
            // If fallback also failed, hide image and show alt text
            target.style.display = 'none';
            const container = target.parentElement;
            if (container) {
                container.innerHTML = `
                    <div class="w-32 h-32 flex items-center justify-center bg-muted text-muted-foreground rounded-lg border">
                        <div class="text-center p-2">
                            <div class="text-sm font-medium mb-1">${productName}</div>
                            <div class="text-xs">${t('admin.image_not_available')}</div>
                        </div>
                    </div>
                `;
            }
        }
    };
    
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
            const file = e.target.files[0];
            setSelectedImage(file);
            setData('image', file);
            
            // Create preview URL for the new image
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
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
            <Head title={t('admin.update_product')}/>
            <div className='w-8/12 p-4'>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    {/* Display Error */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>{t('admin.error_title')}</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key} className="text-sm">
                                            {typeof value === 'string' ? value : Array.isArray(value) ? value[0] : t('admin.an_error_occurred')}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='gap-1.5'>
                        <Label htmlFor="product name">{t('admin.product_name_label')}</Label>
                        <Input placeholder={t('admin.product_name_placeholder')} value={data.name} onChange={(e) => setData('name', e.target.value)}/>
                    </div>
                    
                    <div className='gap-1.5'>
                        <p className="text-sm text-gray-600 mb-2">{t('admin.at_least_one_price_required')}</p>
                        <Label htmlFor="product price_kilo">{t('admin.price_per_kilo')}</Label>
                        <Input type="number" min="0" step="0.01" placeholder={t('admin.price_per_kilo')} value={data.price_kilo} onChange={(e) => setData('price_kilo', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_pc">{t('admin.price_per_piece')}</Label>
                        <Input type="number" min="0" step="0.01" placeholder={t('admin.price_per_piece')} value={data.price_pc} onChange={(e) => setData('price_pc', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price_tali">{t('admin.price_per_tali')}</Label>
                        <Input type="number" min="0" step="0.01" placeholder={t('admin.price_per_tali')} value={data.price_tali} onChange={(e) => setData('price_tali', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product description">{t('ui.description')}</Label>
                        <Textarea placeholder={t('ui.description')} value={data.description} onChange={(e) => setData('description', e.target.value)}/>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product produce_type">{t('admin.produce_type')}</Label>
                        <select
                            id="produce_type"
                            name="produce_type"
                            value={data.produce_type}
                            onChange={e => setData('produce_type', e.target.value)}
                            className="block w-full border rounded px-3 py-2"
                        >
                            <option value="fruit">{t('admin.fruit')}</option>
                            <option value="vegetable">{t('admin.vegetable')}</option>
                        </select>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product image">{t('admin.image_upload')}</Label>
                        
                        {/* Show current image only if no new image is selected */}
                        {!selectedImage && product.image_url && (
                            <div className="mb-4">
                                <Label className="text-sm text-gray-600 mb-2 block">{t('admin.current_image')}:</Label>
                                <img 
                                  src={product.image_url || '/images/products/fallback-photo.png'} 
                                  alt={product.name} 
                                  className="w-32 h-32 object-cover rounded-lg border"
                                  onError={(e) => handleImageError(e, product.name)}
                                />
                            </div>
                        )}
                        
                        {/* Show new image preview if selected */}
                        {selectedImage && imagePreview && (
                            <div className="mb-4">
                                <Label className="text-sm text-gray-600 mb-2 block">{t('admin.new_image_preview')}:</Label>
                                <img 
                                  src={imagePreview} 
                                  alt={t('admin.new_image_preview')} 
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('admin.current_image_will_be_replaced')}
                                </p>
                            </div>
                        )}
                        
                        <Input onChange={handleFileUpload} id='image' name='image' type='file' accept="image/*"/>
                    </div>
                    <Button disabled={processing} type="submit">{t('admin.update_product_button')}</Button>
                </form>
            </div>
        </AppLayout>
    );
}
