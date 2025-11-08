import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBasket, Package, Minus, Plus } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { debounce } from '@/lib/debounce';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
    stock_by_category: Record<string, number>;
}

interface Props {
    product: Product;
    auth?: {
        user?: any;
    };
}

export default function ProductShow({ product, auth }: Props) {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [message, setMessage] = useState<string | null>(null);
    const [showLoginConfirm, setShowLoginConfirm] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        category: '',
        quantity: 1,
    });

    const categories = product.stock_by_category ? Object.keys(product.stock_by_category) : [];
    const isKilo = selectedCategory === 'Kilo';
    const maxQty = product.stock_by_category?.[selectedCategory] ?? 1;

    // Create debounced version of add to cart function
    const debouncedAddToCart = debounce((e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple clicks
        if (isAddingToCart) {
            return;
        }

        if (!auth?.user) {
            setShowLoginConfirm(true);
            setOpen(false);
            return;
        }

        if (!selectedCategory) {
            setMessage('Please select a category.');
            return;
        }

        const sendQty = isKilo ? Number(Number(selectedQuantity).toFixed(2)) : selectedQuantity;

        // Set adding state immediately to prevent multiple clicks
        setIsAddingToCart(true);

        router.post('/customer/cart/store', {
            product_id: product.id,
            category: selectedCategory,
            quantity: sendQty,
        }, {
            onSuccess: () => {
                setMessage('Added to cart!');
                router.reload({ only: ['cart'] });
                setTimeout(() => {
                    setOpen(false);
                    setIsAddingToCart(false);
                }, 800);
            },
            onError: () => {
                setMessage('Failed to add to cart.');
                setIsAddingToCart(false);
            },
            preserveScroll: true,
        });
    }, 300); // 300ms debounce delay

    const handleAddToCart = (e: React.FormEvent) => {
        // Immediate check for multiple clicks
        if (isAddingToCart) {
            return;
        }
        
        // Call debounced function
        debouncedAddToCart(e);
    };

    const handleBack = () => {
        router.visit('/customer/produce');
    };

    const totalStock = Object.values(product.stock_by_category).reduce((sum, quantity) => sum + quantity, 0);

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    return (
        <AppHeaderLayout>
            <Head title={product.name} />
            
            <div className="container mx-auto px-4 py-8 mt-20">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{t('ui.back_to_produce')}</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="space-y-4">
                        {product.image_url && (
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    onError={(e) => { e.currentTarget.src = '/storage/fallback-photo.png'; }}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/storage/fallback-photo.png';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary">{product.produce_type}</Badge>
                                {totalStock > 0 ? (
                                    <Badge className="bg-green-100 text-green-800">
                                        {t('ui.in_stock')}
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">{t('ui.out_of_stock')}</Badge>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-card-foreground">{product.name}</h1>
                            <div className="mt-2 space-y-1">
                                {product.price_kilo && (
                                    <p className="text-base md:text-xl lg:text-2xl font-semibold text-green-600 dark:text-green-400">
                                        Kilo: ₱{formatPrice(product.price_kilo)}
                                    </p>
                                )}
                                {product.price_pc && (
                                    <p className="text-base md:text-xl lg:text-2xl font-semibold text-green-600 dark:text-green-400">
                                        Piece: ₱{formatPrice(product.price_pc)}
                                    </p>
                                )}
                                {product.price_tali && (
                                    <p className="text-base md:text-xl lg:text-2xl font-semibold text-green-600 dark:text-green-400">
                                        Tali: ₱{formatPrice(product.price_tali)}
                                    </p>
                                )}
                                {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                    <p className="text-base md:text-xl lg:text-2xl font-semibold text-muted-foreground">
                                        {t('ui.no_prices_set')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2">{t('ui.description')}</h3>
                            <p className="text-base md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Stock Information */}
                        {Object.keys(product.stock_by_category).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Package className="h-5 w-5" />
                                        <span>{t('ui.available_stock')}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(product.stock_by_category).map(([category, quantity]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground capitalize">{category}</span>
                                                <Badge variant="outline">{quantity}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Add to Cart Button */}
                        <div className="pt-4">
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        disabled={totalStock === 0}
                                        className="w-full flex items-center space-x-2"
                                        size="lg"
                                        onClick={() => {
                                            setOpen(true);
                                            setSelectedCategory('');
                                            setSelectedQuantity(1);
                                            setMessage(null);
                                        }}
                                    >
                                        <ShoppingBasket className="h-5 w-5" />
                                        <span>{totalStock > 0 ? t('ui.add_to_cart') : t('ui.out_of_stock')}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{product.name}</DialogTitle>
                                        <DialogTitle className="text-sm text-muted-foreground">{product.produce_type}</DialogTitle>
                                        <DialogDescription>{product.description}</DialogDescription>

                                        {/* For Displaying Stock */}
                                        {product.stock_by_category ? (
                                            <div className="mt-2 text-sm text-card-foreground">
                                                <strong>{t('ui.available_stock')}:</strong>
                                                {Object.keys(product.stock_by_category).length > 0 ? (
                                                    <ul className="ml-2 list-disc">
                                                        {Object.entries(product.stock_by_category).map(
                                                            ([category, quantity]) => (
                                                                <li key={category}>
                                                                    {category}: {category === 'Kilo'
                                                                        ? (typeof quantity === 'number' ? quantity.toFixed(2) : '0.00')
                                                                        : quantity}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <div className="text-red-500 font-medium">{t('ui.no_stock_available')}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-sm text-card-foreground">
                                                <strong>{t('ui.available_stock')}:</strong>
                                                <div className="text-red-500 font-medium">{t('ui.no_stock_available')}</div>
                                            </div>
                                        )}

                                        {/* Category Selection */}
                                        {categories.length > 0 && (
                                            <div className="mt-4">
                                                <label className="block text-base md:text-xl lg:text-2xl font-medium mb-1">{t('ui.select_category')}</label>
                                                <div className="flex gap-2">
                                                    {categories.map(category => (
                                                        <Button
                                                            key={category}
                                                            type="button"
                                                            variant={selectedCategory === category ? 'default' : 'outline'}
                                                            className={selectedCategory === category ? 'border-2 border-blue-500' : ''}
                                                            onClick={() => {
                                                                setSelectedCategory(category);
                                                                setSelectedQuantity(1);
                                                            }}
                                                        >
                                                            {category}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity Input */}
                                        {selectedCategory && (
                                            <div className="mt-4">
                                                <label className="block text-base md:text-xl lg:text-2xl font-medium mb-1">{t('ui.quantity')}</label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (isKilo) {
                                                                const newQty = Math.max(0.25, selectedQuantity - 0.25);
                                                                setSelectedQuantity(Number(newQty.toFixed(2)));
                                                            } else {
                                                                const newQty = Math.max(1, selectedQuantity - 1);
                                                                setSelectedQuantity(newQty);
                                                            }
                                                        }}
                                                        disabled={
                                                            isKilo ? selectedQuantity <= 0.25 : selectedQuantity <= 1
                                                        }
                                                        className="px-2"
                                                    >
                                                        {isKilo ? '-0.25' : '-1'}
                                                    </Button>
                                                    <input
                                                        type="number"
                                                        min={isKilo ? 0.25 : 1}
                                                        step={isKilo ? 0.01 : 1}
                                                        max={maxQty}
                                                        value={selectedQuantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (isKilo) {
                                                                // For Kilo, allow free typing - rounding happens on blur
                                                                const numValue = parseFloat(value);
                                                                if (!isNaN(numValue) && numValue >= 0.25 && numValue <= maxQty) {
                                                                    setSelectedQuantity(numValue);
                                                                } else if (value === '') {
                                                                    setSelectedQuantity(0.25);
                                                                }
                                                            } else {
                                                                // For PC and Tali, only allow integers
                                                                const numValue = parseInt(value);
                                                                if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
                                                                    setSelectedQuantity(numValue);
                                                                } else if (value === '') {
                                                                    setSelectedQuantity(1);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (isKilo) {
                                                                // Round to nearest quarter when user finishes typing
                                                                const numValue = parseFloat(e.target.value);
                                                                if (!isNaN(numValue) && numValue >= 0.25 && numValue <= maxQty) {
                                                                    const rounded = Math.round(numValue * 4) / 4;
                                                                    setSelectedQuantity(Number(rounded.toFixed(2)));
                                                                } else if (e.target.value === '') {
                                                                    setSelectedQuantity(0.25);
                                                                }
                                                            }
                                                        }}
                                                        className="w-full border rounded p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (isKilo) {
                                                                const newQty = Math.min(maxQty, selectedQuantity + 0.25);
                                                                setSelectedQuantity(Number(newQty.toFixed(2)));
                                                            } else {
                                                                const newQty = Math.min(maxQty, selectedQuantity + 1);
                                                                setSelectedQuantity(newQty);
                                                            }
                                                        }}
                                                        disabled={selectedQuantity >= maxQty}
                                                        className="px-2"
                                                    >
                                                        {isKilo ? '+0.25' : '+1'}
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Max: {isKilo ? maxQty.toFixed(2) : maxQty}
                                                </div>
                                                {errors.quantity && (
                                                    <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>
                                                )}
                                                {errors.category && (
                                                    <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                                                )}
                                                {errors.product_id && (
                                                    <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <Button
                                                className="w-full"
                                                onClick={handleAddToCart}
                                                disabled={
                                                    processing ||
                                                    isAddingToCart ||
                                                    !selectedCategory ||
                                                    selectedQuantity < (isKilo ? 0.25 : 1) ||
                                                    selectedQuantity > maxQty
                                                }
                                            >
                                                {processing || isAddingToCart ? t('ui.adding') : t('ui.add_to_cart')}
                                            </Button>
                                            {message && (
                                                <div className="mt-2 text-center text-sm text-green-600">{message}</div>
                                            )}
                                        </div>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Confirmation Dialog */}
            <Dialog open={showLoginConfirm} onOpenChange={setShowLoginConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ui.login_required')}</DialogTitle>
                        <DialogDescription>
                            {t('ui.must_be_logged_in')}
                        </DialogDescription>
                        <div className="flex gap-4 mt-4">
                            <Button className="w-full" onClick={() => router.visit('/login')}>{t('ui.go_to_login')}</Button>
                            <Button variant="secondary" className="w-full" onClick={() => setShowLoginConfirm(false)}>{t('ui.cancel')}</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </AppHeaderLayout>
    );
} 