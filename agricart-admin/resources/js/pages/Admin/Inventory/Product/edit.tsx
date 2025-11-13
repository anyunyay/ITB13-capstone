import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { OctagonAlert, PackageOpen, Image as ImageIcon, ChevronLeft } from 'lucide-react';
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
        const fallbackPath = '/storage/fallback-photo.png';
        
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
            <div className='bg-background'>
                <div className='w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8'>
                    {/* Page Header */}
                    <div className="mb-2 sm:mb-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <PackageOpen className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.update_product')}</h1>
                                    <p className="text-sm text-muted-foreground mt-1 truncate">{t('admin.edit_product_description')}: {product.name}</p>
                                </div>
                            </div>
                            {/* Mobile: Icon only */}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => router.visit(route('inventory.index'))}
                                className="sm:hidden"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {/* Desktop: Full button with text */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('inventory.index'))}
                                className="hidden sm:flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('admin.back_to_inventory')}
                            </Button>
                        </div>
                    </div>

                    {/* Display Error */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                            <OctagonAlert className='h-4 w-4' />
                            <AlertTitle>{t('admin.error_title')}</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4 space-y-1">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key} className="text-sm">
                                            {typeof value === 'string' ? value : Array.isArray(value) ? value[0] : t('admin.an_error_occurred')}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleUpdate} className='space-y-3'>

                        {/* Two Column Layout on Large Screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Left Column - Main Information */}
                            <div className="lg:col-span-2 space-y-3">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">{t('admin.product_information')}</CardTitle>
                                        <CardDescription>{t('admin.update_product_details')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className='space-y-2'>
                                            <Label htmlFor="product_name" className="text-sm font-medium">
                                                {t('admin.product_name_label')} <span className="text-destructive">*</span>
                                            </Label>
                                            <Input 
                                                id="product_name"
                                                placeholder={t('admin.product_name_placeholder')} 
                                                value={data.name} 
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full"
                                                required
                                            />
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor="produce_type" className="text-sm font-medium">
                                                {t('admin.produce_type')} <span className="text-destructive">*</span>
                                            </Label>
                                            <select
                                                id="produce_type"
                                                name="produce_type"
                                                value={data.produce_type}
                                                onChange={e => setData('produce_type', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                required
                                            >
                                                <option value="fruit">{t('admin.fruit')}</option>
                                                <option value="vegetable">{t('admin.vegetable')}</option>
                                            </select>
                                        </div>
                                        
                                        <div className='space-y-2'>
                                            <Label htmlFor="description" className="text-sm font-medium">{t('ui.description')}</Label>
                                            <Textarea 
                                                id="description"
                                                placeholder={t('ui.description')} 
                                                value={data.description} 
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="w-full min-h-[100px] resize-none"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">{t('admin.pricing_information')}</CardTitle>
                                        <CardDescription>{t('admin.at_least_one_price_required')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className='space-y-2'>
                                                <Label htmlFor="price_kilo" className="text-sm font-medium">{t('admin.price_per_kilo')}</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                                                    <Input 
                                                        id="price_kilo"
                                                        type="number" 
                                                        min="0" 
                                                        step="0.01" 
                                                        placeholder="0.00" 
                                                        value={data.price_kilo} 
                                                        onChange={(e) => setData('price_kilo', e.target.value)}
                                                        className="w-full pl-7"
                                                    />
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label htmlFor="price_pc" className="text-sm font-medium">{t('admin.price_per_piece')}</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                                                    <Input 
                                                        id="price_pc"
                                                        type="number" 
                                                        min="0" 
                                                        step="0.01" 
                                                        placeholder="0.00" 
                                                        value={data.price_pc} 
                                                        onChange={(e) => setData('price_pc', e.target.value)}
                                                        className="w-full pl-7"
                                                    />
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label htmlFor="price_tali" className="text-sm font-medium">{t('admin.price_per_tali')}</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                                                    <Input 
                                                        id="price_tali"
                                                        type="number" 
                                                        min="0" 
                                                        step="0.01" 
                                                        placeholder="0.00" 
                                                        value={data.price_tali} 
                                                        onChange={(e) => setData('price_tali', e.target.value)}
                                                        className="w-full pl-7"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Image Upload & Actions */}
                            <div className="lg:col-span-1 space-y-3">
                                <Card className="shadow-sm lg:sticky lg:top-4">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            {t('admin.product_image')}
                                        </CardTitle>
                                        <CardDescription>{t('admin.upload_product_image_description')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Show current image only if no new image is selected */}
                                        {!selectedImage && product.image_url && (
                                            <div className="p-3 bg-muted/30 rounded-lg border">
                                                <Label className="text-xs font-medium mb-2 block text-muted-foreground text-center">{t('admin.current_image')}</Label>
                                                <div className="w-full h-48 flex items-center justify-center bg-background rounded-lg border">
                                                    <img 
                                                      src={product.image_url || '/storage/fallback-photo.png'} 
                                                      alt={product.name}
                                                      className="max-w-full max-h-full object-contain rounded-lg"
                                                      onError={(e) => handleImageError(e, product.name)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show new image preview if selected */}
                                        {selectedImage && imagePreview && (
                                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                                <Label className="text-xs font-medium mb-2 block text-primary text-center">{t('admin.new_image_preview')}</Label>
                                                <div className="w-full h-48 flex items-center justify-center bg-background rounded-lg border">
                                                    <img 
                                                      src={imagePreview} 
                                                      alt={t('admin.new_image_preview')}
                                                      className="max-w-full max-h-full object-contain rounded-lg"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                                    {t('admin.current_image_will_be_replaced')}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className='space-y-2'>
                                            <Label htmlFor="image" className="text-sm font-medium">
                                                {selectedImage ? t('admin.change_image') : t('admin.upload_new_image')}
                                            </Label>
                                            <div className="relative">
                                                <Input 
                                                    onChange={handleFileUpload} 
                                                    id='image' 
                                                    name='image' 
                                                    type='file' 
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <label 
                                                    htmlFor="image"
                                                    className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md border border-input cursor-pointer hover:bg-primary/90 transition-colors"
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    {selectedImage ? t('admin.change_image') : t('admin.upload_new_image')}
                                                </label>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t('admin.supported_formats')}: JPG, PNG, GIF (Max 2MB)</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <Card className="shadow-sm">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex flex-col gap-3">
                                            <Button 
                                                disabled={processing} 
                                                type="submit"
                                                className="w-full"
                                            >
                                                {processing ? t('admin.updating') : t('admin.update_product_button')}
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(route('inventory.index'))}
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {t('ui.cancel')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
