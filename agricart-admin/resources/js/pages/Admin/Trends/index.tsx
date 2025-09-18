import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PermissionGuard } from '@/components/permission-guard';
import type { SharedData } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

type ProductOption = { name: string };

interface DateRange {
    min_date: string;
    max_date: string;
}

interface PageProps {
    products: ProductOption[];
    dateRange: DateRange;
}

export default function TrendsIndex({ products, dateRange }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [priceCategoryToggles, setPriceCategoryToggles] = useState<{
        per_kilo: boolean;
        per_tali: boolean;
        per_pc: boolean;
    }>({
        per_kilo: true,
        per_tali: true,
        per_pc: true
    });
    const [startDate, setStartDate] = useState<Date | undefined>(dateRange?.min_date ? new Date(dateRange.min_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(dateRange?.max_date ? new Date(dateRange.max_date) : undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPriceCategories, setLoadingPriceCategories] = useState<boolean>(false);
    const [series, setSeries] = useState<any[]>([]);
    const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
    const [availablePriceCategories, setAvailablePriceCategories] = useState<string[]>([]);
    const [productPriceCategories, setProductPriceCategories] = useState<Record<string, string[]>>({});

    // Define product categories
    const fruitProducts = ['Pakwan', 'Mais'];
    const vegetableProducts = ['Ampalaya', 'Kalabasa', 'Sitaw', 'Talong', 'Pipino', 'Pechay', 'Siling Labuyo', 'Siling Haba', 'Kamatis', 'Tanglad', 'Talbos ng Kamote', 'Alugbati', 'Kangkong'];

    // Filter products based on selected category
    const getFilteredProducts = (category: string) => {
        if (category === 'fruit') {
            return products.filter(p => fruitProducts.includes(p.name));
        } else if (category === 'vegetable') {
            return products.filter(p => vegetableProducts.includes(p.name));
        } else if (category === 'all') {
            return products;
        }
        return products;
    };

    // Get available price categories based on selected product from API
    const getAvailablePriceCategories = async (productName: string) => {
        if (!productName || productName === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        try {
            const response = await fetch(`/admin/trends/price-categories?product_name=${encodeURIComponent(productName)}`);
            const data = await response.json();
            return data.price_categories || [];
        } catch (error) {
            console.error('Error fetching price categories:', error);
            return [];
        }
    };

    // Get available price categories for all products in the selected category
    const getAvailablePriceCategoriesForCategory = async (category: string) => {
        if (category === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        const productsInCategory = getFilteredProducts(category);
        if (productsInCategory.length === 0) return [];
        
        try {
            // Get price categories for all products in this category
            const promises = productsInCategory.map(product => 
                fetch(`/admin/trends/price-categories?product_name=${encodeURIComponent(product.name)}`)
                    .then(response => response.json())
                    .then(data => data.price_categories || [])
                    .catch(() => [])
            );
            
            const results = await Promise.all(promises);
            
            // Combine all unique price categories
            const allCategories = results.flat();
            const uniqueCategories = [...new Set(allCategories)];
            
            return uniqueCategories;
        } catch (error) {
            console.error('Error fetching price categories for category:', error);
            return [];
        }
    };

    // Handle category change
    const handleCategoryChange = async (category: string) => {
        setSelectedCategory(category);
        setSelectedProducts([]);
        setAvailableProducts(getFilteredProducts(category));
        setProductPriceCategories({});
        
        // Reset toggles to all enabled
        setPriceCategoryToggles({
            per_kilo: true,
            per_tali: true,
            per_pc: true
        });
    };

    // Handle product selection change
    const handleProductSelectionChange = async (productName: string, checked: boolean) => {
        let newSelectedProducts;
        if (checked) {
            if (selectedProducts.length >= 5) {
                return; // Max 5 products
            }
            newSelectedProducts = [...selectedProducts, productName];
        } else {
            newSelectedProducts = selectedProducts.filter(p => p !== productName);
        }
        
        setSelectedProducts(newSelectedProducts);
        
        // Get price categories for selected products
        if (newSelectedProducts.length > 0) {
            const productCategories: Record<string, string[]> = {};
            for (const product of newSelectedProducts) {
                if (!productPriceCategories[product]) {
                    const categories = await getAvailablePriceCategories(product);
                    productCategories[product] = categories;
                } else {
                    productCategories[product] = productPriceCategories[product];
                }
            }
            setProductPriceCategories(productCategories);
            
            // Update available price categories based on selected products
            const allCategories = Object.values(productCategories).flat();
            const uniqueCategories = [...new Set(allCategories)];
            setAvailablePriceCategories(uniqueCategories);
            
            // Set toggles based on available categories for selected products
            const commonCategories = uniqueCategories;
            
            if (newSelectedProducts.length === 1) {
                // Single product: show all available categories, allow toggling off
                setPriceCategoryToggles({
                    per_kilo: commonCategories.includes('per_kilo'),
                    per_tali: commonCategories.includes('per_tali'),
                    per_pc: commonCategories.includes('per_pc')
                });
            } else if (newSelectedProducts.length >= 2) {
                // Multiple products: only allow one category to be selected
                // Find the first available category and enable only that one
                const firstAvailableCategory = commonCategories.find(cat => 
                    cat === 'per_kilo' || cat === 'per_tali' || cat === 'per_pc'
                );
                
                setPriceCategoryToggles({
                    per_kilo: firstAvailableCategory === 'per_kilo',
                    per_tali: firstAvailableCategory === 'per_tali',
                    per_pc: firstAvailableCategory === 'per_pc'
                });
            }
        } else {
            setAvailablePriceCategories([]);
            setPriceCategoryToggles({
                per_kilo: true,
                per_tali: true,
                per_pc: true
            });
        }
    };

    // Handle price category toggle
    const handlePriceCategoryToggle = (category: keyof typeof priceCategoryToggles) => {
        if (selectedProducts.length === 1) {
            // Single product: allow toggling any available category
            setPriceCategoryToggles(prev => ({
                ...prev,
                [category]: !prev[category]
            }));
        } else if (selectedProducts.length >= 2) {
            // Multiple products: only allow one category to be selected at a time
            setPriceCategoryToggles({
                per_kilo: category === 'per_kilo' ? !priceCategoryToggles.per_kilo : false,
                per_tali: category === 'per_tali' ? !priceCategoryToggles.per_tali : false,
                per_pc: category === 'per_pc' ? !priceCategoryToggles.per_pc : false
            });
        }
    };

    const loadData = useCallback(async () => {
        // Don't load if no products selected or no price categories enabled
        if (selectedProducts.length === 0 || !Object.values(priceCategoryToggles).some(toggle => toggle)) {
            setSeries([]);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Add selected products
            if (selectedProducts.length > 0) {
                selectedProducts.forEach(product => {
                    params.append('product_names[]', product);
                });
            }
            
            if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
            
            // Add selected price categories
            const selectedPriceCategories = Object.entries(priceCategoryToggles)
                .filter(([_, enabled]) => enabled)
                .map(([category, _]) => category);
            
            if (selectedPriceCategories.length > 0) {
                selectedPriceCategories.forEach(category => {
                    params.append('price_categories[]', category);
                });
            }
            
            if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
            if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
            
            const res = await fetch(`/admin/trends/data?${params.toString()}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            // Flatten grouped data into one array with product name and price category on each point
            const flattened = json.data.flatMap((g: any) =>
                g.series.map((p: any) => {
                    // Map unit_type to price category name
                    let priceCategory = 'Unknown';
                    if (p.unit_type === 'kg') {
                        priceCategory = 'Per Kilo';
                    } else if (p.unit_type === 'tali') {
                        priceCategory = 'Per Tali';
                    } else if (p.unit_type === 'pc') {
                        priceCategory = 'Per Piece';
                    }
                    
                    return { 
                        ...p, 
                        product: g.product || 'Unknown',
                        price_category: priceCategory
                    };
                })
            );
            setSeries(flattened);
        } finally {
            setLoading(false);
        }
    }, [selectedProducts, selectedCategory, priceCategoryToggles, startDate, endDate]);

    useEffect(() => {
        // Initialize available products and price categories
        setAvailableProducts(products);
        setAvailablePriceCategories(['per_kilo', 'per_tali', 'per_pc']);
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-reload data when price category toggles change
    useEffect(() => {
        // Only reload if we have selected products and at least one toggle is enabled
        if (selectedProducts.length > 0 && Object.values(priceCategoryToggles).some(toggle => toggle)) {
            loadData();
        }
    }, [loadData]);

    const chartData = useMemo(() => {
        console.log('Series data:', series);
        
        // Group data by date, product, and price category for better visualization
        const groupedByDate = series.reduce((acc, item) => {
            const date = new Date(item.timestamp).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = {};
            }
            // Create unique key combining product name and price category
            const key = `${item.product} (${item.price_category || 'Unknown'})`;
            acc[date][key] = item.price;
            return acc;
        }, {} as Record<string, Record<string, number>>);

        // Convert to array format for Recharts
        const result = Object.entries(groupedByDate).map(([date, products]) => {
            const dataPoint: any = { timestamp: date };
            Object.entries(products as Record<string, number>).forEach(([productKey, price]) => {
                dataPoint[productKey] = price;
            });
            return dataPoint;
        });
        
        console.log('Chart data:', result);
        return result;
    }, [series]);

    // Generate colors for different products
    const getProductColor = (productName: string, index: number) => {
        const colors = [
            '#8884d8', '#82ca9d', '#ff7300', '#ffc658', '#8dd1e1', 
            '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98',
            '#f0e68c', '#ffa07a', '#20b2aa', '#ff6347', '#32cd32'
        ];
        return colors[index % colors.length];
    };

    // Get unique product-category combinations for legend
    const uniqueProducts = useMemo(() => {
        const productKeys = [...new Set(series.map(item => `${item.product} (${item.price_category || 'Unknown'})`))];
        return productKeys.map((productKey, index) => ({
            name: productKey,
            color: getProductColor(productKey, index)
        }));
    }, [series]);

    return (
        <PermissionGuard permissions={['view inventory']} pageTitle="Trend Analysis Access Denied">
            <AppLayout>
                <Head title="Trend Analysis" />
                <div className="m-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Price Trend Analysis</h1>
                            <p className="text-muted-foreground">Visualize product price fluctuations with advanced filtering options</p>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left side - Category and Products */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Category</Label>
                                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All categories</SelectItem>
                                                <SelectItem value="fruit">Fruit</SelectItem>
                                                <SelectItem value="vegetable">Vegetable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Products (Max 5)</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {selectedProducts.length === 0 
                                                        ? "Select products" 
                                                        : `${selectedProducts.length} product(s) selected`
                                                    }
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-96">
                                                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                                    {availableProducts.map((product) => (
                                                        <div key={product.name} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={product.name}
                                                                checked={selectedProducts.includes(product.name)}
                                                                onCheckedChange={(checked) => 
                                                                    handleProductSelectionChange(product.name, checked as boolean)
                                                                }
                                                                disabled={!selectedProducts.includes(product.name) && selectedProducts.length >= 5}
                                                            />
                                                            <Label 
                                                                htmlFor={product.name} 
                                                                className="text-sm font-normal cursor-pointer flex-1"
                                                            >
                                                                {product.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {selectedProducts.length >= 5 && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                Maximum 5 products selected. This may result in not being able to show data properly.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right side - Dates and Apply Button */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <Label>End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex items-end">
                                        <Button 
                                            onClick={loadData} 
                                            disabled={loading || selectedProducts.length === 0 || Object.values(priceCategoryToggles).every(toggle => !toggle)} 
                                            className="w-full"
                                        >
                                            {loading ? 'Loading...' : 'Apply Filters'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Price Trend</CardTitle>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_kilo"
                                                checked={priceCategoryToggles.per_kilo}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_kilo')}
                                                disabled={!availablePriceCategories.includes('per_kilo')}
                                            />
                                            <Label htmlFor="per_kilo" className="text-sm">Per Kilo</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_tali"
                                                checked={priceCategoryToggles.per_tali}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_tali')}
                                                disabled={!availablePriceCategories.includes('per_tali')}
                                            />
                                            <Label htmlFor="per_tali" className="text-sm">Per Tali</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_pc"
                                                checked={priceCategoryToggles.per_pc}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_pc')}
                                                disabled={!availablePriceCategories.includes('per_pc')}
                                            />
                                            <Label htmlFor="per_pc" className="text-sm">Per Piece</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedProducts.length === 0 && (
                                <p className="text-sm text-red-500 mt-2">Please select at least one product to view the chart</p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div style={{ width: '100%', height: 420 }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer>
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="timestamp" />
                                            <YAxis />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                                <p className="font-semibold">{`Date: ${label}`}</p>
                                                                {payload.map((entry, index) => {
                                                                    if (entry.value && entry.dataKey) {
                                                                        // Parse the product key to show product and category separately
                                                                        const match = entry.dataKey.match(/^(.+?) \((.+?)\)$/);
                                                                        const productName = match ? match[1] : entry.dataKey;
                                                                        const priceCategory = match ? match[2] : 'Unknown';
                                                                        
                                                                        return (
                                                                            <p key={index} style={{ color: entry.color }}>
                                                                                <span className="font-medium">{productName}</span>
                                                                                <span className="text-gray-500"> ({priceCategory})</span>
                                                                                <span className="ml-2">₱{entry.value}</span>
                                                                            </p>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend />
                                            {uniqueProducts.map((product, index) => (
                                                <Line 
                                                    key={product.name}
                                                    type="monotone" 
                                                    dataKey={product.name} 
                                                    name={product.name}
                                                    stroke={product.color} 
                                                    dot={false}
                                                    strokeWidth={2}
                                                    connectNulls={false}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <p>No data available. Please select filters and click Apply.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}


