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
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

type ProductOption = { 
    name: string; 
    price_categories: string[]; 
    unit_types: string[]; 
};

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
    const [startDate, setStartDate] = useState<Date | undefined>(dateRange?.min_date ? dayjs(dateRange.min_date).toDate() : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(dateRange?.max_date ? dayjs(dateRange.max_date).toDate() : undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPriceCategories, setLoadingPriceCategories] = useState<boolean>(false);
    const [series, setSeries] = useState<any[]>([]);
    const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
    const [availablePriceCategories, setAvailablePriceCategories] = useState<string[]>([]);
    const [productPriceCategories, setProductPriceCategories] = useState<Record<string, string[]>>({});
    const [timePeriod, setTimePeriod] = useState<'specific' | 'monthly' | 'yearly'>('specific');
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

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

    // Group products by their pricing units
    const getGroupedProducts = (products: ProductOption[]) => {
        const groups: { [key: string]: ProductOption[] } = {
            'per_kilo_only': [],
            'per_tali_only': [],
            'per_pc_only': [],
            'per_kilo_tali': [],
            'per_kilo_pc': [],
            'per_tali_pc': [],
            'all_units': []
        };

        products.forEach(product => {
            const { price_categories } = product;
            const hasKilo = price_categories.includes('per_kilo');
            const hasTali = price_categories.includes('per_tali');
            const hasPc = price_categories.includes('per_pc');

            if (hasKilo && hasTali && hasPc) {
                groups.all_units.push(product);
            } else if (hasKilo && hasTali) {
                groups.per_kilo_tali.push(product);
            } else if (hasKilo && hasPc) {
                groups.per_kilo_pc.push(product);
            } else if (hasTali && hasPc) {
                groups.per_tali_pc.push(product);
            } else if (hasKilo) {
                groups.per_kilo_only.push(product);
            } else if (hasTali) {
                groups.per_tali_only.push(product);
            } else if (hasPc) {
                groups.per_pc_only.push(product);
            }
        });

        return groups;
    };

    // Get available price categories based on selected product from product data
    const getAvailablePriceCategories = (productName: string) => {
        if (!productName || productName === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        const product = products.find(p => p.name === productName);
        return product?.price_categories || ['per_kilo', 'per_tali', 'per_pc'];
    };

    // Get available price categories for all products in the selected category
    const getAvailablePriceCategoriesForCategory = (category: string) => {
        if (category === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        const productsInCategory = getFilteredProducts(category);
        if (productsInCategory.length === 0) return [];
        
        // Combine all unique price categories from products in this category
        const allCategories = productsInCategory.flatMap(product => product.price_categories || []);
        const uniqueCategories = [...new Set(allCategories)];
        
        return uniqueCategories;
    };

    // Handle category change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedProducts([]);
        setAvailableProducts(getFilteredProducts(category));
        setProductPriceCategories({});
        
        // Get available price categories for this category
        const availableCategories = getAvailablePriceCategoriesForCategory(category);
        setAvailablePriceCategories(availableCategories);
        
        // Reset toggles based on available categories
        setPriceCategoryToggles({
            per_kilo: availableCategories.includes('per_kilo'),
            per_tali: availableCategories.includes('per_tali'),
            per_pc: availableCategories.includes('per_pc')
        });
    };

    // Handle product selection change
    const handleProductSelectionChange = (productName: string, checked: boolean) => {
        let newSelectedProducts;
        if (checked) {
            if (selectedProducts.length >= 3) {
                return; // Max 3 products
            }
            newSelectedProducts = [...selectedProducts, productName];
        } else {
            newSelectedProducts = selectedProducts.filter(p => p !== productName);
        }
        
        setSelectedProducts(newSelectedProducts);
        
        // Get price categories for selected products
        if (newSelectedProducts.length > 0) {
            const productCategories: Record<string, string[]> = {};
            for (const productName of newSelectedProducts) {
                const categories = getAvailablePriceCategories(productName);
                productCategories[productName] = categories;
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

    // Convert time period selections to date ranges
    const getDateRangeFromTimePeriod = () => {
        if (timePeriod === 'specific') {
            return {
                startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
                endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined
            };
        } else if (timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined) {
            const startOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
            const endOfMonth = dayjs().year(selectedYear).month(selectedMonth).endOf('month');
            return {
                startDate: startOfMonth.format('YYYY-MM-DD'),
                endDate: endOfMonth.format('YYYY-MM-DD')
            };
        } else if (timePeriod === 'yearly' && selectedYear !== undefined) {
            const startOfYear = dayjs().year(selectedYear).startOf('year');
            const endOfYear = dayjs().year(selectedYear).endOf('year');
            return {
                startDate: startOfYear.format('YYYY-MM-DD'),
                endDate: endOfYear.format('YYYY-MM-DD')
            };
        }
        return { startDate: undefined, endDate: undefined };
    };

    // Handle time period change to clear previous data
    const handleTimePeriodChange = (newTimePeriod: 'specific' | 'monthly' | 'yearly') => {
        setTimePeriod(newTimePeriod);
        
        // Clear previous trend data when switching to monthly or yearly, but keep selected products
        if (newTimePeriod === 'monthly' || newTimePeriod === 'yearly') {
            setSeries([]);
            // Keep selectedProducts - don't clear them
            setProductPriceCategories({});
            setAvailablePriceCategories([]);
            setPriceCategoryToggles({
                per_kilo: true,
                per_tali: true,
                per_pc: true
            });
        }
        
        // Reset date selections when switching time periods
        if (newTimePeriod === 'specific') {
            setSelectedMonth(undefined);
            setSelectedYear(undefined);
        } else if (newTimePeriod === 'monthly') {
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedYear(undefined);
        } else if (newTimePeriod === 'yearly') {
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedMonth(undefined);
        }
    };

    // Handle price category toggle
    const handlePriceCategoryToggle = (category: keyof typeof priceCategoryToggles) => {
        if (selectedProducts.length === 1) {
            // Single product: allow toggling any available category, but prevent turning off the last one
            const currentToggles = { ...priceCategoryToggles };
            const newToggles = {
                ...currentToggles,
                [category]: !currentToggles[category]
            };
            
            // Check if this would result in no toggles being active
            const activeToggles = Object.values(newToggles).filter(Boolean).length;
            if (activeToggles === 0) {
                // Don't allow turning off the last toggle
                return;
            }
            
            setPriceCategoryToggles(newToggles);
        } else if (selectedProducts.length >= 2) {
            // Multiple products: only allow one category to be selected at a time
            // Check if trying to turn off the only active toggle
            const currentActiveToggles = Object.values(priceCategoryToggles).filter(Boolean).length;
            if (currentActiveToggles === 1 && priceCategoryToggles[category]) {
                // Don't allow turning off the last toggle
                return;
            }
            
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
        
        // Validate time period selections before loading data
        const hasValidSpecificDates = timePeriod === 'specific' && (startDate || endDate) && 
            (!startDate || !endDate || !dayjs(startDate).isAfter(dayjs(endDate))) &&
            (!startDate || !dayjs(startDate).isBefore(dayjs('2020-01-01'))) &&
            (!endDate || !dayjs(endDate).isBefore(dayjs('2020-01-01')));
        const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
            !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
        const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
            selectedYear <= dayjs().year() && selectedYear >= 2020;
        
        if (!hasValidSpecificDates && !hasValidMonthlySelection && !hasValidYearlySelection) {
            setSeries([]);
            return; // Don't load data if validation fails
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
            
            const dateRange = getDateRangeFromTimePeriod();
            if (dateRange.startDate) params.append('start_date', dateRange.startDate);
            if (dateRange.endDate) params.append('end_date', dateRange.endDate);
            
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
    }, [selectedProducts, selectedCategory, priceCategoryToggles, timePeriod, startDate, endDate, selectedMonth, selectedYear]);

    useEffect(() => {
        // Initialize available products and price categories
        setAvailableProducts(products);
        setAvailablePriceCategories(['per_kilo', 'per_tali', 'per_pc']);
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-load data when monthly or yearly selections are complete and valid
    useEffect(() => {
        const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
            !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
        const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
            selectedYear <= dayjs().year() && selectedYear >= 2020;
        
        if (hasValidMonthlySelection && selectedProducts.length > 0) {
            loadData();
        } else if (hasValidYearlySelection && selectedProducts.length > 0) {
            loadData();
        }
    }, [timePeriod, selectedMonth, selectedYear, selectedProducts, loadData]);

    // Auto-reload data when price category toggles change
    useEffect(() => {
        // Only reload if we have selected products and at least one toggle is enabled
        if (selectedProducts.length > 0 && Object.values(priceCategoryToggles).some(toggle => toggle)) {
            loadData();
        }
    }, [loadData]);

    const chartData = useMemo(() => {
        console.log('Series data:', series);
        
        if (series.length === 0) return [];
        
        // Group data by date, product, and price category for better visualization
        const groupedByDate = series.reduce((acc, item) => {
            const date = dayjs(item.timestamp);
            const dateString = date.format('YYYY-MM-DD'); // Use YYYY-MM-DD format
            if (!acc[dateString]) {
                acc[dateString] = {};
            }
            // Create unique key combining product name and price category
            const key = `${item.product} (${item.price_category || 'Unknown'})`;
            acc[dateString][key] = item.price;
            return acc;
        }, {} as Record<string, Record<string, number>>);

        // Get all unique product keys
        const allProductKeys = [...new Set(series.map(item => `${item.product} (${item.price_category || 'Unknown'})`))];
        
        // Get all dates and sort them
        const allDates = Object.keys(groupedByDate).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
        
        if (allDates.length === 0) return [];
        
        // Use date range from time period selection
        let chartStartDate, chartEndDate;
        const dateRangeFromPeriod = getDateRangeFromTimePeriod();
        
        if (dateRangeFromPeriod.startDate && dateRangeFromPeriod.endDate) {
            // Use time period specified dates - chart will show exactly this range
            chartStartDate = dayjs(dateRangeFromPeriod.startDate).startOf('day');
            chartEndDate = dayjs(dateRangeFromPeriod.endDate).endOf('day');
        } else {
            // Fall back to data range only if no time period dates specified
            const dataStartDate = dayjs(Math.min(...allDates.map(d => dayjs(d).valueOf())));
            const dataEndDate = dayjs(Math.max(...allDates.map(d => dayjs(d).valueOf())));
            chartStartDate = dataStartDate.startOf('day');
            chartEndDate = dataEndDate.endOf('day');
        }
        
        // Check if the date range spans more than 30 days
        const daysDiff = chartEndDate.diff(chartStartDate, 'day') + 1; // +1 to include both start and end
        const isMoreThanOneMonth = daysDiff > 30;
        
        console.log('Date range analysis:', {
            timePeriod,
            selectedMonth,
            selectedYear,
            periodStartDate: dateRangeFromPeriod.startDate || 'Not specified',
            periodEndDate: dateRangeFromPeriod.endDate || 'Not specified',
            chartStartDate: chartStartDate.format('YYYY-MM-DD'),
            chartEndDate: chartEndDate.format('YYYY-MM-DD'),
            daysDiff,
            isMoreThanOneMonth
        });
        
        // Generate all dates in the range using dayjs
        const dateRange = [];
        let currentDate = chartStartDate.clone();
        while (currentDate.isSameOrBefore(chartEndDate, 'day')) {
            dateRange.push(currentDate.format('YYYY-MM-DD'));
            currentDate = currentDate.add(1, 'day');
        }
        
        // If we only have one data point, use the full date range specified by user
        if (allDates.length === 1) {
            const dataPoints = dateRange.map(date => {
                const dataPoint: any = { timestamp: date, isMoreThanOneMonth };
                allProductKeys.forEach(productKey => {
                    if (groupedByDate[date] && groupedByDate[date][productKey] !== undefined) {
                        // If data exists for this day, use it
                        dataPoint[productKey] = groupedByDate[date][productKey];
                    } else {
                        // If no data for this day, use the single data point value
                        dataPoint[productKey] = groupedByDate[allDates[0]][productKey] || null;
                    }
                });
                return dataPoint;
            });
            console.log('Single data point chart with user date range:', dataPoints);
            return dataPoints;
        }
        
        // Create continuous data by filling missing days with previous day's data
        const continuousData: any[] = [];
        
        for (let i = 0; i < dateRange.length; i++) {
            const date = dateRange[i];
            const dataPoint: any = { timestamp: date, isMoreThanOneMonth };
            
            allProductKeys.forEach(productKey => {
                if (groupedByDate[date] && groupedByDate[date][productKey] !== undefined) {
                    // If data exists for this day, use it (overwrite any previous interpolation)
                    dataPoint[productKey] = groupedByDate[date][productKey];
                } else if (i > 0) {
                    // If no data for this day, copy from previous day
                    dataPoint[productKey] = continuousData[i - 1][productKey];
                } else {
                    // First day with no data - set to null or 0
                    dataPoint[productKey] = null;
                }
            });
            
            continuousData.push(dataPoint);
        }
        
        console.log('Chart data with interpolation:', continuousData);
        return continuousData;
    }, [series, timePeriod, startDate, endDate, selectedMonth, selectedYear]);

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
                            <div className="flex items-center justify-between">
                                <CardTitle>Filters</CardTitle>
                                <div className="flex items-center space-x-6">
                                    <Label className="text-base font-semibold">Time Period</Label>
                                    <div className="flex space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="specific"
                                                name="timePeriod"
                                                value="specific"
                                                checked={timePeriod === 'specific'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="specific">Specific Date</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="monthly"
                                                name="timePeriod"
                                                value="monthly"
                                                checked={timePeriod === 'monthly'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="monthly">Monthly</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="yearly"
                                                name="timePeriod"
                                                value="yearly"
                                                checked={timePeriod === 'yearly'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="yearly">Yearly</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label>Category</Label>
                                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                        <SelectTrigger className="w-full">
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
                                    <Label>Products (Max 3)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {selectedProducts.length === 0 
                                                    ? "Select products" 
                                                    : `${selectedProducts.length} product(s) selected`
                                                }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto min-w-[400px] max-w-[800px]">
                                            <div>
                                                {(() => {
                                                    const groupedProducts = getGroupedProducts(availableProducts);
                                                    const groupTitles = {
                                                        'per_kilo_only': 'Per Kilo Only',
                                                        'per_tali_only': 'Per Tali Only', 
                                                        'per_pc_only': 'Per Piece Only',
                                                        'per_kilo_tali': 'Per Kilo & Tali',
                                                        'per_kilo_pc': 'Per Kilo & Piece',
                                                        'per_tali_pc': 'Per Tali & Piece',
                                                        'all_units': 'All Pricing Units'
                                                    };
                                                    
                                                    // Count total products to determine layout
                                                    const totalProducts = Object.values(groupedProducts).reduce((sum, group) => sum + group.length, 0);
                                                    const hasMultipleGroups = Object.values(groupedProducts).filter(group => group.length > 0).length > 1;
                                                    
                                                    return (
                                                        <div className={hasMultipleGroups ? "grid grid-cols-2 gap-6" : "space-y-4"}>
                                                            {Object.entries(groupedProducts).map(([groupKey, groupProducts]) => {
                                                                if (groupProducts.length === 0) return null;
                                                                
                                                                return (
                                                                    <div key={groupKey} className="space-y-2">
                                                                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 px-1 border-b border-gray-200 pb-1">
                                                                            {groupTitles[groupKey as keyof typeof groupTitles]}
                                                                        </div>
                                                                        <div className={groupProducts.length <= 4 ? "grid grid-cols-1 gap-1" : "grid grid-cols-2 gap-1"}>
                                                                            {groupProducts.map((product) => (
                                                                                <div key={product.name} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded">
                                                                                    <Checkbox
                                                                                        id={product.name}
                                                                                        checked={selectedProducts.includes(product.name)}
                                                                                        onCheckedChange={(checked) => 
                                                                                            handleProductSelectionChange(product.name, checked as boolean)
                                                                                        }
                                                                                        disabled={!selectedProducts.includes(product.name) && selectedProducts.length >= 3}
                                                                                    />
                                                                                    <Label 
                                                                                        htmlFor={product.name} 
                                                                                        className="text-sm font-normal cursor-pointer flex-1 truncate"
                                                                                    >
                                                                                        {product.name}
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedProducts.length >= 3 && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            Maximum 3 products selected. This may result in not being able to show data properly.
                                        </p>
                                    )}
                                </div>
                                {timePeriod === 'specific' && (
                                    <>
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
                                    </>
                                )}
                                
                                {timePeriod === 'monthly' && (
                                    <>
                                        <div>
                                            <Label>Select Month</Label>
                                            <Select 
                                                value={selectedMonth?.toString()} 
                                                onValueChange={(value) => setSelectedMonth(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">January</SelectItem>
                                                    <SelectItem value="1">February</SelectItem>
                                                    <SelectItem value="2">March</SelectItem>
                                                    <SelectItem value="3">April</SelectItem>
                                                    <SelectItem value="4">May</SelectItem>
                                                    <SelectItem value="5">June</SelectItem>
                                                    <SelectItem value="6">July</SelectItem>
                                                    <SelectItem value="7">August</SelectItem>
                                                    <SelectItem value="8">September</SelectItem>
                                                    <SelectItem value="9">October</SelectItem>
                                                    <SelectItem value="10">November</SelectItem>
                                                    <SelectItem value="11">December</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Select Year</Label>
                                            <Select 
                                                value={selectedYear?.toString()} 
                                                onValueChange={(value) => setSelectedYear(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                                
                                {timePeriod === 'yearly' && (
                                    <div>
                                        <Label>Select Year</Label>
                                        <Select 
                                            value={selectedYear?.toString()} 
                                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
                            {timePeriod === 'specific' && !startDate && !endDate && (
                                <p className="text-sm text-red-500 mt-2">Please select start date and/or end date to view the chart</p>
                            )}
                            {timePeriod === 'monthly' && (selectedMonth === undefined || selectedYear === undefined) && (
                                <p className="text-sm text-red-500 mt-2">Please select both month and year to view the chart</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear === undefined && (
                                <p className="text-sm text-red-500 mt-2">Please select a year to view the chart</p>
                            )}
                            {timePeriod === 'specific' && startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate)) && (
                                <p className="text-sm text-red-500 mt-2">Start date cannot be after end date</p>
                            )}
                            {timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && (
                                <p className="text-sm text-red-500 mt-2">Selected month cannot be in the future</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear !== undefined && selectedYear > dayjs().year() && (
                                <p className="text-sm text-red-500 mt-2">Selected year cannot be in the future</p>
                            )}
                            {timePeriod === 'specific' && startDate && dayjs(startDate).isBefore(dayjs('2020-01-01')) && (
                                <p className="text-sm text-red-500 mt-2">Start date cannot be before 2020</p>
                            )}
                            {timePeriod === 'specific' && endDate && dayjs(endDate).isBefore(dayjs('2020-01-01')) && (
                                <p className="text-sm text-red-500 mt-2">End date cannot be before 2020</p>
                            )}
                            {timePeriod === 'monthly' && selectedYear !== undefined && selectedYear < 2020 && (
                                <p className="text-sm text-red-500 mt-2">Selected year cannot be before 2020</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear !== undefined && selectedYear < 2020 && (
                                <p className="text-sm text-red-500 mt-2">Selected year cannot be before 2020</p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div style={{ width: '100%', height: 420 }}>
                                {(() => {
                                    // Check if we should show the chart based on time period requirements
                                    const hasValidSpecificDates = timePeriod === 'specific' && (startDate || endDate) && 
                                        (!startDate || !endDate || !dayjs(startDate).isAfter(dayjs(endDate))) &&
                                        (!startDate || !dayjs(startDate).isBefore(dayjs('2020-01-01'))) &&
                                        (!endDate || !dayjs(endDate).isBefore(dayjs('2020-01-01')));
                                    const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
                                        !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
                                    const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
                                        selectedYear <= dayjs().year() && selectedYear >= 2020;
                                    
                                    const shouldShowChart = chartData.length > 0 && (
                                        hasValidSpecificDates || 
                                        hasValidMonthlySelection ||
                                        hasValidYearlySelection
                                    );
                                    
                                    return shouldShowChart ? (
                                    <ResponsiveContainer>
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="timestamp" 
                                                tickFormatter={(value) => {
                                                    const date = dayjs(value);
                                                    // Check if this is a multi-month range by looking at the first data point
                                                    const isMoreThanOneMonth = chartData.length > 0 && chartData[0]?.isMoreThanOneMonth;
                                                    
                                                    if (isMoreThanOneMonth) {
                                                        // Show full month name with day when spanning more than 30 days
                                                        return date.format('MMMM D');
                                                    } else {
                                                        // Show days when within 30 days
                                                        return date.format('MMM D');
                                                    }
                                                }}
                                                tick={{ fontSize: 12 }}
                                                ticks={(() => {
                                                    const isMoreThanOneMonth = chartData.length > 0 && chartData[0]?.isMoreThanOneMonth;
                                                    if (!isMoreThanOneMonth) return undefined;
                                                    
                                                    // For monthly view, show first day of each month plus the end date
                                                    const monthTicks: string[] = [];
                                                    const seenMonths = new Set<string>();
                                                    
                                                    chartData.forEach((item, index) => {
                                                        const date = dayjs(item.timestamp);
                                                        const monthKey = `${date.year()}-${date.month()}`;
                                                        
                                                        if (!seenMonths.has(monthKey)) {
                                                            seenMonths.add(monthKey);
                                                            monthTicks.push(item.timestamp);
                                                        }
                                                    });
                                                    
                                                    // Always add the last date (end date) if it's not already included
                                                    if (chartData.length > 0) {
                                                        const lastDate = chartData[chartData.length - 1].timestamp;
                                                        if (!monthTicks.includes(lastDate)) {
                                                            monthTicks.push(lastDate);
                                                        }
                                                    }
                                                    
                                                    return monthTicks;
                                                })()}
                                            />
                                            <YAxis />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                                <p className="font-semibold text-gray-800">{`Date: ${label ? dayjs(label).format('MMMM D, YYYY') : 'Unknown'}`}</p>
                                                                {payload.map((entry, index) => {
                                                                    if (entry.value && entry.dataKey) {
                                                                        // Parse the product key to show product and category separately
                                                                        const match = entry.dataKey.match(/^(.+?) \((.+?)\)$/);
                                                                        const productName = match ? match[1] : entry.dataKey;
                                                                        const priceCategory = match ? match[2] : 'Unknown';
                                                                        
                                                                        return (
                                                                            <p key={index} className="flex items-center gap-2">
                                                                                <span 
                                                                                    className="w-3 h-3 rounded-full" 
                                                                                    style={{ backgroundColor: entry.color }}
                                                                ></span>
                                                                                <span className="font-medium text-gray-800">{productName}</span>
                                                                                <span className="text-gray-600">({priceCategory})</span>
                                                                                <span className="ml-2 font-semibold text-green-600">₱{entry.value}</span>
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
                                                    type="linear" 
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
                                            <p>No data available. Please select products and price categories to view the chart.</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}


