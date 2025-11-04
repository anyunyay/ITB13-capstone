import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { PermissionGate } from '@/components/permission-gate';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, CheckCircle } from 'lucide-react';
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
    archived_at?: string;
}

interface PageProps extends SharedData {
    archivedProducts: Product[];
}

export default function Archive() {
    const t = useTranslation();
    const { archivedProducts, flash, auth } = usePage<PageProps>().props;
    
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
                    <div class="w-full h-48 flex items-center justify-center bg-muted text-muted-foreground rounded-t-lg">
                        <div class="text-center p-4">
                            <div class="text-lg font-medium mb-2">${productName}</div>
                            <div class="text-sm">${t('admin.image_not_available')}</div>
                        </div>
                    </div>
                `;
            }
        }
    };
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);
    const { processing, post, delete: destroy } = useForm();

    const handleRestore = (id: number, name: string) => {
        if (confirm(t('admin.confirm_restore_archived_product', { name }))) {
            post(route('inventory.archived.restore', id));
        }
    };

    const handleForceDelete = (id: number, name: string) => {
        if (confirm(t('admin.confirm_permanently_delete_archived_product', { name }))) {
            destroy(route('inventory.archived.forceDelete', id));
        }
    };

    return (
        <AppLayout>
            <Head title={t('admin.archived_inventory')} />
            <div className="m-4">
                <Link href={route('inventory.index')}><Button>{t('admin.back_to_inventory')}</Button></Link>

                <div className='m-4'>
                    <div>
                        <FlashMessage flash={flash} />
                    </div>
                </div>

                <div className='grid grid-cols-5 gap-2'>
                    {archivedProducts.map((product) => (
                        <Card key={product.id} className='w-70 p-0'>
                            <div>
                                <img 
                                    src={product.image_url || product.image || '/storage/fallback-photo.png'} 
                                    alt={product.name}
                                    onError={(e) => { e.currentTarget.src = '/storage/fallback-photo.png'; }}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                    onError={(e) => handleImageError(e, product.name)}
                                />
                            </div>
                            <CardHeader className="px-6">
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    <div className="text-sm">
                                        {product.price_kilo && <div>{t('admin.price_per_kilo')}: P{product.price_kilo}</div>}
                                        {product.price_pc && <div>{t('admin.price_per_piece')}: P{product.price_pc}</div>}
                                        {product.price_tali && <div>{t('admin.price_per_tali')}: P{product.price_tali}</div>}
                                        {!product.price_kilo && !product.price_pc && !product.price_tali && <div>{t('admin.no_prices_set')}</div>}
                                    </div>
                                </CardDescription>
                                <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                                <CardAction>
                                    <Button disabled={processing} onClick={() => handleRestore(product.id, product.name)}>
                                        {t('admin.restore_product')}
                                    </Button>
                                    <Button variant="destructive" disabled={processing} onClick={() => handleForceDelete(product.id, product.name)}>
                                        {t('ui.delete')}
                                    </Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent className="px-6">
                                <p className="text-md break-words">{product.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
