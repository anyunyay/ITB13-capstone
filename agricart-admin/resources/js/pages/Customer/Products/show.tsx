import { Head, router } from '@inertiajs/react';
import { X, ShoppingCart, Package, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  description: string;
  image: string;
  image_url?: string;
  produce_type: string;
  stock_by_category?: Record<string, number>;
}

interface PageProps {
  product: Product;
}

export default function ShowProduct({ product }: PageProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      router.visit('/customer/produce');
    }, 200);
  };

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle image URL - use fallback if image fails to load
  const imageUrl = product.image_url || 
                   (product.image ? `/storage/${product.image}` : '') || 
                   '/images/fallback-photo.png';
  const produceTypeEmoji = product.produce_type === 'fruit' ? '🍎' : '🥬';

  // Calculate available pricing options
  const pricingOptions = [
    { label: 'Per Kilo', value: product.price_kilo, unit: 'kg', category: 'kilo' },
    { label: 'Per Piece', value: product.price_pc, unit: 'pc', category: 'piece' },
    { label: 'Per Tali', value: product.price_tali, unit: 'tali', category: 'tali' },
  ].filter(option => option.value != null && option.value > 0);

  return (
    <>
      <Head title={product.name} />
      
      {/* Blurred Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`bg-background rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all duration-200 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border border-border shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Left Side - Product Image */}
            <div className="md:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 flex items-center justify-center relative overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10 w-full max-w-md">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbackUrl = '/images/fallback-photo.png';
                      // Prevent infinite loop if fallback also fails
                      if (!target.src.includes('fallback-photo.png')) {
                        target.src = fallbackUrl;
                      } else {
                        // If fallback fails, use a data URI placeholder
                        target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='80' fill='%239ca3af'%3E${produceTypeEmoji}%3C/text%3E%3C/svg%3E`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="md:w-1/2 overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Product Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {produceTypeEmoji} {product.produce_type === 'fruit' ? 'Fruit' : 'Vegetable'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h1>
                  
                  {product.description && (
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Pricing Cards */}
                {pricingOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      <DollarSign className="w-4 h-4" />
                      <span>Pricing Options</span>
                    </div>
                    
                    <div className="grid gap-3">
                      {pricingOptions.map((option) => {
                        const stock = product.stock_by_category?.[option.category] ?? 0;
                        const isAvailable = stock > 0;
                        
                        return (
                          <Card 
                            key={option.category}
                            className={`p-4 border-2 transition-all duration-200 ${
                              isAvailable 
                                ? 'hover:border-primary hover:shadow-lg cursor-pointer' 
                                : 'opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <Package className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground">{option.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {isAvailable ? `${stock} ${option.unit} available` : 'Out of stock'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ₱{typeof option.value === 'number' ? option.value.toFixed(2) : Number(option.value || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">per {option.unit}</p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Information */}
                {product.stock_by_category && Object.keys(product.stock_by_category).length > 0 && (
                  <Card className="p-4 bg-muted/50 border-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                        <Info className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">Stock Availability</h3>
                        <div className="space-y-1">
                          {Object.entries(product.stock_by_category).map(([category, stock]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">{category}:</span>
                              <span className={`font-medium ${stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stock > 0 ? `${stock} available` : 'Out of stock'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-12 px-6 border-2 hover:bg-muted"
                    onClick={handleClose}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
