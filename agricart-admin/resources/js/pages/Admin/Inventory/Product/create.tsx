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
import { OctagonAlert, PackagePlus, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function Create() {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
            const file = e.target.files[0];
            setData('image', file);
            
            // Create preview URL for the new image
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.store'));
    }

    return (
        <AppLayout>
            <Head title={t('admin.create_new_product')}/>
            <div className='bg-background'>
                <div className='w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8'>
                    {/* Page Header */}
                    <div className="mb-2 sm:mb-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <PackagePlus className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.create_new_product')}</h1>
                                    <p className="text-sm text-muted-foreground mt-1">{t('admin.add_new_product_description')}</p>
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

                    <form onSubmit={handleSubmit} className='space-y-3'>

                        {/* Display Error */}
                        {Object.keys(errors).length > 0 &&(
                            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                <OctagonAlert className='h-4 w-4' />
                                <AlertTitle>{t('admin.error_title')}</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {Object.entries(errors).map(([key, message]) => (
                                            <li key={key} className="text-sm">{message as string}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Two Column Layout on Large Screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Left Column - Main Information */}
                            <div className="lg:col-span-2 space-y-3">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">{t('admin.product_information')}</CardTitle>
                                        <CardDescription>{t('admin.fill_product_details')}</CardDescription>
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
                                        {/* Show image preview if selected */}
                                        {imagePreview && (
                                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                                <Label className="text-xs font-medium mb-2 block text-primary text-center">{t('admin.new_image_preview')}</Label>
                                                <div className="w-full h-48 flex items-center justify-center bg-background rounded-lg border">
                                                    <img 
                                                      src={imagePreview} 
                                                      alt={t('admin.new_image_preview')}
                                                      className="max-w-full max-h-full object-contain rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className='space-y-2'>
                                            <Label htmlFor="image" className="text-sm font-medium">
                                                {imagePreview ? t('admin.change_image') : t('admin.image_upload')}
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
                                                    {imagePreview ? t('admin.change_image') : t('admin.image_upload')}
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
                                                {processing ? t('admin.creating') : t('admin.create_product')}
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
