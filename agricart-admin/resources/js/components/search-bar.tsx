import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    price: number | string;
    description: string;
    image: string;
    produce_type: string;
    stock_by_category: Record<string, number>;
}

interface SearchBarProps {
    className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleSearch = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (value.trim().length >= 2) {
            const timeoutId = setTimeout(() => handleSearch(value), 300);
            return () => clearTimeout(timeoutId);
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    const handleProductClick = (product: Product) => {
        // Navigate to product page
        router.visit(`/customer/product/${product.id}`);
        setIsExpanded(false);
        setShowResults(false);
        setQuery('');
    };

    const handleExpand = () => {
        setIsExpanded(true);
        setShowResults(false);
    };

    const handleCollapse = () => {
        setIsExpanded(false);
        setShowResults(false);
        setQuery('');
    };

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    return (
        <div ref={searchRef} className={cn("relative", className)}>
            {!isExpanded ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 cursor-pointer"
                    onClick={handleExpand}
                >
                    <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                </Button>
            ) : (
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="pl-10 pr-10 w-64"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleCollapse}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
                    <CardContent className="p-0">
                        {results.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleProductClick(product)}
                            >
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{product.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{product.produce_type}</div>
                                    <div className="text-sm font-semibold text-green-600">
                                        ₱{formatPrice(product.price)}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {Object.keys(product.stock_by_category).length > 0 ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* No Results */}
            {showResults && results.length === 0 && query.trim().length >= 2 && !isLoading && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50">
                    <CardContent className="p-4 text-center text-gray-500">
                        No products found for "{query}"
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 