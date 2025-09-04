import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBasket, Package, Minus, Plus } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        category: '',
        quantity: 1,
    });

    const categories = product.stock_by_category ? Object.keys(product.stock_by_category) : [];
    const isKilo = selectedCategory === 'Kilo';
    const maxQty = product.stock_by_category?.[selectedCategory] ?? 1;

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();

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

        router.post('/customer/cart/store', {
            product_id: product.id,
            category: selectedCategory,
            quantity: sendQty,
        }, {
            onSuccess: () => {
                setMessage('Added to cart!');
                router.reload({ only: ['cart'] });
                setTimeout(() => setOpen(false), 800);
            },
            onError: () => {
                setMessage('Failed to add to cart.');
            },
            preserveScroll: true,
        });
    };

    const handleBack = () => {
        router.visit('/');
    };

    const totalStock = Object.values(product.stock_by_category).reduce((sum, quantity) => sum + quantity, 0);

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    return (
        <AppHeaderLayout>
            <Head title={product.name} />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
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
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/products/default-product.jpg';
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
                                        In Stock
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">Out of Stock</Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <div className="mt-2 space-y-1">
                                {product.price_kilo && (
                                    <p className="text-lg font-semibold text-green-600">
                                        Kilo: ₱{formatPrice(product.price_kilo)}
                                    </p>
                                )}
                                {product.price_pc && (
                                    <p className="text-lg font-semibold text-green-600">
                                        Piece: ₱{formatPrice(product.price_pc)}
                                    </p>
                                )}
                                {product.price_tali && (
                                    <p className="text-lg font-semibold text-green-600">
                                        Tali: ₱{formatPrice(product.price_tali)}
                                    </p>
                                )}
                                {!product.price_kilo && !product.price_pc && !product.price_tali && (
                                    <p className="text-lg font-semibold text-gray-500">
                                        No prices set
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Stock Information */}
                        {Object.keys(product.stock_by_category).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Package className="h-5 w-5" />
                                        <span>Available Stock</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(product.stock_by_category).map(([category, quantity]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 capitalize">{category}</span>
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
                                        <span>{totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{product.name}</DialogTitle>
                                        <DialogTitle className="text-sm text-gray-500">{product.produce_type}</DialogTitle>
                                        <DialogDescription>{product.description}</DialogDescription>

                                        {/* For Displaying Stock */}
                                        {product.stock_by_category ? (
                                            <div className="mt-2 text-sm text-gray-700">
                                                <strong>Available Stock:</strong>
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
                                                    <div className="text-red-500 font-medium">NO STOCK AVAILABLE</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-sm text-gray-700">
                                                <strong>Available Stock:</strong>
                                                <div className="text-red-500 font-medium">NO STOCK AVAILABLE</div>
                                            </div>
                                        )}

                                        {/* Category Selection */}
                                        {categories.length > 0 && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium mb-1">Select Category</label>
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
                                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                                <div className="flex items-center gap-2">
                                                    {isKilo && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newQty = Math.max(0.25, selectedQuantity - 0.25);
                                                                setSelectedQuantity(Number(newQty.toFixed(2)));
                                                            }}
                                                            disabled={selectedQuantity <= 0.25}
                                                            className="px-2"
                                                        >
                                                            -0.25
                                                        </Button>
                                                    )}
                                                    <input
                                                        type="number"
                                                        min={isKilo ? 0.25 : 1}
                                                        step={isKilo ? 0.01 : 1}
                                                        max={maxQty}
                                                        value={selectedQuantity}
                                                        className="w-full border rounded p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        readOnly
                                                    />
                                                    {isKilo && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newQty = Math.min(maxQty, selectedQuantity + 0.25);
                                                                setSelectedQuantity(Number(newQty.toFixed(2)));
                                                            }}
                                                            disabled={selectedQuantity >= maxQty}
                                                            className="px-2"
                                                        >
                                                            +0.25
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
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
                                                    !selectedCategory ||
                                                    selectedQuantity < (isKilo ? 0.25 : 1) ||
                                                    selectedQuantity > maxQty
                                                }
                                            >
                                                {processing ? 'Adding...' : 'Add to Cart'}
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
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You must be logged in to add products to your cart.
                        </DialogDescription>
                        <div className="flex gap-4 mt-4">
                            <Button className="w-full" onClick={() => router.visit('/login')}>Go to Login</Button>
                            <Button variant="secondary" className="w-full" onClick={() => setShowLoginConfirm(false)}>Cancel</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </AppHeaderLayout>
    );
} 